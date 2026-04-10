import { useState } from "react";
import { X, UserPlus, Shield, Truck, FlaskConical, Stethoscope, Eye } from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

const ROLES = [
  { value:"MANUFACTURER", label:"Fabricante",   icon:FlaskConical, color:"#8B5CF6", bg:"#EDE9FE", desc:"Registra e gerencia lotes de medicamentos" },
  { value:"DISTRIBUTOR",  label:"Distribuidor", icon:Truck,        color:"#3B82F6", bg:"#DBEAFE", desc:"Transporta e distribui entre fabricantes e farmácias" },
  { value:"PHARMACY",     label:"Farmácia",     icon:Shield,       color:"#16A34A", bg:"#DCFCE7", desc:"Recebe lotes e dispensa medicamentos com receita" },
  { value:"DOCTOR",       label:"Médico",       icon:Stethoscope,  color:"#F97316", bg:"#FEF3C7", desc:"Emite receitas médicas digitais assinadas" },
  { value:"AUDITOR",      label:"Auditor",      icon:Eye,          color:"#64748b", bg:"#F1F5F9", desc:"Visualiza toda a cadeia sem permissão de escrita" },
];

export default function Users() {
  const { role } = useAuthStore();
  const [showForm, setForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setFv] = useState({ name:"", cnpj:"", address:"", role:"MANUFACTURER", password:"", confirm:"" });
  const canAdd = role === "ADMIN" || role === "MANUFACTURER";

  function cnpjMask(v:string) {
    return v.replace(/\D/g,"").slice(0,14)
      .replace(/(\d{2})(\d)/,"$1.$2")
      .replace(/(\d{3})(\d)/,"$1.$2")
      .replace(/(\d{3})(\d)/,"$1/$2")
      .replace(/(\d{4})(\d{1,2})$/,"$1-$2");
  }

  async function handleSubmit() {
    if (form.password !== form.confirm) { toast.error("Senhas não coincidem"); return; }
    if (form.password.length < 8) { toast.error("Senha mínima: 8 caracteres"); return; }
    if (form.cnpj.replace(/\D/g,"").length !== 14) { toast.error("CNPJ inválido"); return; }
    setLoading(true);
    try {
      await api.post("/participants", {
        name: form.name, cnpj: form.cnpj.replace(/\D/g,""),
        address: form.address, role: form.role, passwordHash: form.password,
      });
      toast.success("Participante cadastrado!");
      setForm(false);
      setFv({ name:"", cnpj:"", address:"", role:"MANUFACTURER", password:"", confirm:"" });
    } catch (e:any) {
      toast.error(e.response?.data?.error ?? "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:36 }}>
        <div>
          <h1 style={{ fontSize:28,fontWeight:800,color:"#0F2417",marginBottom:6 }}>Participantes</h1>
          <p style={{ color:"#4B6B58",fontSize:15 }}>Gerencie os participantes autorizados da rede PharmaChain</p>
        </div>
        {canAdd && (
          <button onClick={() => setForm(true)} style={{ display:"flex",alignItems:"center",gap:8,
            background:"linear-gradient(135deg,#0F2417,#14532D)",color:"white",border:"none",
            borderRadius:12,padding:"11px 20px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
            <UserPlus size={16}/> Adicionar Participante
          </button>
        )}
      </div>

      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:16,fontWeight:700,color:"#0F2417",marginBottom:16 }}>Papéis na Rede</h2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {ROLES.map(({ value,label,icon:Icon,color,bg,desc }) => (
            <div key={value} style={{ background:"white",borderRadius:16,padding:24,
              border:"1px solid rgba(22,163,74,0.12)",
              transition:"transform .2s,box-shadow .2s" }}>
              <div style={{ width:44,height:44,borderRadius:12,background:bg,
                display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14 }}>
                <Icon size={20} color={color}/>
              </div>
              <p style={{ fontSize:15,fontWeight:700,color:"#0F2417",marginBottom:6 }}>{label}</p>
              <p style={{ fontSize:13,color:"#4B6B58",lineHeight:1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {!canAdd && (
        <div style={{ background:"#DCFCE7",border:"1px solid rgba(22,163,74,0.2)",
          borderRadius:16,padding:24,textAlign:"center" }}>
          <Shield size={32} color="#16A34A" style={{ margin:"0 auto 12px",display:"block" }}/>
          <p style={{ fontSize:14,color:"#15803D",fontWeight:600,marginBottom:4 }}>Acesso restrito</p>
          <p style={{ fontSize:13,color:"#16A34A" }}>Apenas administradores podem cadastrar novos participantes.</p>
        </div>
      )}

      {showForm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,
          display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={e => e.target===e.currentTarget && setForm(false)}>
          <div style={{ background:"white",borderRadius:20,padding:36,width:"100%",
            maxWidth:500,maxHeight:"90vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20,fontWeight:800,color:"#0F2417" }}>Novo Participante</h2>
                <p style={{ fontSize:13,color:"#4B6B58",marginTop:2 }}>Será registrado na rede PharmaChain</p>
              </div>
              <button onClick={() => setForm(false)}
                style={{ background:"#F0FAF4",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer" }}>
                <X size={16}/>
              </button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {[
                { label:"NOME / RAZÃO SOCIAL", key:"name",    ph:"Ex: Farmácia Central Ltda" },
                { label:"ENDEREÇO ETHEREUM",   key:"address", ph:"0x..." },
              ].map(({ label,key,ph }) => (
                <div key={key}>
                  <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:5,letterSpacing:".3px" }}>{label}</label>
                  <input placeholder={ph}
                    style={{ width:"100%",padding:"10px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                      borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                    value={(form as any)[key]}
                    onChange={e => setFv(p => ({ ...p,[key]:e.target.value }))}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:5,letterSpacing:".3px" }}>CNPJ</label>
                <input placeholder="00.000.000/0001-00"
                  style={{ width:"100%",padding:"10px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                    borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                  value={form.cnpj} onChange={e => setFv(p => ({ ...p,cnpj:cnpjMask(e.target.value) }))}/>
              </div>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:5,letterSpacing:".3px" }}>PAPEL NA REDE</label>
                <select style={{ width:"100%",padding:"10px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                  borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                  value={form.role} onChange={e => setFv(p => ({ ...p,role:e.target.value }))}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                {[
                  { label:"SENHA",           key:"password", ph:"Mínimo 8 caracteres" },
                  { label:"CONFIRMAR SENHA", key:"confirm",  ph:"Repita a senha" },
                ].map(({ label,key,ph }) => (
                  <div key={key}>
                    <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:5,letterSpacing:".3px" }}>{label}</label>
                    <input type="password" placeholder={ph}
                      style={{ width:"100%",padding:"10px 14px",border:"1.5px solid rgba(22,163,74,0.15)",
                        borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                      value={(form as any)[key]}
                      onChange={e => setFv(p => ({ ...p,[key]:e.target.value }))}/>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit}
                disabled={loading || !form.name || !form.cnpj || !form.address || !form.password}
                style={{ padding:"13px",background:"linear-gradient(135deg,#0F2417,#14532D)",
                  color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,
                  cursor:"pointer",fontFamily:"inherit",opacity:loading?0.7:1 }}>
                {loading ? "Cadastrando..." : "Cadastrar Participante"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
