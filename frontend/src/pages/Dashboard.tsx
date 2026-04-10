import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Package, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { api } from "../lib/api";

interface Stats {
  totalBatches:   number;
  activeRecalls:  number;
  totalTransfers: number;
  expiringCount:  number;
  recentActivity: { date:string; transfers:number }[];
}

function StatCard({ icon: Icon, label, value, color, sub }:
  { icon:any; label:string; value:number|string; color:string; sub?:string }) {
  return (
    <div style={{ background:"white", borderRadius:16, padding:24,
      border:"1px solid rgba(22,163,74,0.12)",
      boxShadow:"0 4px 20px rgba(22,163,74,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:13, color:"#4B6B58", marginBottom:8 }}>{label}</p>
          <p style={{ fontSize:30, fontWeight:800, color:"#0F2417", letterSpacing:"-0.03em" }}>{value}</p>
          {sub && <p style={{ fontSize:12, color:"#4B6B58", marginTop:4 }}>{sub}</p>}
        </div>
        <div style={{ width:44, height:44, borderRadius:12,
          background:`${color}18`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={20} color={color}/>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey:    ["stats"],
    queryFn:     () => api.get("/analytics/stats").then(r => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
      <p style={{ color:"#4B6B58" }}>Carregando dados da blockchain...</p>
    </div>
  );

  return (
    <div style={{ maxWidth:1100 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#0F2417", marginBottom:6 }}>Dashboard</h1>
        <p style={{ color:"#4B6B58", marginBottom:32, fontSize:15 }}>
          Visão geral da cadeia farmacêutica em tempo real
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        <StatCard icon={Package}       label="Lotes Ativos"    value={stats?.totalBatches??0}   color="#16A34A" sub="registrados na blockchain"/>
        <StatCard icon={AlertTriangle} label="Recalls Ativos"  value={stats?.activeRecalls??0}  color="#EF4444" sub="requer ação imediata"/>
        <StatCard icon={Activity}      label="Transferências"  value={stats?.totalTransfers??0} color="#3B82F6" sub="últimas 24h"/>
        <StatCard icon={TrendingUp}    label="Vencendo em 30d" value={stats?.expiringCount??0}  color="#F97316" sub="lotes com validade próxima"/>
      </div>

      <div style={{ background:"white", borderRadius:16, padding:24,
        border:"1px solid rgba(22,163,74,0.12)",
        boxShadow:"0 4px 20px rgba(22,163,74,0.06)" }}>
        <h2 style={{ fontSize:17, fontWeight:700, color:"#0F2417", marginBottom:20 }}>
          Atividade de Transferências
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats?.recentActivity??[]}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize:12, fill:"#4B6B58" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:12, fill:"#4B6B58" }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ border:"1px solid rgba(22,163,74,0.2)", borderRadius:10, fontSize:13 }}/>
            <Area type="monotone" dataKey="transfers" stroke="#16A34A" fill="url(#grad)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
