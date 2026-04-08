import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Package, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { api } from "../lib/api";


interface Stats {
  totalBatches:  number;
  activeRecalls: number;
  totalTransfers:number;
  expiringCount: number;
  recentActivity:{ date:string; transfers:number }[];
}


function StatCard({ icon: Icon, label, value, color, sub }:
  { icon:any; label:string; value:number|string; color:string; sub?:string }) {
  return (
    <motion.div className="card"
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      whileHover={{ y:-2, boxShadow:"var(--shadow-lg)" }}
      transition={{ duration:0.3 }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:13, color:"var(--text2)", marginBottom:8 }}>{label}</p>
          <p style={{ fontSize:30, fontWeight:700, letterSpacing:"-0.03em" }}>{value}</p>
          {sub && <p style={{ fontSize:12, color:"var(--text2)", marginTop:4 }}>{sub}</p>}
        </div>
        <div style={{
          width:44, height:44, borderRadius:12,
          background:`rgba(${color},0.10)`,
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <Icon size={20} color={`rgb(${color})`} />
        </div>
      </div>
    </motion.div>
  );
}


export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey:    ["stats"],
    queryFn:     () => api.get("/analytics/stats").then(r => r.data),
    refetchInterval: 30_000, // atualiza a cada 30s automaticamente
  });


  if (isLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
      <p style={{ color:"var(--text2)" }}>Carregando dados da blockchain...</p>
    </div>
  );


  return (
    <div style={{ maxWidth:1100 }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <h1 style={{ fontSize:28, marginBottom:6 }}>Dashboard</h1>
        <p style={{ color:"var(--text2)", marginBottom:32, fontSize:15 }}>
          Visão geral da cadeia farmacêutica em tempo real
        </p>
      </motion.div>


      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        <StatCard icon={Package}       label="Lotes Ativos"     value={stats?.totalBatches??0}   color="0,113,227"   sub="registrados na blockchain" />
        <StatCard icon={AlertTriangle} label="Recalls Ativos"   value={stats?.activeRecalls??0}  color="255,59,48"   sub="requer ação imediata" />
        <StatCard icon={Activity}      label="Transferências"   value={stats?.totalTransfers??0} color="52,199,89"   sub="últimas 24h" />
        <StatCard icon={TrendingUp}    label="Vencendo em 30d"  value={stats?.expiringCount??0}  color="255,149,0"   sub="lotes com validade próxima" />
      </div>


      {/* Chart */}
      <motion.div className="card"
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.15 }}
      >
        <h2 style={{ fontSize:17, marginBottom:20 }}>Atividade de Transferências</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats?.recentActivity??[]}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0071E3" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize:12, fill:"var(--text2)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:12, fill:"var(--text2)" }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ border:"1px solid var(--border)", borderRadius:10, fontSize:13 }}/>
            <Area type="monotone" dataKey="transfers" stroke="#0071E3" fill="url(#grad)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

