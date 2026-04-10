import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, X, FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

interface Rx {
  id:string; dosage:string; quantity:number;
  expiresAt:string; dispensedAt:string|null; createdAt:string;
  patientHash:string; txHash?:string; signature:string;
  doctor:{ id:string; name:string; cnpj:string };
  pharmacy:{ name:string }|null;
  batch:{ id:string; productName:string; gtin:string; lot:string; expiryDate:string };
}

function cpfMask(v:string) {
  return v.replace(/\D/g,"").slice(0,11)
    .replace(/(\d{3})(\d)/,"$1.$2")
    .replace(/(\d{3})(\d)/,"$1.$2")
    .replace(/(\d{3})(\d{1,2})$/,"$1-$2");
}

function StatusBadge({ rx }:{ rx:Rx }) {
  const exp = new Date(rx.expiresAt) < new Date();
  if (rx.dispensedAt) return (
    <span style={{ background:"#DCFCE7",color:"#15803D",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
      <CheckCircle size={11}/> Dispensada
    </span>
  );
  if (exp) return (
    <span style={{ background:"#FEE2E2",color:"#DC2626",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
      <AlertCircle size={11}/> Expirada
    </span>
  );
  return (
    <span style={{ background:"#FEF3C7",color:"#D97706",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
      <Clock size={11}/> Pendente
    </span>
  );
}

export default function Prescriptions() {
  const { role } = useAuthStore();
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"ALL"|"PENDING"|"DISPENSED"|"EXPIRED">("ALL");
  const [showForm, setForm]     = useState(false);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [form, setFv] = useState({
    batchId:"", patientCpf:"", dosage:"", quantity:1,
    expiresAt:"", signature:"demo-sig-"+Date.now()
  });
  const qc = useQueryClient();

  const { data: rxList=[], isLoading } = useQuery<Rx[]>({
    queryKey: ["prescriptions"],
    queryFn:  () => api.get("/prescriptions").then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: batches=[] } = useQuery({
    queryKey: ["batches-active"],
    queryFn:  () => api.get("/batches").then(r => r.data.filter((b:any) => b.status==="ACTIVE")),
  });

  const createMutation = useMutation({
    mutationFn: (data:typeof form) => api.post("/prescriptions", {
      ...data,
      patientCpf: data.patientCpf.replace(/\D/g,""),
      quantity: Number(data.quantity),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["prescriptions"] });
      setForm(false);
      setFv({ batchId:"", patientCpf:"", dosage:"", quantity:1, expiresAt:"", signature:"demo-sig-"+Date.now() });
      toast.success("Receita registrada na blockchain!");
    },
    onError: (e:any) => toast.error(e.response?.data?.error ?? "Erro ao emitir receita"),
  });

  const dispenseMutation = useMutation({
    mutationFn: (id:string) => api.post("/prescriptions/"+id+"/dispense"),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["prescriptions"] }); toast.success("Medicamento dispensado!"); },
    onError: (e:any) => toast.error(e.response?.data?.error ?? "Erro ao dispensar"),
  });

  const filtered = rxList.filter(rx => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      rx.batch?.productName?.toLowerCase().includes(q) ||
      rx.doctor?.name?.toLowerCase().includes(q);
    const exp = new Date(rx.expiresAt) < new Date();
    const matchFilter =
      filter==="ALL" ? true :
      filter==="PENDING"    ? !rx.dispensedAt && !exp :
      filter==="DISPENSED"  ? !!rx.dispensedAt :
      filter==="EXPIRED"    ? exp && !rx.dispensedAt : true;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL:       rxList.length,
    PENDING:   rxList.filter(r => !r.dispensedAt && new Date(r.expiresAt)>new Date()).length,
    DISPENSED: rxList.filter(r => !!r.dispensedAt).length,
    EXPIRED:   rxList.filter(r => !r.dispensedAt && new Date(r.expiresAt)<new Date()).length,
  };

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28,fontWeight:800,color:"#0F2417",marginBottom:6 }}>Receitas Médicas</h1>
          <p style={{ color:"#4B6B58",fontSize:15 }}>Prescrições digitais assinadas e registradas na blockchain</p>
        </div>
        {role==="DOCTOR" && (
          <button onClick={() => setForm(true)} style={{ display:"flex",alignItems:"center",gap:8,
            background:"linear-gradient(135deg,#0F2417,#14532D)",color:"white",border:"none",
            borderRadius:12,padding:"11px 20px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
            <Plus size={16}/> Nova Receita
          </button>
        )}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
        {[
          { key:"ALL",       label:"Total",       color:"#16A34A", bg:"#DCFCE7" },
          { key:"PENDING",   label:"Pendentes",   color:"#D97706", bg:"#FEF3C7" },
          { key:"DISPENSED", label:"Dispensadas", color:"#16A34A", bg:"#DCFCE7" },
          { key:"EXPIRED",   label:"Expiradas",   color:"#DC2626", bg:"#FEE2E2" },
        ].map(item => (
          <button key={item.key} onClick={() => setFilter(item.key as any)}
            style={{ background:filter===item.key?item.bg:"white",
              border:"1.5px solid "+(filter===item.key?item.color:"rgba(22,163,74,0.15)"),
              borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",transition:"all .2s" }}>
            <p style={{ fontSize:24,fontWeight:800,color:item.color,marginBottom:2 }}>{(counts as any)[item.key]}</p>
            <p style={{ fontSize:12,color:"#4B6B58",fontWeight:500 }}>{item.label}</p>
          </button>
        ))}
      </div>

      <div style={{ position:"relative",marginBottom:20 }}>
        <Search size={14} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8" }}/>
        <input style={{ width:"100%",padding:"10px 14px 10px 36px",border:"1.5px solid rgba(22,163,74,0.15)",
          borderRadius:12,fontSize:13,outline:"none",fontFamily:"inherit",background:"white" }}
          placeholder="Buscar por produto ou médico..."
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {isLoading ? (
          <div style={{ textAlign:"center",padding:48,color:"#94a3b8" }}>Carregando receitas...</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:48,color:"#94a3b8",background:"white",
            borderRadius:16,border:"1px solid rgba(22,163,74,0.12)" }}>
            <FileText size={32} style={{ margin:"0 auto 8px",display:"block" }}/>
            Nenhuma receita encontrada.
          </div>
        ) : filtered.map(rx => (
          <div key={rx.id} style={{ background:"white",borderRadius:16,
            border:"1px solid rgba(22,163,74,0.12)",overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,padding:18,cursor:"pointer" }}
              onClick={() => setExpanded(expanded===rx.id ? null : rx.id)}>
              <div style={{ width:42,height:42,borderRadius:11,background:"#DCFCE7",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <FileText size={19} color="#16A34A"/>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
                  <p style={{ fontWeight:700,fontSize:15,color:"#0F2417" }}>{rx.batch?.productName}</p>
                  <StatusBadge rx={rx}/>
                </div>
                <p style={{ fontSize:13,color:"#4B6B58" }}>
                  {rx.doctor?.name} | {rx.dosage} | {rx.quantity} un.
                </p>
                <p style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>
                  Emitida {format(new Date(rx.createdAt),"dd/MM/yyyy",{locale:ptBR})} ·
                  Válida até {format(new Date(rx.expiresAt),"dd/MM/yyyy",{locale:ptBR})}
                </p>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
                {role==="PHARMACY" && !rx.dispensedAt && new Date(rx.expiresAt)>new Date() && (
                  <button onClick={e => { e.stopPropagation(); dispenseMutation.mutate(rx.id); }}
                    disabled={dispenseMutation.isPending}
                    style={{ padding:"8px 16px",background:"#16A34A",color:"white",border:"none",
                      borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                    {dispenseMutation.isPending ? "..." : "Dispensar"}
                  </button>
                )}
                {expanded===rx.id ? <ChevronUp size={16} color="#94a3b8"/> : <ChevronDown size={16} color="#94a3b8"/>}
              </div>
            </div>

            {expanded===rx.id && (
              <div style={{ borderTop:"1px solid #F0FAF4",padding:18,
                display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                <div>
                  <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:".5px" }}>MEDICAMENTO</p>
                  <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>GTIN:</strong> {rx.batch?.gtin}</p>
                  <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>Lote:</strong> {rx.batch?.lot}</p>
                  <p style={{ fontSize:13,color:"#374151" }}><strong>Validade:</strong> {rx.batch?.expiryDate ? format(new Date(rx.batch.expiryDate),"dd/MM/yyyy") : "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:".5px" }}>PACIENTE</p>
                  <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>Hash CPF:</strong></p>
                  <p style={{ fontSize:11,fontFamily:"monospace",color:"#4B6B58",wordBreak:"break-all" }}>{rx.patientHash}</p>
                  <p style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>Protegido por SHA-256 (LGPD)</p>
                </div>
                {rx.txHash && (
                  <div style={{ gridColumn:"1/-1",paddingTop:12,borderTop:"1px solid #F0FAF4" }}>
                    <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:6,letterSpacing:".5px" }}>REGISTRO BLOCKCHAIN</p>
                    <a href={"https://amoy.polygonscan.com/tx/"+rx.txHash}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex",alignItems:"center",gap:6,fontSize:12,
                        color:"#16A34A",textDecoration:"none",background:"#DCFCE7",
                        padding:"5px 12px",borderRadius:8 }}>
                      <ExternalLink size={12}/>
                      {rx.txHash.slice(0,16)}...{rx.txHash.slice(-8)}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal nova receita */}
      {showForm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,
          display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={e => { if(e.target===e.currentTarget) setForm(false); }}>
          <div style={{ background:"white",borderRadius:20,padding:36,width:"100%",
            maxWidth:500,maxHeight:"90vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20,fontWeight:800,color:"#0F2417" }}>Nova Receita Médica</h2>
                <p style={{ fontSize:13,color:"#4B6B58",marginTop:2 }}>Será registrada na blockchain imediatamente</p>
              </div>
              <button onClick={() => setForm(false)}
                style={{ background:"#F0FAF4",border:"none",borderRadius:8,width:32,height:32,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <X size={16}/>
              </button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".3px" }}>MEDICAMENTO / LOTE</label>
                <select style={{ width:"100%",padding:"11px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                  borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                  value={form.batchId} onChange={e => setFv(p => ({ ...p, batchId:e.target.value }))}>
                  <option value="">Selecione o lote...</option>
                  {(batches as any[]).map((b:any) => (
                    <option key={b.id} value={b.id}>{b.productName} — Lote {b.lot} ({b.quantity} un.)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".3px" }}>CPF DO PACIENTE</label>
                <input style={{ width:"100%",padding:"11px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                  borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                  placeholder="000.000.000-00" value={form.patientCpf}
                  onChange={e => setFv(p => ({ ...p, patientCpf: cpfMask(e.target.value) }))}/>
                <p style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>Armazenado como hash SHA-256 — LGPD</p>
              </div>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".3px" }}>POSOLOGIA</label>
                <input style={{ width:"100%",padding:"11px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                  borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                  placeholder="Ex: 1 comprimido a cada 8h por 5 dias"
                  value={form.dosage} onChange={e => setFv(p => ({ ...p, dosage:e.target.value }))}/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".3px" }}>QUANTIDADE</label>
                  <input type="number" min={1}
                    style={{ width:"100%",padding:"11px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                      borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                    value={form.quantity} onChange={e => setFv(p => ({ ...p, quantity:Number(e.target.value) }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".3px" }}>VALIDADE DA RECEITA</label>
                  <input type="date"
                    style={{ width:"100%",padding:"11px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                      borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                    value={form.expiresAt.slice(0,10)}
                    onChange={e => setFv(p => ({ ...p, expiresAt:e.target.value+"T23:59:00.000Z" }))}/>
                </div>
              </div>
              <button disabled={createMutation.isPending || !form.batchId || !form.patientCpf || !form.dosage}
                onClick={() => createMutation.mutate(form)}
                style={{ padding:"13px",
                  background:!form.batchId||!form.patientCpf||!form.dosage?"#94a3b8":"linear-gradient(135deg,#0F2417,#14532D)",
                  color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,
                  cursor:!form.batchId||!form.patientCpf||!form.dosage?"not-allowed":"pointer",
                  fontFamily:"inherit" }}>
                {createMutation.isPending ? "Registrando na blockchain..." : "Emitir Receita"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
