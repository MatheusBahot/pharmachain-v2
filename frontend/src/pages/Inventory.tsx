import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


export default function Inventory() {
  const { participantId } = useAuthStore();


  const { data: stock = [], isLoading } = useQuery({
    queryKey:  ["stock", participantId],
    queryFn:   () => api.get(`/batches/stock/${participantId}`).then(r => r.data),
    refetchInterval: 10_000,
    enabled:   !!participantId,
  });


  const chartData = stock.slice(0, 10).map((s:any) => ({
    name:  s.productName?.slice(0,18) ?? "...",
    qty:   s.quantity,
    expiring: new Date(s.expiryDate) < new Date(Date.now() + 30*24*60*60*1000),
  }));


  return (
    <div style={{ maxWidth:1100 }}>
      <h1 style={{ fontSize:28, marginBottom:6 }}>Estoque</h1>
      <p style={{ color:"var(--text2)", marginBottom:28 }}>
        Atualização automática a cada 10 segundos via blockchain
      </p>


      {/* Gráfico */}
      <motion.div className="card" style={{ marginBottom:24 }}
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      >
        <h2 style={{ fontSize:16, marginBottom:18 }}>Quantidade por Produto (Top 10)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize:11, fill:"var(--text2)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:11, fill:"var(--text2)" }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ border:"1px solid var(--border)", borderRadius:10, fontSize:12 }}/>
            <Bar dataKey="qty" radius={[6,6,0,0]}>
              {chartData.map((d:any, i:number) => (
                <Cell key={i} fill={d.expiring ? "#FF9500" : "#0071E3"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize:12, color:"var(--text2)", marginTop:8 }}>
Laranja = vence em menos de 30 dias
        </p>
      </motion.div>


      {/* Tabela */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr>
            <th>Produto</th><th>GTIN</th><th>Lote</th>
            <th>Validade</th><th>Estoque</th><th>Alerta</th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign:"center", padding:40, color:"var(--text2)" }}>Carregando...</td></tr>
            ) : stock.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:"center", padding:40, color:"var(--text2)" }}>Sem itens no estoque</td></tr>
            ) : stock.map((s:any) => {
              const exp = new Date(s.expiryDate);
              const days = Math.floor((exp.getTime()-Date.now())/86400000);
              const alert = days < 0 ? "Vencido" : days < 30 ? `${days}d restantes` : "";
              return (
                <tr key={s.batchId}>
                  <td style={{ fontWeight:500 }}>{s.productName}</td>
                  <td style={{ fontFamily:"monospace", fontSize:12 }}>{s.gtin}</td>
                  <td>{s.lot}</td>
                  <td>{format(exp,"dd/MM/yyyy",{locale:ptBR})}</td>
                  <td><strong>{s.quantity}</strong> un.</td>
                  <td>{alert && <span className={`badge ${days<0?"badge-red":"badge-orange"}`}>{alert}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

