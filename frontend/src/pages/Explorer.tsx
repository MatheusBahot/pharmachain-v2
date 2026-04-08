import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


export default function Explorer() {
  const [search, setSearch] = useState("");


  const { data: transfers = [], isLoading } = useQuery({
    queryKey:  ["explorer"],
    queryFn:   () => api.get("/transfers?limit=50").then(r => r.data),
    refetchInterval: 8_000,
  });


  const filtered = transfers.filter((t:any) =>
    t.txHash?.includes(search) ||
    t.batch?.productName?.toLowerCase().includes(search.toLowerCase()) ||
    t.from?.name?.toLowerCase().includes(search.toLowerCase())
  );


  const typeColor: Record<string,string> = {
    DISTRIBUTE: "badge-blue",
    RECEIVE:    "badge-green",
    DISPENSE:   "badge-orange",
    RETURN:     "badge-red",
  };


  return (
    <div style={{ maxWidth:1100 }}>
      <h1 style={{ fontSize:28, marginBottom:6 }}>Blockchain Explorer</h1>
      <p style={{ color:"var(--text2)", marginBottom:28 }}>
        Histórico imutável de transações • Polygon Amoy Testnet
      </p>


      <div style={{ position:"relative", marginBottom:20 }}>
        <Search size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text2)" }}/>
        <input className="input" style={{ paddingLeft:38 }}
          placeholder="Buscar por hash, produto ou participante..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>


      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr>
            <th>Tx Hash</th><th>Produto</th><th>Tipo</th>
            <th>De → Para</th><th>Qtd</th><th>Data</th><th>Polygonscan</th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"var(--text2)" }}>Sincronizando com blockchain...</td></tr>
            ) : filtered.map((t:any) => (
              <motion.tr key={t.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
              >
                <td style={{ fontFamily:"monospace", fontSize:11, color:"var(--accent)" }}>
                  {t.txHash ? `${t.txHash.slice(0,8)}...${t.txHash.slice(-6)}` : "pending"}
                </td>
                <td style={{ fontWeight:500 }}>{t.batch?.productName ?? "-"}</td>
                <td><span className={`badge ${typeColor[t.type]??""}`}>{t.type}</span></td>
                <td style={{ fontSize:12, color:"var(--text2)" }}>
                  {t.from?.name?.slice(0,14)} → {t.to?.name?.slice(0,14)}
                </td>
                <td>{t.quantity} un.</td>
                <td style={{ fontSize:12 }}>
                  {format(new Date(t.createdAt),"dd/MM HH:mm",{locale:ptBR})}
                </td>
                <td>
                  {t.txHash && (
                    <a href={`https://amoy.polygonscan.com/tx/${t.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost" style={{ padding:"3px 8px", fontSize:11 }}
                    >
                      <ExternalLink size={11}/> Ver
                    </a>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

