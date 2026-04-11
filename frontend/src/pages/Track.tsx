import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Camera, Search, X, CheckCircle, AlertTriangle } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

interface TrackStep {
  type: string; date: string; from: string; to: string;
  qty: number; txHash: string;
  conditions?: { temp: number; humidity?: number };
}
interface TrackResult {
  productName: string; gtin: string; lot: string;
  status: string; expiryDate: string; manufacturer: string;
  steps: TrackStep[];
}

const STEP_LABEL: Record<string,string> = {
  DISTRIBUTE:"Distribuição", RECEIVE:"Recebimento",
  DISPENSE:"Dispensação",    RETURN:"Devolução",   MANUFACTURE:"Fabricação"
};
const STEP_ICON: Record<string,string> = {
  MANUFACTURE:"🏭", DISTRIBUTE:"🚚", RECEIVE:"📥", DISPENSE:"💊", RETURN:"↩️"
};
const STEP_COLOR: Record<string,string> = {
  DISTRIBUTE:"#3b82f6", RECEIVE:"#16A34A",
  DISPENSE:"#f59e0b",   RETURN:"#ef4444",  MANUFACTURE:"#8b5cf6"
};

const G   = "#16A34A";
const GL  = "#DCFCE7";
const GD  = "#14532D";
const BG  = "#F0FAF4";
const TX  = "#0F2417";
const TX2 = "#4B6B58";
const BD  = "rgba(22,163,74,0.15)";

export default function Track() {
  const [gtin, setGtin]         = useState("");
  const [tracking, setTracking] = useState(false);
  const [result, setResult]     = useState<TrackResult|null>(null);
  const [error, setError]       = useState("");
  const [camOpen, setCamOpen]   = useState(false);
  const [camErr, setCamErr]     = useState("");
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const scanTimer = useRef<ReturnType<typeof setInterval>|null>(null);

  // Abre câmera
  async function openCamera() {
    setCamErr(""); setCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCamErr("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  }

  function closeCamera() {
    scanTimer.current && clearInterval(scanTimer.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamOpen(false);
  }

  useEffect(() => () => closeCamera(), []);

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault();
    const code = gtin.trim();
    if (!code) return;
    setTracking(true); setResult(null); setError("");
    try {
      const { data } = await axios.get(`${BASE}/consumer/track/${code}`);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Produto não encontrado na blockchain.");
    } finally {
      setTracking(false);
    }
  }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:BG, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .inp { width:100%; padding:14px 18px; border:1.5px solid ${BD}; border-radius:12px;
          font-size:15px; font-family:'Plus Jakarta Sans',sans-serif; outline:none;
          background:white; color:${TX}; transition:border-color .2s,box-shadow .2s; }
        .inp:focus { border-color:${G}; box-shadow:0 0 0 3px rgba(22,163,74,0.1); }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"rgba(240,250,244,0.96)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid " + BD }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 24px",
          height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link to="/login" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            {/* Logo mão mecânica */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#lg)"/>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#16A34A"/>
                  <stop offset="100%" stopColor="#4ADE80"/>
                </linearGradient>
              </defs>
              {/* palma */}
              <rect x="10" y="18" width="16" height="10" rx="3" fill="white" opacity=".95"/>
              {/* dedos */}
              <rect x="11" y="11" width="3" height="9" rx="1.5" fill="white" opacity=".95"/>
              <rect x="15" y="9"  width="3" height="11" rx="1.5" fill="white" opacity=".95"/>
              <rect x="19" y="9"  width="3" height="11" rx="1.5" fill="white" opacity=".95"/>
              <rect x="23" y="11" width="3" height="9"  rx="1.5" fill="white" opacity=".95"/>
              {/* cápsula */}
              <ellipse cx="18" cy="20" rx="4" ry="2" fill="#4ADE80" opacity=".7"/>
            </svg>
            <span style={{ color:TX, fontWeight:800, fontSize:16, letterSpacing:"-0.4px" }}>PharmaChain</span>
          </Link>
          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:6,
            color:GD, fontSize:14, fontWeight:600, textDecoration:"none",
            background:GL, padding:"8px 18px", borderRadius:10 }}>
            <ArrowLeft size={14}/> Voltar ao início
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
        padding:"120px 24px 72px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.25)",
          borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80" }}/>
          <span style={{ color:"#4ADE80", fontSize:13, fontWeight:600 }}>Consulta Pública · Sem Login</span>
        </div>
        <h1 style={{ color:"white", fontSize:52, fontWeight:800,
          letterSpacing:"-1.5px", lineHeight:1.08, marginBottom:16 }}>
          Rastreie seu<br/>
          <span style={{ color:"#4ADE80" }}>Medicamento</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:17, maxWidth:480,
          margin:"0 auto", lineHeight:1.75, fontWeight:400 }}>
          Escaneie o QR Code da embalagem ou digite o código GTIN para ver
          todo o histórico de movimentação registrado na blockchain.
        </p>
      </div>

      {/* BUSCA */}
      <div style={{ maxWidth:640, margin:"-32px auto 0", padding:"0 24px", position:"relative", zIndex:10 }}>
        <div style={{ background:"white", borderRadius:20, padding:32,
          boxShadow:"0 20px 60px rgba(22,163,74,0.12)", border:"1px solid " + BD }}>

          <form onSubmit={handleTrack} style={{ display:"flex", gap:10, marginBottom:16 }}>
            <input className="inp" placeholder="Digite o GTIN da embalagem..."
              value={gtin} onChange={e => { setGtin(e.target.value); setResult(null); setError(""); }}/>
            <button type="submit" disabled={tracking} style={{
              flexShrink:0, padding:"0 22px", height:50,
              background:"linear-gradient(135deg,#16A34A,#15803D)",
              color:"white", border:"none", borderRadius:12,
              fontSize:15, fontWeight:700, cursor: tracking ? "not-allowed" : "pointer",
              fontFamily:"inherit", opacity: tracking ? .7 : 1,
              boxShadow:"0 4px 14px rgba(22,163,74,0.3)"
            }}>
              {tracking ? "Buscando..." : <><Search size={16} style={{ verticalAlign:"middle" }}/></>}
            </button>
          </form>

          <button onClick={openCamera} style={{
            width:"100%", height:48, display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            background:BG, border:"1.5px solid " + BD, borderRadius:12,
            fontSize:15, fontWeight:600, color:GD, cursor:"pointer", fontFamily:"inherit"
          }}>
            <Camera size={18} color={G}/> Abrir câmera para escanear QR Code
          </button>

          <p style={{ textAlign:"center", fontSize:13, color:"#94a3b8", marginTop:14 }}>
            O GTIN de 14 dígitos está impresso na embalagem ou no QR Code
          </p>
        </div>
      </div>

      {/* MODAL CÂMERA */}
      {camOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"white", borderRadius:24, padding:32,
            width:"100%", maxWidth:480, boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:20, fontWeight:700, color:TX, letterSpacing:"-0.3px" }}>Escanear QR Code</h3>
                <p style={{ fontSize:14, color:TX2, marginTop:4 }}>Aponte a câmera para o código da embalagem</p>
              </div>
              <button onClick={closeCamera} style={{ width:36, height:36, borderRadius:10,
                background:BG, border:"none", cursor:"pointer", display:"flex",
                alignItems:"center", justifyContent:"center" }}>
                <X size={16} color={TX2}/>
              </button>
            </div>

            {camErr ? (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
                borderRadius:14, padding:20, textAlign:"center" }}>
                <AlertTriangle size={32} color="#ef4444" style={{ margin:"0 auto 12px", display:"block" }}/>
                <p style={{ fontSize:14, color:"#b91c1c", lineHeight:1.6 }}>{camErr}</p>
              </div>
            ) : (
              <div style={{ position:"relative", borderRadius:16, overflow:"hidden",
                background:"#000", aspectRatio:"4/3" }}>
                <video ref={videoRef} autoPlay playsInline muted
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                {/* Guia de scan */}
                <div style={{ position:"absolute", inset:0, display:"flex",
                  alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                  <div style={{ width:180, height:180, border:"2px solid #4ADE80",
                    borderRadius:16, boxShadow:"0 0 0 9999px rgba(0,0,0,0.4)" }}/>
                </div>
              </div>
            )}

            <div style={{ marginTop:20 }}>
              <p style={{ fontSize:13, color:TX2, marginBottom:12, textAlign:"center" }}>
                Ou digite o código manualmente:
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <input className="inp" placeholder="GTIN / código de barras"
                  value={gtin} onChange={e => setGtin(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { closeCamera(); handleTrack(); } }}
                  style={{ fontSize:14 }}/>
                <button onClick={() => { closeCamera(); handleTrack(); }} style={{
                  flexShrink:0, padding:"0 18px", height:48,
                  background:"linear-gradient(135deg,#16A34A,#15803D)",
                  color:"white", border:"none", borderRadius:12,
                  fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit"
                }}>Buscar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERRO */}
      {error && (
        <div style={{ maxWidth:640, margin:"32px auto 0", padding:"0 24px" }}>
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
            borderRadius:16, padding:"18px 24px",
            display:"flex", alignItems:"center", gap:14 }}>
            <AlertTriangle size={22} color="#ef4444" style={{ flexShrink:0 }}/>
            <p style={{ fontSize:15, color:"#b91c1c" }}>{error}</p>
          </div>
        </div>
      )}

      {/* RESULTADO */}
      {result && (
        <div style={{ maxWidth:640, margin:"32px auto 0", padding:"0 24px" }}>

          {/* Card produto */}
          <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
            borderRadius:20, padding:"28px 32px", marginBottom:16, color:"white" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
              <CheckCircle size={16} color="#4ADE80"/>
              <span style={{ fontSize:12, color:"#4ADE80", fontWeight:700, letterSpacing:"0.8px" }}>
                VERIFICADO NA BLOCKCHAIN
              </span>
            </div>
            <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px", marginBottom:12 }}>
              {result.productName}
            </h2>
            <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
              {[
                { label:"GTIN",       value:result.gtin },
                { label:"Lote",       value:result.lot },
                { label:"Fabricante", value:result.manufacturer },
                { label:"Validade",   value:new Date(result.expiryDate).toLocaleDateString("pt-BR") },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontWeight:600,
                    letterSpacing:"0.5px", marginBottom:2 }}>{item.label}</p>
                  <p style={{ fontSize:14, color:"white", fontWeight:600 }}>{item.value}</p>
                </div>
              ))}
              <div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontWeight:600,
                  letterSpacing:"0.5px", marginBottom:2 }}>STATUS</p>
                <span style={{ fontSize:13, fontWeight:700, padding:"3px 12px", borderRadius:20,
                  background: result.status === "ACTIVE" ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)",
                  color: result.status === "ACTIVE" ? "#4ADE80" : "#fca5a5" }}>
                  {result.status === "ACTIVE" ? "✓ Ativo" : result.status === "RECALLED" ? "⚠ Recall" : result.status}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background:"white", borderRadius:20, border:"1px solid " + BD,
            overflow:"hidden", marginBottom:48 }}>
            <div style={{ padding:"20px 28px", borderBottom:"1px solid " + BD, background:BG }}>
              <h3 style={{ fontSize:17, fontWeight:700, color:TX, letterSpacing:"-0.2px" }}>
                Histórico de Movimentação
                <span style={{ fontSize:14, fontWeight:500, color:TX2, marginLeft:8 }}>
                  — {result.steps.length} registro(s)
                </span>
              </h3>
            </div>
            {result.steps.length === 0 ? (
              <div style={{ padding:40, textAlign:"center", color:TX2, fontSize:15 }}>
                Nenhuma movimentação registrada ainda.
              </div>
            ) : result.steps.map((step, i) => (
              <div key={i} style={{ display:"flex", gap:20, padding:"20px 28px",
                borderBottom: i < result.steps.length - 1 ? "1px solid #f1f5f9" : "none",
                alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:40, height:40, borderRadius:12,
                    background:(STEP_COLOR[step.type]??"#64748b")+"18",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {STEP_ICON[step.type] ?? "📦"}
                  </div>
                  {i < result.steps.length - 1 && (
                    <div style={{ width:2, height:20, background:"#e2e8f0", borderRadius:1 }}/>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:20,
                      background:(STEP_COLOR[step.type]??"#64748b")+"18",
                      color:STEP_COLOR[step.type]??"#64748b" }}>
                      {STEP_LABEL[step.type]??step.type}
                    </span>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>
                      {new Date(step.date).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p style={{ fontSize:15, color:TX, fontWeight:500, marginBottom:4 }}>
                    <strong>{step.from}</strong>
                    <span style={{ color:TX2, margin:"0 6px" }}>→</span>
                    <strong>{step.to}</strong>
                  </p>
                  <p style={{ fontSize:13, color:TX2 }}>
                    {step.qty} unidades
                    {step.conditions && ` · ${step.conditions.temp}°C`}
                    {step.conditions?.humidity && ` · ${step.conditions.humidity}% umidade`}
                  </p>
                  {step.txHash && (
                    <a href={`https://amoy.polygonscan.com/tx/${step.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:12, color:G, textDecoration:"none",
                        display:"inline-flex", alignItems:"center", gap:4, marginTop:6,
                        background:GL, padding:"3px 10px", borderRadius:8, fontWeight:600 }}>
                      🔗 {step.txHash.slice(0,10)}...{step.txHash.slice(-6)}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TÓPICOS — como funciona */}
      {!result && !error && (
        <div style={{ maxWidth:960, margin:"64px auto 80px", padding:"0 24px" }}>
          <h2 style={{ fontSize:34, fontWeight:800, color:TX, letterSpacing:"-0.8px",
            marginBottom:8, textAlign:"center" }}>Como funciona</h2>
          <p style={{ fontSize:17, color:TX2, textAlign:"center", marginBottom:48, fontWeight:400 }}>
            Três passos para verificar a autenticidade do seu medicamento.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {[
              { step:"01", icon:"📦", title:"Localize o código",
                desc:"Encontre o QR Code ou código GTIN na embalagem do medicamento. Geralmente está na parte traseira ou lateral da caixa." },
              { step:"02", icon:"📷", title:"Escaneie ou digite",
                desc:"Use a câmera do celular para escanear o QR Code automaticamente, ou digite os 14 dígitos do GTIN no campo acima." },
              { step:"03", icon:"✅", title:"Veja o histórico completo",
                desc:"Consulte cada etapa percorrida pelo medicamento: fabricação, distribuição, recebimento e dispensação em farmácia." },
            ].map((item, i) => (
              <div key={i} style={{ background:"white", borderRadius:18, padding:"28px 24px",
                border:"1px solid " + BD, boxShadow:"0 2px 12px rgba(22,163,74,0.04)" }}>
                <div style={{ fontSize:32, marginBottom:16 }}>{item.icon}</div>
                <p style={{ fontSize:11, fontWeight:700, color:G, letterSpacing:"1px",
                  marginBottom:8 }}>PASSO {item.step}</p>
                <h3 style={{ fontSize:19, fontWeight:700, color:TX,
                  letterSpacing:"-0.3px", marginBottom:10 }}>{item.title}</h3>
                <p style={{ fontSize:15, color:TX2, lineHeight:1.75, fontWeight:400 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Por que confiar */}
          <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
            borderRadius:20, padding:"36px 40px", marginTop:32, color:"white" }}>
            <h3 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.5px", marginBottom:20 }}>
              Por que você pode confiar?
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[
                { icon:"🔗", title:"Blockchain imutável",    desc:"Cada registro é permanente e à prova de adulteração na rede Polygon." },
                { icon:"🔒", title:"Sem login necessário",   desc:"A consulta pública é aberta a qualquer consumidor, sem cadastro." },
                { icon:"🏥", title:"Conformidade ANVISA",    desc:"Rastreabilidade segundo a RDC 204/2017 para medicamentos no Brasil." },
                { icon:"⚡", title:"Resultado instantâneo",  desc:"A consulta retorna em menos de 2 segundos diretamente da blockchain." },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                    background:"rgba(74,222,128,0.15)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{item.title}</p>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer style={{ background:"#020F07", padding:"24px", textAlign:"center" }}>
        <p style={{ color:"#4B6B58", fontSize:13, fontWeight:400 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados.
          Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
