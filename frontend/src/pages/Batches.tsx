import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


interface Batch {
  id:string; gtin:string; lot:string; productName:string;
  expiryDate:string; quantity:number; status:string; txHash?:string;
}


function StatusBadge({ status }: { status:string }) {
  const map: Record<string,[string,string]> = {
    ACTIVE:   ["badge-green",  "Ativo"],
    RECALLED: ["badge-red",    "Recall"],
    EXPIRED:  ["badge-orange", "Vencido"],
    DISPENSED:["badge-blue",   "Dispensado"],
  };
  const [cls, label] = map[status] ?? ["badge-blue", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}


export default function Batches() {
  const [search, setSearch]   = useState("");
  const [showForm, setForm]   = useState(false);
  const [form, setForm2]      = useState({
    gtin:"", lot:"", productName:"", expiryDate:"", quantity:0, unitPrice:0
  });
  const qc = useQueryClient();


  const { data: batches = [], isLoading } = useQuery<Batch[]>({
    queryKey:  ["batches"],
    queryFn:   () => api.get("/batches").then(r => r.data),
    refetchInterval: 15_000,
  });


  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/batches", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["batches"] });
      setForm(false);
      toast.success("Lote registrado na blockchain!");
    },
    onError: (e:any) => toast.error(e.response?.data?.error ?? "Erro ao registrar"),
  });


  const recallMutation = useMutation({
    mutationFn: ({ id, reason }:{id:string;reason:string}) =>
      api.post(`/batches/${id}/recall`, { reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["batches"] }); toast.success("Recall iniciado!"); },
    onError:   (e:any) => toast.error(e.response?.data?.error ?? "Erro"),
  });


  const filtered = batches.filter(b =>
    b.productName.toLowerCase().includes(search.toLowerCase()) ||
    b.gtin.includes(search) || b.lot.includes(search)
  );


  return (
    <div style={{ maxWidth:1100 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, marginBottom:4 }}>Lotes</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>
            {batches.length} lotes registrados na blockchain
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setForm(true)}>
          <Plus size={16}/> Novo Lote
        </button>
      </div>


      {/* Search */}
      <div style={{ position:"relative", marginBottom:20 }}>
        <Search size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text2)" }}/>
        <input className="input" style={{ paddingLeft:38 }}
          placeholder="Buscar por nome, GTIN ou lote..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>


      {/* Tabela */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Produto</th><th>GTIN</th><th>Lote</th>
              <th>Validade</th><th>Estoque</th><th>Status</th>
              <th>Tx Hash</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign:"center", padding:40, color:"var(--text2)" }}>
                Carregando da blockchain...
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight:500 }}>{b.productName}</td>
                <td style={{ fontFamily:"monospace", fontSize:12 }}>{b.gtin}</td>
                <td>{b.lot}</td>
                <td>{format(new Date(b.expiryDate),"dd/MM/yyyy",{locale:ptBR})}</td>
                <td><strong>{b.quantity}</strong> un.</td>
                <td><StatusBadge status={b.status}/></td>
                <td>
                  {b.txHash ? (
                    <a href={`https://amoy.polygonscan.com/tx/${b.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:11, color:"var(--accent)", fontFamily:"monospace" }}
                    >
                      {b.txHash.slice(0,10)}...
                    </a>
                  ) : "-"}
                </td>
                <td>
                  {b.status==="ACTIVE" && (
                    <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:12 }}
                      onClick={() => {
                        const reason = prompt("Motivo do recall (mínimo 10 caracteres):");
                        if (reason && reason.length >= 10) recallMutation.mutate({ id:b.id, reason });
                      }}
                    >
                      <AlertCircle size={13}/> Recall
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Modal novo lote */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{
              position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000
            }}
            onClick={e => e.target===e.currentTarget && setForm(false)}
          >
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.9, opacity:0 }} transition={{ type:"spring", stiffness:400, damping:30 }}
              className="card" style={{ width:480, maxHeight:"90vh", overflowY:"auto" }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:20 }}>Registrar Novo Lote</h2>
                <button style={{ border:"none", background:"none", cursor:"pointer" }} onClick={() => setForm(false)}><X size={20}/></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  ["GTIN-14 (ANVISA)", "gtin", "text",   "00000000000000"],
                  ["Nome do Produto",  "productName","text","Dipirona 500mg"],
                  ["Nº do Lote",       "lot",  "text",   "LOTE-2026-001"],
                  ["Validade",         "expiryDate","datetime-local",""],
                  ["Quantidade (un.)", "quantity","number","1000"],
                  ["Preço Unitário R$","unitPrice","number","2.50"],
                ].map(([label,key,type,ph]) => (
                  <div key={key}>
                    <label style={{ fontSize:13, fontWeight:500, display:"block", marginBottom:6 }}>{label}</label>
                    <input className="input" type={type as any} placeholder={ph}
                      value={(form as any)[key]} onChange={e => setForm2(p => ({ ...p, [key]: e.target.value }))}/>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ height:44, marginTop:4 }}
                  disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate({ ...form, quantity:Number(form.quantity), unitPrice:Number(form.unitPrice) })}
                >
                  {createMutation.isPending ? "Registrando na blockchain..." : "Registrar Lote"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

