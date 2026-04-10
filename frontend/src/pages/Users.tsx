import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UserPlus, Shield, Truck, FlaskConical, Stethoscope, Eye } from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

const ROLES = [
  { value:"MANUFACTURER", label:"Fabricante",    icon:FlaskConical, color:"#8b5cf6", bg:"#ede9fe", desc:"Registra e gerencia lotes de medicamentos" },
  { value:"DISTRIBUTOR",  label:"Distribuidor",  icon:Truck,        color:"#3b82f6", bg:"#dbeafe", desc:"Transporta e distribui entre fabricantes e farmácias" },
  { value:"PHARMACY",     label:"Farmácia",      icon:Shield,       color:"#10b981", bg:"#d1fae5", desc:"Recebe lotes e dispensa medicamentos com receita" },
  { value:"DOCTOR",       label:"Médico",        icon:Stethoscope,  color:"#f59e0b", bg:"#fef3c7", desc:"Emite receitas médicas digitais assinadas" },
  { value:"AUDITOR",      label:"Auditor",       icon:Eye,          color:"#64748b", bg:"#f1f5f9", desc:"Visualiza toda a cadeia sem permissão de escrita" },
];

export default function Users() {
  const { role } = useAuthStore();
  const [showForm, setForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setFv] = useState({
    name:"", cnpj:"", address:"", role:"MANUFACTURER", password:"", confirm:""
  });

  const canAdd = role === "ADMIN" || role === "MANUFACTURER";

  async function handleSubmit() {
    if (form.password !== form.confirm) { toast.error("Senhas não coincidem"); return; }
    if (form.password.length < 8) { toast.error("Senha mínima: 8 caracteres"); return; }
    if (form.cnpj.replace(/\D/g,"").length !== 14) { toast.error("CNPJ inválido"); return; }
    setLoading(true);
    try {
      await api.post("/participants", {
        name:         form.name,
        cnpj:         form.cnpj.replace(/\D/g,""),
        address:      form.address,
        role:         form.role,
        passwordHash: form.password,
      });
      toast.success("Participante cadastrado com sucesso!");
      setForm(false);
      setFv({ name:"", cnpj:"", address:"", role:"MANUFACTURER", password:"", confirm:"" });
    } catch (e:any) {
      toast.error(e.response?.data?.error ?? "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  function cnpjMask(v: string) {
    return v.replace(/\D/g,"").slice(0,14)
      .replace(/(\d{2})(\d)/,"$1.$2")
      .replace(/(\d{3})(\d)/,"$1.$2")
      .replace(/(\d{3})(\d)/,"$1/$2")
      .replace(/(\d{4})(\d{1,2})$/,"$1-$2");
  }

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:36 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Participantes</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>
            Gerencie os participantes autorizados da rede PharmaChain
          </p>
        </div>
        {canAdd && (
          <button onClick={() => setForm(true)} style={{
            display:"flex", alignItems:"center", gap:8,
            background:"linear-gradient(135deg,#0a1628,#1e3a8a)",
            color:"white", border:"none", borderRadius:12, padding:"11px 20px",
            fontSize:14, fontWeight:600, cursor:"pointer"
          }}>
            <UserPlus size={16}/> Adicionar Participante
          </button>
        )}
      </div>

      {/* Papéis disponíveis */}
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"#0a1628", marginBottom:16 }}>
          Papéis na Rede
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {ROLES.map(({ value, label, icon: Icon, color, bg, desc }) => (
            <motion.div key={value}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #e2e8f0" }}
              whileHover={{ y:-3, boxShadow:"0 12px 32px rgba(0,0,0,0.08)" }}
            >
              <div style={{ width:44, height:44, borderRadius:12, background:bg,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <Icon size={20} color={color}/>
              </div>
              <p style={{ fontSize:15, fontWeight:700, color:"#0a1628", marginBottom:6 }}>{label}</p>
              <p style={{ fontSize:13, color:"#64748b", lineHeight:1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info */}
      {!canAdd && (
        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:16, padding:24, textAlign:"center" }}>
          <Shield size={32} color="#3b82f6" style={{ margin:"0 auto 12px", display:"block" }}/>
          <p style={{ fontSize:14, color:"#1e40af", fontWeight:600, marginBottom:4 }}>
            Acesso restrito
          </p>
          <p style={{ fontSize:13, color:"#3b82f6" }}>
            Apenas administradores podem cadastrar novos participantes na rede.
          </p>
        </div>
      )}

      {/* Modal cadastro */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:1000,
              display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
            onClick={e => e.target===e.currentTarget && setForm(false)}
          >
            <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:.92, opacity:0 }}
              style={{ background:"white", borderRadius:20, padding:36,
                width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto" }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#0a1628" }}>Novo Participante</h2>
                  <p style={{ fontSize:13, color:"#64748b", marginTop:2 }}>Será registrado na rede PharmaChain</p>
                </div>
                <button onClick={() => setForm(false)}
                  style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer" }}>
                  <X size={16}/>
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  { label:"NOME COMPLETO / RAZÃO SOCIAL", key:"name", type:"text", ph:"Ex: Farmácia Central Ltda" },
                  { label:"ENDEREÇO ETHEREUM (0x...)",    key:"address", type:"text", ph:"0x..." },
                ].map(({ label, key, type, ph }) => (
                  <div key={key}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:5, letterSpacing:".3px" }}>{label}</label>
                    <input type={type} placeholder={ph}
                      style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={(form as any)[key]}
                      onChange={e => setFv(p => ({ ...p, [key]: e.target.value }))}/>
                  </div>
                ))}

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:5, letterSpacing:".3px" }}>CNPJ</label>
                  <input placeholder="00.000.000/0001-00"
                    style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    value={form.cnpj} onChange={e => setFv(p => ({ ...p, cnpj: cnpjMask(e.target.value) }))}/>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:5, letterSpacing:".3px" }}>PAPEL NA REDE</label>
                  <select style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit", background:"white" }}
                    value={form.role} onChange={e => setFv(p => ({ ...p, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[
                    { label:"SENHA", key:"password", ph:"Mínimo 8 caracteres" },
                    { label:"CONFIRMAR SENHA", key:"confirm", ph:"Repita a senha" },
                  ].map(({ label, key, ph }) => (
                    <div key={key}>
                      <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:5, letterSpacing:".3px" }}>{label}</label>
                      <input type="password" placeholder={ph}
                        style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                        value={(form as any)[key]}
                        onChange={e => setFv(p => ({ ...p, [key]: e.target.value }))}/>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:12 }}>
                  <p style={{ fontSize:12, color:"#166534", lineHeight:1.6 }}>
                    O participante receberá acesso imediato após o cadastro. Certifique-se de que o endereço Ethereum é válido e pertence ao participante.
                  </p>
                </div>

                <button onClick={handleSubmit} disabled={loading || !form.name || !form.cnpj || !form.address || !form.password}
                  style={{ padding:"13px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)",
                    color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                    cursor:"pointer", fontFamily:"inherit", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Cadastrando..." : "Cadastrar Participante"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
