import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

interface Rx {
  id: string; dosage: string; quantity: number;
  expiresAt: string; dispensedAt: string | null; createdAt: string;
  doctor: { name: string };
  pharmacy: { name: string } | null;
  batch: { productName: string; gtin: string; lot: string };
}

export default function Prescriptions() {
  const { role, participantId } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showForm, setForm] = useState(false);
  const [form, setFv]       = useState({ batchId:"", patientCpf:"", dosage:"", quantity:1, expiresAt:"", signature:"demo-sig" });
  const qc = useQueryClient();

  const { data: rxList = [], isLoading } = useQuery<Rx[]>({
    queryKey: ["prescriptions"],
    queryFn:  () => api.get("/prescriptions").then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["batches-select"],
    queryFn:  () => api.get("/batches").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/prescriptions", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["prescriptions"] }); setForm(false); toast.success("Receita emitida!"); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao emitir"),
  });

  const dispenseMutation = useMutation({
    mutationFn: (id: string) => api.post("/prescriptions/" + id + "/dispense"),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["prescriptions"] }); toast.success("Medicamento dispensado!"); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao dispensar"),
  });

  const filtered = rxList.filter(r =>
    r.batch?.productName?.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  function StatusBadge({ rx }: { rx: Rx }) {
    const expired = new Date(rx.expiresAt) < new Date();
    if (rx.dispensedAt) return <span style={{ background:"#d1fae5", color:"#065f46", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}><CheckCircle size={11} /> Dispensada</span>;
    if (expired) return <span style={{ background:"#fee2e2", color:"#ef4444", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}><AlertCircle size={11} /> Expirada</span>;
    return <span style={{ background:"#fef3c7", color:"#92400e", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}><Clock size={11} /> Pendente</span>;
  }

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Receitas Medicas</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>Prescricoes digitais assinadas e registradas na blockchain</p>
        </div>
        {role === "DOCTOR" && (
          <button onClick={() => setForm(true)} style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            <Plus size={16} /> Nova Receita
          </button>
        )}
      </div>

      <div style={{ position:"relative", marginBottom:20 }}>
        <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
        <input style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:13, outline:"none", fontFamily:"inherit", background:"white" }}
          placeholder="Buscar por produto ou medico..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {isLoading ? (
          <div style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>Carregando receitas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:48, color:"#94a3b8", background:"white", borderRadius:16 }}>
            <FileText size={32} style={{ margin:"0 auto 8px", display:"block" }} />
            Nenhuma receita encontrada.
          </div>
        ) : filtered.map(rx => (
          <motion.div key={rx.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <FileText size={20} color="#3b82f6" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <p style={{ fontWeight:700, fontSize:15, color:"#0a1628" }}>{rx.batch?.productName}</p>
                <StatusBadge rx={rx} />
              </div>
              <p style={{ fontSize:13, color:"#64748b" }}>
                Dr. {rx.doctor?.name}  |  {rx.dosage}  |  {rx.quantity} un.
              </p>
              <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>
                Emitida: {format(new Date(rx.createdAt), "dd/MM/yyyy", { locale:ptBR })}  |
                Validade: {format(new Date(rx.expiresAt), "dd/MM/yyyy", { locale:ptBR })}
                {rx.dispensedAt && "  |  Dispensada: " + format(new Date(rx.dispensedAt), "dd/MM/yyyy", { locale:ptBR })}
              </p>
            </div>
            {role === "PHARMACY" && !rx.dispensedAt && new Date(rx.expiresAt) > new Date() && (
              <button onClick={() => dispenseMutation.mutate(rx.id)}
                style={{ padding:"9px 18px", background:"#10b981", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
                Dispensar
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
            onClick={e => { if (e.target === e.currentTarget) setForm(false); }}>
            <motion.div initial={{ scale:0.92 }} animate={{ scale:1 }} exit={{ scale:0.92 }}
              style={{ background:"white", borderRadius:20, padding:36, width:"100%", maxWidth:480 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:20, fontWeight:800 }}>Nova Receita</h2>
                <button onClick={() => setForm(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16} /></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>MEDICAMENTO (LOTE)</label>
                  <select style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    value={form.batchId} onChange={e => setFv(p => ({ ...p, batchId: e.target.value }))}>
                    <option value="">Selecione o lote...</option>
                    {batches.map((b: any) => <option key={b.id} value={b.id}>{b.productName} — Lote {b.lot}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>CPF DO PACIENTE</label>
                  <input style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    placeholder="000.000.000-00" maxLength={14}
                    value={form.patientCpf} onChange={e => setFv(p => ({ ...p, patientCpf: e.target.value.replace(/\D/g,"") }))} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>POSOLOGIA</label>
                  <input style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    placeholder="Ex: 1 comprimido 8/8h por 5 dias"
                    value={form.dosage} onChange={e => setFv(p => ({ ...p, dosage: e.target.value }))} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>QUANTIDADE</label>
                    <input type="number" min={1} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={form.quantity} onChange={e => setFv(p => ({ ...p, quantity: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>VALIDADE</label>
                    <input type="date" style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={form.expiresAt} onChange={e => setFv(p => ({ ...p, expiresAt: e.target.value + "T23:59:00.000Z" }))} />
                  </div>
                </div>
                <button disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate(form)}
                  style={{ padding:"12px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", marginTop:4 }}>
                  {createMutation.isPending ? "Registrando na blockchain..." : "Emitir Receita"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
