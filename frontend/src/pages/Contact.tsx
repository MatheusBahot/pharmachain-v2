import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Bug } from "lucide-react";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setFv] = useState({ name:"", email:"", subject:"suporte", message:"" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Mensagem enviada! Responderemos em até 24h.");
    setFv({ name:"", email:"", subject:"suporte", message:"" });
  }

  const channels = [
    { icon:Mail,    color:"#3b82f6", bg:"#dbeafe", label:"E-mail Suporte",   value:"suporte@pharmachain.com.br",  detail:"Resposta em até 24h úteis" },
    { icon:Phone,   color:"#10b981", bg:"#d1fae5", label:"Telefone",         value:"(71) 3000-0000",              detail:"Seg–Sex, 8h às 18h" },
    { icon:Mail,    color:"#8b5cf6", bg:"#ede9fe", label:"Compliance/LGPD",  value:"compliance@pharmachain.com.br",detail:"DPO disponível" },
    { icon:MapPin,  color:"#f59e0b", bg:"#fef3c7", label:"Endereço",         value:"Av. Tancredo Neves, 1632",    detail:"Salvador, Bahia – CEP 41820-020" },
  ];

  const subjects = [
    { value:"suporte",    icon:HelpCircle, label:"Suporte Técnico" },
    { value:"bug",        icon:Bug,        label:"Reportar Problema" },
    { value:"comercial",  icon:MessageSquare, label:"Comercial / Parceria" },
    { value:"lgpd",       icon:Mail,       label:"Solicitação LGPD" },
  ];

  return (
    <div style={{ fontFamily:"'Sora','DM Sans',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:8,
            color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:13, marginBottom:32 }}>
            <ArrowLeft size={15}/> Voltar
          </Link>
          <h1 style={{ color:"white", fontSize:42, fontWeight:800, letterSpacing:"-1px", marginBottom:16 }}>
            Fale Conosco
          </h1>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, maxWidth:500, lineHeight:1.7 }}>
            Nossa equipe está pronta para ajudar. Escolha o canal mais adequado ou envie uma mensagem.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 24px" }}>

        {/* Canais */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
          {channels.map(({ icon: Icon, color, bg, label, value, detail }, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.08 }}
              style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #e2e8f0" }}
            >
              <div style={{ width:44, height:44, borderRadius:12, background:bg,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <Icon size={20} color={color}/>
              </div>
              <p style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:4, letterSpacing:".5px", textTransform:"uppercase" }}>{label}</p>
              <p style={{ fontSize:13, fontWeight:600, color:"#0a1628", marginBottom:4 }}>{value}</p>
              <p style={{ fontSize:11, color:"#94a3b8" }}>{detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Horário */}
        <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #e2e8f0", marginBottom:32,
          display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"#f0fdf4",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Clock size={20} color="#10b981"/>
          </div>
          <div>
            <p style={{ fontSize:15, fontWeight:700, color:"#0a1628", marginBottom:2 }}>Horário de Atendimento</p>
            <p style={{ fontSize:13, color:"#64748b" }}>Segunda a Sexta: 8h às 18h · Sábado: 9h às 13h · Suporte crítico 24/7 para clientes enterprise</p>
          </div>
        </div>

        {/* Formulário */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          style={{ background:"white", borderRadius:20, padding:40, border:"1px solid #e2e8f0" }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#0a1628", marginBottom:6 }}>Enviar Mensagem</h2>
          <p style={{ fontSize:14, color:"#64748b", marginBottom:28 }}>Responderemos no próximo dia útil.</p>

          {sent ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"#d1fae5",
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Send size={28} color="#10b981"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, color:"#0a1628", marginBottom:8 }}>Mensagem enviada!</h3>
              <p style={{ fontSize:14, color:"#64748b", marginBottom:20 }}>Nossa equipe responderá em até 24 horas úteis.</p>
              <button onClick={() => setSent(false)} style={{ padding:"10px 24px", background:"#0a1628",
                color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {[
                  { label:"SEU NOME", key:"name", ph:"Nome completo" },
                  { label:"E-MAIL", key:"email", ph:"seu@email.com" },
                ].map(({ label, key, ph }) => (
                  <div key={key}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, letterSpacing:".3px" }}>{label}</label>
                    <input required placeholder={ph}
                      style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={(form as any)[key]} onChange={e => setFv(p => ({ ...p, [key]: e.target.value }))}/>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:8, letterSpacing:".3px" }}>ASSUNTO</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {subjects.map(({ value, icon: Icon, label }) => (
                    <button key={value} type="button"
                      onClick={() => setFv(p => ({ ...p, subject: value }))}
                      style={{ padding:"10px 8px", border:"1.5px solid "+(form.subject===value?"#3b82f6":"#e2e8f0"),
                        borderRadius:10, background: form.subject===value?"#eff6ff":"white",
                        cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <Icon size={16} color={form.subject===value?"#3b82f6":"#94a3b8"}/>
                      <span style={{ fontSize:11, fontWeight:600, color:form.subject===value?"#3b82f6":"#64748b" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, letterSpacing:".3px" }}>MENSAGEM</label>
                <textarea required rows={5} placeholder="Descreva sua dúvida ou solicitação com o máximo de detalhes..."
                  style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10,
                    fontSize:13, outline:"none", fontFamily:"inherit", resize:"vertical" }}
                  value={form.message} onChange={e => setFv(p => ({ ...p, message: e.target.value }))}/>
              </div>

              <button type="submit" style={{ padding:"13px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)",
                color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Send size={16}/> Enviar Mensagem
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <footer style={{ background:"#020817", padding:"24px", textAlign:"center" }}>
        <p style={{ color:"#475569", fontSize:12 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
