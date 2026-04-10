import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertTriangle, Lock, Globe, Scale } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: FileText, color:"#3b82f6",
      title: "1. Aceitação dos Termos",
      content: `O uso da plataforma PharmaChain implica na aceitação integral e irrevogável destes Termos de Uso. Caso não concorde com qualquer disposição aqui contida, o acesso deve ser imediatamente interrompido. Estes termos constituem o acordo completo entre o usuário e a PharmaChain.`
    },
    {
      icon: Shield, color:"#10b981",
      title: "2. Uso Permitido",
      content: `A plataforma destina-se exclusivamente a participantes autorizados da cadeia farmacêutica brasileira — fabricantes, distribuidores, farmácias, médicos e auditores devidamente credenciados. É vedado o uso para fins distintos dos previstos na regulamentação farmacêutica vigente.`
    },
    {
      icon: Lock, color:"#8b5cf6",
      title: "3. Credenciais de Acesso",
      content: `O usuário é integralmente responsável pela confidencialidade de suas credenciais, incluindo senha e chave privada Ethereum. O compartilhamento de credenciais é expressamente proibido e sujeito a responsabilização civil e penal. A PharmaChain não se responsabiliza por acessos não autorizados decorrentes de negligência do usuário.`
    },
    {
      icon: Globe, color:"#f59e0b",
      title: "4. Registros na Blockchain",
      content: `Todos os registros realizados na blockchain são imutáveis e permanentes. Uma vez confirmada uma transação na rede Polygon, ela não pode ser revertida ou excluída. O usuário compreende e aceita esta característica inerente à tecnologia blockchain antes de realizar qualquer operação.`
    },
    {
      icon: AlertTriangle, color:"#ef4444",
      title: "5. Responsabilidade pelas Informações",
      content: `O usuário é exclusivamente responsável pela veracidade, precisão e completude das informações inseridas na plataforma. Registros incorretos de lotes, transferências ou receitas médicas podem constituir infrações sanitárias nos termos da Lei nº 6.360/76 e das RDCs ANVISA vigentes.`
    },
    {
      icon: Scale, color:"#0ea5e9",
      title: "6. Conformidade Regulatória",
      content: `O uso da PharmaChain deve estar em conformidade com a RDC 204/2017 (rastreabilidade), RDC 20/2011 (medicamentos controlados), Lei nº 13.709/2018 (LGPD) e demais normativas aplicáveis. A plataforma é uma ferramenta de suporte — a responsabilidade regulatória permanece com cada participante da cadeia.`
    },
  ];

  return (
    <div style={{ fontFamily:"'Sora','DM Sans',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:8,
            color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:13, marginBottom:32 }}>
            <ArrowLeft size={15}/> Voltar
          </Link>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)",
            borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
            <FileText size={12} color="#93c5fd"/>
            <span style={{ color:"#93c5fd", fontSize:12, fontWeight:500 }}>Última atualização: Abril 2026</span>
          </div>
          <h1 style={{ color:"white", fontSize:42, fontWeight:800, letterSpacing:"-1px", marginBottom:16 }}>
            Termos de Uso
          </h1>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, maxWidth:560, lineHeight:1.7 }}>
            Leia atentamente antes de utilizar a plataforma PharmaChain. O uso implica aceitação integral.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {sections.map(({ icon: Icon, color, title, content }, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.08 }}
              style={{ background:"white", borderRadius:16, padding:32, border:"1px solid #e2e8f0" }}
            >
              <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:44, height:44, borderRadius:12,
                  background: color+"20", display:"flex", alignItems:"center",
                  justifyContent:"center", flexShrink:0 }}>
                  <Icon size={20} color={color}/>
                </div>
                <div>
                  <h2 style={{ fontSize:17, fontWeight:700, color:"#0a1628", marginBottom:10 }}>{title}</h2>
                  <p style={{ fontSize:14, color:"#475569", lineHeight:1.8 }}>{content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ background:"#0a1628", borderRadius:16, padding:28, marginTop:32, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, lineHeight:1.7 }}>
            Dúvidas sobre os termos? Entre em contato pelo{" "}
            <Link to="/contact" style={{ color:"#60a5fa" }}>canal de atendimento</Link>.
          </p>
        </div>
      </div>

      <footer style={{ background:"#020817", padding:"24px", textAlign:"center" }}>
        <p style={{ color:"#475569", fontSize:12 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
