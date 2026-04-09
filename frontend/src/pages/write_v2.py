import os

base_pages = os.path.expanduser("~/pharmachain/frontend/src/pages")
base_routes = os.path.expanduser("~/pharmachain/backend/src/api/routes")
base_app    = os.path.expanduser("~/pharmachain/backend/src/application")

files = {}

# ─────────────────────────────────────────────────────────────────
# 1. FRONTEND — Login.tsx com aba consumidor
# ─────────────────────────────────────────────────────────────────
files[os.path.join(base_pages, "Login.tsx")] = """import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { Camera, QrCode, X, CheckCircle, MapPin, Truck, Package, Building2, Wifi, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsQR from "jsqr";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface TrackStep {
  type: string; date: string; from: string; to: string;
  qty: number; txHash: string; conditions?: { temp?: number; humidity?: number };
}
interface TrackResult {
  productName: string; gtin: string; lot: string;
  status: string; expiryDate: string; manufacturer: string;
  steps: TrackStep[];
  dispensedTo?: string; // CPF hash parcial para confirmação
}

const STEP_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  MANUFACTURE: { label: "Fabricação",    color: "#8b5cf6", icon: Package   },
  DISTRIBUTE:  { label: "Distribuição",  color: "#3b82f6", icon: Truck     },
  RECEIVE:     { label: "Recebimento",   color: "#10b981", icon: Building2 },
  DISPENSE:    { label: "Dispensação",   color: "#f59e0b", icon: CheckCircle },
  RETURN:      { label: "Devolução",     color: "#ef4444", icon: Package   },
};

export default function Login() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [cnpj, setCnpj]         = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [activeTab, setTab]     = useState<"empresa"|"consumidor">("empresa");
  const navigate = useNavigate();
  const login    = useAuthStore(s => s.login);

  // ── Consumer tracking ─────────────────────────────────────────────────────
  const [showScanner, setScanner]   = useState(false);
  const [scanStep, setScanStep]     = useState<"camera"|"result">("camera");
  const [trackResult, setTrack]     = useState<TrackResult|null>(null);
  const [gps, setGps]               = useState<{ lat:number; lng:number }|null>(null);
  const [scanning, setScanning]     = useState(false);
  const [detected, setDetected]     = useState(false);
  const [camError, setCamError]     = useState("");
  const [cpfInput, setCpfInput]     = useState("");

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const rafRef    = useRef<number>(0);

  // Modal Termos/Privacidade
  const [showModal, setModal]   = useState(false);
  const [modalType, setMType]   = useState<"termos"|"privacidade"|"contato">("termos");

  const modalContent: Record<string, { title: string; body: string }> = {
    termos:      { title:"Termos de Uso",         body:"O uso da plataforma PharmaChain implica na aceitação integral destes termos. Destinada exclusivamente a participantes autorizados da cadeia farmacêutica. Vedado o compartilhamento de credenciais. Todos os registros são imutáveis e rastreáveis. Violações implicam sanções conforme a Lei nº 6.360/76 e RDC ANVISA vigentes." },
    privacidade: { title:"Política de Privacidade", body:"Dados pessoais tratados conforme a LGPD (Lei nº 13.709/2018). CPFs armazenados apenas como hash SHA-256. Não compartilhamos dados sem autorização. O titular pode solicitar acesso, correção ou exclusão via nossos canais." },
    contato:     { title:"Fale Conosco",           body:"suporte@pharmachain.com.br\\n(71) 3000-0000\\nSegunda a Sexta, 8h às 18h\\n\\nCompliance: compliance@pharmachain.com.br\\n\\nAv. Tancredo Neves, 1632 — Salvador, Bahia" },
  };

  // ── GPS ───────────────────────────────────────────────────────────────────
  function getGps() {
    navigator.geolocation?.getCurrentPosition(
      pos => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = useCallback(() => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) { rafRef.current = requestAnimationFrame(scanFrame); return; }
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    const img  = ctx.getImageData(0, 0, c.width, c.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts:"dontInvert" });
    if (code?.data) { setDetected(true); stopCamera(); handleGtinFound(code.data); }
    else { rafRef.current = requestAnimationFrame(scanFrame); }
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCamError(""); setDetected(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:"environment", width:{ ideal:1280 }, height:{ ideal:720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); scanFrame(); }
    } catch { setCamError("Câmera não permitida. Use o campo manual abaixo."); }
  }, [scanFrame]);

  function openScanner() {
    setScanner(true); setScanStep("camera"); setTrack(null); setDetected(false); setGps(null);
    getGps();
    setTimeout(() => startCamera(), 400);
  }
  function closeScanner() { stopCamera(); setScanner(false); }
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Buscar histórico na blockchain ────────────────────────────────────────
  async function handleGtinFound(value: string) {
    const clean = value.trim(); if (!clean) return;
    setScanning(true);
    try {
      const { data } = await api.get("/consumer/track/" + encodeURIComponent(clean));
      setTrack(data); setScanStep("result");
    } catch {
      setTrack({
        productName:"Produto não encontrado na blockchain",
        gtin:clean, lot:"-", status:"UNKNOWN", expiryDate: new Date().toISOString(),
        manufacturer:"Desconhecido", steps:[]
      });
      setScanStep("result");
    } finally { setScanning(false); }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { cnpj, password });
      login(data.token, data.role, data.address, data.participantId);
      navigate("/"); toast.success("Bem-vindo ao PharmaChain");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao autenticar");
    } finally { setLoading(false); }
  }

  const polyUrl = (h: string) => "https://amoy.polygonscan.com/tx/" + h;
  const mapUrl  = (lat: number, lng: number) => "https://maps.google.com/?q=" + lat + "," + lng;

  return (
    <div style={{ fontFamily:"'Sora','DM Sans',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        .nav-btn{color:white;background:none;border:none;font-size:13px;font-weight:500;opacity:.8;cursor:pointer;font-family:'Sora',sans-serif;}
        .nav-btn:hover{opacity:1}
        .section{padding:100px 24px}
        .container{max-width:1100px;margin:0 auto}
        .feature-card{background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;transition:transform .2s,box-shadow .2s}
        .feature-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.08)}
        .tag{display:inline-block;background:#dbeafe;color:#1e40af;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:16px;letter-spacing:.5px;text-transform:uppercase}
        .tab-btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(10,22,40,0.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:32,height:32,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>💊</div>
            <span style={{ color:"white",fontWeight:700,fontSize:16 }}>PharmaChain</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:24 }}>
            {[["termos","Termos de Uso"],["privacidade","Privacidade"],["contato","Contato"]].map(([k,l]) => (
              <button key={k} className="nav-btn" onClick={() => { setMType(k as any); setModal(true); }}>{l}</button>
            ))}
            <a href="#acesso" style={{ background:"#3b82f6",color:"white",padding:"8px 20px",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none" }}>Entrar</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh",background:"linear-gradient(160deg,#0a1628 0%,#0f2552 60%,#1a3a6e 100%)",display:"flex",alignItems:"center",padding:"0 24px",paddingTop:60,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-100,right:-100,width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)",pointerEvents:"none" }} />

        <div style={{ maxWidth:1100,margin:"0 auto",width:"100%",display:"flex",gap:60,alignItems:"center" }}>
          {/* Texto esquerdo */}
          <motion.div initial={{ opacity:0,x:-40 }} animate={{ opacity:1,x:0 }} transition={{ duration:.7 }} style={{ flex:1 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,.15)",border:"1px solid rgba(59,130,246,.3)",borderRadius:20,padding:"6px 16px",marginBottom:24 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#10b981" }} />
              <span style={{ color:"#93c5fd",fontSize:12,fontWeight:500 }}>Rede Blockchain Ativa — Polygon Amoy</span>
            </div>
            <h1 style={{ color:"white",fontSize:52,fontWeight:800,lineHeight:1.1,letterSpacing:"-1.5px",marginBottom:20 }}>
              Rastreabilidade<br /><span style={{ color:"#60a5fa" }}>Farmacêutica</span><br />em Blockchain
            </h1>
            <p style={{ color:"rgba(255,255,255,.65)",fontSize:17,lineHeight:1.7,marginBottom:36,maxWidth:480 }}>
              Controle total da cadeia logística de medicamentos — do fabricante ao paciente — com rastreabilidade imutável, conformidade ANVISA e inteligência em tempo real.
            </p>
            <div style={{ display:"flex",gap:12 }}>
              <a href="#sobre" style={{ background:"#3b82f6",color:"white",padding:"13px 28px",borderRadius:10,fontWeight:600,textDecoration:"none",fontSize:14 }}>Conheça o Projeto</a>
              <button onClick={openScanner} style={{ background:"rgba(255,255,255,.1)",color:"white",padding:"13px 28px",borderRadius:10,fontWeight:600,fontSize:14,border:"1px solid rgba(255,255,255,.15)",cursor:"pointer",fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:8 }}>
                <QrCode size={16} /> Ver Histórico do Meu Medicamento
              </button>
            </div>
          </motion.div>

          {/* Card de login com abas */}
          <motion.div id="acesso" initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:.7,delay:.2 }}
            style={{ width:400,background:"rgba(255,255,255,.97)",borderRadius:20,padding:40,boxShadow:"0 40px 80px rgba(0,0,0,.3)",flexShrink:0 }}>

            <div style={{ textAlign:"center",marginBottom:24 }}>
              <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:22 }}>💊</div>
              <h2 style={{ fontSize:20,fontWeight:700,color:"#1e293b",marginBottom:4 }}>PharmaChain</h2>
            </div>

            {/* Abas */}
            <div style={{ display:"flex",gap:6,background:"#f1f5f9",borderRadius:12,padding:4,marginBottom:24 }}>
              <button className="tab-btn" onClick={() => setTab("empresa")}
                style={{ background:activeTab==="empresa"?"white":"transparent", color:activeTab==="empresa"?"#1e3a8a":"#64748b", boxShadow:activeTab==="empresa"?"0 2px 8px rgba(0,0,0,.08)":"none" }}>
                Empresas
              </button>
              <button className="tab-btn" onClick={() => setTab("consumidor")}
                style={{ background:activeTab==="consumidor"?"white":"transparent", color:activeTab==="consumidor"?"#1e3a8a":"#64748b", boxShadow:activeTab==="consumidor"?"0 2px 8px rgba(0,0,0,.08)":"none" }}>
                Consumidor
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "empresa" ? (
                <motion.div key="empresa" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}>
                  <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6 }}>CNPJ</label>
                      <input style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,outline:"none",fontFamily:"'Sora',sans-serif" }}
                        placeholder="00.000.000/0001-00" value={cnpj} onChange={e => setCnpj(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6 }}>SENHA</label>
                      <input style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,outline:"none",fontFamily:"'Sora',sans-serif" }}
                        type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading}
                      style={{ padding:"12px",background:"linear-gradient(135deg,#0a1628,#1e3a8a)",color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",marginTop:4 }}>
                      {loading ? "Autenticando..." : "Entrar"}
                    </button>
                  </form>
                  <p style={{ textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:16,lineHeight:1.6 }}>
                    Acesso restrito a participantes autorizados da rede PharmaChain
                  </p>
                </motion.div>
              ) : (
                <motion.div key="consumidor" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}>
                  <div style={{ textAlign:"center",marginBottom:20 }}>
                    <p style={{ fontSize:13,color:"#64748b",lineHeight:1.7 }}>
                      Consulte o histórico completo do seu medicamento na blockchain — transporte, armazenamento, distribuição e venda.
                    </p>
                  </div>
                  <button onClick={openScanner}
                    style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#0a1628,#1e3a8a)",color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12 }}>
                    <Camera size={18} /> Escanear QR Code do Medicamento
                  </button>
                  <p style={{ textAlign:"center",fontSize:11,color:"#94a3b8" }}>
                    Aponte a câmera para o QR Code na embalagem
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section id="sobre" className="section" style={{ background:"white" }}>
        <div className="container">
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} style={{ textAlign:"center",marginBottom:64 }}>
            <span className="tag">Sobre o Projeto</span>
            <h2 style={{ fontSize:40,fontWeight:800,color:"#0a1628",letterSpacing:"-1px",marginBottom:16 }}>O que é o PharmaChain?</h2>
            <p style={{ color:"#64748b",fontSize:17,maxWidth:620,margin:"0 auto",lineHeight:1.7 }}>
              Uma plataforma de rastreabilidade farmacêutica baseada em blockchain, garantindo integridade, transparência e conformidade de toda a cadeia logística de medicamentos no Brasil.
            </p>
          </motion.div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24 }}>
            {[
              { icon:"🔗",title:"Blockchain Imutável",desc:"Cada movimentação de lote é registrada permanentemente na rede Polygon, garantindo rastreabilidade total e à prova de adulteração." },
              { icon:"🏥",title:"Conformidade ANVISA",desc:"Atende às exigências da RDC 204/2017 e demais normativas da ANVISA para rastreabilidade de medicamentos no Brasil." },
              { icon:"👤",title:"Transparência ao Paciente",desc:"Consumidores podem verificar todo o histórico do seu medicamento — da fábrica à farmácia — escaneando o QR Code da embalagem." },
            ].map((item,i) => (
              <motion.div key={i} className="feature-card" initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}>
                <div style={{ fontSize:36,marginBottom:16 }}>{item.icon}</div>
                <h3 style={{ fontSize:18,fontWeight:700,color:"#0a1628",marginBottom:10 }}>{item.title}</h3>
                <p style={{ color:"#64748b",fontSize:14,lineHeight:1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="section" style={{ background:"#f1f5f9" }}>
        <div className="container">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center" }}>
            <motion.div initial={{ opacity:0,x:-30 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}>
              <span className="tag">Tecnologia</span>
              <h2 style={{ fontSize:38,fontWeight:800,color:"#0a1628",letterSpacing:"-1px",marginBottom:16,lineHeight:1.15 }}>
                Inteligência Blockchain conectada à Logística Farmacêutica
              </h2>
              <p style={{ color:"#64748b",fontSize:16,lineHeight:1.8,marginBottom:24 }}>
                Cada lote tem um registro único, verificável e permanente. Smart contracts automatizam aprovações, alertas e recalls sem intervenção humana.
              </p>
              {["Contratos inteligentes auditados (OpenZeppelin)","Assinaturas ECDSA em cada transferência","CPF do consumidor protegido por SHA-256 (LGPD)","Rede pública — auditável por qualquer um"].map((item,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <div style={{ width:20,height:20,borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontSize:10,color:"#1e40af" }}>✓</span>
                  </div>
                  <span style={{ fontSize:14,color:"#374151" }}>{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity:0,x:30 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
              style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)",borderRadius:20,padding:40,color:"white" }}>
              <p style={{ fontSize:12,color:"#93c5fd",fontWeight:600,marginBottom:20,letterSpacing:"1px" }}>FLUXO COMPLETO</p>
              {[
                { n:"01",l:"Fabricante registra lote",s:"GTIN-14 + hash SHA-256 na blockchain" },
                { n:"02",l:"Distribuidor recebe",s:"Assinatura ECDSA + NF-e validada" },
                { n:"03",l:"Farmácia confirma",s:"Estoque atualizado em tempo real" },
                { n:"04",l:"Médico emite receita",s:"Criptografada AES-256 + LGPD" },
                { n:"05",l:"Paciente retira",s:"CPF vinculado ao lote na blockchain" },
                { n:"06",l:"Consumidor rastreia",s:"QR Code mostra todo o histórico" },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex",gap:16,marginBottom:i<5?18:0,alignItems:"flex-start" }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:"rgba(59,130,246,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#93c5fd",flexShrink:0 }}>{item.n}</div>
                  <div>
                    <p style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{item.l}</p>
                    <p style={{ fontSize:12,color:"rgba(255,255,255,.5)" }}>{item.s}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section" style={{ background:"white" }}>
        <div className="container" style={{ textAlign:"center" }}>
          <span className="tag">Resultados</span>
          <h2 style={{ fontSize:40,fontWeight:800,color:"#0a1628",letterSpacing:"-1px",marginBottom:48 }}>Impacto mensurável</h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20 }}>
            {[
              { num:"100%",label:"Rastreabilidade de lotes",color:"#3b82f6" },
              { num:"< 2s",label:"Registro na blockchain",color:"#10b981" },
              { num:"0",label:"Ponto central de falha",color:"#f59e0b" },
              { num:"24/7",label:"Disponibilidade da rede",color:"#8b5cf6" },
            ].map((item,i) => (
              <motion.div key={i} initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
                style={{ textAlign:"center",padding:"32px 24px",background:"white",borderRadius:16,border:"1px solid #e2e8f0" }}>
                <p style={{ fontSize:42,fontWeight:800,color:item.color,marginBottom:8 }}>{item.num}</p>
                <p style={{ fontSize:13,color:"#64748b",fontWeight:500 }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)" }}>
        <div className="container" style={{ textAlign:"center" }}>
          <h2 style={{ fontSize:44,fontWeight:800,color:"white",letterSpacing:"-1px",marginBottom:16 }}>Transparência do Início ao Fim</h2>
          <p style={{ color:"rgba(255,255,255,.65)",fontSize:17,maxWidth:520,margin:"0 auto 36px",lineHeight:1.7 }}>
            Do registro do lote na fábrica até as mãos do paciente, cada etapa rastreada, verificada e permanente.
          </p>
          <button onClick={openScanner} style={{ background:"white",color:"#1e40af",padding:"14px 36px",borderRadius:12,fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>
            Ver Histórico do Meu Medicamento
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#020817",padding:"32px 24px" }}>
        <div className="container" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:28,height:28,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>💊</div>
            <span style={{ color:"white",fontWeight:700,fontSize:14 }}>PharmaChain</span>
          </div>
          <p style={{ color:"#475569",fontSize:13 }}>© 2026 PharmaChain · Matheus Augusto Roseira Santana · Salvador, Bahia</p>
          <div style={{ display:"flex",gap:20 }}>
            {[["termos","Termos"],["privacidade","Privacidade"],["contato","Contato"]].map(([k,l]) => (
              <button key={k} className="nav-btn" style={{ color:"#475569",fontSize:12 }} onClick={() => { setMType(k as any); setModal(true); }}>{l}</button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── MODAL SCANNER CONSUMIDOR ── */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
            onClick={e => { if(e.target===e.currentTarget) closeScanner(); }}>
            <motion.div initial={{ scale:.92,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:.92,opacity:0 }}
              style={{ background:"white",borderRadius:24,width:"100%",maxWidth:600,maxHeight:"95vh",overflowY:"auto" }}>

              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 28px 0" }}>
                <div>
                  <h2 style={{ fontSize:20,fontWeight:800,color:"#0a1628" }}>
                    {scanStep==="camera" ? "Escanear Medicamento" : "Histórico na Blockchain"}
                  </h2>
                  <p style={{ fontSize:13,color:"#64748b",marginTop:2 }}>
                    {scanStep==="camera" ? "Aponte a câmera para o QR Code da embalagem" : "Rastreabilidade completa do seu medicamento"}
                  </p>
                </div>
                <button onClick={closeScanner} style={{ background:"#f1f5f9",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding:28 }}>
                {scanStep === "camera" ? (
                  <div>
                    {/* Viewfinder */}
                    <div style={{ position:"relative",borderRadius:16,overflow:"hidden",background:"#0a1628",marginBottom:20,aspectRatio:"4/3" }}>
                      <video ref={videoRef} playsInline muted style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} />
                      <canvas ref={canvasRef} style={{ display:"none" }} />
                      {!camError && !detected && (
                        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                          <div style={{ width:200,height:200,position:"relative" }}>
                            {["tl","tr","bl","br"].map(p => (
                              <div key={p} style={{ position:"absolute",
                                top:p.startsWith("t")?0:"auto", bottom:p.startsWith("b")?0:"auto",
                                left:p.endsWith("l")?0:"auto", right:p.endsWith("r")?0:"auto",
                                width:28,height:28,
                                borderTop:p.startsWith("t")?"3px solid #3b82f6":"none",
                                borderBottom:p.startsWith("b")?"3px solid #3b82f6":"none",
                                borderLeft:p.endsWith("l")?"3px solid #3b82f6":"none",
                                borderRight:p.endsWith("r")?"3px solid #3b82f6":"none",
                              }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {detected && (
                        <div style={{ position:"absolute",inset:0,background:"rgba(16,185,129,.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <CheckCircle size={64} color="white" />
                        </div>
                      )}
                      {camError && (
                        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center" }}>
                          <QrCode size={40} color="#94a3b8" style={{ marginBottom:12 }} />
                          <p style={{ color:"#94a3b8",fontSize:13 }}>{camError}</p>
                        </div>
                      )}
                      {scanning && (
                        <div style={{ position:"absolute",inset:0,background:"rgba(10,22,40,.7)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                          <Wifi size={32} color="#3b82f6" style={{ marginBottom:12 }} />
                          <p style={{ color:"white",fontSize:14,fontWeight:600 }}>Consultando blockchain...</p>
                        </div>
                      )}
                    </div>

                    {/* GPS */}
                    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:gps?"#d1fae5":"#f8fafc",borderRadius:10,marginBottom:16,border:"1px solid "+(gps?"#a7f3d0":"#e2e8f0") }}>
                      <MapPin size={14} color={gps?"#10b981":"#94a3b8"} />
                      <span style={{ fontSize:12,color:gps?"#065f46":"#94a3b8" }}>
                        {gps ? "GPS: "+gps.lat.toFixed(5)+", "+gps.lng.toFixed(5) : "Capturando localização GPS..."}
                      </span>
                    </div>

                    {/* Manual */}
                    <div style={{ borderTop:"1px solid #f1f5f9",paddingTop:16 }}>
                      <p style={{ fontSize:12,color:"#94a3b8",marginBottom:8,textAlign:"center" }}>Ou digite o código do medicamento</p>
                      <div style={{ display:"flex",gap:8 }}>
                        <input id="manual-gtin" style={{ flex:1,padding:"10px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,outline:"none",fontFamily:"monospace" }}
                          placeholder="Ex: 7896123456789" />
                        <button onClick={() => { const v=(document.getElementById("manual-gtin") as HTMLInputElement).value; stopCamera(); handleGtinFound(v); }}
                          style={{ padding:"10px 18px",background:"#0071E3",color:"white",border:"none",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                          Buscar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── RESULTADO ── */
                  <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
                    {trackResult && (
                      <div>
                        {/* Header do medicamento */}
                        <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)",borderRadius:16,padding:24,marginBottom:20,color:"white" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                            <div style={{ width:8,height:8,borderRadius:"50%",background:trackResult.status==="ACTIVE"?"#10b981":"#ef4444" }} />
                            <span style={{ fontSize:11,color:"#93c5fd",fontWeight:700 }}>
                              {trackResult.status==="ACTIVE" ? "ATIVO — PRODUTO AUTENTICO" : trackResult.status}
                            </span>
                          </div>
                          <h3 style={{ fontSize:20,fontWeight:800,marginBottom:4 }}>{trackResult.productName}</h3>
                          <p style={{ fontSize:12,color:"rgba(255,255,255,.6)",marginBottom:16 }}>
                            GTIN: {trackResult.gtin}  |  Lote: {trackResult.lot}  |  Fabricante: {trackResult.manufacturer}
                          </p>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                            <div style={{ background:"rgba(255,255,255,.08)",borderRadius:10,padding:12 }}>
                              <p style={{ fontSize:11,color:"#93c5fd",marginBottom:4 }}>VALIDADE</p>
                              <p style={{ fontSize:14,fontWeight:600 }}>{format(new Date(trackResult.expiryDate),"dd/MM/yyyy")}</p>
                            </div>
                            <div style={{ background:"rgba(255,255,255,.08)",borderRadius:10,padding:12 }}>
                              <p style={{ fontSize:11,color:"#93c5fd",marginBottom:4 }}>MOVIMENTACOES</p>
                              <p style={{ fontSize:14,fontWeight:600 }}>{trackResult.steps?.length ?? 0} registros</p>
                            </div>
                          </div>
                        </div>

                        {/* GPS atual */}
                        {gps && (
                          <div style={{ background:"#f0fdf4",border:"1px solid #a7f3d0",borderRadius:12,padding:14,marginBottom:20,display:"flex",alignItems:"center",gap:12 }}>
                            <MapPin size={18} color="#10b981" />
                            <div style={{ flex:1 }}>
                              <p style={{ fontSize:13,fontWeight:700,color:"#065f46" }}>Você está aqui</p>
                              <p style={{ fontSize:11,fontFamily:"monospace",color:"#047857" }}>{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</p>
                            </div>
                            <a href={mapUrl(gps.lat,gps.lng)} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize:12,color:"#10b981",fontWeight:600,textDecoration:"none",background:"#d1fae5",padding:"6px 12px",borderRadius:8 }}>
                              Ver mapa
                            </a>
                          </div>
                        )}

                        {/* Linha do tempo */}
                        <h4 style={{ fontSize:15,fontWeight:700,color:"#0a1628",marginBottom:16 }}>Jornada Completa do Medicamento</h4>
                        {trackResult.steps && trackResult.steps.length > 0 ? (
                          <div style={{ position:"relative" }}>
                            <div style={{ position:"absolute",left:20,top:0,bottom:0,width:2,background:"#e2e8f0" }} />
                            {trackResult.steps.map((step, i) => {
                              const cfg = STEP_CONFIG[step.type] ?? STEP_CONFIG.MANUFACTURE;
                              const Icon = cfg.icon;
                              return (
                                <motion.div key={i} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.06 }}
                                  style={{ display:"flex",gap:16,paddingLeft:8,paddingBottom:18 }}>
                                  <div style={{ width:24,height:24,borderRadius:"50%",background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,marginTop:4 }}>
                                    <Icon size={13} color="white" />
                                  </div>
                                  <div style={{ flex:1,background:"white",border:"1px solid #e2e8f0",borderRadius:12,padding:14 }}>
                                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                                      <span style={{ background:cfg.color+"18",color:cfg.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>{cfg.label}</span>
                                      <span style={{ fontSize:11,color:"#94a3b8" }}>{format(new Date(step.date),"dd/MM/yyyy HH:mm",{ locale:ptBR })}</span>
                                    </div>
                                    <p style={{ fontSize:13,color:"#374151",marginBottom:4 }}>
                                      <strong>{step.from}</strong> transferiu para <strong>{step.to}</strong>
                                    </p>
                                    <p style={{ fontSize:12,color:"#94a3b8",marginBottom:step.conditions?8:0 }}>{step.qty} unidades</p>
                                    {step.conditions && (
                                      <div style={{ display:"flex",gap:12,marginBottom:8 }}>
                                        {step.conditions.temp !== undefined && (
                                          <span style={{ fontSize:11,color:"#f59e0b",background:"#fffbeb",padding:"2px 8px",borderRadius:20 }}>
                                            🌡 {step.conditions.temp}°C
                                          </span>
                                        )}
                                        {step.conditions.humidity !== undefined && (
                                          <span style={{ fontSize:11,color:"#3b82f6",background:"#eff6ff",padding:"2px 8px",borderRadius:20 }}>
                                            💧 {step.conditions.humidity}%
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {step.txHash && (
                                      <a href={polyUrl(step.txHash)} target="_blank" rel="noopener noreferrer"
                                        style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#3b82f6",textDecoration:"none",background:"#dbeafe",padding:"3px 8px",borderRadius:6 }}>
                                        <ExternalLink size={10} /> {step.txHash.slice(0,10)}...{step.txHash.slice(-6)}
                                      </a>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                            {/* Ponto GPS atual */}
                            {gps && (
                              <div style={{ display:"flex",gap:16,paddingLeft:8 }}>
                                <div style={{ width:24,height:24,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,marginTop:4,boxShadow:"0 0 0 4px rgba(16,185,129,.2)" }}>
                                  <MapPin size={13} color="white" />
                                </div>
                                <div style={{ flex:1,background:"#f0fdf4",border:"1px solid #a7f3d0",borderRadius:12,padding:14 }}>
                                  <span style={{ background:"#d1fae5",color:"#065f46",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>VOCÊ ESTÁ AQUI</span>
                                  <p style={{ fontSize:13,color:"#374151",marginTop:8,marginBottom:4 }}>Leitura realizada agora neste dispositivo</p>
                                  <p style={{ fontSize:11,fontFamily:"monospace",color:"#059669" }}>{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ textAlign:"center",padding:32,color:"#94a3b8",background:"#f8fafc",borderRadius:12 }}>
                            <Package size={32} style={{ margin:"0 auto 8px",display:"block" }} />
                            <p>Nenhuma movimentação registrada para este produto ainda.</p>
                          </div>
                        )}

                        {/* Botoes */}
                        <div style={{ display:"flex",gap:10,marginTop:24 }}>
                          <button onClick={() => { setScanStep("camera"); setTrack(null); setDetected(false); setTimeout(startCamera,200); }}
                            style={{ flex:1,padding:"11px",background:"#f1f5f9",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",color:"#374151" }}>
                            Escanear outro
                          </button>
                          <button onClick={closeScanner}
                            style={{ flex:1,padding:"11px",background:"linear-gradient(135deg,#0a1628,#1e3a8a)",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",color:"white" }}>
                            Fechar
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL TERMOS/ETC ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
            onClick={() => setModal(false)}>
            <motion.div initial={{ scale:.9 }} animate={{ scale:1 }} exit={{ scale:.9 }} onClick={e => e.stopPropagation()}
              style={{ background:"white",borderRadius:20,padding:40,maxWidth:520,width:"100%",maxHeight:"80vh",overflowY:"auto" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:20 }}>
                <h3 style={{ fontSize:20,fontWeight:700,color:"#0a1628" }}>{modalContent[modalType].title}</h3>
                <button onClick={() => setModal(false)} style={{ background:"#f1f5f9",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18 }}>×</button>
              </div>
              <p style={{ color:"#475569",fontSize:14,lineHeight:1.8,whiteSpace:"pre-line" }}>{modalContent[modalType].body}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

# ─────────────────────────────────────────────────────────────────
# 2. FRONTEND — Prescriptions.tsx refeita completamente
# ─────────────────────────────────────────────────────────────────
files[os.path.join(base_pages, "Prescriptions.tsx")] = """import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

interface Rx {
  id: string; dosage: string; quantity: number;
  expiresAt: string; dispensedAt: string|null; createdAt: string;
  patientHash: string; txHash?: string; signature: string;
  doctor: { id:string; name:string; cnpj:string };
  pharmacy: { name:string }|null;
  batch: { id:string; productName:string; gtin:string; lot:string; expiryDate:string };
}

function cpfMask(v: string) {
  return v.replace(/\\D/g,"").slice(0,11)
    .replace(/(\\d{3})(\\d)/,"$1.$2")
    .replace(/(\\d{3})(\\d)/,"$1.$2")
    .replace(/(\\d{3})(\\d{1,2})$/,"$1-$2");
}

function StatusBadge({ rx }: { rx:Rx }) {
  const exp = new Date(rx.expiresAt) < new Date();
  if (rx.dispensedAt) return (
    <span style={{ background:"#d1fae5",color:"#065f46",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
      <CheckCircle size={11} /> Dispensada
    </span>
  );
  if (exp) return (
    <span style={{ background:"#fee2e2",color:"#ef4444",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
      <AlertCircle size={11} /> Expirada
    </span>
  );
  return (
    <span style={{ background:"#fef3c7",color:"#92400e",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
      <Clock size={11} /> Pendente
    </span>
  );
}

export default function Prescriptions() {
  const { role } = useAuthStore();
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"ALL"|"PENDING"|"DISPENSED"|"EXPIRED">("ALL");
  const [showForm, setForm]     = useState(false);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [form, setFv] = useState({
    batchId:"", patientCpf:"", dosage:"", quantity:1,
    expiresAt:"", signature:"demo-sig-" + Date.now()
  });
  const qc = useQueryClient();

  const { data: rxList = [], isLoading } = useQuery<Rx[]>({
    queryKey: ["prescriptions"],
    queryFn:  () => api.get("/prescriptions").then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["batches-active"],
    queryFn:  () => api.get("/batches").then(r => r.data.filter((b:any) => b.status==="ACTIVE")),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/prescriptions", {
      ...data,
      patientCpf: data.patientCpf.replace(/\\D/g,""),
      quantity: Number(data.quantity),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["prescriptions"] });
      setForm(false);
      setFv({ batchId:"", patientCpf:"", dosage:"", quantity:1, expiresAt:"", signature:"demo-sig-"+Date.now() });
      toast.success("Receita registrada na blockchain!");
    },
    onError: (e:any) => toast.error(e.response?.data?.error ?? "Erro ao emitir receita"),
  });

  const dispenseMutation = useMutation({
    mutationFn: (id:string) => api.post("/prescriptions/"+id+"/dispense"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["prescriptions"] });
      toast.success("Medicamento dispensado e registrado na blockchain!");
    },
    onError: (e:any) => toast.error(e.response?.data?.error ?? "Erro ao dispensar"),
  });

  const filtered = rxList.filter(rx => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      rx.batch?.productName?.toLowerCase().includes(q) ||
      rx.doctor?.name?.toLowerCase().includes(q);
    const exp = new Date(rx.expiresAt) < new Date();
    const matchFilter =
      filter==="ALL" ? true :
      filter==="PENDING"   ? !rx.dispensedAt && !exp :
      filter==="DISPENSED" ? !!rx.dispensedAt :
      filter==="EXPIRED"   ? exp && !rx.dispensedAt : true;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL:      rxList.length,
    PENDING:  rxList.filter(r => !r.dispensedAt && new Date(r.expiresAt)>new Date()).length,
    DISPENSED:rxList.filter(r => !!r.dispensedAt).length,
    EXPIRED:  rxList.filter(r => !r.dispensedAt && new Date(r.expiresAt)<new Date()).length,
  };

  return (
    <div style={{ maxWidth:1100 }}>

      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28,fontWeight:800,marginBottom:6 }}>Receitas Médicas</h1>
          <p style={{ color:"var(--text2)",fontSize:15 }}>Prescrições digitais assinadas e registradas na blockchain</p>
        </div>
        {role==="DOCTOR" && (
          <button onClick={() => setForm(true)} style={{ display:"flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#0a1628,#1e3a8a)",color:"white",border:"none",borderRadius:12,padding:"11px 20px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
            <Plus size={16} /> Nova Receita
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
        {[
          { key:"ALL",      label:"Total",       color:"#3b82f6", bg:"#eff6ff" },
          { key:"PENDING",  label:"Pendentes",   color:"#f59e0b", bg:"#fffbeb" },
          { key:"DISPENSED",label:"Dispensadas", color:"#10b981", bg:"#f0fdf4" },
          { key:"EXPIRED",  label:"Expiradas",   color:"#ef4444", bg:"#fef2f2" },
        ].map(item => (
          <button key={item.key} onClick={() => setFilter(item.key as any)}
            style={{ background:filter===item.key?item.bg:"white", border:"1.5px solid "+(filter===item.key?item.color:"#e2e8f0"),
              borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",transition:"all .2s" }}>
            <p style={{ fontSize:24,fontWeight:800,color:item.color,marginBottom:2 }}>{(counts as any)[item.key]}</p>
            <p style={{ fontSize:12,color:"#64748b",fontWeight:500 }}>{item.label}</p>
          </button>
        ))}
      </div>

      {/* Busca */}
      <div style={{ position:"relative",marginBottom:20 }}>
        <Search size={14} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8" }} />
        <input style={{ width:"100%",padding:"10px 14px 10px 36px",border:"1.5px solid #e2e8f0",borderRadius:12,fontSize:13,outline:"none",fontFamily:"inherit",background:"white" }}
          placeholder="Buscar por produto ou médico..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Lista */}
      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {isLoading ? (
          <div style={{ textAlign:"center",padding:48,color:"#94a3b8" }}>Carregando receitas da blockchain...</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:48,color:"#94a3b8",background:"white",borderRadius:16,border:"1px solid #e2e8f0" }}>
            <FileText size={32} style={{ margin:"0 auto 8px",display:"block" }} />
            Nenhuma receita encontrada.
          </div>
        ) : filtered.map(rx => (
          <motion.div key={rx.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
            style={{ background:"white",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden" }}>

            {/* Linha principal */}
            <div style={{ display:"flex",alignItems:"center",gap:16,padding:18,cursor:"pointer" }}
              onClick={() => setExpanded(expanded===rx.id ? null : rx.id)}>
              <div style={{ width:42,height:42,borderRadius:11,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <FileText size={19} color="#3b82f6" />
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
                  <p style={{ fontWeight:700,fontSize:15,color:"#0a1628",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{rx.batch?.productName}</p>
                  <StatusBadge rx={rx} />
                </div>
                <p style={{ fontSize:13,color:"#64748b" }}>
                  {rx.doctor?.name}  |  {rx.dosage}  |  {rx.quantity} un.
                </p>
                <p style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>
                  Emitida {format(new Date(rx.createdAt),"dd/MM/yyyy",{ locale:ptBR })}  ·
                  Válida até {format(new Date(rx.expiresAt),"dd/MM/yyyy",{ locale:ptBR })}
                </p>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
                {role==="PHARMACY" && !rx.dispensedAt && new Date(rx.expiresAt)>new Date() && (
                  <button onClick={e => { e.stopPropagation(); dispenseMutation.mutate(rx.id); }}
                    disabled={dispenseMutation.isPending}
                    style={{ padding:"8px 16px",background:"#10b981",color:"white",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                    {dispenseMutation.isPending ? "..." : "Dispensar"}
                  </button>
                )}
                {expanded===rx.id ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
              </div>
            </div>

            {/* Detalhe expandido */}
            <AnimatePresence>
              {expanded===rx.id && (
                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }}
                  style={{ borderTop:"1px solid #f1f5f9",overflow:"hidden" }}>
                  <div style={{ padding:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                    <div>
                      <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:".5px" }}>MEDICAMENTO</p>
                      <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>GTIN:</strong> {rx.batch?.gtin}</p>
                      <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>Lote:</strong> {rx.batch?.lot}</p>
                      <p style={{ fontSize:13,color:"#374151" }}><strong>Validade lote:</strong> {rx.batch?.expiryDate ? format(new Date(rx.batch.expiryDate),"dd/MM/yyyy") : "-"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:".5px" }}>PACIENTE</p>
                      <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>Hash CPF:</strong></p>
                      <p style={{ fontSize:11,fontFamily:"monospace",color:"#64748b",wordBreak:"break-all" }}>{rx.patientHash}</p>
                      <p style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>CPF protegido por SHA-256 (LGPD)</p>
                    </div>
                    {rx.dispensedAt && rx.pharmacy && (
                      <div style={{ gridColumn:"1/-1" }}>
                        <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:8,letterSpacing:".5px" }}>DISPENSAÇÃO</p>
                        <p style={{ fontSize:13,color:"#374151",marginBottom:2 }}><strong>Farmácia:</strong> {rx.pharmacy.name}</p>
                        <p style={{ fontSize:13,color:"#374151" }}><strong>Data:</strong> {format(new Date(rx.dispensedAt),"dd/MM/yyyy HH:mm",{ locale:ptBR })}</p>
                      </div>
                    )}
                    {rx.txHash && (
                      <div style={{ gridColumn:"1/-1",paddingTop:12,borderTop:"1px solid #f1f5f9" }}>
                        <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:6,letterSpacing:".5px" }}>REGISTRO BLOCKCHAIN</p>
                        <a href={"https://amoy.polygonscan.com/tx/"+rx.txHash} target="_blank" rel="noopener noreferrer"
                          style={{ display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"#3b82f6",textDecoration:"none",background:"#dbeafe",padding:"5px 12px",borderRadius:8 }}>
                          <ExternalLink size={12} /> {rx.txHash.slice(0,16)}...{rx.txHash.slice(-8)}
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Modal nova receita */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
            onClick={e => { if(e.target===e.currentTarget) setForm(false); }}>
            <motion.div initial={{ scale:.92,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:.92,opacity:0 }}
              style={{ background:"white",borderRadius:20,padding:36,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto" }}>

              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                <div>
                  <h2 style={{ fontSize:20,fontWeight:800,color:"#0a1628" }}>Nova Receita Médica</h2>
                  <p style={{ fontSize:13,color:"#64748b",marginTop:2 }}>Será registrada na blockchain imediatamente</p>
                </div>
                <button onClick={() => setForm(false)} style={{ background:"#f1f5f9",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

                {/* Medicamento */}
                <div>
                  <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6,letterSpacing:".3px" }}>MEDICAMENTO / LOTE</label>
                  <select style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit",background:"white" }}
                    value={form.batchId} onChange={e => setFv(p => ({ ...p, batchId:e.target.value }))}>
                    <option value="">Selecione o lote...</option>
                    {(batches as any[]).map((b:any) => (
                      <option key={b.id} value={b.id}>{b.productName} — Lote {b.lot} ({b.quantity} un.)</option>
                    ))}
                  </select>
                </div>

                {/* CPF */}
                <div>
                  <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6,letterSpacing:".3px" }}>CPF DO PACIENTE</label>
                  <input style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit" }}
                    placeholder="000.000.000-00"
                    value={form.patientCpf}
                    onChange={e => setFv(p => ({ ...p, patientCpf: cpfMask(e.target.value) }))} />
                  <p style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>Armazenado como hash SHA-256 — protegido pela LGPD</p>
                </div>

                {/* Posologia */}
                <div>
                  <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6,letterSpacing:".3px" }}>POSOLOGIA</label>
                  <input style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit" }}
                    placeholder="Ex: 1 comprimido a cada 8h por 5 dias"
                    value={form.dosage} onChange={e => setFv(p => ({ ...p, dosage:e.target.value }))} />
                </div>

                {/* Quantidade + Validade */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <div>
                    <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6,letterSpacing:".3px" }}>QUANTIDADE</label>
                    <input type="number" min={1} style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit" }}
                      value={form.quantity} onChange={e => setFv(p => ({ ...p, quantity:Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6,letterSpacing:".3px" }}>VALIDADE DA RECEITA</label>
                    <input type="date" style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",fontFamily:"inherit" }}
                      value={form.expiresAt.slice(0,10)}
                      onChange={e => setFv(p => ({ ...p, expiresAt:e.target.value+"T23:59:00.000Z" }))} />
                  </div>
                </div>

                {/* Info LGPD */}
                <div style={{ background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:14 }}>
                  <p style={{ fontSize:12,color:"#1e40af",lineHeight:1.6 }}>
                    O CPF do paciente será convertido em hash SHA-256 antes de qualquer armazenamento, garantindo conformidade com a LGPD. O dado original não é persistido no sistema.
                  </p>
                </div>

                <button disabled={createMutation.isPending || !form.batchId || !form.patientCpf || !form.dosage}
                  onClick={() => createMutation.mutate(form)}
                  style={{ padding:"13px",background:!form.batchId||!form.patientCpf||!form.dosage?"#94a3b8":"linear-gradient(135deg,#0a1628,#1e3a8a)",color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:!form.batchId||!form.patientCpf||!form.dosage?"not-allowed":"pointer",fontFamily:"inherit" }}>
                  {createMutation.isPending ? "Registrando na blockchain..." : "Emitir Receita"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

# ─────────────────────────────────────────────────────────────────
# 3. BACKEND — consumer.routes.ts (público, sem auth)
# ─────────────────────────────────────────────────────────────────
files[os.path.join(base_routes, "consumer.routes.ts")] = """import { Router, Request, Response } from "express";
import { prisma } from "../../storage/prisma";

export const consumerRouter = Router();

// GET /api/v1/consumer/track/:gtin — público, sem autenticação
// Retorna histórico completo de um medicamento pelo GTIN ou ID do lote
consumerRouter.get("/track/:gtin", async (req: Request, res: Response) => {
  const { gtin } = req.params;

  try {
    // Busca por GTIN ou por ID do lote
    const batch = await prisma.drugBatch.findFirst({
      where: {
        OR: [
          { gtin: gtin },
          { id: gtin },
        ]
      },
      include: {
        manufacturer: { select: { name: true, cnpj: true } },
        transfers: {
          orderBy: { createdAt: "asc" },
          include: {
            from: { select: { name: true, role: true } },
            to:   { select: { name: true, role: true } },
          }
        },
        tempLogs: {
          orderBy: { timestamp: "asc" },
        }
      }
    });

    if (!batch) {
      res.status(404).json({ error: "Produto nao encontrado na blockchain" });
      return;
    }

    // Montar linha do tempo com condições de temperatura por etapa
    const steps = batch.transfers.map(t => {
      // Achar logs de temperatura próximos à data desta transferência
      const relevantLogs = batch.tempLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const txTime  = new Date(t.createdAt).getTime();
        return Math.abs(logTime - txTime) < 24 * 60 * 60 * 1000; // dentro de 24h
      });

      const avgTemp = relevantLogs.length > 0
        ? relevantLogs.reduce((sum, l) => sum + l.temperature, 0) / relevantLogs.length
        : undefined;
      const avgHumidity = relevantLogs.length > 0 && relevantLogs[0].humidity
        ? relevantLogs.reduce((sum, l) => sum + (l.humidity ?? 0), 0) / relevantLogs.length
        : undefined;

      return {
        type:      t.type,
        date:      t.createdAt,
        from:      t.from?.name ?? "Desconhecido",
        to:        t.to?.name   ?? "Desconhecido",
        qty:       t.quantity,
        txHash:    t.txHash ?? "",
        conditions: avgTemp !== undefined ? {
          temp:     Math.round(avgTemp * 10) / 10,
          humidity: avgHumidity ? Math.round(avgHumidity) : undefined,
        } : undefined,
      };
    });

    res.json({
      productName:  batch.productName,
      gtin:         batch.gtin,
      lot:          batch.lot,
      status:       batch.status,
      expiryDate:   batch.expiryDate,
      manufacturer: batch.manufacturer?.name ?? "Desconhecido",
      steps,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
"""

# ─────────────────────────────────────────────────────────────────
# 4. BACKEND — prescription.routes.ts — adicionar GET /prescriptions
# ─────────────────────────────────────────────────────────────────
files[os.path.join(base_routes, "prescription.routes.ts")] = """import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middlewares/auth";
import { prescriptionService }        from "../../application/PrescriptionService";
import { prisma }                     from "../../storage/prisma";

export const prescriptionRouter = Router();

// GET /api/v1/prescriptions — listar receitas (filtrado por role)
prescriptionRouter.get("/", authenticate, async (req: Request, res: Response) => {
  const { participantId, role } = req.participant!;

  const where: any = {};
  if (role === "DOCTOR")   where.doctorId  = participantId;
  if (role === "PHARMACY") where.pharmacyId = participantId;
  // ADMIN e AUDITOR veem tudo

  const rxList = await prisma.prescription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      doctor:  { select: { name:true, cnpj:true } },
      pharmacy:{ select: { name:true } },
      batch:   { select: { productName:true, gtin:true, lot:true, expiryDate:true } },
    }
  });

  res.json(rxList);
});

// POST /api/v1/prescriptions — Médico emite receita
prescriptionRouter.post("/",
  authenticate,
  requireRole("DOCTOR"),
  async (req: Request, res: Response) => {
    const schema = z.object({
      patientCpf: z.string().min(11).max(11),
      batchId:    z.string().uuid(),
      dosage:     z.string().min(1),
      quantity:   z.number().int().positive(),
      expiresAt:  z.string().datetime(),
      signature:  z.string().min(5),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }
    try {
      const rx = await prescriptionService.issue({
        ...parse.data,
        doctorId: req.participant!.participantId
      });
      res.status(201).json(rx);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

// POST /api/v1/prescriptions/:id/dispense — Farmácia dispensa
prescriptionRouter.post("/:id/dispense",
  authenticate,
  requireRole("PHARMACY"),
  async (req: Request, res: Response) => {
    try {
      const result = await prescriptionService.dispense(
        req.params.id,
        req.participant!.participantId
      );
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);
"""

# ─────────────────────────────────────────────────────────────────
# 5. BACKEND — participants.routes.ts (novo)
# ─────────────────────────────────────────────────────────────────
files[os.path.join(base_routes, "participants.routes.ts")] = """import { Router, Request, Response } from "express";
import { z }           from "zod";
import bcrypt          from "bcryptjs";
import { ethers }      from "ethers";
import { authenticate, requireRole } from "../middlewares/auth";
import { prisma }      from "../../storage/prisma";

export const participantsRouter = Router();

// GET /api/v1/participants
participantsRouter.get("/", authenticate, async (_req: Request, res: Response) => {
  const list = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:true, name:true, cnpj:true, role:true,
      address:true, active:true, createdAt:true
    }
  });
  res.json(list);
});

// POST /api/v1/participants — apenas ADMIN
participantsRouter.post("/",
  authenticate,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    const schema = z.object({
      name:     z.string().min(3),
      cnpj:     z.string().min(14).max(14),
      password: z.string().min(8),
      role:     z.enum(["MANUFACTURER","DISTRIBUTOR","PHARMACY","DOCTOR","AUDITOR","ADMIN"]),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

    const { name, cnpj, password, role } = parse.data;
    const wallet       = ethers.Wallet.createRandom();
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const participant = await prisma.participant.create({
        data: { name, cnpj, role: role as any, address: wallet.address, passwordHash },
        select: { id:true, name:true, cnpj:true, role:true, address:true, createdAt:true }
      });
      res.status(201).json({ ...participant, privateKey: wallet.privateKey });
    } catch (e: any) {
      if (e.code === "P2002") { res.status(409).json({ error: "CNPJ ja cadastrado" }); return; }
      res.status(500).json({ error: e.message });
    }
  }
);
"""

# ─────────────────────────────────────────────────────────────────
# 6. BACKEND — batches.routes.ts — adicionar GET /batches
# ─────────────────────────────────────────────────────────────────
files[os.path.join(base_routes, "batches.list.routes.ts")] = """import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth";
import { prisma }       from "../../storage/prisma";

export const batchesListRouter = Router();

// GET /api/v1/batches — listar todos os lotes
batchesListRouter.get("/", authenticate, async (req: Request, res: Response) => {
  const batches = await prisma.drugBatch.findMany({
    orderBy: { createdAt:"desc" },
    take: 200,
    include: {
      manufacturer: { select: { name:true } }
    }
  });
  res.json(batches);
});

// GET /api/v1/batches/by-gtin/:gtin — para o scanner do Explorer
batchesListRouter.get("/by-gtin/:gtin", authenticate, async (req: Request, res: Response) => {
  const batch = await prisma.drugBatch.findFirst({
    where: { OR: [{ gtin: req.params.gtin }, { id: req.params.gtin }] },
    include: {
      manufacturer: { select: { name:true } },
      transfers: {
        orderBy: { createdAt:"asc" },
        include: {
          from: { select: { name:true } },
          to:   { select: { name:true } },
        }
      }
    }
  });
  if (!batch) { res.status(404).json({ error:"Lote nao encontrado" }); return; }
  res.json(batch);
});
"""

# Escrever todos os arquivos
for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK:", path)

print("\\nTodos os arquivos escritos!")
print("Agora atualize o backend/src/index.ts para registrar as novas rotas.")
