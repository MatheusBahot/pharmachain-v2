import os
base = os.path.expanduser("~/pharmachain/frontend/src/pages")

# ─────────────────────────────────────────────────────────────────
# EXPLORER.TSX — Webcam QR + GPS + histórico blockchain real
# ─────────────────────────────────────────────────────────────────
explorer = """import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, QrCode, MapPin, Wifi, X, Filter, Camera, CheckCircle, Clock, Truck, Package, Building2 } from "lucide-react";
import { api } from "../lib/api";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsQR from "jsqr";

const TYPE_LABELS: Record<string,string> = {
  DISTRIBUTE:"Distribuicao", RECEIVE:"Recebimento",
  DISPENSE:"Dispensacao", RETURN:"Devolucao", MANUFACTURE:"Fabricacao"
};
const TYPE_COLORS: Record<string,string> = {
  DISTRIBUTE:"#3b82f6", RECEIVE:"#10b981",
  DISPENSE:"#f59e0b", RETURN:"#ef4444", MANUFACTURE:"#8b5cf6"
};
const TYPE_ICONS: Record<string,any> = {
  MANUFACTURE: Package, DISTRIBUTE: Truck,
  RECEIVE: Building2, DISPENSE: CheckCircle, RETURN: Clock
};

interface BatchHistory {
  id: string;
  productName: string;
  gtin: string;
  lot: string;
  status: string;
  expiryDate: string;
  manufacturer: { name: string };
  transfers: {
    id: string; type: string; quantity: number; createdAt: string;
    txHash: string; from: { name: string }; to: { name: string };
  }[];
}

interface GpsLocation { lat: number; lng: number; accuracy: number; }

export default function Explorer() {
  const [search, setSearch]         = useState("");
  const [typeFilter, setType]       = useState("ALL");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [showScanner, setScanner]   = useState(false);
  const [gtin, setGtin]             = useState("");
  const [batchHistory, setBatchHistory] = useState<BatchHistory|null>(null);
  const [gps, setGps]               = useState<GpsLocation|null>(null);
  const [scanStep, setScanStep]     = useState<"camera"|"result">("camera");
  const [camError, setCamError]     = useState("");
  const [scanning, setScanning]     = useState(false);
  const [detected, setDetected]     = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream|null>(null);
  const rafRef      = useRef<number>(0);

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["explorer"],
    queryFn:  () => api.get("/analytics/transfers?limit=100").then(r => r.data),
    refetchInterval: 8_000,
  });

  // ── GPS ────────────────────────────────────────────────────────
  const getGps = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ── Iniciar câmera ─────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamError(""); setDetected(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanFrame();
      }
    } catch {
      setCamError("Camera nao permitida. Permita o acesso ou use o campo manual abaixo.");
    }
  }, []);

  // ── Parar câmera ───────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // ── Loop de leitura QR ─────────────────────────────────────────
  const scanFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame); return;
    }
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const img  = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
    if (code?.data) {
      setDetected(true);
      stopCamera();
      handleGtinFound(code.data);
    } else {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
  }, [stopCamera]);

  // ── Buscar histórico pelo GTIN ─────────────────────────────────
  const handleGtinFound = useCallback(async (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setGtin(clean);
    setLoadingHistory(true);
    setScanning(true);
    getGps();
    try {
      const { data } = await api.get("/batches/by-gtin/" + encodeURIComponent(clean));
      setBatchHistory(data);
    } catch {
      // fallback mock para demonstracao quando GTIN nao existe no banco
      setBatchHistory({
        id: "mock-" + clean,
        productName: "Produto nao cadastrado: " + clean,
        gtin: clean, lot: "-", status: "UNKNOWN",
        expiryDate: new Date().toISOString(),
        manufacturer: { name: "Desconhecido" },
        transfers: []
      });
    } finally {
      setLoadingHistory(false); setScanning(false); setScanStep("result");
    }
  }, [getGps]);

  // ── Abrir modal ────────────────────────────────────────────────
  function openScanner() {
    setScanner(true); setScanStep("camera");
    setBatchHistory(null); setGtin(""); setGps(null); setDetected(false);
    setTimeout(() => startCamera(), 400);
  }

  // ── Fechar modal ───────────────────────────────────────────────
  function closeScanner() {
    stopCamera(); setScanner(false);
  }

  // Limpar camera ao desmontar
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Filtros tabela ─────────────────────────────────────────────
  const filtered = transfers.filter((t: any) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      t.txHash?.includes(search) ||
      t.batch?.productName?.toLowerCase().includes(q) ||
      t.from?.name?.toLowerCase().includes(q) ||
      t.to?.name?.toLowerCase().includes(q);
    const matchType = typeFilter === "ALL" || t.type === typeFilter;
    const matchFrom = !dateFrom || isAfter(new Date(t.createdAt), parseISO(dateFrom));
    const matchTo   = !dateTo   || isBefore(new Date(t.createdAt), parseISO(dateTo + "T23:59:59"));
    return matchSearch && matchType && matchFrom && matchTo;
  });

  const mapUrl  = (lat: number, lng: number) => "https://maps.google.com/?q=" + lat + "," + lng;
  const polyUrl = (hash: string) => "https://amoy.polygonscan.com/tx/" + hash;

  return (
    <div style={{ maxWidth:1100 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Blockchain Explorer</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>
            Historico imutavel de transacoes - Polygon Amoy Testnet
          </p>
        </div>
        <button onClick={openScanner} style={{
          display:"flex", alignItems:"center", gap:8,
          background:"linear-gradient(135deg,#0a1628,#1e3a8a)",
          color:"white", border:"none", borderRadius:12, padding:"11px 20px",
          fontSize:14, fontWeight:600, cursor:"pointer", boxShadow:"0 4px 14px rgba(10,22,40,0.35)"
        }}>
          <Camera size={16} /> Rastrear com Camera
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background:"white", borderRadius:16, padding:20, marginBottom:20, border:"1px solid #e2e8f0", display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div style={{ flex:2, minWidth:200 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>BUSCAR</label>
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
            <input style={{ width:"100%", padding:"9px 12px 9px 32px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
              placeholder="Hash, produto, participante..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ minWidth:160 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>TIPO</label>
          <select style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", background:"white", fontFamily:"inherit" }}
            value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="ALL">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ minWidth:150 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>DATA INICIO</label>
          <input type="date" style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div style={{ minWidth:150 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>DATA FIM</label>
          <input type="date" style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        {(search || typeFilter !== "ALL" || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(""); setType("ALL"); setDateFrom(""); setDateTo(""); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", background:"#fee2e2", color:"#ef4444", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      <div style={{ marginBottom:12, fontSize:13, color:"#64748b" }}>
        <Filter size={13} style={{ marginRight:6, verticalAlign:"middle" }} />
        {filtered.length} transacao(oes) de {transfers.length} total
      </div>

      {/* Tabela */}
      <div style={{ background:"white", borderRadius:16, border:"1px solid #e2e8f0", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["Tx Hash","Produto","Tipo","De / Para","Qtd","Data","Polygonscan"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.5px", textTransform:"uppercase", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>Sincronizando com blockchain...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>Nenhuma transacao encontrada.</td></tr>
            ) : filtered.map((t: any) => (
              <motion.tr key={t.id} initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:"#3b82f6" }}>
                  {t.txHash ? t.txHash.slice(0,8) + "..." + t.txHash.slice(-6) : "pending"}
                </td>
                <td style={{ padding:"12px 16px", fontWeight:500, fontSize:13 }}>{t.batch?.productName ?? "-"}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ background:(TYPE_COLORS[t.type] ?? "#64748b") + "20", color:TYPE_COLORS[t.type] ?? "#64748b", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>
                    {TYPE_LABELS[t.type] ?? t.type}
                  </span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:"#64748b" }}>
                  {t.from?.name?.slice(0,18)} / {t.to?.name?.slice(0,18)}
                </td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{t.quantity} un.</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:"#64748b" }}>
                  {format(new Date(t.createdAt), "dd/MM/yy HH:mm", { locale:ptBR })}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  {t.txHash && (
                    <a href={polyUrl(t.txHash)} target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"#3b82f6", textDecoration:"none", background:"#dbeafe", padding:"3px 8px", borderRadius:6 }}>
                      <ExternalLink size={10} /> Ver
                    </a>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal Scanner com Webcam ── */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) closeScanner(); }}
          >
            <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }}
              style={{ background:"white", borderRadius:24, width:"100%", maxWidth:600, maxHeight:"95vh", overflowY:"auto" }}>

              {/* Header modal */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 28px 0" }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#0a1628" }}>
                    {scanStep === "camera" ? "Rastrear Medicamento" : "Resultado da Rastreabilidade"}
                  </h2>
                  <p style={{ fontSize:13, color:"#64748b", marginTop:2 }}>
                    {scanStep === "camera" ? "Aponte a camera para o QR Code do medicamento" : "Historico completo na blockchain"}
                  </p>
                </div>
                <button onClick={closeScanner}
                  style={{ background:"#f1f5f9", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding:28 }}>
                {scanStep === "camera" ? (
                  <div>
                    {/* Viewfinder */}
                    <div style={{ position:"relative", borderRadius:16, overflow:"hidden", background:"#0a1628", marginBottom:20, aspectRatio:"4/3" }}>
                      <video ref={videoRef} playsInline muted
                        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                      <canvas ref={canvasRef} style={{ display:"none" }} />

                      {/* Overlay de mira */}
                      {!camError && !detected && (
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                          <div style={{ width:200, height:200, position:"relative" }}>
                            {[["top-left","0","0"], ["top-right","0","auto"], ["bottom-left","auto","0"], ["bottom-right","auto","auto"]].map(([pos, top, right]) => (
                              <div key={pos} style={{
                                position:"absolute",
                                top: pos.includes("top") ? 0 : "auto",
                                bottom: pos.includes("bottom") ? 0 : "auto",
                                left: pos.includes("left") ? 0 : "auto",
                                right: pos.includes("right") ? 0 : "auto",
                                width:28, height:28,
                                borderTop: pos.includes("top") ? "3px solid #0071E3" : "none",
                                borderBottom: pos.includes("bottom") ? "3px solid #0071E3" : "none",
                                borderLeft: pos.includes("left") ? "3px solid #0071E3" : "none",
                                borderRight: pos.includes("right") ? "3px solid #0071E3" : "none",
                              }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detectado */}
                      {detected && (
                        <div style={{ position:"absolute", inset:0, background:"rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <CheckCircle size={64} color="white" />
                        </div>
                      )}

                      {/* Erro de camera */}
                      {camError && (
                        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
                          <QrCode size={40} color="#94a3b8" style={{ marginBottom:12 }} />
                          <p style={{ color:"#94a3b8", fontSize:13 }}>{camError}</p>
                        </div>
                      )}

                      {/* Loading busca */}
                      {scanning && (
                        <div style={{ position:"absolute", inset:0, background:"rgba(10,22,40,0.7)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                          <Wifi size={32} color="#3b82f6" style={{ marginBottom:12 }} />
                          <p style={{ color:"white", fontSize:14, fontWeight:600 }}>Consultando blockchain...</p>
                        </div>
                      )}
                    </div>

                    {/* GPS Status */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background: gps ? "#d1fae5" : "#f8fafc", borderRadius:12, marginBottom:16, border:"1px solid " + (gps ? "#a7f3d0" : "#e2e8f0") }}>
                      <MapPin size={16} color={gps ? "#10b981" : "#94a3b8"} />
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, color: gps ? "#065f46" : "#64748b" }}>
                          {gps ? "GPS capturado (precisao: " + Math.round(gps.accuracy) + "m)" : "GPS sera capturado ao escanear"}
                        </p>
                        {gps && (
                          <p style={{ fontSize:11, fontFamily:"monospace", color:"#6ee7b7" }}>
                            {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Entrada manual fallback */}
                    <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:16 }}>
                      <p style={{ fontSize:12, color:"#94a3b8", marginBottom:8, textAlign:"center" }}>Ou digite o GTIN manualmente</p>
                      <div style={{ display:"flex", gap:8 }}>
                        <input
                          style={{ flex:1, padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", fontFamily:"monospace", letterSpacing:"1px" }}
                          placeholder="00000000000000"
                          onKeyDown={e => { if (e.key === "Enter") { stopCamera(); handleGtinFound((e.target as HTMLInputElement).value); }}}
                        />
                        <button
                          onClick={e => { stopCamera(); handleGtinFound(((e.currentTarget.previousElementSibling) as HTMLInputElement).value); }}
                          style={{ padding:"10px 18px", background:"#0071E3", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                          Buscar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── RESULTADO ── */
                  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
                    {loadingHistory ? (
                      <div style={{ textAlign:"center", padding:48 }}>
                        <Wifi size={32} color="#3b82f6" style={{ margin:"0 auto 12px", display:"block" }} />
                        <p style={{ color:"#64748b" }}>Carregando historico da blockchain...</p>
                      </div>
                    ) : batchHistory ? (
                      <div>
                        {/* Card principal do medicamento */}
                        <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", borderRadius:16, padding:24, marginBottom:20, color:"white" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background: batchHistory.status === "ACTIVE" ? "#10b981" : "#ef4444" }} />
                            <span style={{ fontSize:11, color:"#93c5fd", fontWeight:700, letterSpacing:"0.5px" }}>
                              {batchHistory.status === "ACTIVE" ? "ATIVO NA BLOCKCHAIN" : batchHistory.status}
                            </span>
                          </div>
                          <h3 style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>{batchHistory.productName}</h3>
                          <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:16 }}>
                            GTIN: {batchHistory.gtin}  |  Lote: {batchHistory.lot}  |  Fab: {batchHistory.manufacturer?.name}
                          </p>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                            <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:12 }}>
                              <p style={{ fontSize:11, color:"#93c5fd", marginBottom:4 }}>VALIDADE</p>
                              <p style={{ fontSize:14, fontWeight:600 }}>
                                {format(new Date(batchHistory.expiryDate), "dd/MM/yyyy")}
                              </p>
                            </div>
                            <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:12 }}>
                              <p style={{ fontSize:11, color:"#93c5fd", marginBottom:4 }}>MOVIMENTACOES</p>
                              <p style={{ fontSize:14, fontWeight:600 }}>{batchHistory.transfers?.length ?? 0} registros</p>
                            </div>
                          </div>
                        </div>

                        {/* GPS do scan atual */}
                        {gps && (
                          <div style={{ background:"#f0fdf4", border:"1px solid #a7f3d0", borderRadius:12, padding:16, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
                            <MapPin size={20} color="#10b981" />
                            <div style={{ flex:1 }}>
                              <p style={{ fontSize:13, fontWeight:700, color:"#065f46", marginBottom:2 }}>Leitura registrada aqui</p>
                              <p style={{ fontSize:12, fontFamily:"monospace", color:"#047857" }}>
                                {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}  (precisao {Math.round(gps.accuracy)}m)
                              </p>
                            </div>
                            <a href={mapUrl(gps.lat, gps.lng)} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize:12, color:"#10b981", fontWeight:600, textDecoration:"none", background:"#d1fae5", padding:"6px 12px", borderRadius:8 }}>
                              Ver mapa
                            </a>
                          </div>
                        )}

                        {/* Linha do tempo da blockchain */}
                        <h4 style={{ fontSize:15, fontWeight:700, color:"#0a1628", marginBottom:16 }}>
                          Cadeia Logistica Completa
                        </h4>
                        {batchHistory.transfers && batchHistory.transfers.length > 0 ? (
                          <div style={{ position:"relative" }}>
                            {/* Linha vertical */}
                            <div style={{ position:"absolute", left:20, top:0, bottom:0, width:2, background:"#e2e8f0" }} />
                            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                              {batchHistory.transfers.map((t, i) => {
                                const Icon = TYPE_ICONS[t.type] ?? Package;
                                const color = TYPE_COLORS[t.type] ?? "#64748b";
                                return (
                                  <motion.div key={t.id}
                                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                                    transition={{ delay: i * 0.07 }}
                                    style={{ display:"flex", gap:16, paddingLeft:8, paddingBottom:20 }}
                                  >
                                    {/* Icone */}
                                    <div style={{ width:24, height:24, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:1, marginTop:4 }}>
                                      <Icon size={13} color="white" />
                                    </div>
                                    {/* Conteudo */}
                                    <div style={{ flex:1, background:"white", border:"1px solid #e2e8f0", borderRadius:12, padding:14 }}>
                                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                                        <span style={{ background:color + "18", color, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
                                          {TYPE_LABELS[t.type] ?? t.type}
                                        </span>
                                        <span style={{ fontSize:11, color:"#94a3b8" }}>
                                          {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm", { locale:ptBR })}
                                        </span>
                                      </div>
                                      <p style={{ fontSize:13, color:"#374151", marginBottom:4 }}>
                                        <strong>{t.from?.name}</strong> transferiu para <strong>{t.to?.name}</strong>
                                      </p>
                                      <p style={{ fontSize:12, color:"#94a3b8", marginBottom:8 }}>{t.quantity} unidades</p>
                                      {t.txHash && (
                                        <a href={polyUrl(t.txHash)} target="_blank" rel="noopener noreferrer"
                                          style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"#3b82f6", textDecoration:"none", background:"#dbeafe", padding:"3px 8px", borderRadius:6 }}>
                                          <ExternalLink size={10} /> {t.txHash.slice(0,10)}...{t.txHash.slice(-6)}
                                        </a>
                                      )}
                                    </div>
                                  </motion.div>
                                );
                              })}
                              {/* No final — ponto atual (GPS) */}
                              {gps && (
                                <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                                  transition={{ delay: batchHistory.transfers.length * 0.07 }}
                                  style={{ display:"flex", gap:16, paddingLeft:8 }}>
                                  <div style={{ width:24, height:24, borderRadius:"50%", background:"#10b981", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:1, marginTop:4, boxShadow:"0 0 0 4px rgba(16,185,129,0.2)" }}>
                                    <MapPin size={13} color="white" />
                                  </div>
                                  <div style={{ flex:1, background:"#f0fdf4", border:"1px solid #a7f3d0", borderRadius:12, padding:14 }}>
                                    <span style={{ background:"#d1fae5", color:"#065f46", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
                                      LEITURA ATUAL
                                    </span>
                                    <p style={{ fontSize:13, color:"#374151", marginTop:8, marginBottom:4 }}>
                                      Escaneado agora neste dispositivo
                                    </p>
                                    <p style={{ fontSize:12, fontFamily:"monospace", color:"#059669" }}>
                                      {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign:"center", padding:32, color:"#94a3b8", background:"#f8fafc", borderRadius:12 }}>
                            <Package size={32} style={{ margin:"0 auto 8px", display:"block" }} />
                            <p>Nenhuma movimentacao registrada ainda para este lote.</p>
                          </div>
                        )}

                        {/* Botoes */}
                        <div style={{ display:"flex", gap:10, marginTop:24 }}>
                          <button onClick={() => { setScanStep("camera"); setBatchHistory(null); setDetected(false); setTimeout(startCamera, 200); }}
                            style={{ flex:1, padding:"11px", background:"#f1f5f9", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", color:"#374151" }}>
                            Escanear outro
                          </button>
                          {batchHistory.transfers?.[0]?.txHash && (
                            <a href={"https://amoy.polygonscan.com/address/" + batchHistory.id} target="_blank" rel="noopener noreferrer"
                              style={{ flex:1, padding:"11px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)", borderRadius:10, fontSize:14, fontWeight:600, color:"white", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                              <ExternalLink size={14} /> Ver no Polygonscan
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>
                        Produto nao encontrado na blockchain.
                      </div>
                    )}
                  </motion.div>
                )}
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
# PRESCRIPTIONS.TSX
# ─────────────────────────────────────────────────────────────────
prescriptions = """import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

interface Rx {
  id: string; dosage: string; quantity: number;
  expiresAt: string; dispensedAt: string | null; createdAt: string;
  doctor: { name: string };
  pharmacy: { name: string } | null;
  batch: { productName: string; gtin: string; lot: string };
}

export default function Prescriptions() {
  const { role, participantId } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showForm, setForm] = useState(false);
  const [form, setFv]       = useState({ batchId:"", patientCpf:"", dosage:"", quantity:1, expiresAt:"", signature:"demo-sig" });
  const qc = useQueryClient();

  const { data: rxList = [], isLoading } = useQuery<Rx[]>({
    queryKey: ["prescriptions"],
    queryFn:  () => api.get("/prescriptions").then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["batches-select"],
    queryFn:  () => api.get("/batches").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/prescriptions", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["prescriptions"] }); setForm(false); toast.success("Receita emitida!"); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao emitir"),
  });

  const dispenseMutation = useMutation({
    mutationFn: (id: string) => api.post("/prescriptions/" + id + "/dispense"),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["prescriptions"] }); toast.success("Medicamento dispensado!"); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao dispensar"),
  });

  const filtered = rxList.filter(r =>
    r.batch?.productName?.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  function StatusBadge({ rx }: { rx: Rx }) {
    const expired = new Date(rx.expiresAt) < new Date();
    if (rx.dispensedAt) return <span style={{ background:"#d1fae5", color:"#065f46", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}><CheckCircle size={11} /> Dispensada</span>;
    if (expired) return <span style={{ background:"#fee2e2", color:"#ef4444", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}><AlertCircle size={11} /> Expirada</span>;
    return <span style={{ background:"#fef3c7", color:"#92400e", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}><Clock size={11} /> Pendente</span>;
  }

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Receitas Medicas</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>Prescricoes digitais assinadas e registradas na blockchain</p>
        </div>
        {role === "DOCTOR" && (
          <button onClick={() => setForm(true)} style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            <Plus size={16} /> Nova Receita
          </button>
        )}
      </div>

      <div style={{ position:"relative", marginBottom:20 }}>
        <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
        <input style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:13, outline:"none", fontFamily:"inherit", background:"white" }}
          placeholder="Buscar por produto ou medico..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {isLoading ? (
          <div style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>Carregando receitas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:48, color:"#94a3b8", background:"white", borderRadius:16 }}>
            <FileText size={32} style={{ margin:"0 auto 8px", display:"block" }} />
            Nenhuma receita encontrada.
          </div>
        ) : filtered.map(rx => (
          <motion.div key={rx.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <FileText size={20} color="#3b82f6" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <p style={{ fontWeight:700, fontSize:15, color:"#0a1628" }}>{rx.batch?.productName}</p>
                <StatusBadge rx={rx} />
              </div>
              <p style={{ fontSize:13, color:"#64748b" }}>
                Dr. {rx.doctor?.name}  |  {rx.dosage}  |  {rx.quantity} un.
              </p>
              <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>
                Emitida: {format(new Date(rx.createdAt), "dd/MM/yyyy", { locale:ptBR })}  |
                Validade: {format(new Date(rx.expiresAt), "dd/MM/yyyy", { locale:ptBR })}
                {rx.dispensedAt && "  |  Dispensada: " + format(new Date(rx.dispensedAt), "dd/MM/yyyy", { locale:ptBR })}
              </p>
            </div>
            {role === "PHARMACY" && !rx.dispensedAt && new Date(rx.expiresAt) > new Date() && (
              <button onClick={() => dispenseMutation.mutate(rx.id)}
                style={{ padding:"9px 18px", background:"#10b981", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
                Dispensar
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
            onClick={e => { if (e.target === e.currentTarget) setForm(false); }}>
            <motion.div initial={{ scale:0.92 }} animate={{ scale:1 }} exit={{ scale:0.92 }}
              style={{ background:"white", borderRadius:20, padding:36, width:"100%", maxWidth:480 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:20, fontWeight:800 }}>Nova Receita</h2>
                <button onClick={() => setForm(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16} /></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>MEDICAMENTO (LOTE)</label>
                  <select style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    value={form.batchId} onChange={e => setFv(p => ({ ...p, batchId: e.target.value }))}>
                    <option value="">Selecione o lote...</option>
                    {batches.map((b: any) => <option key={b.id} value={b.id}>{b.productName} — Lote {b.lot}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>CPF DO PACIENTE</label>
                  <input style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    placeholder="000.000.000-00" maxLength={14}
                    value={form.patientCpf} onChange={e => setFv(p => ({ ...p, patientCpf: e.target.value.replace(/\\D/g,"") }))} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>POSOLOGIA</label>
                  <input style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    placeholder="Ex: 1 comprimido 8/8h por 5 dias"
                    value={form.dosage} onChange={e => setFv(p => ({ ...p, dosage: e.target.value }))} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>QUANTIDADE</label>
                    <input type="number" min={1} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={form.quantity} onChange={e => setFv(p => ({ ...p, quantity: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>VALIDADE</label>
                    <input type="date" style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={form.expiresAt} onChange={e => setFv(p => ({ ...p, expiresAt: e.target.value + "T23:59:00.000Z" }))} />
                  </div>
                </div>
                <button disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate(form)}
                  style={{ padding:"12px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", marginTop:4 }}>
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
# USERS.TSX
# ─────────────────────────────────────────────────────────────────
users = """import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Users as UsersIcon, Building2, Stethoscope, Truck, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";

const ROLE_CONFIG: Record<string, { label:string; color:string; bg:string; Icon:any }> = {
  MANUFACTURER: { label:"Fabricante",    color:"#8b5cf6", bg:"#f5f3ff", Icon: Building2   },
  DISTRIBUTOR:  { label:"Distribuidor",  color:"#3b82f6", bg:"#eff6ff", Icon: Truck        },
  PHARMACY:     { label:"Farmacia",      color:"#10b981", bg:"#f0fdf4", Icon: ShieldCheck  },
  DOCTOR:       { label:"Medico",        color:"#f59e0b", bg:"#fffbeb", Icon: Stethoscope  },
  ADMIN:        { label:"Admin",         color:"#ef4444", bg:"#fef2f2", Icon: UsersIcon    },
};

interface Participant {
  id: string; name: string; cnpj: string; role: string;
  address: string; active: boolean; createdAt: string;
}

export default function Users() {
  const { role: myRole } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showForm, setForm] = useState(false);
  const [form, setFv]       = useState({ name:"", cnpj:"", role:"PHARMACY", password:"" });
  const qc = useQueryClient();

  const { data: participants = [], isLoading } = useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn:  () => api.get("/participants").then(r => r.data),
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/participants", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["participants"] }); setForm(false); toast.success("Participante cadastrado!"); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Erro ao cadastrar"),
  });

  const filtered = participants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.cnpj.includes(q);
    const matchRole = roleFilter === "ALL" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Participantes</h1>
          <p style={{ color:"var(--text2)", fontSize:15 }}>Entidades autorizadas na rede PharmaChain</p>
        </div>
        {myRole === "ADMIN" && (
          <button onClick={() => setForm(true)} style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            <Plus size={16} /> Novo Participante
          </button>
        )}
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:2, minWidth:200 }}>
          <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:13, outline:"none", fontFamily:"inherit", background:"white" }}
            placeholder="Buscar por nome ou CNPJ..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:13, outline:"none", background:"white", fontFamily:"inherit" }}
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">Todos os papeis</option>
          {Object.entries(ROLE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:16 }}>
        {isLoading ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:48, color:"#94a3b8" }}>Carregando participantes...</div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:48, color:"#94a3b8", background:"white", borderRadius:16 }}>
            <UsersIcon size={32} style={{ margin:"0 auto 8px", display:"block" }} />
            Nenhum participante encontrado.
          </div>
        ) : filtered.map(p => {
          const cfg = ROLE_CONFIG[p.role] ?? ROLE_CONFIG.ADMIN;
          const Icon = cfg.Icon;
          return (
            <motion.div key={p.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={20} color={cfg.color} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                    <p style={{ fontWeight:700, fontSize:15, color:"#0a1628", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</p>
                    <span style={{ background:cfg.bg, color:cfg.color, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, flexShrink:0 }}>{cfg.label}</span>
                  </div>
                  <p style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>CNPJ: {p.cnpj}</p>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#94a3b8", wordBreak:"break-all" }}>
                    {p.address?.slice(0,18)}...{p.address?.slice(-6)}
                  </p>
                </div>
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>
                  Desde {format(new Date(p.createdAt), "MMM yyyy", { locale:ptBR })}
                </span>
                <span style={{ fontSize:11, fontWeight:600, color: p.active ? "#10b981" : "#ef4444" }}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
            onClick={e => { if (e.target === e.currentTarget) setForm(false); }}>
            <motion.div initial={{ scale:0.92 }} animate={{ scale:1 }} exit={{ scale:0.92 }}
              style={{ background:"white", borderRadius:20, padding:36, width:"100%", maxWidth:440 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:20, fontWeight:800 }}>Novo Participante</h2>
                <button onClick={() => setForm(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16} /></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  ["NOME COMPLETO / EMPRESA", "name", "text", "Farmacia XYZ Ltda"],
                  ["CNPJ (somente numeros)", "cnpj", "text", "00000000000000"],
                  ["SENHA", "password", "password", "Minimo 8 caracteres"],
                ].map(([label, key, type, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>{label}</label>
                    <input type={type} placeholder={ph} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                      value={(form as any)[key]} onChange={e => setFv(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>PAPEL</label>
                  <select style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    value={form.role} onChange={e => setFv(p => ({ ...p, role: e.target.value }))}>
                    {Object.entries(ROLE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <button disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate(form)}
                  style={{ padding:"12px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", marginTop:4 }}>
                  {createMutation.isPending ? "Cadastrando..." : "Cadastrar Participante"}
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
# APP.TSX atualizado
# ─────────────────────────────────────────────────────────────────
app = """import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Layout        from "./components/Layout";
import Login         from "./pages/Login";
import About         from "./pages/About";
import Dashboard     from "./pages/Dashboard";
import Batches       from "./pages/Batches";
import Inventory     from "./pages/Inventory";
import Explorer      from "./pages/Explorer";
import Prescriptions from "./pages/Prescriptions";
import Users         from "./pages/Users";
import { useAuthStore } from "./store/auth";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime:30_000, retry:1 } }
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index          element={<Dashboard />} />
            <Route path="about"         element={<About />} />
            <Route path="batches"       element={<Batches />} />
            <Route path="inventory"     element={<Inventory />} />
            <Route path="explorer"      element={<Explorer />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="users"         element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right"
        toastOptions={{ style:{ borderRadius:10, fontSize:14 } }}/>
    </QueryClientProvider>
  );
}
"""

# Escrever os arquivos
files = {
    os.path.join(base, "Explorer.tsx"):      explorer,
    os.path.join(base, "Prescriptions.tsx"): prescriptions,
    os.path.join(base, "Users.tsx"):         users,
    os.path.join(os.path.dirname(base), "App.tsx"): app,
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK:", path)

print("\\nTodos os arquivos escritos. Rode: npm run build")
