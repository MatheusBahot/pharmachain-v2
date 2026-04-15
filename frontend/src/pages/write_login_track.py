import os

base = os.path.expanduser("~/pharmachain/frontend/src/pages")

# ─────────────────────────────────────────────────────────────────
# LOGIN.TSX — imagens reais, logo 3D SVG, seção consumidor
# ─────────────────────────────────────────────────────────────────
login = r"""import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

// Logo 3D SVG — mao mecanica segurando capsula
function Logo3D({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hand1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ADE80"/>
          <stop offset="100%" stopColor="#16A34A"/>
        </linearGradient>
        <linearGradient id="pill1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="50%" stopColor="#DCFCE7"/>
          <stop offset="100%" stopColor="#86EFAC"/>
        </linearGradient>
        <linearGradient id="pill2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16A34A"/>
          <stop offset="100%" stopColor="#14532D"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#14532D" floodOpacity="0.35"/>
        </filter>
      </defs>
      {/* Base da mao */}
      <rect x="8" y="28" width="6" height="18" rx="3" fill="url(#hand1)" filter="url(#shadow)"/>
      <rect x="16" y="24" width="6" height="22" rx="3" fill="url(#hand1)" filter="url(#shadow)"/>
      <rect x="24" y="22" width="6" height="24" rx="3" fill="url(#hand1)" filter="url(#shadow)"/>
      <rect x="32" y="24" width="6" height="22" rx="3" fill="url(#hand1)" filter="url(#shadow)"/>
      {/* Palma */}
      <rect x="8" y="36" width="30" height="10" rx="4" fill="url(#hand1)"/>
      {/* Polegar */}
      <rect x="4" y="30" width="6" height="12" rx="3" fill="#4ADE80" transform="rotate(-15 4 30)"/>
      {/* Capsula - metade branca */}
      <ellipse cx="27" cy="16" rx="10" ry="5.5" fill="url(#pill1)" filter="url(#shadow)" transform="rotate(-20 27 16)"/>
      {/* Capsula - metade verde */}
      <path d="M27 16 Q33 10 37 14 Q38 18 33 21 Q29 22 27 16Z" fill="url(#pill2)"/>
      {/* Brilho capsula */}
      <ellipse cx="23" cy="13" rx="3.5" ry="1.5" fill="white" opacity="0.5" transform="rotate(-20 23 13)"/>
      {/* Brilho dedos */}
      <ellipse cx="19" cy="25" rx="1.5" ry="3" fill="white" opacity="0.2"/>
      <ellipse cx="27" cy="23" rx="1.5" ry="3" fill="white" opacity="0.2"/>
    </svg>
  );
}

// Imagens por topico
const HERO_IMGS = [
  { url:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80", label:"Rastreabilidade de ponta a ponta", tag:"Supply Chain" },
  { url:"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80", label:"Cadeia do frio monitorada", tag:"Cold Chain" },
  { url:"https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80", label:"Conformidade ANVISA", tag:"Regulatory" },
  { url:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80", label:"Blockchain farmaceutico", tag:"Blockchain" },
];

const FEATURE_IMGS = [
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80",
  "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=600&q=80",
  "https://images.unsplash.com/photo-1620825937374-87fc7d6bddc2?w=600&q=80",
];

const FLOW_IMG = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=900&q=80";

export default function Login() {
  const [cnpj, setCnpj]         = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [activeImg, setActiveImg] = useState(0);
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
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        .nk{color:#4B6B58;text-decoration:none;font-size:13px;font-weight:500;opacity:.8;transition:opacity .2s}
        .nk:hover{opacity:1;color:#16A34A}
        .s{padding:80px 24px}
        .c{max-width:1080px;margin:0 auto}
        .tag{display:inline-block;background:#DCFCE7;color:#14532D;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:14px;letter-spacing:.6px;text-transform:uppercase}
        .fc{background:white;border-radius:18px;padding:28px;border:1px solid rgba(22,163,74,.14);transition:transform .2s,box-shadow .2s}
        .fc:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(22,163,74,.1)}
        .inp{width:100%;padding:12px 16px;border:1.5px solid rgba(22,163,74,.2);border-radius:10px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;background:#F0FAF4;color:#0F2417}
        .inp:focus{border-color:#16A34A;background:white;box-shadow:0 0 0 3px rgba(22,163,74,.1)}
        .img-card{border-radius:20px;overflow:hidden;position:relative;background:#0F2417}
        .img-card img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .img-card:hover img{transform:scale(1.04)}
        .thumb{width:52px;height:52px;border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:border-color .2s,transform .2s;flex-shrink:0}
        .thumb:hover{transform:scale(1.05)}
        .thumb.active{border-color:#16A34A}
        .thumb img{width:100%;height:100%;object-fit:cover}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(240,250,244,.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(22,163,74,.12)",boxShadow:"0 2px 16px rgba(22,163,74,.07)" }}>
        <div style={{ maxWidth:1080,margin:"0 auto",padding:"0 24px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Logo3D size={36}/>
            <span style={{ color:"#0F2417",fontWeight:800,fontSize:16,letterSpacing:"-0.4px" }}>PharmaChain</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:24 }}>
            <Link to="/terms"   className="nk">Termos de Uso</Link>
            <Link to="/privacy" className="nk">Politica de Privacidade</Link>
            <Link to="/contact" className="nk">Fale Conosco</Link>
            <Link to="/track" style={{ background:"#DCFCE7",color:"#14532D",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:700,textDecoration:"none",border:"1px solid rgba(22,163,74,.25)" }}>
              Rastrear Medicamento
            </Link>
            <a href="#login" style={{ background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",padding:"9px 22px",borderRadius:10,fontSize:13,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 12px rgba(22,163,74,.25)" }}>
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh",background:"#F0FAF4",display:"flex",alignItems:"center",padding:"0 24px",paddingTop:62 }}>
        <div style={{ maxWidth:1080,margin:"0 auto",width:"100%",display:"flex",gap:56,alignItems:"center" }}>

          {/* Esquerdo — texto + galeria */}
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#DCFCE7",border:"1px solid rgba(22,163,74,.25)",borderRadius:20,padding:"6px 16px",marginBottom:24 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#16A34A",boxShadow:"0 0 6px #16A34A" }}/>
              <span style={{ color:"#14532D",fontSize:12,fontWeight:600 }}>Rede Blockchain Ativa — Polygon Amoy</span>
            </div>
            <h1 style={{ color:"#0F2417",fontSize:48,fontWeight:800,lineHeight:1.1,letterSpacing:"-1.5px",marginBottom:18 }}>
              Rastreabilidade<br/>
              <span style={{ color:"#16A34A" }}>Farmaceutica</span><br/>
              em Blockchain
            </h1>
            <p style={{ color:"#4B6B58",fontSize:16,lineHeight:1.8,marginBottom:28,maxWidth:460 }}>
              Controle total da cadeia logistica de medicamentos — do fabricante a farmacia — com rastreabilidade imutavel, conformidade ANVISA e inteligencia em tempo real.
            </p>

            {/* Stats */}
            <div style={{ display:"flex",gap:28,marginBottom:32 }}>
              {[{ num:"100%",label:"Rastreabilidade" },{ num:"< 2s",label:"Registro blockchain" },{ num:"24/7",label:"Disponibilidade" }].map((s,i) => (
                <div key={i}>
                  <p style={{ color:"#16A34A",fontSize:24,fontWeight:800,marginBottom:2 }}>{s.num}</p>
                  <p style={{ color:"#4B6B58",fontSize:12 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Imagem principal com galeria */}
            <div className="img-card" style={{ height:260,marginBottom:10 }}>
              <img src={HERO_IMGS[activeImg].url} alt={HERO_IMGS[activeImg].label}/>
              <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,36,23,.7) 0%,transparent 50%)" }}/>
              <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"16px 20px" }}>
                <span style={{ background:"rgba(22,163,74,.8)",color:"white",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,marginBottom:6,display:"inline-block" }}>{HERO_IMGS[activeImg].tag}</span>
                <p style={{ color:"white",fontSize:14,fontWeight:600 }}>{HERO_IMGS[activeImg].label}</p>
              </div>
            </div>
            {/* Thumbnails */}
            <div style={{ display:"flex",gap:8 }}>
              {HERO_IMGS.map((img,i) => (
                <div key={i} className={"thumb" + (activeImg===i?" active":"")} onClick={() => setActiveImg(i)}>
                  <img src={img.url} alt={img.label}/>
                </div>
              ))}
              <Link to="/track" style={{ flex:1,background:"linear-gradient(135deg,#0F2417,#14532D)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none",padding:"8px 12px" }}>
                <span style={{ fontSize:18 }}>📷</span>
                <span style={{ color:"#4ADE80",fontSize:12,fontWeight:700,lineHeight:1.3 }}>Rastrear<br/>Medicamento</span>
              </Link>
            </div>
          </div>

          {/* Direito — LOGIN CARD */}
          <div id="login" style={{ width:390,flexShrink:0 }}>
            <div style={{ background:"white",borderRadius:24,padding:40,boxShadow:"0 24px 64px rgba(22,163,74,.13)",border:"1px solid rgba(22,163,74,.15)" }}>
              <div style={{ textAlign:"center",marginBottom:28 }}>
                <div style={{ width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#DCFCE7,#BBF7D0)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 24px rgba(22,163,74,.2)" }}>
                  <Logo3D size={48}/>
                </div>
                <h2 style={{ fontSize:20,fontWeight:800,color:"#0F2417",marginBottom:4 }}>Acesso ao Sistema</h2>
                <p style={{ color:"#4B6B58",fontSize:13 }}>Insira suas credenciais para continuar</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".5px" }}>CNPJ</label>
                  <input className="inp" type="text" placeholder="00.000.000/0001-00" value={cnpj} onChange={e => setCnpj(e.target.value)} required/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:"#4B6B58",display:"block",marginBottom:6,letterSpacing:".5px" }}>SENHA</label>
                  <input className="inp" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
                <button type="submit" disabled={loading} style={{ marginTop:6,height:46,fontSize:15,width:"100%",fontWeight:700,background:"linear-gradient(135deg,#15803D,#16A34A)",color:"white",border:"none",borderRadius:11,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:"0 6px 18px rgba(22,163,74,.3)",opacity:loading?.7:1 }}>
                  {loading ? "Autenticando..." : "Entrar"}
                </button>
              </form>

              <div style={{ margin:"20px 0 16px",borderTop:"1px solid rgba(22,163,74,.12)",paddingTop:16,textAlign:"center" }}>
                <p style={{ fontSize:12,color:"#4B6B58",marginBottom:10 }}>Voce e um paciente ou consumidor?</p>
                <Link to="/track" style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#F0FAF4",color:"#16A34A",border:"1px solid rgba(22,163,74,.25)",padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:700,textDecoration:"none",width:"100%",justifyContent:"center" }}>
                  <span>📷</span> Rastrear meu Medicamento
                </Link>
              </div>

              <p style={{ textAlign:"center",fontSize:11,color:"#94a3b8",lineHeight:1.6 }}>
                Acesso restrito a participantes autorizados<br/>da rede PharmaChain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES COM IMAGENS ── */}
      <section className="s" style={{ background:"white" }}>
        <div className="c">
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <span className="tag">Sobre o Projeto</span>
            <h2 style={{ fontSize:36,fontWeight:800,color:"#0F2417",letterSpacing:"-1px",marginBottom:14 }}>O que e o PharmaChain?</h2>
            <p style={{ color:"#4B6B58",fontSize:16,maxWidth:580,margin:"0 auto",lineHeight:1.8 }}>
              Plataforma blockchain para garantir integridade e conformidade ANVISA em toda a cadeia logistica de medicamentos no Brasil.
            </p>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
            {[
              { img:FEATURE_IMGS[0], icon:"🔗", title:"Blockchain Imutavel", desc:"Cada movimentacao de lote registrada permanentemente na rede Polygon, a prova de adulteracao." },
              { img:FEATURE_IMGS[1], icon:"🏥", title:"Conformidade ANVISA", desc:"Atende RDC 204/2017 e demais normativas para rastreabilidade de medicamentos no Brasil." },
              { img:FEATURE_IMGS[2], icon:"📷", title:"Rastreio pelo Consumidor", desc:"Pacientes escaneiam o QR Code da embalagem e visualizam todo o historico do medicamento." },
            ].map((item,i) => (
              <div key={i} className="fc" style={{ padding:0,overflow:"hidden" }}>
                <div style={{ height:180,overflow:"hidden",position:"relative" }}>
                  <img src={item.img} alt={item.title} style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s" }} onMouseOver={e=>(e.currentTarget.style.transform="scale(1.05)")} onMouseOut={e=>(e.currentTarget.style.transform="scale(1)")}/>
                  <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,36,23,.5) 0%,transparent 60%)" }}/>
                  <div style={{ position:"absolute",bottom:12,left:14,fontSize:28 }}>{item.icon}</div>
                </div>
                <div style={{ padding:"20px 24px 24px" }}>
                  <h3 style={{ fontSize:16,fontWeight:700,color:"#0F2417",marginBottom:8 }}>{item.title}</h3>
                  <p style={{ color:"#4B6B58",fontSize:14,lineHeight:1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCKCHAIN COM IMAGEM ── */}
      <section className="s" style={{ background:"#F0FAF4" }}>
        <div className="c">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <div className="img-card" style={{ height:400 }}>
                <img src={FLOW_IMG} alt="Fluxo farmaceutico" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(15,36,23,.4),transparent)" }}/>
              </div>
              <div style={{ position:"absolute",bottom:-20,right:-20,background:"white",borderRadius:16,padding:"16px 20px",boxShadow:"0 12px 32px rgba(22,163,74,.15)",border:"1px solid rgba(22,163,74,.15)" }}>
                <p style={{ fontSize:11,color:"#16A34A",fontWeight:700,marginBottom:4 }}>ULTIMA TRANSACAO</p>
                <p style={{ fontSize:13,color:"#0F2417",fontWeight:600 }}>Lote #LOTE-2026 verificado</p>
                <p style={{ fontSize:11,color:"#4B6B58" }}>Polygon Amoy • agora</p>
              </div>
            </div>
            <div>
              <span className="tag">Tecnologia</span>
              <h2 style={{ fontSize:34,fontWeight:800,color:"#0F2417",letterSpacing:"-1px",marginBottom:14,lineHeight:1.2 }}>
                Inteligencia Blockchain conectada a Logistica Farmaceutica
              </h2>
              <p style={{ color:"#4B6B58",fontSize:15,lineHeight:1.8,marginBottom:22 }}>
                Smart contracts automatizam aprovacoes, alertas e recalls. Cada lote tem registro unico, verificavel e permanente na rede Polygon Amoy.
              </p>
              {["Contratos inteligentes auditados (OpenZeppelin)","Assinaturas ECDSA em cada transferencia","Hash SHA-256 para validacao de dados","Rede publica — sem servidor central"].map((item,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <div style={{ width:22,height:22,borderRadius:"50%",background:"#DCFCE7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontSize:11,color:"#16A34A",fontWeight:700 }}>✓</span>
                  </div>
                  <span style={{ fontSize:14,color:"#374151" }}>{item}</span>
                </div>
              ))}
              <Link to="/track" style={{ display:"inline-flex",alignItems:"center",gap:10,marginTop:24,background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",padding:"13px 28px",borderRadius:11,fontWeight:700,textDecoration:"none",fontSize:14,boxShadow:"0 6px 18px rgba(22,163,74,.3)" }}>
                <span>📷</span> Testar Rastreio de Medicamento
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSUMIDOR ── */}
      <section className="s" style={{ background:"white" }}>
        <div className="c">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center" }}>
            <div>
              <span className="tag">Para o Paciente</span>
              <h2 style={{ fontSize:34,fontWeight:800,color:"#0F2417",letterSpacing:"-1px",marginBottom:14,lineHeight:1.2 }}>
                Voce pode verificar seu medicamento em segundos
              </h2>
              <p style={{ color:"#4B6B58",fontSize:15,lineHeight:1.8,marginBottom:22 }}>
                Sem login, sem cadastro. Apenas abra a camera do seu celular, aponte para o QR Code na embalagem e veja toda a historia do medicamento — de onde veio, como foi transportado e se e autentico.
              </p>
              {[
                { icon:"📦", title:"Origem verificada", desc:"Fabricante, lote e data de fabricacao registrados na blockchain" },
                { icon:"🌡️", title:"Cadeia do frio", desc:"Temperatura e umidade monitoradas em cada etapa do transporte" },
                { icon:"✅", title:"Autenticidade garantida", desc:"Impossivel falsificar — registro imutavel na rede publica Polygon" },
                { icon:"🔒", title:"Sua privacidade protegida", desc:"Nenhum dado pessoal e coletado ao rastrear" },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex",gap:12,marginBottom:16,alignItems:"flex-start" }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"#F0FAF4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize:14,fontWeight:700,color:"#0F2417",marginBottom:2 }}>{item.title}</p>
                    <p style={{ fontSize:13,color:"#4B6B58" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
              <Link to="/track" style={{ display:"inline-flex",alignItems:"center",gap:10,marginTop:8,background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",padding:"14px 32px",borderRadius:12,fontWeight:800,textDecoration:"none",fontSize:15,boxShadow:"0 8px 24px rgba(22,163,74,.3)" }}>
                <span>📷</span> Rastrear meu Medicamento Agora
              </Link>
            </div>
            <div style={{ position:"relative" }}>
              <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",borderRadius:24,padding:32,color:"white" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:"#4ADE80",boxShadow:"0 0 8px #4ADE80" }}/>
                  <span style={{ fontSize:12,color:"#4ADE80",fontWeight:600 }}>VERIFICADO NA BLOCKCHAIN</span>
                </div>
                <h3 style={{ fontSize:18,fontWeight:800,marginBottom:4 }}>Dipirona Sodica 500mg</h3>
                <p style={{ fontSize:12,color:"rgba(255,255,255,.55)",marginBottom:20 }}>GTIN: 07896065012416 | Lote: L2026-001</p>
                {[
                  { step:"01", icon:"🏭", label:"Fabricacao", sub:"Laboratorios Bahia • 15/01/2026", ok:true },
                  { step:"02", icon:"🚛", label:"Transporte", sub:"Temp. media: 4.2°C • Umid: 62%",   ok:true },
                  { step:"03", icon:"🏪", label:"Distribuicao", sub:"Distribuidora Nordeste",            ok:true },
                  { step:"04", icon:"💊", label:"Farmacia",   sub:"Farmacia Popular Salvador",          ok:true },
                ].map((item,i) => (
                  <div key={i} style={{ display:"flex",gap:12,marginBottom:i<3?14:0,alignItems:"flex-start" }}>
                    <div style={{ width:32,height:32,borderRadius:8,background:"rgba(74,222,128,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{item.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:2 }}>
                        <p style={{ fontSize:13,fontWeight:600 }}>{item.label}</p>
                        {item.ok && <span style={{ fontSize:10,color:"#4ADE80",fontWeight:700 }}>✓ OK</span>}
                      </div>
                      <p style={{ fontSize:11,color:"rgba(255,255,255,.45)" }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:20,padding:"12px 16px",background:"rgba(74,222,128,.1)",borderRadius:10,border:"1px solid rgba(74,222,128,.25)",display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>📍</span>
                  <div>
                    <p style={{ fontSize:12,fontWeight:600,color:"#4ADE80" }}>Leitura realizada em Salvador, BA</p>
                    <p style={{ fontSize:10,color:"rgba(255,255,255,.4)" }}>GPS: -12.9714, -38.5014</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="s" style={{ background:"#DCFCE7" }}>
        <div className="c" style={{ textAlign:"center" }}>
          <span className="tag">Logistica Farmaceutica</span>
          <h2 style={{ fontSize:40,fontWeight:800,color:"#0F2417",letterSpacing:"-1px",marginBottom:16 }}>Cuidamos da sua Logistica</h2>
          <p style={{ color:"#4B6B58",fontSize:16,maxWidth:500,margin:"0 auto 36px",lineHeight:1.8 }}>
            Do registro na fabrica a dispensacao na farmacia — cada etapa rastreada, verificada e registrada permanentemente na blockchain.
          </p>
          <div style={{ display:"flex",gap:14,justifyContent:"center" }}>
            <a href="#login" style={{ display:"inline-block",background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",padding:"14px 36px",borderRadius:13,fontWeight:800,textDecoration:"none",fontSize:15,boxShadow:"0 10px 28px rgba(22,163,74,.3)" }}>
              Acessar o Sistema
            </a>
            <Link to="/track" style={{ display:"inline-block",background:"white",color:"#16A34A",padding:"14px 36px",borderRadius:13,fontWeight:800,textDecoration:"none",fontSize:15,border:"1px solid rgba(22,163,74,.25)" }}>
              Rastrear Medicamento
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#020F07",padding:"36px 24px" }}>
        <div className="c">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <Logo3D size={30}/>
              <span style={{ color:"white",fontWeight:700,fontSize:14 }}>PharmaChain</span>
            </div>
            <p style={{ color:"#4B6B58",fontSize:12 }}>Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.</p>
            <div style={{ display:"flex",gap:20 }}>
              <Link to="/terms"   style={{ color:"#4B6B58",fontSize:12,textDecoration:"none" }}>Termos de Uso</Link>
              <Link to="/privacy" style={{ color:"#4B6B58",fontSize:12,textDecoration:"none" }}>Privacidade</Link>
              <Link to="/contact" style={{ color:"#4B6B58",fontSize:12,textDecoration:"none" }}>Contato</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
"""

# ─────────────────────────────────────────────────────────────────
# TRACK.TSX — pagina publica consumidor com webcam QR real
# ─────────────────────────────────────────────────────────────────
track = r"""import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsQR from "jsqr";
import axios from "axios";

const API = (import.meta.env.VITE_API_URL ?? "/api/v1").replace(/\/$/, "");

interface TrackStep {
  type: string; date: string;
  from: string; to: string;
  qty: number; txHash: string;
  conditions?: { temp?: number; humidity?: number };
}
interface TrackResult {
  productName: string; gtin: string; lot: string;
  status: string; expiryDate: string; manufacturer: string;
  steps: TrackStep[];
}

const STEP_CFG: Record<string,{ label:string; color:string; icon:string }> = {
  MANUFACTURE: { label:"Fabricacao",   color:"#8B5CF6", icon:"🏭" },
  DISTRIBUTE:  { label:"Distribuicao", color:"#3B82F6", icon:"🚛" },
  RECEIVE:     { label:"Recebimento",  color:"#10B981", icon:"🏪" },
  DISPENSE:    { label:"Dispensacao",  color:"#F59E0B", icon:"💊" },
  RETURN:      { label:"Devolucao",    color:"#EF4444", icon:"↩" },
};

// Logo SVG
function Logo3D({ size=36 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <defs>
        <linearGradient id="h1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#16A34A"/></linearGradient>
        <linearGradient id="p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff"/><stop offset="50%" stopColor="#DCFCE7"/><stop offset="100%" stopColor="#86EFAC"/></linearGradient>
        <linearGradient id="p2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#16A34A"/><stop offset="100%" stopColor="#14532D"/></linearGradient>
        <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#14532D" floodOpacity="0.35"/></filter>
      </defs>
      <rect x="8" y="28" width="6" height="18" rx="3" fill="url(#h1)" filter="url(#sh)"/>
      <rect x="16" y="24" width="6" height="22" rx="3" fill="url(#h1)" filter="url(#sh)"/>
      <rect x="24" y="22" width="6" height="24" rx="3" fill="url(#h1)" filter="url(#sh)"/>
      <rect x="32" y="24" width="6" height="22" rx="3" fill="url(#h1)" filter="url(#sh)"/>
      <rect x="8" y="36" width="30" height="10" rx="4" fill="url(#h1)"/>
      <rect x="4" y="30" width="6" height="12" rx="3" fill="#4ADE80" transform="rotate(-15 4 30)"/>
      <ellipse cx="27" cy="16" rx="10" ry="5.5" fill="url(#p1)" filter="url(#sh)" transform="rotate(-20 27 16)"/>
      <path d="M27 16 Q33 10 37 14 Q38 18 33 21 Q29 22 27 16Z" fill="url(#p2)"/>
      <ellipse cx="23" cy="13" rx="3.5" ry="1.5" fill="white" opacity="0.5" transform="rotate(-20 23 13)"/>
    </svg>
  );
}

export default function Track() {
  const [step, setStep]           = useState<"home"|"camera"|"result">("home");
  const [result, setResult]       = useState<TrackResult|null>(null);
  const [gps, setGps]             = useState<{ lat:number; lng:number; acc:number }|null>(null);
  const [camError, setCamError]   = useState("");
  const [detected, setDetected]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [manualGtin, setManual]   = useState("");
  const [torchOn, setTorch]       = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const rafRef    = useRef<number>(0);
  const trackRef  = useRef<any>(null);

  // GPS
  function getGps() {
    navigator.geolocation?.getCurrentPosition(
      p => setGps({ lat:p.coords.latitude, lng:p.coords.longitude, acc:Math.round(p.coords.accuracy) }),
      () => {}, { enableHighAccuracy:true, timeout:10000 }
    );
  }

  // Parar camera
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // Loop QR
  const scanFrame = useCallback(() => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) { rafRef.current = requestAnimationFrame(scanFrame); return; }
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    const img  = ctx.getImageData(0, 0, c.width, c.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts:"dontInvert" });
    if (code?.data) { setDetected(true); stopCamera(); fetchHistory(code.data); }
    else { rafRef.current = requestAnimationFrame(scanFrame); }
  }, [stopCamera]);

  // Iniciar camera
  const startCamera = useCallback(async () => {
    setCamError(""); setDetected(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:"environment", width:{ ideal:1280 }, height:{ ideal:720 } }
      });
      streamRef.current = stream;
      trackRef.current  = stream.getVideoTracks()[0];
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); scanFrame(); }
    } catch { setCamError("Camera nao disponivel. Use o campo manual abaixo."); }
  }, [scanFrame]);

  // Lanterna (se disponivel)
  async function toggleTorch() {
    try {
      const t = trackRef.current;
      if (!t) return;
      await t.applyConstraints({ advanced:[{ torch:!torchOn }] });
      setTorch(v => !v);
    } catch { /* nao suportado */ }
  }

  // Buscar historico
  async function fetchHistory(gtin: string) {
    const clean = gtin.trim(); if (!clean) return;
    setLoading(true);
    getGps();
    try {
      const { data } = await axios.get(API + "/consumer/track/" + encodeURIComponent(clean));
      setResult(data); setStep("result");
    } catch {
      setResult({ productName:"Produto nao encontrado na blockchain", gtin:clean, lot:"-", status:"UNKNOWN", expiryDate:new Date().toISOString(), manufacturer:"Desconhecido", steps:[] });
      setStep("result");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (step === "camera") { setTimeout(startCamera, 300); }
    return () => { if (step !== "camera") stopCamera(); };
  }, [step, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const polyUrl = (h:string) => "https://amoy.polygonscan.com/tx/" + h;
  const mapUrl  = (lat:number, lng:number) => "https://maps.google.com/?q=" + lat + "," + lng;
  const isValid = result?.status === "ACTIVE";

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F0FAF4", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        .scan-corner{position:absolute;width:28px;height:28px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse{animation:pulse 1.5s ease-in-out infinite}
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(240,250,244,.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(22,163,74,.12)",boxShadow:"0 2px 16px rgba(22,163,74,.07)" }}>
        <div style={{ maxWidth:960,margin:"0 auto",padding:"0 20px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <Link to="/login" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
            <Logo3D size={32}/>
            <span style={{ color:"#0F2417",fontWeight:800,fontSize:15 }}>PharmaChain</span>
          </Link>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ background:"#DCFCE7",padding:"4px 12px",borderRadius:20,display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#16A34A" }}/>
              <span style={{ fontSize:11,color:"#14532D",fontWeight:600 }}>Polygon Amoy</span>
            </div>
            <Link to="/login" style={{ background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",padding:"8px 18px",borderRadius:9,fontSize:13,fontWeight:700,textDecoration:"none" }}>
              Acesso Empresarial
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:960,margin:"0 auto",padding:"40px 20px" }}>

        {/* ── HOME ── */}
        {step === "home" && (
          <div>
            {/* Header */}
            <div style={{ textAlign:"center",marginBottom:48 }}>
              <div style={{ width:80,height:80,borderRadius:22,background:"linear-gradient(135deg,#DCFCE7,#BBF7D0)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:"0 12px 32px rgba(22,163,74,.2)" }}>
                <Logo3D size={60}/>
              </div>
              <h1 style={{ fontSize:38,fontWeight:800,color:"#0F2417",letterSpacing:"-1px",marginBottom:12 }}>
                Rastreie seu Medicamento
              </h1>
              <p style={{ color:"#4B6B58",fontSize:16,maxWidth:520,margin:"0 auto",lineHeight:1.8 }}>
                Verifique a autenticidade e todo o historico do seu medicamento na blockchain. Sem cadastro, sem login, totalmente gratuito.
              </p>
            </div>

            {/* Cards de acao */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:680,margin:"0 auto 48px" }}>
              {/* Camera */}
              <button onClick={() => setStep("camera")} style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",borderRadius:20,padding:32,border:"none",cursor:"pointer",textAlign:"left",position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",top:-20,right:-20,fontSize:120,opacity:.06 }}>📷</div>
                <div style={{ fontSize:40,marginBottom:16 }}>📷</div>
                <h3 style={{ fontSize:18,fontWeight:800,color:"white",marginBottom:8 }}>Escanear QR Code</h3>
                <p style={{ fontSize:13,color:"rgba(255,255,255,.6)",lineHeight:1.6 }}>Abra a camera e aponte para o QR Code na embalagem do medicamento</p>
                <div style={{ marginTop:20,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(74,222,128,.2)",padding:"8px 14px",borderRadius:10 }}>
                  <span style={{ color:"#4ADE80",fontSize:13,fontWeight:700 }}>Usar camera</span>
                  <span style={{ color:"#4ADE80" }}>→</span>
                </div>
              </button>

              {/* Manual */}
              <div style={{ background:"white",borderRadius:20,padding:32,border:"1px solid rgba(22,163,74,.15)",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:40,marginBottom:16 }}>⌨️</div>
                  <h3 style={{ fontSize:18,fontWeight:800,color:"#0F2417",marginBottom:8 }}>Digitar Codigo</h3>
                  <p style={{ fontSize:13,color:"#4B6B58",lineHeight:1.6,marginBottom:16 }}>Digite o GTIN ou codigo de barras que esta na embalagem</p>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <input
                    style={{ flex:1,padding:"10px 14px",border:"1.5px solid rgba(22,163,74,.2)",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4",color:"#0F2417" }}
                    placeholder="Ex: 07896065012416"
                    value={manualGtin}
                    onChange={e => setManual(e.target.value)}
                    onKeyDown={e => { if(e.key==="Enter" && manualGtin.trim()) fetchHistory(manualGtin); }}
                  />
                  <button onClick={() => manualGtin.trim() && fetchHistory(manualGtin)}
                    style={{ padding:"10px 16px",background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div style={{ background:"white",borderRadius:20,padding:40,border:"1px solid rgba(22,163,74,.12)",marginBottom:32 }}>
              <h2 style={{ fontSize:22,fontWeight:800,color:"#0F2417",marginBottom:28,textAlign:"center" }}>Como funciona</h2>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24 }}>
                {[
                  { icon:"📦",step:"1",title:"Embalagem",desc:"Cada medicamento sai da fabrica com um QR Code unico vinculado a blockchain" },
                  { icon:"📷",step:"2",title:"Escanear",desc:"Abra esta pagina e escaneie o QR Code com a camera do seu celular" },
                  { icon:"🔍",step:"3",title:"Consultar",desc:"O sistema busca todo o historico na blockchain Polygon em segundos" },
                  { icon:"✅",step:"4",title:"Verificar",desc:"Veja fabricacao, transporte, temperatura e autenticidade do produto" },
                ].map((item,i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ width:56,height:56,borderRadius:16,background:"#F0FAF4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px",border:"1px solid rgba(22,163,74,.12)" }}>
                      {item.icon}
                    </div>
                    <div style={{ width:20,height:20,borderRadius:"50%",background:"#16A34A",color:"white",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px" }}>{item.step}</div>
                    <h4 style={{ fontSize:14,fontWeight:700,color:"#0F2417",marginBottom:6 }}>{item.title}</h4>
                    <p style={{ fontSize:12,color:"#4B6B58",lineHeight:1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantias */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
              {[
                { icon:"🔒",title:"Sem coleta de dados",desc:"Nenhum dado pessoal e coletado ao rastrear um medicamento" },
                { icon:"⚡",title:"Resultado em segundos",desc:"Consulta direta na blockchain Polygon Amoy — resultado instantaneo" },
                { icon:"🆓",title:"Totalmente gratuito",desc:"Servico publico para todos os consumidores, sem cadastro necessario" },
              ].map((item,i) => (
                <div key={i} style={{ background:"#F0FAF4",borderRadius:14,padding:20,border:"1px solid rgba(22,163,74,.12)",display:"flex",gap:12,alignItems:"flex-start" }}>
                  <div style={{ fontSize:24,flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize:13,fontWeight:700,color:"#0F2417",marginBottom:4 }}>{item.title}</p>
                    <p style={{ fontSize:12,color:"#4B6B58",lineHeight:1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CAMERA ── */}
        {step === "camera" && (
          <div style={{ maxWidth:600,margin:"0 auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:24 }}>
              <button onClick={() => { stopCamera(); setStep("home"); }} style={{ width:36,height:36,borderRadius:10,border:"1px solid rgba(22,163,74,.2)",background:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>←</button>
              <div>
                <h2 style={{ fontSize:22,fontWeight:800,color:"#0F2417" }}>Escanear QR Code</h2>
                <p style={{ fontSize:13,color:"#4B6B58" }}>Aponte a camera para o QR Code na embalagem</p>
              </div>
            </div>

            {/* Viewfinder */}
            <div style={{ position:"relative",borderRadius:20,overflow:"hidden",background:"#0F2417",aspectRatio:"4/3",marginBottom:16 }}>
              <video ref={videoRef} playsInline muted style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
              <canvas ref={canvasRef} style={{ display:"none" }}/>

              {/* Cantos de mira */}
              {!camError && !detected && !loading && (
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                  <div style={{ width:220,height:220,position:"relative" }}>
                    {/* TL */}
                    <div className="scan-corner" style={{ top:0,left:0,borderTop:"3px solid #4ADE80",borderLeft:"3px solid #4ADE80",borderRadius:"4px 0 0 0" }}/>
                    {/* TR */}
                    <div className="scan-corner" style={{ top:0,right:0,borderTop:"3px solid #4ADE80",borderRight:"3px solid #4ADE80",borderRadius:"0 4px 0 0" }}/>
                    {/* BL */}
                    <div className="scan-corner" style={{ bottom:0,left:0,borderBottom:"3px solid #4ADE80",borderLeft:"3px solid #4ADE80",borderRadius:"0 0 0 4px" }}/>
                    {/* BR */}
                    <div className="scan-corner" style={{ bottom:0,right:0,borderBottom:"3px solid #4ADE80",borderRight:"3px solid #4ADE80",borderRadius:"0 0 4px 0" }}/>
                    {/* Linha scan */}
                    <div className="pulse" style={{ position:"absolute",top:"50%",left:0,right:0,height:2,background:"rgba(74,222,128,.6)",boxShadow:"0 0 8px #4ADE80" }}/>
                  </div>
                </div>
              )}

              {/* Detectado */}
              {detected && (
                <div style={{ position:"absolute",inset:0,background:"rgba(22,163,74,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12 }}>
                  <div style={{ width:72,height:72,borderRadius:"50%",background:"#16A34A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36 }}>✓</div>
                  <p style={{ color:"white",fontWeight:700,fontSize:16 }}>QR Code detectado!</p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ position:"absolute",inset:0,background:"rgba(15,36,23,.8)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12 }}>
                  <div style={{ width:48,height:48,borderRadius:"50%",border:"3px solid rgba(74,222,128,.2)",borderTop:"3px solid #4ADE80",animation:"spin 1s linear infinite" }}/>
                  <p style={{ color:"white",fontWeight:600 }}>Consultando blockchain...</p>
                </div>
              )}

              {/* Erro camera */}
              {camError && (
                <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center" }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>📷</div>
                  <p style={{ color:"rgba(255,255,255,.7)",fontSize:14 }}>{camError}</p>
                </div>
              )}
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Controles */}
            <div style={{ display:"flex",gap:10,marginBottom:20 }}>
              <button onClick={toggleTorch} style={{ flex:1,padding:"11px",background:"white",border:"1px solid rgba(22,163,74,.2)",borderRadius:11,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:"#0F2417" }}>
                {torchOn ? "🔦 Lanterna Off" : "🔦 Lanterna On"}
              </button>
              <button onClick={() => { stopCamera(); setTimeout(startCamera,200); }} style={{ flex:1,padding:"11px",background:"white",border:"1px solid rgba(22,163,74,.2)",borderRadius:11,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:"#0F2417" }}>
                🔄 Reiniciar Camera
              </button>
            </div>

            {/* GPS status */}
            <div style={{ background:"white",borderRadius:12,padding:"12px 16px",border:"1px solid rgba(22,163,74,.15)",display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
              <span style={{ fontSize:18 }}>📍</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13,fontWeight:600,color: gps?"#16A34A":"#4B6B58" }}>
                  {gps ? "Localizacao capturada" : "Aguardando GPS..."}
                </p>
                {gps && <p style={{ fontSize:11,color:"#4B6B58",fontFamily:"monospace" }}>{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)} (±{gps.acc}m)</p>}
              </div>
              {!gps && <button onClick={getGps} style={{ fontSize:11,background:"#16A34A",color:"white",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer" }}>Ativar GPS</button>}
            </div>

            {/* Manual fallback */}
            <div style={{ borderTop:"1px solid rgba(22,163,74,.12)",paddingTop:16 }}>
              <p style={{ fontSize:12,color:"#4B6B58",marginBottom:8,textAlign:"center" }}>Ou digite o codigo manualmente</p>
              <div style={{ display:"flex",gap:8 }}>
                <input id="mc" style={{ flex:1,padding:"10px 14px",border:"1.5px solid rgba(22,163,74,.2)",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F0FAF4" }}
                  placeholder="GTIN ou codigo de barras"/>
                <button onClick={() => { const v=(document.getElementById("mc") as HTMLInputElement).value; if(v.trim()){ stopCamera(); fetchHistory(v); }}}
                  style={{ padding:"10px 16px",background:"linear-gradient(135deg,#16A34A,#15803D)",color:"white",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {step === "result" && result && (
          <div style={{ maxWidth:700,margin:"0 auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:24 }}>
              <button onClick={() => { setResult(null); setStep("home"); }} style={{ width:36,height:36,borderRadius:10,border:"1px solid rgba(22,163,74,.2)",background:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>←</button>
              <div>
                <h2 style={{ fontSize:22,fontWeight:800,color:"#0F2417" }}>Resultado da Rastreabilidade</h2>
                <p style={{ fontSize:13,color:"#4B6B58" }}>Historico completo na blockchain Polygon Amoy</p>
              </div>
            </div>

            {/* Card principal */}
            <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",borderRadius:20,padding:28,marginBottom:20,color:"white" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                <div style={{ width:10,height:10,borderRadius:"50%",background: isValid?"#4ADE80":"#EF4444",boxShadow: isValid?"0 0 8px #4ADE80":"0 0 8px #EF4444" }}/>
                <span style={{ fontSize:12,color: isValid?"#4ADE80":"#FCA5A5",fontWeight:700 }}>
                  {isValid ? "PRODUTO AUTENTICO — VERIFICADO NA BLOCKCHAIN" : "PRODUTO NAO ENCONTRADO"}
                </span>
              </div>
              <h3 style={{ fontSize:22,fontWeight:800,marginBottom:6 }}>{result.productName}</h3>
              <p style={{ fontSize:13,color:"rgba(255,255,255,.55)",marginBottom:20 }}>
                GTIN: {result.gtin}  |  Lote: {result.lot}  |  Fabricante: {result.manufacturer}
              </p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div style={{ background:"rgba(255,255,255,.08)",borderRadius:12,padding:14 }}>
                  <p style={{ fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:4 }}>VALIDADE</p>
                  <p style={{ fontSize:15,fontWeight:700 }}>
                    {result.expiryDate ? format(new Date(result.expiryDate),"dd/MM/yyyy") : "-"}
                  </p>
                </div>
                <div style={{ background:"rgba(255,255,255,.08)",borderRadius:12,padding:14 }}>
                  <p style={{ fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:4 }}>MOVIMENTACOES</p>
                  <p style={{ fontSize:15,fontWeight:700 }}>{result.steps?.length ?? 0} registros</p>
                </div>
              </div>
            </div>

            {/* GPS */}
            {gps && (
              <div style={{ background:"#F0FAF4",border:"1px solid rgba(22,163,74,.2)",borderRadius:14,padding:16,marginBottom:20,display:"flex",alignItems:"center",gap:12 }}>
                <span style={{ fontSize:24 }}>📍</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13,fontWeight:700,color:"#16A34A" }}>Leitura registrada aqui</p>
                  <p style={{ fontSize:12,fontFamily:"monospace",color:"#4B6B58" }}>{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)} (±{gps.acc}m)</p>
                </div>
                <a href={mapUrl(gps.lat,gps.lng)} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:12,color:"#16A34A",fontWeight:700,textDecoration:"none",background:"#DCFCE7",padding:"7px 14px",borderRadius:9 }}>
                  Ver no mapa
                </a>
              </div>
            )}

            {/* Linha do tempo */}
            <div style={{ background:"white",borderRadius:20,padding:28,border:"1px solid rgba(22,163,74,.12)",marginBottom:20 }}>
              <h4 style={{ fontSize:16,fontWeight:800,color:"#0F2417",marginBottom:24 }}>Jornada Completa do Medicamento</h4>

              {result.steps && result.steps.length > 0 ? (
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute",left:20,top:0,bottom:0,width:2,background:"#DCFCE7" }}/>
                  {result.steps.map((s,i) => {
                    const cfg = STEP_CFG[s.type] ?? { label:s.type, color:"#64748B", icon:"📦" };
                    return (
                      <div key={i} style={{ display:"flex",gap:16,paddingLeft:8,paddingBottom:20 }}>
                        <div style={{ width:24,height:24,borderRadius:"50%",background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,marginTop:4,fontSize:12 }}>
                          {cfg.icon}
                        </div>
                        <div style={{ flex:1,background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:14,padding:16 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                            <span style={{ background:cfg.color+"18",color:cfg.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>
                              {cfg.label}
                            </span>
                            <span style={{ fontSize:11,color:"#94A3B8" }}>
                              {format(new Date(s.date),"dd/MM/yyyy HH:mm",{ locale:ptBR })}
                            </span>
                          </div>
                          <p style={{ fontSize:13,color:"#374151",marginBottom:4 }}>
                            <strong>{s.from}</strong> → <strong>{s.to}</strong>
                          </p>
                          <p style={{ fontSize:12,color:"#94A3B8",marginBottom: s.conditions?8:0 }}>{s.qty} unidades</p>
                          {s.conditions && (
                            <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                              {s.conditions.temp !== undefined && (
                                <span style={{ fontSize:11,color:"#F59E0B",background:"#FFFBEB",padding:"2px 8px",borderRadius:20 }}>🌡️ {s.conditions.temp}°C</span>
                              )}
                              {s.conditions.humidity !== undefined && (
                                <span style={{ fontSize:11,color:"#3B82F6",background:"#EFF6FF",padding:"2px 8px",borderRadius:20 }}>💧 {s.conditions.humidity}%</span>
                              )}
                            </div>
                          )}
                          {s.txHash && (
                            <a href={polyUrl(s.txHash)} target="_blank" rel="noopener noreferrer"
                              style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#3B82F6",textDecoration:"none",background:"#DBEAFE",padding:"3px 8px",borderRadius:6 }}>
                              🔗 {s.txHash.slice(0,10)}...{s.txHash.slice(-6)}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Ponto atual GPS */}
                  {gps && (
                    <div style={{ display:"flex",gap:16,paddingLeft:8 }}>
                      <div style={{ width:24,height:24,borderRadius:"50%",background:"#16A34A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,marginTop:4,fontSize:12,boxShadow:"0 0 0 4px rgba(22,163,74,.2)" }}>
                        📍
                      </div>
                      <div style={{ flex:1,background:"#F0FAF4",border:"1px solid rgba(22,163,74,.2)",borderRadius:14,padding:16 }}>
                        <span style={{ background:"#DCFCE7",color:"#16A34A",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>VOCE ESTA AQUI</span>
                        <p style={{ fontSize:13,color:"#0F2417",marginTop:8,marginBottom:4 }}>Leitura realizada agora neste dispositivo</p>
                        <p style={{ fontSize:11,fontFamily:"monospace",color:"#4B6B58" }}>{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:32,color:"#94A3B8" }}>
                  <div style={{ fontSize:40,marginBottom:8 }}>📦</div>
                  <p>Nenhuma movimentacao registrada para este produto ainda.</p>
                </div>
              )}
            </div>

            {/* Botoes */}
            <div style={{ display:"flex",gap:12 }}>
              <button onClick={() => { setResult(null); setStep("camera"); setDetected(false); }}
                style={{ flex:1,padding:"13px",background:"white",border:"1px solid rgba(22,163,74,.2)",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#0F2417",fontFamily:"inherit" }}>
                Escanear outro
              </button>
              <button onClick={() => { setResult(null); setStep("home"); }}
                style={{ flex:1,padding:"13px",background:"linear-gradient(135deg,#16A34A,#15803D)",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"white",fontFamily:"inherit" }}>
                Voltar ao inicio
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer minimo */}
      <footer style={{ marginTop:60,background:"#020F07",padding:"24px 20px",textAlign:"center" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:8 }}>
          <Logo3D size={24}/>
          <span style={{ color:"white",fontWeight:700,fontSize:13 }}>PharmaChain</span>
        </div>
        <p style={{ color:"#4B6B58",fontSize:12 }}>Servico publico de rastreabilidade farmaceutica · Blockchain Polygon Amoy · 2026</p>
      </footer>
    </div>
  );
}
"""

files = {
    os.path.join(base, "Login.tsx"): login,
    os.path.join(base, "Track.tsx"): track,
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK:", path)

print("\nPronto! Rode: cd ~/pharmachain/frontend && npm run build")
