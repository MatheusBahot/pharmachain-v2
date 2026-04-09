import os

content = """import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, QrCode, MapPin, Wifi, X, Filter } from "lucide-react";
import { api } from "../lib/api";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_LABELS: Record<string,string> = {
  DISTRIBUTE:"Distribuicao", RECEIVE:"Recebimento",
  DISPENSE:"Dispensacao", RETURN:"Devolucao", MANUFACTURE:"Fabricacao"
};
const TYPE_COLORS: Record<string,string> = {
  DISTRIBUTE:"#3b82f6", RECEIVE:"#10b981",
  DISPENSE:"#f59e0b", RETURN:"#ef4444", MANUFACTURE:"#8b5cf6"
};

interface ScanEvent {
  id: string; productName: string; gtin: string; lot: string;
  lat: number; lng: number; timestamp: string; txHash: string;
}

export default function Explorer() {
  const [search, setSearch]         = useState("");
  const [typeFilter, setType]       = useState("ALL");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [showScanner, setScanner]   = useState(false);
  const [scanResult, setScanResult] = useState<ScanEvent|null>(null);
  const [location, setLocation]     = useState<{lat:number;lng:number}|null>(null);
  const [scanning, setScanning]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["explorer"],
    queryFn:  () => api.get("/analytics/transfers?limit=100").then(r => r.data),
    refetchInterval: 8_000,
  });

  function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  function openScanner() {
    setScanner(true); getLocation();
    setTimeout(() => inputRef.current?.focus(), 300);
  }

  function handleScan(value: string) {
    if (!value || value.length < 6) return;
    setScanning(true);
    setTimeout(() => {
      const mock: ScanEvent = {
        id: crypto.randomUUID(),
        productName: "Dipirona Sodica 500mg",
        gtin: value.padEnd(14,"0").slice(0,14),
        lot: "LOTE-2026-001",
        lat: location?.lat ?? -12.9714,
        lng: location?.lng ?? -38.5014,
        timestamp: new Date().toISOString(),
        txHash: "0x" + [...Array(64)].map(()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join(""),
      };
      setScanResult(mock); setScanning(false);
    }, 1200);
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

  const mapUrl  = (lat: number, lng: number) => "https://maps.google.com/?q=" + lat + "," + lng;
  const polyUrl = (hash: string) => "https://amoy.polygonscan.com/tx/" + hash;

  return (
    <div style={{ maxWidth:1100 }}>

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
          fontSize:14, fontWeight:600, cursor:"pointer"
        }}>
          <QrCode size={16} /> Rastrear Medicamento
        </button>
      </div>

      <div style={{
        background:"white", borderRadius:16, padding:20, marginBottom:20,
        border:"1px solid #e2e8f0", display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end"
      }}>
        <div style={{ flex:2, minWidth:200 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>BUSCAR</label>
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
            <input
              style={{ width:"100%", padding:"9px 12px 9px 32px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
              placeholder="Hash, produto, participante..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ minWidth:160 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>TIPO</label>
          <select
            style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", background:"white", fontFamily:"inherit" }}
            value={typeFilter} onChange={e => setType(e.target.value)}
          >
            <option value="ALL">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([k,v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth:150 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>DATA INICIO</label>
          <input type="date"
            style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
            value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          />
        </div>

        <div style={{ minWidth:150 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>DATA FIM</label>
          <input type="date"
            style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", fontFamily:"inherit" }}
            value={dateTo} onChange={e => setDateTo(e.target.value)}
          />
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
                  {t.from?.name?.slice(0,16)} / {t.to?.name?.slice(0,16)}
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

      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
            onClick={e => { if (e.target === e.currentTarget) setScanner(false); }}
          >
            <motion.div
              initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              style={{ background:"white", borderRadius:20, padding:40, width:"100%", maxWidth:520 }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#0a1628", marginBottom:4 }}>Rastrear Medicamento</h2>
                  <p style={{ fontSize:13, color:"#64748b" }}>Leia o QR Code ou codigo de barras</p>
                </div>
                <button onClick={() => { setScanner(false); setScanResult(null); }}
                  style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18 }}>
                  x
                </button>
              </div>

              {!scanResult ? (
                <div>
                  <div style={{ border:"2px dashed #e2e8f0", borderRadius:16, padding:32, textAlign:"center", marginBottom:20, background:"#f8fafc" }}>
                    <QrCode size={48} color="#94a3b8" style={{ margin:"0 auto 12px", display:"block" }} />
                    <p style={{ fontSize:13, color:"#64748b", marginBottom:16 }}>Aponte a camera ou digite o GTIN</p>
                    <input
                      ref={inputRef}
                      style={{ width:"100%", padding:"12px 16px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", textAlign:"center", fontFamily:"monospace", letterSpacing:"2px" }}
                      placeholder="Digite o GTIN ou codigo..."
                      onKeyDown={e => { if (e.key === "Enter") handleScan((e.target as HTMLInputElement).value); }}
                    />
                    <p style={{ fontSize:11, color:"#94a3b8", marginTop:8 }}>Pressione Enter para consultar</p>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background: location ? "#d1fae5" : "#f1f5f9", borderRadius:12, marginBottom:16 }}>
                    <MapPin size={16} color={location ? "#10b981" : "#94a3b8"} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color: location ? "#065f46" : "#64748b" }}>
                        {location ? "Localizacao capturada" : "Aguardando GPS..."}
                      </p>
                      {location && (
                        <p style={{ fontSize:11, color:"#6ee7b7", fontFamily:"monospace" }}>
                          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                    {!location && (
                      <button onClick={getLocation} style={{ fontSize:11, background:"#3b82f6", color:"white", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>
                        Ativar GPS
                      </button>
                    )}
                  </div>

                  {scanning && (
                    <div style={{ textAlign:"center", padding:"20px 0", color:"#64748b", fontSize:14 }}>
                      <Wifi size={20} style={{ margin:"0 auto 8px", display:"block", color:"#3b82f6" }} />
                      Consultando blockchain...
                    </div>
                  )}
                </div>
              ) : (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                  <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", borderRadius:16, padding:24, marginBottom:16, color:"white" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }} />
                      <span style={{ fontSize:12, color:"#93c5fd", fontWeight:600 }}>REGISTRADO NA BLOCKCHAIN</span>
                    </div>
                    <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{scanResult.productName}</h3>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:16 }}>
                      GTIN: {scanResult.gtin} - Lote: {scanResult.lot}
                    </p>
                    <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:12, fontFamily:"monospace", fontSize:11, color:"#93c5fd", wordBreak:"break-all" }}>
                      Tx: {scanResult.txHash}
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                    <div style={{ background:"#f0fdf4", borderRadius:12, padding:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                        <MapPin size={14} color="#10b981" />
                        <span style={{ fontSize:11, fontWeight:600, color:"#065f46" }}>LOCALIZACAO GPS</span>
                      </div>
                      <p style={{ fontSize:12, fontFamily:"monospace", color:"#374151", marginBottom:6 }}>
                        {scanResult.lat.toFixed(6)}<br />{scanResult.lng.toFixed(6)}
                      </p>
                      <a href={mapUrl(scanResult.lat, scanResult.lng)} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:11, color:"#10b981", textDecoration:"none" }}>
                        Ver no mapa
                      </a>
                    </div>
                    <div style={{ background:"#eff6ff", borderRadius:12, padding:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                        <Wifi size={14} color="#3b82f6" />
                        <span style={{ fontSize:11, fontWeight:600, color:"#1e40af" }}>HORARIO</span>
                      </div>
                      <p style={{ fontSize:12, color:"#374151" }}>
                        {format(new Date(scanResult.timestamp), "dd/MM/yyyy HH:mm:ss", { locale:ptBR })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => setScanResult(null)}
                      style={{ flex:1, padding:"11px", background:"#f1f5f9", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", color:"#374151" }}>
                      Escanear outro
                    </button>
                    <a href={polyUrl(scanResult.txHash)} target="_blank" rel="noopener noreferrer"
                      style={{ flex:1, padding:"11px", background:"linear-gradient(135deg,#0a1628,#1e3a8a)", borderRadius:10, fontSize:14, fontWeight:600, color:"white", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <ExternalLink size={14} /> Ver na Blockchain
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
"""

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Explorer.tsx")
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK — Explorer.tsx escrito em:", path)
