import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const [cnpj, setCnpj]         = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"termos"|"privacidade"|"contato">("termos");
  const navigate = useNavigate();
  const login    = useAuthStore(s => s.login);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { cnpj, password });
      login(data.token, data.role, data.address, data.participantId);
      navigate("/");
      toast.success("Bem-vindo ao PharmaChain");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  const modalContent = {
    termos: {
      title: "Termos de Uso",
      body: `O uso da plataforma PharmaChain implica na aceitação integral destes termos. A plataforma destina-se exclusivamente a participantes autorizados da cadeia farmacêutica. É vedado o compartilhamento de credenciais de acesso. Todos os registros realizados na blockchain são imutáveis e rastreáveis. O usuário é responsável pela veracidade das informações inseridas. Violações podem implicar em sanções legais conforme a Lei nº 6.360/76 e RDC ANVISA vigentes.`
    },
    privacidade: {
      title: "Política de Privacidade",
      body: `O PharmaChain coleta apenas os dados estritamente necessários para a operação da plataforma. Dados pessoais são tratados em conformidade com a LGPD (Lei nº 13.709/2018). CPFs de pacientes são armazenados apenas como hash SHA-256, garantindo anonimização. Não compartilhamos dados com terceiros sem autorização expressa. O titular dos dados pode solicitar acesso, correção ou exclusão a qualquer momento via nossos canais oficiais.`
    },
    contato: {
      title: "Fale Conosco",
      body: `Para suporte técnico ou dúvidas sobre a plataforma, entre em contato:\n\n📧 suporte@pharmachain.com.br\n📞 (71) 3000-0000\n🕐 Segunda a Sexta, das 8h às 18h\n\nPara questões regulatórias e compliance:\n📧 compliance@pharmachain.com.br\n\nEndereço:\nAv. Tancredo Neves, 1632 — Caminho das Árvores\nSalvador, Bahia — CEP 41820-020`
    }
  };

  return (
    <div style={{ fontFamily: "'Sora', 'DM Sans', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Sora', sans-serif; }
        :root {
          --navy: #0a1628;
          --blue: #1e40af;
          --accent: #3b82f6;
          --green: #10b981;
          --light: #f8fafc;
          --text: #1e293b;
          --text2: #64748b;
          --border: #e2e8f0;
        }
        html { scroll-behavior: smooth; }
        .nav-link {
          color: white; text-decoration: none; font-size: 13px;
          font-weight: 500; opacity: 0.85; transition: opacity 0.2s;
          cursor: pointer; background: none; border: none;
        }
        .nav-link:hover { opacity: 1; }
        .section { padding: 100px 24px; }
        .container { max-width: 1100px; margin: 0 auto; }
        .tag {
          display: inline-block; background: #dbeafe; color: #1e40af;
          font-size: 12px; font-weight: 600; padding: 4px 12px;
          border-radius: 20px; margin-bottom: 16px; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .card-feature {
          background: white; border-radius: 16px; padding: 32px;
          border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s;
        }
        .card-feature:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .input-field {
          width: 100%; padding: 12px 16px; border: 1.5px solid var(--border);
          border-radius: 10px; font-size: 14px; font-family: 'Sora', sans-serif;
          outline: none; transition: border-color 0.2s; background: #f8fafc;
        }
        .input-field:focus { border-color: var(--accent); background: white; }
        .btn-primary {
          width: 100%; padding: 13px; background: var(--blue);
          color: white; border: none; border-radius: 10px; font-size: 15px;
          font-weight: 600; font-family: 'Sora', sans-serif; cursor: pointer;
          transition: background 0.2s; letter-spacing: 0.3px;
        }
        .btn-primary:hover { background: #1d3a9e; }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .modal-box {
          background: white; border-radius: 20px; padding: 40px;
          max-width: 520px; width: 100%; max-height: 80vh; overflow-y: auto;
        }
        .stat-card {
          text-align: center; padding: 32px 24px; background: white;
          border-radius: 16px; border: 1px solid var(--border);
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,22,40,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16
            }}>💊</div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>
              PharmaChain
            </span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <button className="nav-link" onClick={() => { setModalType("termos"); setShowModal(true); }}>
              Termos de Uso
            </button>
            <button className="nav-link" onClick={() => { setModalType("privacidade"); setShowModal(true); }}>
              Política de Privacidade
            </button>
            <button className="nav-link" onClick={() => { setModalType("contato"); setShowModal(true); }}>
              Fale Conosco
            </button>
            <a href="#login" style={{
              background: "#3b82f6", color: "white", padding: "8px 20px",
              borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
              transition: "background 0.2s"
            }}>Login</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #0f2552 60%, #1a3a6e 100%)",
        display: "flex", alignItems: "center", padding: "0 24px", paddingTop: 60,
        position: "relative", overflow: "hidden"
      }}>
        {/* Decorativo */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -50, left: -50,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", gap: 60, alignItems: "center" }}>
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ flex: 1 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 20, padding: "6px 16px", marginBottom: 24
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ color: "#93c5fd", fontSize: 12, fontWeight: 500 }}>
                Rede Blockchain Ativa — Polygon Amoy
              </span>
            </div>
            <h1 style={{
              color: "white", fontSize: 52, fontWeight: 800, lineHeight: 1.1,
              letterSpacing: "-1.5px", marginBottom: 20
            }}>
              Rastreabilidade<br />
              <span style={{ color: "#60a5fa" }}>Farmacêutica</span><br />
              em Blockchain
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.7,
              marginBottom: 36, maxWidth: 480
            }}>
              Controle total da cadeia logística de medicamentos — do fabricante à farmácia — com
              rastreabilidade imutável, conformidade ANVISA e inteligência em tempo real.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="#sobre" style={{
                background: "#3b82f6", color: "white", padding: "13px 28px",
                borderRadius: 10, fontWeight: 600, textDecoration: "none", fontSize: 14
              }}>Conheça o Projeto</a>
              <a href="#login" style={{
                background: "rgba(255,255,255,0.1)", color: "white", padding: "13px 28px",
                borderRadius: 10, fontWeight: 600, textDecoration: "none", fontSize: 14,
                border: "1px solid rgba(255,255,255,0.15)"
              }}>Acessar Sistema</a>
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            id="login"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              width: 380, background: "rgba(255,255,255,0.97)", borderRadius: 20,
              padding: 40, boxShadow: "0 40px 80px rgba(0,0,0,0.3)", flexShrink: 0
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px", fontSize: 22
              }}>💊</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                Acesso ao Sistema
              </h2>
              <p style={{ color: "#64748b", fontSize: 13 }}>
                Insira suas credenciais para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: "0.3px" }}>
                  CNPJ
                </label>
                <input className="input-field" type="text" placeholder="00.000.000/0001-00"
                  value={cnpj} onChange={e => setCnpj(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: "0.3px" }}>
                  SENHA
                </label>
                <input className="input-field" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 6 }}>
                {loading ? "Autenticando..." : "Entrar"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 20, lineHeight: 1.6 }}>
              Acesso restrito a participantes autorizados<br />
              da rede PharmaChain
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section id="sobre" className="section" style={{ background: "white" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <span className="tag">Sobre o Projeto</span>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#0a1628", letterSpacing: "-1px", marginBottom: 16 }}>
              O que é o PharmaChain?
            </h2>
            <p style={{ color: "#64748b", fontSize: 17, maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
              Uma plataforma de rastreabilidade farmacêutica baseada em blockchain, projetada para
              garantir a integridade, transparência e conformidade de toda a cadeia logística de medicamentos no Brasil.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: "🔗", title: "Blockchain Imutável", desc: "Cada movimentação de lote é registrada permanentemente na rede Polygon, garantindo rastreabilidade total e à prova de adulteração." },
              { icon: "🏥", title: "Conformidade ANVISA", desc: "Atende às exigências da RDC 204/2017 e demais normativas da ANVISA para rastreabilidade de medicamentos no Brasil." },
              { icon: "⚡", title: "Tempo Real", desc: "Monitoramento ao vivo de transferências, alertas de temperatura, recall de lotes e dispensação de receitas médicas." },
            ].map((item, i) => (
              <motion.div
                key={i} className="card-feature"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0a1628", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCKCHAIN ── */}
      <section className="section" style={{ background: "#f1f5f9" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="tag">Tecnologia</span>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: "#0a1628", letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.15 }}>
                Inteligência Blockchain conectada à Logística Farmacêutica
              </h2>
              <p style={{ color: "#64748b", fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
                A rede Polygon Amoy garante que cada lote de medicamento tenha um registro único,
                verificável e permanente. Smart contracts automatizam aprovações, alertas e recalls
                sem intervenção humana.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Contratos inteligentes auditados (OpenZeppelin)", "Assinaturas ECDSA em cada transferência", "Hash SHA-256 para validação de dados", "Rede pública — sem servidor central"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: "#1e40af" }}>✓</span>
                    </div>
                    <span style={{ fontSize: 14, color: "#374151" }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: "linear-gradient(135deg, #0a1628, #1e3a8a)",
                borderRadius: 20, padding: 40, color: "white"
              }}
            >
              <p style={{ fontSize: 12, color: "#93c5fd", fontWeight: 600, marginBottom: 20, letterSpacing: "1px" }}>FLUXO DE RASTREABILIDADE</p>
              {[
                { step: "01", label: "Fabricante registra lote", sub: "GTIN-14 + hash SHA-256 → blockchain" },
                { step: "02", label: "Distribuidor recebe", sub: "Assinatura ECDSA + NF-e validada" },
                { step: "03", label: "Farmácia confirma", sub: "Estoque atualizado em tempo real" },
                { step: "04", label: "Médico emite receita", sub: "Criptografada AES-256 + LGPD" },
                { step: "05", label: "Paciente retira", sub: "Dispensação registrada na blockchain" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < 4 ? 20 : 0, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#93c5fd", flexShrink: 0
                  }}>{item.step}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── RESULTADOS ── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <span className="tag">Resultados</span>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#0a1628", letterSpacing: "-1px", marginBottom: 16 }}>
              Resultados e Benefícios
            </h2>
            <p style={{ color: "#64748b", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
              Impacto mensurável para fabricantes, distribuidores, farmácias e pacientes.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 48 }}>
            {[
              { num: "100%", label: "Rastreabilidade de lotes", color: "#3b82f6" },
              { num: "< 2s", label: "Registro na blockchain", color: "#10b981" },
              { num: "0", label: "Ponto central de falha", color: "#f59e0b" },
              { num: "24/7", label: "Disponibilidade da rede", color: "#8b5cf6" },
            ].map((item, i) => (
              <motion.div
                key={i} className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p style={{ fontSize: 42, fontWeight: 800, color: item.color, marginBottom: 8 }}>{item.num}</p>
                <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{item.label}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {[
              { icon: "🛡️", title: "Segurança Regulatória", desc: "Conformidade automática com ANVISA, SEFAZ e LGPD. Auditoria completa disponível a qualquer momento." },
              { icon: "📦", title: "Gestão de Recall", desc: "Identificação e bloqueio de lotes em segundos. Notificação automática a todos os participantes da cadeia." },
              { icon: "🌡️", title: "Monitoramento IoT", desc: "Sensores de temperatura integrados alertam em tempo real sobre desvios na cadeia do frio." },
              { icon: "💊", title: "Receitas Digitais", desc: "Prescrição médica criptografada, dispensação controlada e histórico do paciente protegido por LGPD." },
            ].map((item, i) => (
              <motion.div
                key={i} className="card-feature"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
              >
                <div style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background: "linear-gradient(135deg, #0a1628, #1e3a8a)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span style={{
              display: "inline-block", background: "rgba(59,130,246,0.2)",
              color: "#93c5fd", fontSize: 12, fontWeight: 600, padding: "4px 14px",
              borderRadius: 20, marginBottom: 24, letterSpacing: "1px", textTransform: "uppercase"
            }}>Logística Farmacêutica</span>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 16 }}>
              Cuidamos da sua Logística
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Do registro do lote na fábrica até a dispensação na farmácia, o PharmaChain garante
              que cada etapa seja rastreada, verificada e registrada de forma permanente.
            </p>
            <a href="#login" style={{
              display: "inline-block", background: "white", color: "#1e40af",
              padding: "14px 36px", borderRadius: 12, fontWeight: 700, textDecoration: "none",
              fontSize: 15, transition: "transform 0.2s"
            }}>Acessar o Sistema →</a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#020817", padding: "40px 24px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
              }}>💊</div>
              <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>PharmaChain</span>
            </div>
            <p style={{ color: "#475569", fontSize: 13 }}>
              Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Termos de Uso", "Privacidade", "Contato"].map((link, i) => (
                <button key={i} className="nav-link" style={{ color: "#475569", fontSize: 12 }}
                  onClick={() => { setModalType(["termos","privacidade","contato"][i] as any); setShowModal(true); }}>
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-box"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0a1628" }}>
                  {modalContent[modalType].title}
                </h3>
                <button onClick={() => setShowModal(false)} style={{
                  background: "#f1f5f9", border: "none", borderRadius: 8,
                  width: 32, height: 32, cursor: "pointer", fontSize: 16
                }}>×</button>
              </div>
              <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {modalContent[modalType].body}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
