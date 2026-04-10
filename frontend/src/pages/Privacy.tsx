import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Database, UserCheck, Trash2, Mail } from "lucide-react";

export default function Privacy() {
  const sections = [
    { icon:Database,  color:"#3B82F6", title:"Dados Coletados",          content:"Coletamos apenas dados estritamente necessários: nome, CNPJ, endereço Ethereum e hash de senha (bcrypt). CPFs de pacientes são armazenados como hash SHA-256 irreversível — o dado original nunca é persistido." },
    { icon:Lock,      color:"#8B5CF6", title:"Proteção dos Dados",        content:"Dados sensíveis são protegidos com AES-256-GCM em repouso e TLS 1.3 em trânsito. Senhas armazenadas com bcrypt (fator 12). Chaves de criptografia nunca expostas em logs ou APIs." },
    { icon:Eye,       color:"#16A34A", title:"Compartilhamento",          content:"Não compartilhamos dados pessoais com terceiros sem autorização expressa, exceto quando exigido por obrigação legal ou regulatória." },
    { icon:UserCheck, color:"#F97316", title:"Direitos do Titular (LGPD)", content:"Você tem direito a: acesso, correção, portabilidade, revogação de consentimento e eliminação de dados. Solicitações devem ser encaminhadas ao nosso DPO." },
    { icon:Trash2,    color:"#EF4444", title:"Retenção e Exclusão",       content:"Dados são retidos pelo período mínimo exigido pela ANVISA e SEFAZ. Registros na blockchain são permanentes por natureza da tecnologia." },
    { icon:Mail,      color:"#0EA5E9", title:"Contato do DPO",            content:"📧 dpo@pharmachain.com.br\n📞 (71) 3000-0001\n\nRespondemos em até 15 dias úteis conforme exigência da LGPD." },
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
            <Lock size={12} color="#4ADE80"/>
            <span style={{ color:"#4ADE80", fontSize:12, fontWeight:500 }}>LGPD Compliant · Abril 2026</span>
          </div>
          <h1 style={{ color:"white", fontSize:42, fontWeight:800, letterSpacing:"-1px", marginBottom:16 }}>
            Política de Privacidade
          </h1>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, maxWidth:560, lineHeight:1.7 }}>
            Seu dado é seu. Tratamos informações com responsabilidade e conformidade com a LGPD.
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
                  <p style={{ fontSize:14, color:"#4B6B58", lineHeight:1.8, whiteSpace:"pre-line" }}>{content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"#0F2417", borderRadius:16, padding:28, marginTop:32, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13 }}>
            Para exercer seus direitos LGPD, acesse nosso{" "}
            <Link to="/contact" style={{ color:"#4ADE80" }}>canal de atendimento</Link>.
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
