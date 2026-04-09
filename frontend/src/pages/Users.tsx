import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Users as UsersIcon, Building2, Stethoscope, Truck, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

const ROLE_CONFIG: Record<string, { label:string; color:string; bg:string; Icon:any }> = {
  MANUFACTURER: { label:"Fabricante",    color:"#8b5cf6", bg:"#f5f3ff", Icon: Building2   },
  DISTRIBUTOR:  { label:"Distribuidor",  color:"#3b82f6", bg:"#eff6ff", Icon: Truck        },
  PHARMACY:     { label:"Farmacia",      color:"#10b981", bg:"#f0fdf4", Icon: ShieldCheck  },
  DOCTOR:       { label:"Medico",        color:"#f59e0b", bg:"#fffbeb", Icon: Stethoscope  },
  ADMIN:        { label:"Admin",         color:"#ef4444", bg:"#fef2f2", Icon: UsersIcon    },
};

interface Participant {
  id: string; name: string; cnpj: string; role: string;
  address: string; active: boolean; createdAt: string;
}

export default function Users() {
  const { role: myRole } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showForm, setForm] = useState(false);
  const [form, setFv]       = useState({ name:"", cnpj:"", role:"PHARMACY", password:"" });
  const qc = useQueryClient();

  const { data: participants = [], isLoading } = useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn:  () => api.get("/participants").then(r => r.data),
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/participants", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["participants"] }); setForm(false); toast.success("Participante cadastrado!"); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao cadastrar"),
  });

  const filtered = participants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.cnpj.includes(q);
    const matchRole = roleFilter === "ALL" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Participantes</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>Entidades autorizadas na rede PharmaChain</p>
        </div>
        {myRole === "ADMIN" && (
          <button onClick={() => setForm(true)} style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            <Plus size={16} /> Novo Participante
          </button>
        )}
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:2, minWidth:200 }}>
          <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:13, outline:"none", fontFamily:"inherit", background:"white" }}
            placeholder="Buscar por nome ou CNPJ..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:13, outline:"none", background:"white", fontFamily:"inherit" }}
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">Todos os papeis</option>
          {Object.entries(ROLE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:16 }}>
        {isLoading ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:48, color:"#94a3b8" }}>Carregando participantes...</div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:48, color:"#94a3b8", background:"white", borderRadius:16 }}>
            <UsersIcon size={32} style={{ margin:"0 auto 8px", display:"block" }} />
            Nenhum participante encontrado.
          </div>
        ) : filtered.map(p => {
          const cfg = ROLE_CONFIG[p.role] ?? ROLE_CONFIG.ADMIN;
          const Icon = cfg.Icon;
          return (
            <motion.div key={p.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={20} color={cfg.color} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                    <p style={{ fontWeight:700, fontSize:15, color:"#0a1628", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</p>
                    <span style={{ background:cfg.bg, color:cfg.color, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, flexShrink:0 }}>{cfg.label}</span>
                  </div>
                  <p style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>CNPJ: {p.cnpj}</p>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#94a3b8", wordBreak:"break-all" }}>
                    {p.address?.slice(0,18)}...{p.address?.slice(-6)}
                  </p>
                </div>
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>
                  Desde {format(new Date(p.createdAt), "MMM yyyy", { locale:ptBR })}
                </span>
                <span style={{ fontSize:11, fontWeight:600, color: p.active ? "#10b981" : "#ef4444" }}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
            onClick={e => { if (e.target === e.currentTarget) setForm(false); }}>
            <motion.div initial={{ scale:0.92 }} animate={{ scale:1 }} exit={{ scale:0.92 }}
              style={{ background:"white", borderRadius:20, padding:36, width:"100%", maxWidth:440 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:20, fontWeight:800 }}>Novo Participante</h2>
                <button onClick={() => setForm(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16} /></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  ["NOME COMPLETO / EMPRESA", "name", "text", "Farmacia XYZ Ltda"],
                  ["CNPJ (somente numeros)", "cnpj", "text", "00000000000000"],
                  ["SENHA", "password", "password", "Minimo 8 caracteres"],
                ].map(([label, key, type, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>{label}</label>
                    <input type={type} placeholder={ph} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={(form as any)[key]} onChange={e => setFv(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>PAPEL</label>
                  <select style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    value={form.role} onChange={e => setFv(p => ({ ...p, role: e.target.value }))}>
                    {Object.entries(ROLE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <button disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate(form)}
                  style={{ padding:"12px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", marginTop:4 }}>
                  {createMutation.isPending ? "Cadastrando..." : "Cadastrar Participante"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
