import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const [cnpj, setCnpj]         = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const login    = useAuthStore(s => s.login);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { cnpj, password });
      login(data.token, data.role, data.address, data.participantId);
      navigate("/about");
      toast.success("Bem-vindo ao PharmaChain");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  const G = "#16A34A";
  const GL = "#DCFCE7";
  const GD = "#14532D";
  const BG = "#F0FAF4";
  const TX = "#0F2417";
  const TX2 = "#4B6B58";
  const BD = "rgba(22,163,74,0.18)";

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:BG, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        .nk { color:${TX2}; text-decoration:none; font-size:13px; font-weight:500; opacity:.8; transition:opacity .2s; }
        .nk:hover { opacity:1; color:${G}; }
        .s { padding:80px 24px; }
        .c { max-width:1080px; margin:0 auto; }
        .tag { display:inline-block; background:${GL}; color:${GD}; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; margin-bottom:14px; letter-spacing:.6px; text-transform:uppercase; }
        .fc { background:white; border-radius:18px; padding:28px; border:1px solid ${BD}; transition:transform .2s,box-shadow .2s; }
        .fc:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(22,163,74,0.1); }
        .inp { width:100%; padding:12px 16px; border:1.5px solid ${BD}; border-radius:10px; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; background:${BG}; color:${TX}; }
        .inp:focus { border-color:${G}; background:white; box-shadow:0 0 0 3px rgba(22,163,74,0.1); }
        .sc { text-align:center; padding:28px 20px; background:white; border-radius:16px; border:1px solid ${BD}; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"rgba(240,250,244,0.96)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid " + BD,
        boxShadow:"0 2px 16px rgba(22,163,74,0.07)"
      }}>
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px",
          height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#16A34A,#4ADE80)",
              borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, boxShadow:"0 4px 12px rgba(22,163,74,0.25)" }}>💊</div>
            <span style={{ color:TX, fontWeight:800, fontSize:16, letterSpacing:"-0.4px" }}>PharmaChain</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            <Link to="/terms"   className="nk">Termos de Uso</Link>
            <Link to="/privacy" className="nk">Política de Privacidade</Link>
            <Link to="/contact" className="nk">Fale Conosco</Link>
            <a href="#login" style={{
              background:"linear-gradient(135deg,#16A34A,#15803D)",
              color:"white", padding:"9px 22px", borderRadius:10, fontSize:13,
              fontWeight:700, textDecoration:"none",
              boxShadow:"0 4px 12px rgba(22,163,74,0.25)"
            }}>Login</a>
          </div>
        </div>
      </nav>

      {/* ── HERO — fundo verde claro, formulário visível imediatamente ── */}
      <section style={{
        minHeight:"100vh", background:BG,
        display:"flex", alignItems:"center",
        padding:"0 24px", paddingTop:62
      }}>
        <div style={{ maxWidth:1080, margin:"0 auto", width:"100%",
          display:"flex", gap:64, alignItems:"center" }}>

          {/* Texto esquerdo */}
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8,
              background:GL, border:"1px solid " + BD,
              borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:G }}/>
              <span style={{ color:GD, fontSize:12, fontWeight:600 }}>
                Rede Blockchain Ativa — Polygon Amoy
              </span>
            </div>
            <h1 style={{ color:TX, fontSize:50, fontWeight:800, lineHeight:1.1,
              letterSpacing:"-1.5px", marginBottom:18 }}>
              Rastreabilidade<br/>
              <span style={{ color:G }}>Farmacêutica</span><br/>
              em Blockchain
            </h1>
            <p style={{ color:TX2, fontSize:16, lineHeight:1.8, marginBottom:32, maxWidth:460 }}>
              Controle total da cadeia logística de medicamentos — do fabricante à farmácia —
              com rastreabilidade imutável, conformidade ANVISA e inteligência em tempo real.
            </p>
            <div style={{ display:"flex", gap:28, marginBottom:36 }}>
              {[
                { num:"100%", label:"Rastreabilidade" },
                { num:"< 2s", label:"Registro blockchain" },
                { num:"24/7", label:"Disponibilidade" },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ color:G, fontSize:26, fontWeight:800, marginBottom:2 }}>{s.num}</p>
                  <p style={{ color:TX2, fontSize:12 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <a href="#sobre" style={{
              display:"inline-block",
              background:"linear-gradient(135deg,#16A34A,#15803D)",
              color:"white", padding:"13px 28px", borderRadius:11,
              fontWeight:700, textDecoration:"none", fontSize:14,
              boxShadow:"0 6px 20px rgba(22,163,74,0.3)"
            }}>
              Conheça o Projeto
            </a>
          </div>

          {/* ── LOGIN CARD — sempre visível ── */}
          <div id="login" style={{ width:380, flexShrink:0 }}>
            <div style={{
              background:"white", borderRadius:24, padding:40,
              boxShadow:"0 24px 64px rgba(22,163,74,0.13), 0 1px 0 " + BD,
              border:"1px solid " + BD
            }}>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ width:54, height:54, borderRadius:16,
                  background:"linear-gradient(135deg,#16A34A,#4ADE80)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 14px", fontSize:24,
                  boxShadow:"0 6px 18px rgba(22,163,74,0.3)" }}>💊</div>
                <h2 style={{ fontSize:20, fontWeight:800, color:TX, marginBottom:4 }}>
                  Acesso ao Sistema
                </h2>
                <p style={{ color:TX2, fontSize:13 }}>Insira suas credenciais para continuar</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:TX2,
                    display:"block", marginBottom:6, letterSpacing:".5px" }}>CNPJ</label>
                  <input className="inp" type="text" placeholder="00.000.000/0001-00"
                    value={cnpj} onChange={e => setCnpj(e.target.value)} required/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:TX2,
                    display:"block", marginBottom:6, letterSpacing:".5px" }}>SENHA</label>
                  <input className="inp" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
                <button type="submit" disabled={loading} style={{
                  marginTop:6, height:46, fontSize:15, width:"100%", fontWeight:700,
                  background:"linear-gradient(135deg,#15803D,#16A34A)", color:"white",
                  border:"none", borderRadius:11, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily:"inherit", boxShadow:"0 6px 18px rgba(22,163,74,0.3)",
                  opacity: loading ? .7 : 1
                }}>
                  {loading ? "Autenticando..." : "Entrar"}
                </button>
              </form>

              <p style={{ textAlign:"center", fontSize:11, color:"#94a3b8", marginTop:18, lineHeight:1.6 }}>
                Acesso restrito a participantes autorizados<br/>da rede PharmaChain
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── SOBRE ── */}
      <section id="sobre" className="s" style={{ background:"white" }}>
        <div className="c">
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <span className="tag">Sobre o Projeto</span>
            <h2 style={{ fontSize:36, fontWeight:800, color:TX, letterSpacing:"-1px", marginBottom:14 }}>
              O que é o PharmaChain?
            </h2>
            <p style={{ color:TX2, fontSize:16, maxWidth:580, margin:"0 auto", lineHeight:1.8 }}>
              Plataforma blockchain para garantir integridade e conformidade ANVISA
              em toda a cadeia logística de medicamentos no Brasil.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {[
              { icon:"🔗", title:"Blockchain Imutável",  desc:"Cada movimentação de lote registrada permanentemente na rede Polygon, à prova de adulteração." },
              { icon:"🏥", title:"Conformidade ANVISA",  desc:"Atende RDC 204/2017 e demais normativas para rastreabilidade de medicamentos no Brasil." },
              { icon:"⚡", title:"Tempo Real",           desc:"Monitoramento ao vivo de transferências, alertas de temperatura e dispensação de receitas." },
            ].map((item, i) => (
              <div key={i} className="fc">
                <div style={{ fontSize:34, marginBottom:14 }}>{item.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:700, color:TX, marginBottom:10 }}>{item.title}</h3>
                <p style={{ color:TX2, fontSize:14, lineHeight:1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCKCHAIN ── */}
      <section className="s" style={{ background:BG }}>
        <div className="c">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
            <div>
              <span className="tag">Tecnologia</span>
              <h2 style={{ fontSize:34, fontWeight:800, color:TX, letterSpacing:"-1px",
                marginBottom:14, lineHeight:1.2 }}>
                Inteligência Blockchain conectada à Logística Farmacêutica
              </h2>
              <p style={{ color:TX2, fontSize:15, lineHeight:1.8, marginBottom:22 }}>
                Smart contracts automatizam aprovações, alertas e recalls. Cada lote tem registro
                único, verificável e permanente na rede Polygon Amoy.
              </p>
              {[
                "Contratos inteligentes auditados (OpenZeppelin)",
                "Assinaturas ECDSA em cada transferência",
                "Hash SHA-256 para validação de dados",
                "Rede pública — sem servidor central",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:GL,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:11, color:G, fontWeight:700 }}>✓</span>
                  </div>
                  <span style={{ fontSize:14, color:"#374151" }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
              borderRadius:22, padding:36, color:"white" }}>
              <p style={{ fontSize:11, color:"#4ADE80", fontWeight:700, marginBottom:20,
                letterSpacing:"1.5px" }}>FLUXO DE RASTREABILIDADE</p>
              {[
                { step:"01", label:"Fabricante registra lote",  sub:"GTIN-14 + hash SHA-256 → blockchain" },
                { step:"02", label:"Distribuidor recebe",        sub:"Assinatura ECDSA + NF-e validada" },
                { step:"03", label:"Farmácia confirma",          sub:"Estoque atualizado em tempo real" },
                { step:"04", label:"Médico emite receita",       sub:"Criptografada AES-256 + LGPD" },
                { step:"05", label:"Paciente retira",            sub:"Dispensação registrada na blockchain" },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:14, marginBottom:i<4?18:0, alignItems:"flex-start" }}>
                  <div style={{ width:32, height:32, borderRadius:9,
                    background:"rgba(74,222,128,0.18)", display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:11, fontWeight:700, color:"#4ADE80", flexShrink:0 }}>
                    {item.step}
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{item.label}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="s" style={{ background:GL }}>
        <div className="c" style={{ textAlign:"center" }}>
          <span className="tag">Logística Farmacêutica</span>
          <h2 style={{ fontSize:40, fontWeight:800, color:TX, letterSpacing:"-1px", marginBottom:16 }}>
            Cuidamos da sua Logística
          </h2>
          <p style={{ color:TX2, fontSize:16, maxWidth:500, margin:"0 auto 36px", lineHeight:1.8 }}>
            Do registro na fábrica à dispensação na farmácia — cada etapa rastreada,
            verificada e registrada permanentemente na blockchain.
          </p>
          <a href="#login" style={{
            display:"inline-block",
            background:"linear-gradient(135deg,#16A34A,#15803D)",
            color:"white", padding:"14px 36px", borderRadius:13,
            fontWeight:800, textDecoration:"none", fontSize:15,
            boxShadow:"0 10px 28px rgba(22,163,74,0.3)"
          }}>
            Acessar o Sistema
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#020F07", padding:"36px 24px" }}>
        <div className="c">
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, background:"linear-gradient(135deg,#16A34A,#4ADE80)",
                borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>💊</div>
              <span style={{ color:"white", fontWeight:700, fontSize:14 }}>PharmaChain</span>
            </div>
            <p style={{ color:"#4B6B58", fontSize:12 }}>
              Copyright © 2026 PharmaChain. Todos os direitos reservados.
              Matheus Augusto Roseira Santana · Salvador, Bahia.
            </p>
            <div style={{ display:"flex", gap:20 }}>
              <Link to="/terms"   style={{ color:"#4B6B58", fontSize:12, textDecoration:"none" }}>Termos de Uso</Link>
              <Link to="/privacy" style={{ color:"#4B6B58", fontSize:12, textDecoration:"none" }}>Privacidade</Link>
              <Link to="/contact" style={{ color:"#4B6B58", fontSize:12, textDecoration:"none" }}>Contato</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
