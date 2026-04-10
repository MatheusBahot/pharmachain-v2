import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertTriangle, Lock, Globe, Scale } from "lucide-react";

export default function Terms() {
  const sections = [
    { icon:FileText,      color:"#3B82F6", title:"1. Aceitação dos Termos",       content:"O uso da plataforma PharmaChain implica na aceitação integral destes Termos de Uso. Caso não concorde, o acesso deve ser interrompido imediatamente." },
    { icon:Shield,        color:"#16A34A", title:"2. Uso Permitido",              content:"A plataforma destina-se exclusivamente a participantes autorizados da cadeia farmacêutica brasileira — fabricantes, distribuidores, farmácias, médicos e auditores credenciados." },
    { icon:Lock,          color:"#8B5CF6", title:"3. Credenciais de Acesso",      content:"O usuário é responsável pela confidencialidade de suas credenciais. O compartilhamento é expressamente proibido e sujeito a responsabilização civil e penal." },
    { icon:Globe,         color:"#F97316", title:"4. Registros na Blockchain",    content:"Todos os registros na blockchain são imutáveis e permanentes. Uma vez confirmada uma transação, ela não pode ser revertida ou excluída." },
    { icon:AlertTriangle, color:"#EF4444", title:"5. Responsabilidade",           content:"O usuário é responsável pela veracidade das informações inseridas. Registros incorretos podem constituir infrações sanitárias nos termos da Lei nº 6.360/76." },
    { icon:Scale,         color:"#0EA5E9", title:"6. Conformidade Regulatória",   content:"O uso deve estar em conformidade com a RDC 204/2017, RDC 20/2011, Lei nº 13.709/2018 (LGPD) e demais normativas aplicáveis." },
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F0FAF4", minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)", padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:8,
            color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:13, marginBottom:32 }}>
            <ArrowLeft size={15}/> Voltar
          </Link>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)",
            borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
            <FileText size={12} color="#4ADE80"/>
            <span style={{ color:"#4ADE80", fontSize:12, fontWeight:500 }}>Última atualização: Abril 2026</span>
          </div>
          <h1 style={{ color:"white", fontSize:42, fontWeight:800, letterSpacing:"-1px", marginBottom:16 }}>
            Termos de Uso
          </h1>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, maxWidth:560, lineHeight:1.7 }}>
            Leia atentamente antes de utilizar a plataforma PharmaChain.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {sections.map(({ icon:Icon, color, title, content }, i) => (
            <div key={i} style={{ background:"white", borderRadius:16, padding:28,
              border:"1px solid rgba(22,163,74,0.12)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:color+"20",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={20} color={color}/>
                </div>
                <div>
                  <h2 style={{ fontSize:17, fontWeight:700, color:"#0F2417", marginBottom:10 }}>{title}</h2>
                  <p style={{ fontSize:14, color:"#4B6B58", lineHeight:1.8 }}>{content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"#0F2417", borderRadius:16, padding:28, marginTop:32, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, lineHeight:1.7 }}>
            Dúvidas? <Link to="/contact" style={{ color:"#4ADE80" }}>Entre em contato</Link>.
          </p>
        </div>
      </div>

      <footer style={{ background:"#020F07", padding:"24px", textAlign:"center" }}>
        <p style={{ color:"#374151", fontSize:12 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
