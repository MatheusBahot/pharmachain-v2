import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, QrCode, X, Filter, Camera, CheckCircle, AlertTriangle, Loader } from "lucide-react";
import { api } from "../lib/api";
import axios from "axios";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

const TYPE_LABELS: Record<string,string> = {
  DISTRIBUTE:"Distribuição", RECEIVE:"Recebimento",
  DISPENSE:"Dispensação",    RETURN:"Devolução",   MANUFACTURE:"Fabricação"
};
const TYPE_COLORS: Record<string,string> = {
  DISTRIBUTE:"#3b82f6", RECEIVE:"#16A34A",
  DISPENSE:"#f59e0b",   RETURN:"#ef4444",  MANUFACTURE:"#8b5cf6"
};
const STEP_ICON: Record<string,string> = {
  MANUFACTURE:"🏭", DISTRIBUTE:"🚚", RECEIVE:"📥", DISPENSE:"💊", RETURN:"↩️"
};

interface TrackStep {
  type:string; date:string; from:string; to:string;
  qty:number; txHash:string;
  conditions?: { temp:number; humidity?:number };
}
interface TrackResult {
  productName:string; gtin:string; lot:string;
  status:string; expiryDate:string; manufacturer:string;
  steps:TrackStep[];
}

const G  = "#16A34A";
const GL = "#DCFCE7";
const BG = "#F0FAF4";
const TX = "#0F2417";
const TX2= "#4B6B58";
const BD = "rgba(22,163,74,0.12)";

export default function Explorer() {
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");

  // Scanner
  const [showScanner, setShowScanner] = useState(false);
  const [camActive, setCamActive]     = useState(false);
  const [camErr, setCamErr]           = useState("");
  const [gtinInput, setGtinInput]     = useState("");
  const [tracking, setTracking]       = useState(false);
  const [trackResult, setTrackResult] = useState<TrackResult|null>(null);
  const [trackErr, setTrackErr]       = useState("");

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["explorer"],
    queryFn:  () => api.get("/analytics/transfers?limit=100").then(r => r.data),
    refetchInterval: 8_000,
  });

  async function openCamera() {
    setCamErr(""); setCamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCamErr("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      setCamActive(false);
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamActive(false);
  }

  function closeModal() {
    closeCamera();
    setShowScanner(false);
    setTrackResult(null);
    setTrackErr("");
    setGtinInput("");
    setCamErr("");
  }

  useEffect(() => () => closeCamera(), []);

  async function handleTrack() {
    const code = gtinInput.trim();
    if (!code) return;
    setTracking(true); setTrackResult(null); setTrackErr("");
    closeCamera();
    try {
      const { data } = await axios.get(`${BASE}/consumer/track/${code}`);
      setTrackResult(data);
    } catch (err:any) {
      setTrackErr(err.response?.data?.error ?? "Produto não encontrado na blockchain.");
    } finally {
      setTracking(false);
    }
  }

  const filtered = transfers.filter((t: any) => {
    const matchSearch =
      t.txHash?.includes(search) ||
      t.batch?.productName?.toLowerCase().includes(search.toLowerCase()) ||
      t.from?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.to?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || t.type === typeFilter;
    const matchFrom = !dateFrom || isAfter(new Date(t.createdAt), parseISO(dateFrom));
    const matchTo   = !dateTo   || isBefore(new Date(t.createdAt), parseISO(dateTo + "T23:59:59"));
    return matchSearch && matchType && matchFrom && matchTo;
  });

  return (
    <div style={{ maxWidth:1100 }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, color:TX, marginBottom:6 }}>Blockchain Explorer</h1>
          <p style={{ color:TX2, fontSize:15 }}>Histórico imutável de transações · Polygon Amoy Testnet</p>
        </div>
        <button onClick={() => setShowScanner(true)} style={{
          display:"flex", alignItems:"center", gap:8,
          background:"linear-gradient(135deg,#0F2417,#14532D)",
          color:"white", border:"none", borderRadius:12, padding:"11px 20px",
          fontSize:14, fontWeight:600, cursor:"pointer",
          boxShadow:"0 4px 14px rgba(15,36,23,0.3)"
        }}>
          <QrCode size={16}/> Rastrear Medicamento
        </button>
      </div>

      {/* ── Filtros ── */}
      <div style={{ background:"white", borderRadius:16, padding:20, marginBottom:20,
        border:"1px solid " + BD, display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div style={{ flex:2, minWidth:200 }}>
          <label style={{ fontSize:11, fontWeight:700, color:TX2, display:"block", marginBottom:6 }}>BUSCAR</label>
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
            <input style={{ width:"100%", padding:"9px 12px 9px 32px", border:"1.5px solid rgba(22,163,74,0.15)",
              borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit", background:BG }}
              placeholder="Hash, produto, participante..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div style={{ minWidth:160 }}>
          <label style={{ fontSize:11, fontWeight:700, color:TX2, display:"block", marginBottom:6 }}>TIPO</label>
          <select style={{ width:"100%", padding:"9px 12px", border:"1.5px solid rgba(22,163,74,0.15)",
            borderRadius:10, fontSize:13, outline:"none", background:BG, fontFamily:"inherit" }}
            value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="ALL">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ minWidth:150 }}>
          <label style={{ fontSize:11, fontWeight:700, color:TX2, display:"block", marginBottom:6 }}>DATA INÍCIO</label>
          <input type="date" style={{ width:"100%", padding:"9px 12px", border:"1.5px solid rgba(22,163,74,0.15)",
            borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit", background:BG }}
            value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
        </div>
        <div style={{ minWidth:150 }}>
          <label style={{ fontSize:11, fontWeight:700, color:TX2, display:"block", marginBottom:6 }}>DATA FIM</label>
          <input type="date" style={{ width:"100%", padding:"9px 12px", border:"1.5px solid rgba(22,163,74,0.15)",
            borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit", background:BG }}
            value={dateTo} onChange={e => setDateTo(e.target.value)}/>
        </div>
        {(search || typeFilter !== "ALL" || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(""); setType("ALL"); setDateFrom(""); setDateTo(""); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
              background:"#fee2e2", color:"#ef4444", border:"none", borderRadius:10,
              fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <X size={13}/> Limpar
          </button>
        )}
      </div>

      <div style={{ marginBottom:12, fontSize:13, color:TX2 }}>
        <Filter size={13} style={{ marginRight:6, verticalAlign:"middle" }}/>
        {filtered.length} transação(ões) encontrada(s){transfers.length > 0 && ` de ${transfers.length} total`}
      </div>

      {/* ── Tabela ── */}
      <div style={{ background:"white", borderRadius:16, border:"1px solid " + BD, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:BG }}>
              {["Tx Hash","Produto","Tipo","De → Para","Qtd","Data","Polygonscan"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11,
                  fontWeight:700, color:TX2, letterSpacing:"0.5px",
                  textTransform:"uppercase", borderBottom:"1px solid rgba(22,163,74,0.1)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>
                Sincronizando com blockchain...
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>
                Nenhuma transação encontrada.
              </td></tr>
            ) : filtered.map((t: any) => (
              <tr key={t.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:G }}>
                  {t.txHash ? `${t.txHash.slice(0,8)}...${t.txHash.slice(-6)}` : "pending"}
                </td>
                <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13, color:TX }}>
                  {t.batch?.productName ?? "-"}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ background:(TYPE_COLORS[t.type]??"#64748b")+"20",
                    color:TYPE_COLORS[t.type]??"#64748b",
                    fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>
                    {TYPE_LABELS[t.type] ?? t.type}
                  </span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:TX2 }}>
                  {t.from?.name?.slice(0,16)} → {t.to?.name?.slice(0,16)}
                </td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{t.quantity} un.</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:TX2 }}>
                  {format(new Date(t.createdAt), "dd/MM/yy HH:mm", {locale:ptBR})}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  {t.txHash && (
                    <a href={`https://amoy.polygonscan.com/tx/${t.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11,
                        color:G, textDecoration:"none", background:GL, padding:"3px 8px", borderRadius:6 }}>
                      <ExternalLink size={10}/> Ver
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal Rastreador ── */}
      {showScanner && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background:"white", borderRadius:24, width:"100%", maxWidth:600,
            maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 32px 80px rgba(0,0,0,0.25)" }}>

            {/* Header modal */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"24px 28px", borderBottom:"1px solid " + BD }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:TX, letterSpacing:"-0.3px" }}>
                  Rastrear Medicamento
                </h2>
                <p style={{ fontSize:13, color:TX2, marginTop:3 }}>
                  Escaneie o QR Code ou insira o GTIN manualmente
                </p>
              </div>
              <button onClick={closeModal} style={{ width:36, height:36, borderRadius:10,
                background:BG, border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16} color={TX2}/>
              </button>
            </div>

            <div style={{ padding:"24px 28px" }}>

              {/* Câmera */}
              {!trackResult && (
                <>
                  {camActive ? (
                    <div style={{ marginBottom:20 }}>
                      <div style={{ position:"relative", borderRadius:16, overflow:"hidden",
                        background:"#000", aspectRatio:"4/3" }}>
                        <video ref={videoRef} autoPlay playsInline muted
                          style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        {/* Guia scan */}
                        <div style={{ position:"absolute", inset:0, display:"flex",
                          alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                          <div style={{ width:180, height:180, border:"2.5px solid #4ADE80",
                            borderRadius:16, boxShadow:"0 0 0 9999px rgba(0,0,0,0.45)" }}/>
                        </div>
                        <button onClick={closeCamera} style={{
                          position:"absolute", top:12, right:12,
                          background:"rgba(0,0,0,0.6)", border:"none", borderRadius:8,
                          color:"white", padding:"6px 12px", fontSize:12,
                          cursor:"pointer", fontFamily:"inherit" }}>
                          Fechar câmera
                        </button>
                      </div>
                      <p style={{ textAlign:"center", fontSize:12, color:TX2, marginTop:10 }}>
                        Aponte para o QR Code da embalagem · Ou digite abaixo
                      </p>
                    </div>
                  ) : (
                    <button onClick={openCamera} style={{
                      width:"100%", height:52, display:"flex", alignItems:"center",
                      justifyContent:"center", gap:10, marginBottom:20,
                      background:BG, border:"1.5px solid " + BD, borderRadius:14,
                      fontSize:15, fontWeight:600, color:"#14532D", cursor:"pointer",
                      fontFamily:"inherit"
                    }}>
                      <Camera size={18} color={G}/> Abrir câmera / webcam
                    </button>
                  )}

                  {camErr && (
                    <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
                      borderRadius:12, padding:"12px 16px", marginBottom:16,
                      display:"flex", alignItems:"center", gap:10 }}>
                      <AlertTriangle size={16} color="#ef4444"/>
                      <p style={{ fontSize:13, color:"#b91c1c" }}>{camErr}</p>
                    </div>
                  )}

                  {/* Input GTIN */}
                  <div style={{ display:"flex", gap:10, marginBottom:8 }}>
                    <input
                      style={{ flex:1, padding:"13px 16px", border:"1.5px solid " + BD,
                        borderRadius:12, fontSize:14, outline:"none",
                        fontFamily:"monospace", letterSpacing:"1px",
                        background:BG, color:TX,
                        transition:"border-color .2s" }}
                      placeholder="Digite o GTIN (14 dígitos)..."
                      value={gtinInput}
                      onChange={e => setGtinInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleTrack()}
                    />
                    <button onClick={handleTrack} disabled={tracking || !gtinInput.trim()} style={{
                      flexShrink:0, padding:"0 22px", height:50,
                      background:"linear-gradient(135deg,#16A34A,#15803D)",
                      color:"white", border:"none", borderRadius:12,
                      fontSize:14, fontWeight:700, cursor: tracking ? "not-allowed" : "pointer",
                      fontFamily:"inherit", opacity: tracking || !gtinInput.trim() ? .6 : 1,
                      boxShadow:"0 4px 14px rgba(22,163,74,0.3)"
                    }}>
                      {tracking
                        ? <Loader size={16} style={{ animation:"spin 1s linear infinite" }}/>
                        : "Buscar"}
                    </button>
                  </div>
                  <p style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                    Pressione Enter ou clique em Buscar para consultar a blockchain
                  </p>
                </>
              )}

              {/* Loading */}
              {tracking && (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ width:48, height:48, border:"3px solid " + GL,
                    borderTop:"3px solid " + G, borderRadius:"50%",
                    margin:"0 auto 16px",
                    animation:"spin 0.8s linear infinite" }}/>
                  <p style={{ fontSize:14, color:TX2 }}>Consultando blockchain...</p>
                  <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Erro */}
              {trackErr && (
                <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
                  borderRadius:14, padding:"16px 20px", marginTop:16,
                  display:"flex", alignItems:"center", gap:12 }}>
                  <AlertTriangle size={20} color="#ef4444" style={{ flexShrink:0 }}/>
                  <p style={{ fontSize:14, color:"#b91c1c" }}>{trackErr}</p>
                </div>
              )}

              {/* ── RESULTADO ── */}
              {trackResult && (
                <div>
                  {/* Card produto */}
                  <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
                    borderRadius:16, padding:"22px 24px", marginBottom:20, color:"white" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                      <CheckCircle size={14} color="#4ADE80"/>
                      <span style={{ fontSize:11, color:"#4ADE80", fontWeight:700, letterSpacing:"0.8px" }}>
                        VERIFICADO NA BLOCKCHAIN
                      </span>
                    </div>
                    <h3 style={{ fontSize:20, fontWeight:800, marginBottom:10, letterSpacing:"-0.3px" }}>
                      {trackResult.productName}
                    </h3>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                      {[
                        { label:"GTIN",       value:trackResult.gtin },
                        { label:"Lote",       value:trackResult.lot },
                        { label:"Fabricante", value:trackResult.manufacturer },
                        { label:"Validade",   value:new Date(trackResult.expiryDate).toLocaleDateString("pt-BR") },
                      ].map((item,i) => (
                        <div key={i}>
                          <p style={{ fontSize:10, color:"rgba(255,255,255,0.45)",
                            fontWeight:700, letterSpacing:"0.5px", marginBottom:2 }}>{item.label}</p>
                          <p style={{ fontSize:13, color:"white", fontWeight:600 }}>{item.value}</p>
                        </div>
                      ))}
                      <div>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.45)",
                          fontWeight:700, letterSpacing:"0.5px", marginBottom:2 }}>STATUS</p>
                        <span style={{ fontSize:12, fontWeight:700, padding:"2px 10px", borderRadius:20,
                          background: trackResult.status === "ACTIVE" ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)",
                          color: trackResult.status === "ACTIVE" ? "#4ADE80" : "#fca5a5" }}>
                          {trackResult.status === "ACTIVE" ? "✓ Ativo" : trackResult.status === "RECALLED" ? "⚠ Recall" : trackResult.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabela do histórico */}
                  <div style={{ border:"1px solid " + BD, borderRadius:14, overflow:"hidden", marginBottom:20 }}>
                    <div style={{ background:BG, padding:"12px 16px", borderBottom:"1px solid " + BD }}>
                      <p style={{ fontSize:13, fontWeight:700, color:TX }}>
                        Histórico de Movimentação
                        <span style={{ fontWeight:500, color:TX2, marginLeft:8 }}>
                          — {trackResult.steps.length} registro(s)
                        </span>
                      </p>
                    </div>

                    {trackResult.steps.length === 0 ? (
                      <div style={{ padding:24, textAlign:"center", color:TX2, fontSize:14 }}>
                        Nenhuma movimentação registrada.
                      </div>
                    ) : (
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:520 }}>
                          <thead>
                            <tr style={{ background:"#fafafa" }}>
                              {["Tx Hash","Produto","Tipo","De → Para","Qtd","Data","Polygonscan"].map(h => (
                                <th key={h} style={{ textAlign:"left", padding:"10px 14px",
                                  fontSize:10, fontWeight:700, color:TX2,
                                  letterSpacing:"0.5px", textTransform:"uppercase",
                                  borderBottom:"1px solid " + BD, whiteSpace:"nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {trackResult.steps.map((step, i) => (
                              <tr key={i} style={{ borderBottom: i < trackResult.steps.length-1 ? "1px solid #f1f5f9" : "none" }}>
                                <td style={{ padding:"11px 14px", fontFamily:"monospace",
                                  fontSize:11, color:G, whiteSpace:"nowrap" }}>
                                  {step.txHash
                                    ? `${step.txHash.slice(0,8)}...${step.txHash.slice(-6)}`
                                    : <span style={{ color:"#94a3b8" }}>—</span>}
                                </td>
                                <td style={{ padding:"11px 14px", fontSize:13,
                                  fontWeight:600, color:TX, whiteSpace:"nowrap" }}>
                                  <span style={{ marginRight:6 }}>{STEP_ICON[step.type]??""}</span>
                                  {trackResult.productName}
                                </td>
                                <td style={{ padding:"11px 14px", whiteSpace:"nowrap" }}>
                                  <span style={{ fontSize:11, fontWeight:600,
                                    padding:"3px 9px", borderRadius:20,
                                    background:(TYPE_COLORS[step.type]??"#64748b")+"18",
                                    color:TYPE_COLORS[step.type]??"#64748b" }}>
                                    {TYPE_LABELS[step.type]??step.type}
                                  </span>
                                </td>
                                <td style={{ padding:"11px 14px", fontSize:12, color:TX2, whiteSpace:"nowrap" }}>
                                  {step.from?.slice(0,14)} → {step.to?.slice(0,14)}
                                </td>
                                <td style={{ padding:"11px 14px", fontSize:13, whiteSpace:"nowrap" }}>
                                  {step.qty} un.
                                </td>
                                <td style={{ padding:"11px 14px", fontSize:12, color:TX2, whiteSpace:"nowrap" }}>
                                  {format(new Date(step.date), "dd/MM/yy HH:mm", {locale:ptBR})}
                                </td>
                                <td style={{ padding:"11px 14px" }}>
                                  {step.txHash ? (
                                    <a href={`https://amoy.polygonscan.com/tx/${step.txHash}`}
                                      target="_blank" rel="noopener noreferrer"
                                      style={{ display:"inline-flex", alignItems:"center", gap:4,
                                        fontSize:11, color:G, textDecoration:"none",
                                        background:GL, padding:"3px 8px", borderRadius:6,
                                        fontWeight:600, whiteSpace:"nowrap" }}>
                                      <ExternalLink size={10}/> Ver
                                    </a>
                                  ) : <span style={{ color:"#94a3b8", fontSize:11 }}>—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setTrackResult(null); setGtinInput(""); setTrackErr(""); }}
                    style={{ width:"100%", padding:"12px", background:BG, border:"1.5px solid " + BD,
                      borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer",
                      color:TX, fontFamily:"inherit" }}>
                    Nova consulta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
