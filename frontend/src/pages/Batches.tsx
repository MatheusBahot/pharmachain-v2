import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, AlertCircle, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Batch {
  id: string; gtin: string; lot: string; productName: string;
  expiryDate: string; quantity: number; status: string; txHash?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ACTIVE:    { bg:"#DCFCE7", color:"#16A34A", label:"Ativo"      },
    RECALLED:  { bg:"#FEE2E2", color:"#DC2626", label:"Recall"     },
    EXPIRED:   { bg:"#FEF3C7", color:"#D97706", label:"Vencido"    },
    DISPENSED: { bg:"#DBEAFE", color:"#2563EB", label:"Dispensado" },
  };
  const s = map[status] ?? { bg:"#F1F5F9", color:"#64748B", label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      padding: "3px 10px", borderRadius: 20, display: "inline-block"
    }}>
      {s.label}
    </span>
  );
}

export default function Batches() {
  const [search, setSearch] = useState("");
  const [showForm, setForm] = useState(false);
  const [form, setFv]       = useState({
    gtin: "", lot: "", productName: "",
    expiryDate: "", quantity: 0, unitPrice: 0
  });
  const qc = useQueryClient();

  const { data: batches = [], isLoading } = useQuery<Batch[]>({
    queryKey:        ["batches"],
    queryFn:         () => api.get("/batches").then(r => r.data),
    refetchInterval: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/batches", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      setForm(false);
      setFv({ gtin:"", lot:"", productName:"", expiryDate:"", quantity:0, unitPrice:0 });
      toast.success("Lote registrado na blockchain!");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao registrar"),
  });

  const recallMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post("/batches/" + id + "/recall", { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Recall iniciado na blockchain!");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao iniciar recall"),
  });

  const filtered = batches.filter(b =>
    b.productName.toLowerCase().includes(search.toLowerCase()) ||
    b.gtin.includes(search) ||
    b.lot.includes(search)
  );

  const fields: [string, keyof typeof form, string, string][] = [
    ["GTIN-14 (ANVISA)",  "gtin",        "text",           "00000000000000"],
    ["Nome do Produto",   "productName", "text",           "Dipirona Sódica 500mg"],
    ["Número do Lote",    "lot",         "text",           "LOTE-2026-001"],
    ["Validade",          "expiryDate",  "datetime-local", ""],
    ["Quantidade (un.)",  "quantity",    "number",         "1000"],
    ["Preço Unitário R$", "unitPrice",   "number",         "2.50"],
  ];

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4, color:"#0F2417" }}>Lotes</h1>
          <p style={{ color:"#4B6B58", fontSize:15 }}>
            {batches.length} lotes registrados na blockchain
          </p>
        </div>
        <button
          onClick={() => setForm(true)}
          style={{
            display:"flex", alignItems:"center", gap:8,
            background:"linear-gradient(135deg,#16A34A,#15803D)",
            color:"white", border:"none", borderRadius:12,
            padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer"
          }}>
          <Plus size={16} /> Novo Lote
        </button>
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:20 }}>
        <Search size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }} />
        <input
          style={{
            width:"100%", padding:"10px 14px 10px 40px",
            border:"1.5px solid #E2E8F0", borderRadius:12,
            fontSize:13, outline:"none", fontFamily:"inherit", background:"white"
          }}
          placeholder="Buscar por nome, GTIN ou lote..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div style={{ background:"white", borderRadius:16, border:"1px solid #E2E8F0", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["Produto","GTIN","Lote","Validade","Estoque","Status","Tx Hash","Ações"].map(h => (
                <th key={h} style={{
                  textAlign:"left", padding:"12px 16px", fontSize:11,
                  fontWeight:700, color:"#64748B", letterSpacing:"0.5px",
                  textTransform:"uppercase", borderBottom:"1px solid #E2E8F0"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign:"center", padding:48, color:"#94A3B8" }}>
                  Carregando da blockchain...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign:"center", padding:48, color:"#94A3B8" }}>
                  Nenhum lote encontrado.
                </td>
              </tr>
            ) : filtered.map(b => (
              <motion.tr
                key={b.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ borderBottom:"1px solid #F1F5F9" }}
              >
                <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13, color:"#0F2417" }}>
                  {b.productName}
                </td>
                <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:12, color:"#64748B" }}>
                  {b.gtin}
                </td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{b.lot}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>
                  {format(new Date(b.expiryDate), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>
                  <strong>{b.quantity}</strong> un.
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <StatusBadge status={b.status} />
                </td>
                <td style={{ padding:"12px 16px" }}>
                  {b.txHash ? (
                    <a
                    
                      href={"https://amoy.polygonscan.com/tx/" + b.txHash}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display:"inline-flex", alignItems:"center", gap:4,
                        fontSize:11, color:"#2563EB", textDecoration:"none",
                        background:"#DBEAFE", padding:"3px 8px", borderRadius:6
                      }}>
                      <ExternalLink size={10} />
                      {b.txHash.slice(0, 8)}...
                    </a>
                  ) : (
                    <span style={{ fontSize:12, color:"#94A3B8" }}>pending</span>
                  )}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  {b.status === "ACTIVE" && (
                    <button
                      style={{
                        display:"inline-flex", alignItems:"center", gap:5,
                        padding:"5px 12px", background:"#FEF2F2",
                        color:"#DC2626", border:"1px solid #FECACA",
                        borderRadius:8, fontSize:12, fontWeight:600,
                        cursor:"pointer", fontFamily:"inherit"
                      }}
                      onClick={() => {
                        const reason = prompt("Motivo do recall (mínimo 10 caracteres):");
                        if (reason && reason.length >= 10) {
                          recallMutation.mutate({ id: b.id, reason });
                        }
                      }}
                    >
                      <AlertCircle size={12} /> Recall
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal novo lote */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{
              position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
              display:"flex", alignItems:"center", justifyContent:"center",
              zIndex:1000, padding:24
            }}
            onClick={e => { if (e.target === e.currentTarget) setForm(false); }}
          >
            <motion.div
              initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.92, opacity:0 }}
              style={{
                background:"white", borderRadius:20, padding:36,
                width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto"
              }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#0F2417" }}>Registrar Novo Lote</h2>
                  <p style={{ fontSize:13, color:"#64748B", marginTop:2 }}>Será registrado na blockchain imediatamente</p>
                </div>
                <button
                  onClick={() => setForm(false)}
                  style={{ background:"#F1F5F9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {fields.map(([label, key, type, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6, letterSpacing:"0.3px" }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={ph}
                      style={{
                        width:"100%", padding:"10px 14px",
                        border:"1.5px solid #E2E8F0", borderRadius:10,
                        fontSize:13, outline:"none", fontFamily:"inherit"
                      }}
                      value={String(form[key])}
                      onChange={e => setFv(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}

                <button
                  disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate({
                    ...form,
                    quantity:  Number(form.quantity),
                    unitPrice: Number(form.unitPrice),
                  })}
                  style={{
                    padding:"13px", marginTop:4,
                    background: createMutation.isPending
                      ? "#94A3B8"
                      : "linear-gradient(135deg,#16A34A,#15803D)",
                    color:"white", border:"none", borderRadius:12,
                    fontSize:15, fontWeight:700, cursor: createMutation.isPending ? "not-allowed" : "pointer",
                    fontFamily:"inherit"
                  }}>
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
