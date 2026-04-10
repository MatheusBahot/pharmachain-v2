import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Database, UserCheck, Trash2, Mail } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: Database, color:"#3b82f6",
      title: "Dados Coletados",
      content: `Coletamos apenas os dados estritamente necessários para a operação da plataforma: nome ou razão social, CNPJ, endereço Ethereum e hash de senha (bcrypt). CPFs de pacientes são armazenados exclusivamente como hash SHA-256 irreversível — o dado original nunca é persistido.`
    },
    {
      icon: Lock, color:"#8b5cf6",
      title: "Proteção dos Dados",
      content: `Todos os dados sensíveis são protegidos com criptografia AES-256-GCM em repouso e TLS 1.3 em trânsito. Senhas são armazenadas com bcrypt (fator 12). Chaves de criptografia são rotacionadas periodicamente e nunca expostas em logs ou APIs.`
    },
    {
      icon: Eye, color:"#10b981",
      title: "Compartilhamento",
      content: `Não compartilhamos dados pessoais com terceiros sem autorização expressa do titular, exceto quando exigido por obrigação legal ou regulatória. Informações de rastreabilidade de medicamentos podem ser acessadas por participantes autorizados da cadeia conforme necessidade operacional.`
    },
    {
      icon: UserCheck, color:"#f59e0b",
      title: "Direitos do Titular (LGPD)",
      content: `Em conformidade com a Lei nº 13.709/2018, você tem direito a: acesso aos seus dados, correção de informações incorretas, portabilidade, revogação de consentimento e eliminação de dados não obrigatórios. Solicitações devem ser encaminhadas ao nosso DPO.`
    },
    {
      icon: Trash2, color:"#ef4444",
      title: "Retenção e Exclusão",
      content: `Dados são retidos pelo período mínimo exigido pela regulamentação sanitária (ANVISA) e fiscal (SEFAZ). Registros na blockchain são permanentes por natureza da tecnologia. Dados off-chain podem ser solicitados para exclusão após o período legal de retenção.`
    },
    {
      icon: Mail, color:"#0ea5e9",
      title: "Contato do DPO",
      content: `Nosso Encarregado de Proteção de Dados (DPO) está disponível para esclarecer dúvidas e receber solicitações:\n\n📧 dpo@pharmachain.com.br\n📞 (71) 3000-0001\n\nRespondemos em até 15 dias úteis conforme exigência da LGPD.`
    },
  ];

  return (
    <div style={{ fontFamily:"'Sora','DM Sans',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:8,
            color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:13, marginBottom:32 }}>
            <ArrowLeft size={15}/> Voltar
          </Link>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)",
            borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
            <Lock size={12} color="#93c5fd"/>
            <span style={{ color:"#93c5fd", fontSize:12, fontWeight:500 }}>LGPD Compliant · Abril 2026</span>
          </div>
          <h1 style={{ color:"white", fontSize:42, fontWeight:800, letterSpacing:"-1px", marginBottom:16 }}>
            Política de Privacidade
          </h1>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, maxWidth:560, lineHeight:1.7 }}>
            Seu dado é seu. Tratamos informações com responsabilidade, transparência e conformidade com a LGPD.
          </p>
        </div>
      </div>

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
                  <p style={{ fontSize:14, color:"#475569", lineHeight:1.8, whiteSpace:"pre-line" }}>{content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ background:"#0a1628", borderRadius:16, padding:28, marginTop:32, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, lineHeight:1.7 }}>
            Para exercer seus direitos LGPD, acesse nosso{" "}
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
