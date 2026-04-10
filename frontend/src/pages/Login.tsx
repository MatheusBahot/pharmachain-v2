import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

const IMGS = [
  { url:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=420&q=80", label:"Rastreabilidade de ponta a ponta" },
  { url:"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=420&q=80", label:"Cadeia do frio monitorada" },
  { url:"https://images.unsplash.com/photo-1576671081837-49000212a370?w=420&q=80", label:"Conformidade ANVISA" },
  { url:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=420&q=80",   label:"Blockchain farmacêutico" },
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
      navigate("/about");
      toast.success("Bem-vindo ao PharmaChain");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F0FAF4", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        .nk { color:#0F2417; text-decoration:none; font-size:13px; font-weight:500; opacity:.7; transition:opacity .2s; }
        .nk:hover { opacity:1; }
        .s { padding:88px 24px; }
        .c { max-width:1080px; margin:0 auto; }
        .tag { display:inline-block; background:#DCFCE7; color:#15803D; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; margin-bottom:14px; letter-spacing:.6px; text-transform:uppercase; }
        .fc { background:white; border-radius:18px; padding:28px; border:1px solid rgba(22,163,74,.12); transition:transform .2s,box-shadow .2s; }
        .fc:hover { transform:translateY(-4px); box-shadow:0 20px 48px rgba(22,163,74,.12); }
        .inp { width:100%; padding:12px 16px; border:1.5px solid rgba(22,163,74,.2); border-radius:10px; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; background:#F0FAF4; color:#0F2417; }
        .inp:focus { border-color:#16A34A; background:white; box-shadow:0 0 0 3px rgba(22,163,74,.12); }
        .sc { text-align:center; padding:28px 20px; background:white; border-radius:16px; border:1px solid rgba(22,163,74,.12); }
        .ic { border-radius:18px; overflow:hidden; position:relative; height:200px; background:#0F2417; }
        .ic img { width:100%; height:100%; object-fit:cover; opacity:.82; }
        .ic-label { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent,rgba(0,0,0,.7)); padding:12px 16px; color:white; font-size:12px; font-weight:600; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"rgba(255,255,255,0.94)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(22,163,74,0.12)",
        boxShadow:"0 2px 20px rgba(22,163,74,0.06)" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px",
          height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#16A34A,#4ADE80)",
              borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, boxShadow:"0 4px 12px rgba(22,163,74,0.3)" }}>💊</div>
            <span style={{ color:"#0F2417", fontWeight:800, fontSize:16, letterSpacing:"-0.4px" }}>PharmaChain</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:28 }}>
            <Link to="/terms"   className="nk">Termos de Uso</Link>
            <Link to="/privacy" className="nk">Política de Privacidade</Link>
            <Link to="/contact" className="nk">Fale Conosco</Link>
            <a href="#login" style={{ background:"linear-gradient(135deg,#16A34A,#15803D)",
              color:"white", padding:"9px 22px", borderRadius:10, fontSize:13,
              fontWeight:700, textDecoration:"none",
              boxShadow:"0 4px 12px rgba(22,163,74,0.3)" }}>Login</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh",
        background:"linear-gradient(160deg,#0F2417 0%,#14532D 55%,#166534 100%)",
        display:"flex", alignItems:"center", padding:"0 24px", paddingTop:62,
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:500, height:500,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(74,222,128,0.12) 0%,transparent 70%)",
          pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, left:-60, width:380, height:380,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(22,163,74,0.15) 0%,transparent 70%)",
          pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"20%", left:"3%", fontSize:100, opacity:.06, pointerEvents:"none" }}>🧬</div>
        <div style={{ position:"absolute", bottom:"12%", left:"6%", fontSize:80, opacity:.05, pointerEvents:"none" }}>🔬</div>
        <div style={{ position:"absolute", top:"45%", right:"3%", fontSize:90, opacity:.05, pointerEvents:"none" }}>🏥</div>

        <div style={{ maxWidth:1080, margin:"0 auto", width:"100%",
          display:"flex", gap:64, alignItems:"center" }}>

          {/* Texto */}
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)",
              borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80",
                boxShadow:"0 0 8px #4ADE80" }}/>
              <span style={{ color:"#4ADE80", fontSize:12, fontWeight:600 }}>
                Rede Blockchain Ativa — Polygon Amoy
              </span>
            </div>
            <h1 style={{ color:"white", fontSize:52, fontWeight:800, lineHeight:1.08,
              letterSpacing:"-2px", marginBottom:20 }}>
              Rastreabilidade<br/>
              <span style={{ color:"#4ADE80" }}>Farmacêutica</span><br/>
              em Blockchain
            </h1>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:17, lineHeight:1.8,
              marginBottom:36, maxWidth:460 }}>
              Controle total da cadeia logística de medicamentos — do fabricante à farmácia —
              com rastreabilidade imutável, conformidade ANVISA e inteligência em tempo real.
            </p>
            <div style={{ display:"flex", gap:32, marginBottom:36 }}>
              {[
                { num:"100%", label:"Rastreabilidade" },
                { num:"< 2s", label:"Registro blockchain" },
                { num:"24/7", label:"Disponibilidade" },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ color:"#4ADE80", fontSize:26, fontWeight:800, marginBottom:2 }}>{s.num}</p>
                  <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <a href="#sobre" style={{ background:"linear-gradient(135deg,#16A34A,#4ADE80)",
                color:"white", padding:"13px 28px", borderRadius:11, fontWeight:700,
                textDecoration:"none", fontSize:14,
                boxShadow:"0 8px 24px rgba(22,163,74,0.4)" }}>
                Conheça o Projeto
              </a>
              <a href="#login" style={{ background:"rgba(255,255,255,0.1)", color:"white",
                padding:"13px 28px", borderRadius:11, fontWeight:600,
                textDecoration:"none", fontSize:14,
                border:"1px solid rgba(255,255,255,0.2)" }}>
                Acessar Sistema
              </a>
            </div>
          </div>

          {/* Login Card */}
          <div id="login" style={{ width:380, flexShrink:0 }}>
            <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:24, padding:40,
              boxShadow:"0 48px 96px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)" }}>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ width:56, height:56, borderRadius:16,
                  background:"linear-gradient(135deg,#16A34A,#4ADE80)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 16px", fontSize:24,
                  boxShadow:"0 8px 24px rgba(22,163,74,0.35)" }}>💊</div>
                <h2 style={{ fontSize:21, fontWeight:800, color:"#0F2417", marginBottom:4 }}>Acesso ao Sistema</h2>
                <p style={{ color:"#4B6B58", fontSize:13 }}>Insira suas credenciais para continuar</p>
              </div>
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#4B6B58",
                    display:"block", marginBottom:6, letterSpacing:".5px" }}>CNPJ</label>
                  <input className="inp" type="text" placeholder="00.000.000/0001-00"
                    value={cnpj} onChange={e => setCnpj(e.target.value)} required/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#4B6B58",
                    display:"block", marginBottom:6, letterSpacing:".5px" }}>SENHA</label>
                  <input className="inp" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
                <button type="submit" disabled={loading}
                  style={{ marginTop:6, height:46, fontSize:15, width:"100%", fontWeight:700,
                    background:"linear-gradient(135deg,#15803D,#16A34A)", color:"white",
                    border:"none", borderRadius:11, cursor:"pointer", fontFamily:"inherit",
                    boxShadow:"0 6px 20px rgba(22,163,74,0.35)",
                    opacity: loading ? .7 : 1 }}>
                  {loading ? "Autenticando..." : "Entrar"}
                </button>
              </form>
              <p style={{ textAlign:"center", fontSize:11, color:"#94a3b8", marginTop:20, lineHeight:1.6 }}>
                Acesso restrito a participantes autorizados<br/>da rede PharmaChain
              </p>
            </div>

            {/* Mini galeria */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
              {IMGS.map((img, i) => (
                <div key={i} className="ic">
                  <img src={img.url} alt={img.label}
                    onError={e => (e.currentTarget.style.display="none")}/>
                  <div className="ic-label">{img.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMAGENS ILUSTRATIVAS */}
      <section className="s" style={{ background:"white", paddingBottom:64 }}>
        <div className="c">
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <span className="tag">Tecnologia em Ação</span>
            <h2 style={{ fontSize:36, fontWeight:800, color:"#0F2417", letterSpacing:"-1px" }}>
              Inovação na Cadeia Farmacêutica
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {IMGS.map((img, i) => (
              <div key={i} style={{ borderRadius:20, overflow:"hidden", position:"relative",
                height:220, background:"#0F2417",
                boxShadow:"0 12px 40px rgba(22,163,74,0.15)" }}>
                <img src={img.url} alt={img.label}
                  style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.85 }}
                  onError={e => (e.currentTarget.style.display="none")}/>
                <div style={{ position:"absolute", inset:0,
                  background:"linear-gradient(to top,rgba(15,36,23,0.8) 0%,transparent 60%)" }}/>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"16px" }}>
                  <p style={{ color:"white", fontSize:13, fontWeight:700 }}>{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="s" style={{ background:"#F0FAF4" }}>
        <div className="c">
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <span className="tag">Sobre o Projeto</span>
            <h2 style={{ fontSize:38, fontWeight:800, color:"#0F2417", letterSpacing:"-1px", marginBottom:14 }}>
              O que é o PharmaChain?
            </h2>
            <p style={{ color:"#4B6B58", fontSize:16, maxWidth:580, margin:"0 auto", lineHeight:1.8 }}>
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
                <div style={{ fontSize:36, marginBottom:16 }}>{item.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:700, color:"#0F2417", marginBottom:10 }}>{item.title}</h3>
                <p style={{ color:"#4B6B58", fontSize:14, lineHeight:1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCKCHAIN */}
      <section className="s" style={{ background:"white" }}>
        <div className="c">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
            <div>
              <span className="tag">Tecnologia</span>
              <h2 style={{ fontSize:36, fontWeight:800, color:"#0F2417", letterSpacing:"-1px",
                marginBottom:14, lineHeight:1.2 }}>
                Inteligência Blockchain conectada à Logística Farmacêutica
              </h2>
              <p style={{ color:"#4B6B58", fontSize:15, lineHeight:1.8, marginBottom:22 }}>
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
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"#DCFCE7",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:11, color:"#16A34A", fontWeight:700 }}>✓</span>
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
                    background:"rgba(74,222,128,0.2)", display:"flex", alignItems:"center",
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

      {/* CTA */}
      <section className="s" style={{ background:"linear-gradient(135deg,#0F2417,#14532D)" }}>
        <div className="c" style={{ textAlign:"center" }}>
          <span style={{ display:"inline-block", background:"rgba(74,222,128,0.15)",
            color:"#4ADE80", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20,
            marginBottom:24, letterSpacing:"1px", textTransform:"uppercase" }}>
            Logística Farmacêutica
          </span>
          <h2 style={{ fontSize:44, fontWeight:800, color:"white", letterSpacing:"-1px", marginBottom:16 }}>
            Cuidamos da sua Logística
          </h2>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:17, maxWidth:500,
            margin:"0 auto 36px", lineHeight:1.8 }}>
            Do registro na fábrica à dispensação na farmácia — cada etapa rastreada,
            verificada e registrada permanentemente na blockchain.
          </p>
          <a href="#login" style={{ display:"inline-block",
            background:"linear-gradient(135deg,#16A34A,#4ADE80)",
            color:"white", padding:"15px 40px", borderRadius:13,
            fontWeight:800, textDecoration:"none", fontSize:15,
            boxShadow:"0 12px 32px rgba(22,163,74,0.4)" }}>
            Acessar o Sistema →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"#020F07", padding:"36px 24px" }}>
        <div className="c">
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, background:"linear-gradient(135deg,#16A34A,#4ADE80)",
                borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>💊</div>
              <span style={{ color:"white", fontWeight:700, fontSize:14 }}>PharmaChain</span>
            </div>
            <p style={{ color:"#374151", fontSize:12 }}>
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
