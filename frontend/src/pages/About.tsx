import { Shield, Zap, Globe, Lock, Cpu, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ background:"linear-gradient(135deg,#0F2417,#14532D)",
        borderRadius:22, padding:"44px 40px", marginBottom:28,
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(74,222,128,0.15) 0%,transparent 70%)" }}/>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)",
          borderRadius:20, padding:"5px 14px", marginBottom:16 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80" }}/>
          <span style={{ color:"#4ADE80", fontSize:12, fontWeight:600 }}>Rede Blockchain Ativa</span>
        </div>
        <h1 style={{ color:"white", fontSize:36, fontWeight:800, letterSpacing:"-1px",
          marginBottom:12, lineHeight:1.2 }}>
          PharmaChain — <span style={{ color:"#4ADE80" }}>Rastreabilidade Farmacêutica</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, maxWidth:540, lineHeight:1.8 }}>
          Plataforma blockchain para garantir integridade, transparência e conformidade ANVISA
          em toda a cadeia logística de medicamentos no Brasil — do fabricante ao paciente.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[
          { icon:Shield,    color:"#16A34A", bg:"#DCFCE7", title:"Conformidade ANVISA",    desc:"RDC 204/2017 · Auditoria completa a qualquer momento." },
          { icon:Zap,       color:"#0EA5E9", bg:"#E0F2FE", title:"Tempo Real",              desc:"Transferências e recalls processados em menos de 2s." },
          { icon:Globe,     color:"#8B5CF6", bg:"#EDE9FE", title:"Rede 24/7",               desc:"Polygon Amoy — sem servidor central, sempre online." },
          { icon:Lock,      color:"#F97316", bg:"#FEF3C7", title:"LGPD & Segurança",       desc:"CPFs anonimizados (SHA-256). Receitas em AES-256-GCM." },
          { icon:Cpu,       color:"#EF4444", bg:"#FEE2E2", title:"Smart Contracts",         desc:"OpenZeppelin auditado. Lógica imutável, zero intermediários." },
          { icon:BarChart3, color:"#16A34A", bg:"#DCFCE7", title:"Analytics em Tempo Real", desc:"Dashboard com métricas de estoque, recalls e vencimentos." },
        ].map(({ icon: Icon, color, bg, title, desc }, i) => (
          <div key={i} style={{ background:"white", borderRadius:16, padding:24,
            border:"1px solid rgba(22,163,74,0.12)",
            transition:"transform .2s,box-shadow .2s" }}>
            <div style={{ width:42, height:42, borderRadius:11, background:bg,
              display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <Icon size={18} color={color}/>
            </div>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#0F2417", marginBottom:6 }}>{title}</h3>
            <p style={{ fontSize:13, color:"#4B6B58", lineHeight:1.7 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
