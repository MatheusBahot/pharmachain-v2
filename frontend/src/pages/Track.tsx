import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Package, Truck, Shield, CheckCircle, AlertCircle, ExternalLink, Thermometer } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

interface TrackStep {
  type:string; date:string; from:string; to:string; qty:number; txHash:string;
  conditions?: { temp:number; humidity?:number };
}
interface TrackResult {
  productName:string; gtin:string; lot:string;
  status:string; expiryDate:string; manufacturer:string;
  steps:TrackStep[];
}

const STEP_LABEL: Record<string,string> = {
  DISTRIBUTE:"Distribuição", RECEIVE:"Recebimento",
  DISPENSE:"Dispensação", RETURN:"Devolução", MANUFACTURE:"Fabricação"
};
const STEP_COLOR: Record<string,string> = {
  DISTRIBUTE:"#3b82f6", RECEIVE:"#16A34A",
  DISPENSE:"#f59e0b", RETURN:"#ef4444", MANUFACTURE:"#8b5cf6"
};
const STEP_ICON: Record<string,any> = {
  MANUFACTURE: Package, DISTRIBUTE: Truck,
  RECEIVE: CheckCircle, DISPENSE: Shield, RETURN: AlertCircle
};

export default function Track() {
  const [gtin, setGtin]       = useState("");
  const [tracking, setTracking] = useState(false);
  const [result, setResult]   = useState<TrackResult|null>(null);
  const [error, setError]     = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!gtin.trim()) return;
    setTracking(true); setResult(null); setError("");
    try {
      const { data } = await axios.get(`${BASE}/consumer/track/${gtin.trim()}`);
      setResult(data);
    } catch (err:any) {
      setError(err.response?.data?.error ?? "Produto não encontrado na blockchain.");
    } finally {
      setTracking(false);
    }
  }

  const G   = "#16A34A";
  const GD  = "#14532D";
  const BG  = "#F0FAF4";
  const TX  = "#0F2417";
  const TX2 = "#4B6B58";

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:BG, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
      `}</style>

      {/* Navbar */}
      <nav style={{ position:"sticky", top:0, zIndex:100,
        background:"rgba(255,255,255,0.95)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(22,163,74,0.12)",
        boxShadow:"0 2px 16px rgba(22,163,74,0.06)" }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px",
          height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:28 }}>🦾</div>
            <span style={{ color:TX, fontWeight:800, fontSize:15, letterSpacing:"-0.3px" }}>PharmaChain</span>
          </div>
          <Link to="/login" style={{ display:"flex", alignItems:"center", gap:6,
            color:TX2, textDecoration:"none", fontSize:13, fontWeight:500 }}>
            <ArrowLeft size={14}/> Voltar ao início
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${TX} 0%,${GD} 100%)`,
        padding:"56px 24px 80px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)",
          borderRadius:20, padding:"5px 16px", marginBottom:20 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80",
            boxShadow:"0 0 8px #4ADE80" }}/>
          <span style={{ color:"#4ADE80", fontSize:12, fontWeight:600 }}>Consulta Pública — Sem Login</span>
        </div>
        <h1 style={{ color:"white", fontSize:38, fontWeight:800, letterSpacing:"-1px",
          marginBottom:14, lineHeight:1.15 }}>
          Rastrear Medicamento
        </h1>
        <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, maxWidth:480,
          margin:"0 auto 36px", lineHeight:1.75 }}>
          Digite o código GTIN da embalagem para consultar o histórico
          completo de movimentação na blockchain.
        </p>

        {/* Barra de busca */}
        <form onSubmit={handleTrack}
          style={{ display:"flex", gap:10, maxWidth:520, margin:"0 auto" }}>
          <div style={{ flex:1, position:"relative" }}>
            <Search size={16} style={{ position:"absolute", left:14, top:"50%",
              transform:"translateY(-50%)", color:"#94a3b8" }}/>
            <input
              style={{ width:"100%", padding:"14px 16px 14px 42px",
                border:"none", borderRadius:12, fontSize:15,
                fontFamily:"inherit", outline:"none",
                boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}
              placeholder="Digite o GTIN (ex: 78912345678901)"
              value={gtin} onChange={e => setGtin(e.target.value)}/>
          </div>
          <button type="submit" disabled={tracking || !gtin.trim()}
            style={{ padding:"14px 24px", background:`linear-gradient(135deg,${G},#4ADE80)`,
              color:"white", border:"none", borderRadius:12, fontSize:14,
              fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              boxShadow:"0 6px 20px rgba(22,163,74,0.4)",
              opacity: tracking || !gtin.trim() ? 0.7 : 1 }}>
            {tracking ? "Consultando..." : "Rastrear"}
          </button>
        </form>

        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:14 }}>
          O GTIN está impresso na embalagem ou no QR Code do medicamento
        </p>
      </div>

      {/* Resultado */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>

        {error && (
          <div style={{ background:"#FEE2E2", border:"1px solid #FCA5A5",
            borderRadius:16, padding:24, textAlign:"center", marginBottom:24 }}>
            <AlertCircle size={32} color="#DC2626" style={{ margin:"0 auto 8px", display:"block" }}/>
            <p style={{ color:"#DC2626", fontWeight:600, fontSize:14 }}>{error}</p>
          </div>
        )}

        {result && (
          <div>
            {/* Card do produto */}
            <div style={{ background:`linear-gradient(135deg,${TX},${GD})`,
              borderRadius:20, padding:32, marginBottom:24, color:"white" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ADE80",
                      boxShadow:"0 0 8px #4ADE80" }}/>
                    <span style={{ color:"#4ADE80", fontSize:12, fontWeight:700, letterSpacing:"1px" }}>
                      VERIFICADO NA BLOCKCHAIN
                    </span>
                  </div>
                  <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8, lineHeight:1.2 }}>
                    {result.productName}
                  </h2>
                  <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                    <div>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>GTIN</p>
                      <p style={{ fontSize:13, fontFamily:"monospace" }}>{result.gtin}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>LOTE</p>
                      <p style={{ fontSize:13 }}>{result.lot}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>VALIDADE</p>
                      <p style={{ fontSize:13 }}>{new Date(result.expiryDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>FABRICANTE</p>
                      <p style={{ fontSize:13 }}>{result.manufacturer}</p>
                    </div>
                  </div>
                </div>
                <span style={{
                  background: result.status==="ACTIVE" ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)",
                  color: result.status==="ACTIVE" ? "#4ADE80" : "#FCA5A5",
                  border: `1px solid ${result.status==="ACTIVE" ? "rgba(74,222,128,0.4)" : "rgba(239,68,68,0.4)"}`,
                  fontSize:12, fontWeight:700, padding:"6px 16px", borderRadius:20
                }}>
                  {result.status==="ACTIVE" ? "✓ Ativo" :
                   result.status==="RECALLED" ? "⚠ Recall" :
                   result.status==="EXPIRED" ? "✗ Vencido" : result.status}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <h3 style={{ fontSize:18, fontWeight:700, color:TX, marginBottom:20 }}>
              Histórico de Movimentação ({result.steps.length} etapas)
            </h3>

            {result.steps.length === 0 ? (
              <div style={{ background:"white", borderRadius:16, padding:40, textAlign:"center",
                border:"1px solid rgba(22,163,74,0.12)", color:TX2 }}>
                Nenhuma movimentação registrada ainda.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {result.steps.map((step, i) => {
                  const Icon = STEP_ICON[step.type] ?? Package;
                  const color = STEP_COLOR[step.type] ?? G;
                  return (
                    <div key={i} style={{ background:"white", borderRadius:16, padding:24,
                      border:"1px solid rgba(22,163,74,0.12)",
                      display:"flex", gap:16, alignItems:"flex-start" }}>
                      <div style={{ width:44, height:44, borderRadius:12,
                        background:color+"18", display:"flex", alignItems:"center",
                        justifyContent:"center", flexShrink:0 }}>
                        <Icon size={20} color={color}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                          <span style={{ background:color+"18", color, fontSize:11,
                            fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                            {STEP_LABEL[step.type] ?? step.type}
                          </span>
                          <span style={{ fontSize:12, color:TX2 }}>
                            {new Date(step.date).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(step.date).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                          </span>
                        </div>
                        <p style={{ fontSize:14, color:TX, fontWeight:500, marginBottom:4 }}>
                          {step.from} → {step.to}
                        </p>
                        <p style={{ fontSize:13, color:TX2 }}>{step.qty} unidades</p>
                        {step.conditions && (
                          <div style={{ display:"flex", alignItems:"center", gap:6,
                            marginTop:8, padding:"6px 12px", background:BG,
                            borderRadius:8, width:"fit-content" }}>
                            <Thermometer size={13} color={step.conditions.temp > 25 ? "#EF4444" : G}/>
                            <span style={{ fontSize:12, color:TX2 }}>
                              {step.conditions.temp}°C
                              {step.conditions.humidity ? ` · ${step.conditions.humidity}% umidade` : ""}
                            </span>
                          </div>
                        )}
                        {step.txHash && (
                          <a href={`https://amoy.polygonscan.com/tx/${step.txHash}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display:"inline-flex", alignItems:"center", gap:4,
                              marginTop:8, fontSize:11, color:G, textDecoration:"none",
                              background:"#DCFCE7", padding:"3px 10px", borderRadius:6 }}>
                            <ExternalLink size={10}/>
                            {step.txHash.slice(0,12)}...{step.txHash.slice(-6)}
                          </a>
                        )}
                      </div>
                      <div style={{ fontSize:13, color:TX2, fontWeight:600, flexShrink:0 }}>
                        #{i+1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!result && !error && !tracking && (
          <div style={{ textAlign:"center", padding:"60px 24px", color:TX2 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🦾</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:TX, marginBottom:8 }}>
              Consulte a origem do seu medicamento
            </h3>
            <p style={{ fontSize:14, lineHeight:1.75, maxWidth:400, margin:"0 auto" }}>
              Digite o código GTIN da embalagem acima para visualizar
              todo o histórico de movimentação na blockchain, garantindo
              a autenticidade e procedência do medicamento.
            </p>
          </div>
        )}
      </div>

      <footer style={{ background:"#020F07", padding:"24px", textAlign:"center", marginTop:40 }}>
        <p style={{ color:"#374151", fontSize:12 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados.
          Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
