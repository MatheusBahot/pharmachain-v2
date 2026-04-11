import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

const IMGS = [
  { url:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80", label:"Rastreabilidade de ponta a ponta" },
  { url:"https://images.unsplash.com/photo-1576671081837-49000212a370?w=500&q=80", label:"Conformidade ANVISA" },
  { url:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80",   label:"Blockchain farmacêutico" },
  { url:"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80", label:"Cadeia do frio monitorada" },
];

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
      toast.success("Bem-vindo ao PharmaChain");
      navigate("/about");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F0FAF4", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; font-size:16px; }
        body { -webkit-font-smoothing:antialiased; }
        .nk { color:#0F2417; text-decoration:none; font-size:0.8125rem; font-weight:500; opacity:.65; transition:opacity .2s; white-space:nowrap; }
        .nk:hover { opacity:1; }
        .sec { padding:5.5rem 1.5rem; }
        .wrap { max-width:68rem; margin:0 auto; }
        .tag { display:inline-block; background:#DCFCE7; color:#15803D; font-size:0.6875rem; font-weight:700; padding:0.25rem 0.75rem; border-radius:999px; margin-bottom:0.875rem; letter-spacing:0.06em; text-transform:uppercase; }
        .fc { background:white; border-radius:1.125rem; padding:1.75rem; border:1px solid rgba(22,163,74,.1); transition:transform .2s,box-shadow .2s; }
        .fc:hover { transform:translateY(-3px); box-shadow:0 1.25rem 3rem rgba(22,163,74,.1); }
        .inp { width:100%; padding:0.75rem 1rem; border:1.5px solid rgba(22,163,74,.18); border-radius:0.625rem; font-size:0.9375rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; background:#F0FAF4; color:#0F2417; }
        .inp:focus { border-color:#16A34A; background:white; box-shadow:0 0 0 3px rgba(22,163,74,.1); }
        .ic { border-radius:1.125rem; overflow:hidden; position:relative; height:11rem; background:#0F2417; }
        .ic img { width:100%; height:100%; object-fit:cover; opacity:.82; transition:opacity .3s; }
        .ic:hover img { opacity:.95; }
        .ic-lbl { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent,rgba(0,0,0,.72)); padding:0.75rem 1rem; color:white; font-size:0.75rem; font-weight:600; }
        .sc { text-align:center; padding:1.75rem 1.25rem; background:white; border-radius:1rem; border:1px solid rgba(22,163,74,.1); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"rgba(255,255,255,0.94)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(22,163,74,0.1)",
        boxShadow:"0 2px 20px rgba(22,163,74,0.05)" }}>
        <div style={{ maxWidth:"68rem", margin:"0 auto", padding:"0 1.5rem",
          height:"3.875rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
            <div style={{ fontSize:"1.875rem", lineHeight:1 }}>🦾</div>
            <span style={{ color:"#0F2417", fontWeight:800, fontSize:"1rem", letterSpacing:"-0.025em" }}>
              PharmaChain
            </span>
          </div>

          {/* Links */}
          <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
            <Link to="/terms"   className="nk">Termos de Uso</Link>
            <Link to="/privacy" className="nk">Política de Privacidade</Link>
            <Link to="/contact" className="nk">Fale Conosco</Link>
            <Link to="/track" style={{ color:"#16A34A", textDecoration:"none",
              fontSize:"0.8125rem", fontWeight:600, opacity:1 }}>
              Rastrear
            </Link>
            <a href="#login" style={{ background:"linear-gradient(135deg,#16A34A,#15803D)",
              color:"white", padding:"0.5rem 1.25rem", borderRadius:"0.625rem",
              fontSize:"0.8125rem", fontWeight:700, textDecoration:"none",
              boxShadow:"0 4px 12px rgba(22,163,74,0.28)" }}>
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh",
        background:"linear-gradient(160deg,#0F2417 0%,#14532D 55%,#166534 100%)",
        display:"flex", alignItems:"center", padding:"0 1.5rem", paddingTop:"3.875rem",
        position:"relative", overflow:"hidden" }}>

        {/* Decorativos */}
        <div style={{ position:"absolute", top:"-5rem", right:"-5rem", width:"31rem", height:"31rem",
          borderRadius:"50%", background:"radial-gradient(circle,rgba(74,222,128,0.11) 0%,transparent 70%)",
          pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"-3.75rem", left:"-3.75rem", width:"23.75rem", height:"23.75rem",
          borderRadius:"50%", background:"radial-gradient(circle,rgba(22,163,74,0.14) 0%,transparent 70%)",
          pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"20%", left:"2%", fontSize:"5.5rem", opacity:.05, pointerEvents:"none" }}>🧬</div>
        <div style={{ position:"absolute", bottom:"10%", left:"5%", fontSize:"4.5rem", opacity:.04, pointerEvents:"none" }}>🔬</div>
        <div style={{ position:"absolute", top:"45%", right:"2%", fontSize:"5rem", opacity:.04, pointerEvents:"none" }}>🏥</div>

        <div style={{ maxWidth:"68rem", margin:"0 auto", width:"100%",
          display:"flex", gap:"4rem", alignItems:"center" }}>

          {/* Texto */}
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
              background:"rgba(74,222,128,0.14)", border:"1px solid rgba(74,222,128,0.28)",
              borderRadius:"999px", padding:"0.375rem 1rem", marginBottom:"1.5rem" }}>
              <div style={{ width:"0.4375rem", height:"0.4375rem", borderRadius:"50%",
                background:"#4ADE80", boxShadow:"0 0 8px #4ADE80" }}/>
              <span style={{ color:"#4ADE80", fontSize:"0.75rem", fontWeight:600 }}>
                Rede Blockchain Ativa — Polygon Amoy
              </span>
            </div>

            <h1 style={{ color:"white", fontSize:"clamp(2rem,4vw,3.25rem)", fontWeight:800,
              lineHeight:1.08, letterSpacing:"-0.04em", marginBottom:"1.25rem" }}>
              Rastreabilidade<br/>
              <span style={{ color:"#4ADE80" }}>Farmacêutica</span><br/>
              em Blockchain
            </h1>

            <p style={{ color:"rgba(255,255,255,0.62)", fontSize:"1.0625rem", lineHeight:1.8,
              marginBottom:"2.25rem", maxWidth:"28rem" }}>
              Controle total da cadeia logística de medicamentos — do fabricante à farmácia —
              com rastreabilidade imutável, conformidade ANVISA e inteligência em tempo real.
            </p>

            {/* Stats */}
            <div style={{ display:"flex", gap:"2rem", marginBottom:"2.25rem" }}>
              {[
                { num:"100%", label:"Rastreabilidade" },
                { num:"< 2s", label:"Registro blockchain" },
                { num:"24/7", label:"Disponibilidade" },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ color:"#4ADE80", fontSize:"1.625rem", fontWeight:800, marginBottom:"0.125rem",
                    letterSpacing:"-0.03em" }}>{s.num}</p>
                  <p style={{ color:"rgba(255,255,255,0.48)", fontSize:"0.8125rem" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <a href="#sobre" style={{ background:"linear-gradient(135deg,#16A34A,#4ADE80)",
                color:"white", padding:"0.8125rem 1.75rem", borderRadius:"0.6875rem",
                fontWeight:700, textDecoration:"none", fontSize:"0.9375rem",
                boxShadow:"0 8px 24px rgba(22,163,74,0.38)" }}>
                Conheça o Projeto
              </a>
              <a href="#login" style={{ background:"rgba(255,255,255,0.09)", color:"white",
                padding:"0.8125rem 1.75rem", borderRadius:"0.6875rem", fontWeight:600,
                textDecoration:"none", fontSize:"0.9375rem",
                border:"1px solid rgba(255,255,255,0.18)" }}>
                Acessar Sistema
              </a>
            </div>
          </div>

          {/* Login Card */}
          <div id="login" style={{ width:"23.75rem", flexShrink:0 }}>
            <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:"1.5rem", padding:"2.5rem",
              boxShadow:"0 3rem 6rem rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.09)" }}>
              <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"0.875rem" }}>🦾</div>
                <h2 style={{ fontSize:"1.3125rem", fontWeight:800, color:"#0F2417", marginBottom:"0.25rem",
                  letterSpacing:"-0.025em" }}>
                  Acesso ao Sistema
                </h2>
                <p style={{ color:"#4B6B58", fontSize:"0.875rem" }}>
                  Insira suas credenciais para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                <div>
                  <label style={{ fontSize:"0.6875rem", fontWeight:700, color:"#4B6B58",
                    display:"block", marginBottom:"0.375rem", letterSpacing:"0.05em" }}>CNPJ</label>
                  <input className="inp" type="text" placeholder="00.000.000/0001-00"
                    value={cnpj} onChange={e => setCnpj(e.target.value)} required/>
                </div>
                <div>
                  <label style={{ fontSize:"0.6875rem", fontWeight:700, color:"#4B6B58",
                    display:"block", marginBottom:"0.375rem", letterSpacing:"0.05em" }}>SENHA</label>
                  <input className="inp" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
                <button type="submit" disabled={loading}
                  style={{ marginTop:"0.375rem", height:"2.875rem", fontSize:"0.9375rem", width:"100%",
                    fontWeight:700, background:"linear-gradient(135deg,#15803D,#16A34A)",
                    color:"white", border:"none", borderRadius:"0.6875rem", cursor:"pointer",
                    fontFamily:"inherit", boxShadow:"0 6px 20px rgba(22,163,74,0.32)",
                    opacity: loading ? .7 : 1, transition:"opacity .2s" }}>
                  {loading ? "Autenticando..." : "Entrar"}
                </button>
              </form>

              <p style={{ textAlign:"center", fontSize:"0.6875rem", color:"#94a3b8",
                marginTop:"1.25rem", lineHeight:1.6 }}>
                Acesso restrito a participantes autorizados<br/>da rede PharmaChain
              </p>
            </div>

            {/* Mini galeria */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginTop:"0.75rem" }}>
              {IMGS.map((img, i) => (
                <div key={i} className="ic">
                  <img src={img.url} alt={img.label}
                    onError={e => (e.currentTarget.style.display="none")}/>
                  <div className="ic-lbl">{img.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMAGENS ── */}
      <section className="sec" style={{ background:"white" }}>
        <div className="wrap">
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <span className="tag">Tecnologia em Ação</span>
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.25rem)", fontWeight:800, color:"#0F2417",
              letterSpacing:"-0.03em" }}>
              Inovação na Cadeia Farmacêutica
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
            {IMGS.map((img, i) => (
              <div key={i} style={{ borderRadius:"1.25rem", overflow:"hidden", position:"relative",
                height:"13.75rem", background:"#0F2417",
                boxShadow:"0 0.75rem 2.5rem rgba(22,163,74,0.13)" }}>
                <img src={img.url} alt={img.label}
                  style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.84 }}
                  onError={e => (e.currentTarget.style.display="none")}/>
                <div style={{ position:"absolute", inset:0,
                  background:"linear-gradient(to top,rgba(15,36,23,0.78) 0%,transparent 60%)" }}/>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1rem" }}>
                  <p style={{ color:"white", fontSize:"0.8125rem", fontWeight:600 }}>{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section id="sobre" className="sec" style={{ background:"#F0FAF4" }}>
        <div className="wrap">
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <span className="tag">Sobre o Projeto</span>
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.375rem)", fontWeight:800, color:"#0F2417",
              letterSpacing:"-0.03em", marginBottom:"0.875rem" }}>
              O que é o PharmaChain?
            </h2>
            <p style={{ color:"#4B6B58", fontSize:"1rem", maxWidth:"36rem",
              margin:"0 auto", lineHeight:1.8 }}>
              Plataforma blockchain para garantir integridade e conformidade ANVISA
              em toda a cadeia logística de medicamentos no Brasil.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.25rem" }}>
            {[
              { icon:"🔗", title:"Blockchain Imutável",  desc:"Cada movimentação de lote registrada permanentemente na rede Polygon, à prova de adulteração." },
              { icon:"🏥", title:"Conformidade ANVISA",  desc:"Atende RDC 204/2017 e demais normativas para rastreabilidade de medicamentos no Brasil." },
              { icon:"⚡", title:"Tempo Real",           desc:"Monitoramento ao vivo de transferências, alertas de temperatura e dispensação de receitas." },
            ].map((item, i) => (
              <div key={i} className="fc">
                <div style={{ fontSize:"2.25rem", marginBottom:"1rem" }}>{item.icon}</div>
                <h3 style={{ fontSize:"1.0625rem", fontWeight:700, color:"#0F2417", marginBottom:"0.625rem",
                  letterSpacing:"-0.02em" }}>{item.title}</h3>
                <p style={{ color:"#4B6B58", fontSize:"0.9375rem", lineHeight:1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCKCHAIN ── */}
      <section className="sec" style={{ background:"white" }}>
        <div className="wrap">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4.5rem", alignItems:"center" }}>
            <div>
              <span className="tag">Tecnologia</span>
              <h2 style={{ fontSize:"clamp(1.375rem,2.5vw,2.25rem)", fontWeight:800, color:"#0F2417",
                letterSpacing:"-0.03em", marginBottom:"0.875rem", lineHeight:1.2 }}>
                Inteligência Blockchain conectada à Logística Farmacêutica
              </h2>
              <p style={{ color:"#4B6B58", fontSize:"0.9375rem", lineHeight:1.8, marginBottom:"1.375rem" }}>
                Smart contracts automatizam aprovações, alertas e recalls. Cada lote tem registro
                único, verificável e permanente na rede Polygon Amoy.
              </p>
              {[
                "Contratos inteligentes auditados (OpenZeppelin)",
                "Assinaturas ECDSA em cada transferência",
                "Hash SHA-256 para validação de dados",
                "Rede pública — sem servidor central",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"0.625rem" }}>
                  <div style={{ width:"1.375rem", height:"1.375rem", borderRadius:"50%",
                    background:"#DCFCE7", display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:"0.6875rem", color:"#16A34A", fontWeight:700 }}>✓</span>
                  </div>
                  <span style={{ fontSize:"0.9375rem", color:"#374151" }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
              borderRadius:"1.375rem", padding:"2.25rem", color:"white" }}>
              <p style={{ fontSize:"0.6875rem", color:"#4ADE80", fontWeight:700, marginBottom:"1.25rem",
                letterSpacing:"0.1em" }}>FLUXO DE RASTREABILIDADE</p>
              {[
                { step:"01", label:"Fabricante registra lote",  sub:"GTIN-14 + hash SHA-256 → blockchain" },
                { step:"02", label:"Distribuidor recebe",        sub:"Assinatura ECDSA + NF-e validada" },
                { step:"03", label:"Farmácia confirma",          sub:"Estoque atualizado em tempo real" },
                { step:"04", label:"Médico emite receita",       sub:"Criptografada AES-256 + LGPD" },
                { step:"05", label:"Paciente retira",            sub:"Dispensação registrada na blockchain" },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"0.875rem",
                  marginBottom:i<4?"1.125rem":"0", alignItems:"flex-start" }}>
                  <div style={{ width:"2rem", height:"2rem", borderRadius:"0.5625rem",
                    background:"rgba(74,222,128,0.18)", display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"0.6875rem", fontWeight:700,
                    color:"#4ADE80", flexShrink:0 }}>
                    {item.step}
                  </div>
                  <div>
                    <p style={{ fontSize:"0.9375rem", fontWeight:600, marginBottom:"0.125rem" }}>{item.label}</p>
                    <p style={{ fontSize:"0.8125rem", color:"rgba(255,255,255,0.42)" }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="sec" style={{ background:"linear-gradient(135deg,#0F2417,#14532D)" }}>
        <div className="wrap" style={{ textAlign:"center" }}>
          <span style={{ display:"inline-block", background:"rgba(74,222,128,0.14)",
            color:"#4ADE80", fontSize:"0.6875rem", fontWeight:700, padding:"0.25rem 0.875rem",
            borderRadius:"999px", marginBottom:"1.5rem", letterSpacing:"0.08em",
            textTransform:"uppercase" }}>
            Logística Farmacêutica
          </span>
          <h2 style={{ fontSize:"clamp(1.75rem,4vw,2.75rem)", fontWeight:800, color:"white",
            letterSpacing:"-0.04em", marginBottom:"1rem" }}>
            Cuidamos da sua Logística
          </h2>
          <p style={{ color:"rgba(255,255,255,0.58)", fontSize:"1.0625rem", maxWidth:"31.25rem",
            margin:"0 auto 2.25rem", lineHeight:1.8 }}>
            Do registro na fábrica à dispensação na farmácia — cada etapa rastreada,
            verificada e registrada permanentemente na blockchain.
          </p>
          <a href="#login" style={{ display:"inline-block",
            background:"linear-gradient(135deg,#16A34A,#4ADE80)",
            color:"white", padding:"0.9375rem 2.5rem", borderRadius:"0.8125rem",
            fontWeight:800, textDecoration:"none", fontSize:"0.9375rem",
            boxShadow:"0 0.75rem 2rem rgba(22,163,74,0.38)" }}>
            Acessar o Sistema →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#020F07", padding:"2.25rem 1.5rem" }}>
        <div className="wrap">
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
              <div style={{ fontSize:"1.5rem" }}>🦾</div>
              <span style={{ color:"white", fontWeight:700, fontSize:"0.9375rem" }}>PharmaChain</span>
            </div>
            <p style={{ color:"#374151", fontSize:"0.8125rem" }}>
              Copyright © 2026 PharmaChain. Todos os direitos reservados.
              Matheus Augusto Roseira Santana · Salvador, Bahia.
            </p>
            <div style={{ display:"flex", gap:"1.25rem" }}>
              <Link to="/terms"   style={{ color:"#4B6B58", fontSize:"0.8125rem", textDecoration:"none" }}>Termos de Uso</Link>
              <Link to="/privacy" style={{ color:"#4B6B58", fontSize:"0.8125rem", textDecoration:"none" }}>Privacidade</Link>
              <Link to="/contact" style={{ color:"#4B6B58", fontSize:"0.8125rem", textDecoration:"none" }}>Contato</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
