import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Database, UserCheck, Trash2, Mail } from "lucide-react";

export default function Privacy() {
  const sections = [
    { icon:Database,  color:"#3B82F6", title:"Dados Coletados",           content:"Coletamos apenas dados estritamente necessários: nome, CNPJ, endereço Ethereum e hash de senha (bcrypt). CPFs de pacientes são armazenados como hash SHA-256 irreversível — o dado original nunca é persistido." },
    { icon:Lock,      color:"#8B5CF6", title:"Proteção dos Dados",         content:"Dados sensíveis são protegidos com AES-256-GCM em repouso e TLS 1.3 em trânsito. Senhas armazenadas com bcrypt (fator 12). Chaves de criptografia nunca expostas em logs ou APIs." },
    { icon:Eye,       color:"#16A34A", title:"Compartilhamento",           content:"Não compartilhamos dados pessoais com terceiros sem autorização expressa, exceto quando exigido por obrigação legal ou regulatória." },
    { icon:UserCheck, color:"#F97316", title:"Direitos do Titular",        content:"Você tem direito a: acesso, correção, portabilidade, revogação de consentimento e eliminação de dados. Solicitações devem ser encaminhadas ao nosso DPO." },
    { icon:Trash2,    color:"#EF4444", title:"Retenção e Exclusão",        content:"Dados são retidos pelo período mínimo exigido pela ANVISA e SEFAZ. Registros na blockchain são permanentes por natureza da tecnologia." },
    { icon:Mail,      color:"#0EA5E9", title:"Contato do DPO",             content:"📧 dpo@pharmachain.com.br\n📞 (71) 3000-0001\n\nRespondemos em até 15 dias úteis conforme exigência da LGPD." },
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
            Política de Privacidade
          </h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:17,
            maxWidth:520, lineHeight:1.75, fontWeight:400 }}>
            Seu dado é seu. Tratamos informações com responsabilidade e em conformidade com a LGPD.
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
                  <p style={{ fontSize:15, color:"#4B6B58", lineHeight:1.8,
                    fontWeight:400, whiteSpace:"pre-line" }}>{content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"#0F2417", borderRadius:18, padding:"28px 32px",
          marginTop:28, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, lineHeight:1.7, fontWeight:400 }}>
            Para exercer seus direitos, acesse nosso{" "}
            <Link to="/contact" style={{ color:"#4ADE80", fontWeight:600 }}>canal de atendimento</Link>.
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
