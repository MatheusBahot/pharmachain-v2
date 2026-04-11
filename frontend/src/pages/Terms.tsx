import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertTriangle, Lock, Globe, Scale } from "lucide-react";

export default function Terms() {
  const sections = [
    { icon:FileText,      color:"#3B82F6", title:"Aceitação dos Termos",     content:"O uso da plataforma PharmaChain implica na aceitação integral destes Termos de Uso. Caso não concorde, o acesso deve ser interrompido imediatamente." },
    { icon:Shield,        color:"#16A34A", title:"Uso Permitido",             content:"A plataforma destina-se exclusivamente a participantes autorizados da cadeia farmacêutica brasileira — fabricantes, distribuidores, farmácias, médicos e auditores credenciados." },
    { icon:Lock,          color:"#8B5CF6", title:"Credenciais de Acesso",     content:"O usuário é responsável pela confidencialidade de suas credenciais. O compartilhamento é expressamente proibido e sujeito a responsabilização civil e penal." },
    { icon:Globe,         color:"#F97316", title:"Registros na Blockchain",   content:"Todos os registros na blockchain são imutáveis e permanentes. Uma vez confirmada uma transação, ela não pode ser revertida ou excluída." },
    { icon:AlertTriangle, color:"#EF4444", title:"Responsabilidade",          content:"O usuário é responsável pela veracidade das informações inseridas. Registros incorretos podem constituir infrações sanitárias nos termos da Lei nº 6.360/76." },
    { icon:Scale,         color:"#0EA5E9", title:"Conformidade Regulatória",  content:"O uso deve estar em conformidade com a RDC 204/2017, RDC 20/2011, Lei nº 13.709/2018 (LGPD) e demais normativas aplicáveis." },
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F0FAF4", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
      `}</style>

      {/* HERO */}
      <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)", padding:"56px 24px 72px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:8,
            color:"rgba(255,255,255,0.5)", textDecoration:"none", fontSize:15,
            fontWeight:500, marginBottom:40, letterSpacing:"-0.1px" }}>
            <ArrowLeft size={16}/> Voltar
          </Link>
          <h1 style={{ color:"white", fontSize:52, fontWeight:800,
            letterSpacing:"-1.5px", lineHeight:1.08, marginBottom:16 }}>
            Termos de Uso
          </h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:17,
            maxWidth:520, lineHeight:1.75, fontWeight:400 }}>
            Leia atentamente antes de utilizar a plataforma PharmaChain.
          </p>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth:800, margin:"0 auto", padding:"56px 24px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {sections.map(({ icon:Icon, color, title, content }, i) => (
            <div key={i} style={{ background:"white", borderRadius:18, padding:"28px 32px",
              border:"1px solid rgba(22,163,74,0.10)",
              boxShadow:"0 2px 12px rgba(22,163,74,0.04)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:20 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:color+"18",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={22} color={color}/>
                </div>
                <div>
                  <h2 style={{ fontSize:19, fontWeight:700, color:"#0F2417",
                    letterSpacing:"-0.3px", marginBottom:10 }}>{title}</h2>
                  <p style={{ fontSize:15, color:"#4B6B58", lineHeight:1.8, fontWeight:400 }}>{content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"#0F2417", borderRadius:18, padding:"28px 32px",
          marginTop:28, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, lineHeight:1.7, fontWeight:400 }}>
            Dúvidas?{" "}
            <Link to="/contact" style={{ color:"#4ADE80", fontWeight:600 }}>Entre em contato</Link>.
          </p>
        </div>
      </div>

      <footer style={{ background:"#020F07", padding:"24px", textAlign:"center" }}>
        <p style={{ color:"#4B6B58", fontSize:13, fontWeight:400 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
