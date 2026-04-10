import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock, Cpu, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div style={{ maxWidth:900 }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>

        {/* Hero */}
        <div style={{
          background:"linear-gradient(135deg,#0a1628,#1e3a8a)",
          borderRadius:20, padding:"44px 40px", marginBottom:28, position:"relative", overflow:"hidden"
        }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)" }}/>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)",
            borderRadius:20, padding:"5px 14px", marginBottom:16 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }}/>
            <span style={{ color:"#93c5fd", fontSize:12, fontWeight:500 }}>Rede Blockchain Ativa</span>
          </div>
          <h1 style={{ color:"white", fontSize:36, fontWeight:800, letterSpacing:"-1px", marginBottom:12, lineHeight:1.2 }}>
            PharmaChain — <span style={{ color:"#60a5fa" }}>Rastreabilidade Farmacêutica</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, maxWidth:540, lineHeight:1.75 }}>
            Plataforma blockchain para garantir integridade, transparência e conformidade ANVISA
            em toda a cadeia logística de medicamentos no Brasil — do fabricante ao paciente.
          </p>
        </div>

        {/* 6 cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
          {[
            { icon:Shield,    color:"#3b82f6", bg:"#dbeafe", title:"Conformidade ANVISA",   desc:"RDC 204/2017 · Auditoria completa a qualquer momento." },
            { icon:Zap,       color:"#10b981", bg:"#d1fae5", title:"Tempo Real",             desc:"Transferências e recalls processados em menos de 2s." },
            { icon:Globe,     color:"#8b5cf6", bg:"#ede9fe", title:"Rede 24/7",              desc:"Polygon Amoy — sem servidor central, sempre online." },
            { icon:Lock,      color:"#f59e0b", bg:"#fef3c7", title:"LGPD & Segurança",      desc:"CPFs anonimizados (SHA-256). Receitas em AES-256-GCM." },
            { icon:Cpu,       color:"#ef4444", bg:"#fee2e2", title:"Smart Contracts",        desc:"OpenZeppelin auditado. Lógica imutável, zero intermediários." },
            { icon:BarChart3, color:"#0ea5e9", bg:"#e0f2fe", title:"Analytics em Tempo Real",desc:"Dashboard com métricas de estoque, recalls e vencimentos." },
          ].map(({ icon: Icon, color, bg, title, desc }, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.07 }}
              style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #e2e8f0" }}
              whileHover={{ y:-3, boxShadow:"0 16px 32px rgba(0,0,0,0.08)" }}
            >
              <div style={{ width:40, height:40, borderRadius:11, background:bg,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <Icon size={18} color={color}/>
              </div>
              <h3 style={{ fontSize:14, fontWeight:700, color:"#0a1628", marginBottom:6 }}>{title}</h3>
              <p style={{ fontSize:13, color:"#64748b", lineHeight:1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Fluxo compacto */}
        <div style={{ background:"white", borderRadius:16, padding:32, border:"1px solid #e2e8f0" }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#0a1628", marginBottom:20 }}>
            Fluxo de Rastreabilidade
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto" }}>
            {[
              { step:"01", label:"Fabricante",   desc:"Registra lote",      color:"#3b82f6" },
              { step:"02", label:"Distribuidor", desc:"Assina NF-e",        color:"#8b5cf6" },
              { step:"03", label:"Farmácia",     desc:"Confirma receb.",    color:"#10b981" },
              { step:"04", label:"Médico",       desc:"Emite receita",      color:"#f59e0b" },
              { step:"05", label:"Paciente",     desc:"Retira med.",        color:"#ef4444" },
            ].map((item, i, arr) => (
              <div key={i} style={{ display:"flex", alignItems:"center", flex:1, minWidth:120 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{
                    width:44, height:44, borderRadius:11, background:item.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 8px", color:"white", fontWeight:700, fontSize:12
                  }}>{item.step}</div>
                  <p style={{ fontSize:12, fontWeight:700, color:"#0a1628", marginBottom:2 }}>{item.label}</p>
                  <p style={{ fontSize:11, color:"#94a3b8" }}>{item.desc}</p>
                </div>
                {i < arr.length-1 && <div style={{ width:24, height:2, background:"#e2e8f0", flexShrink:0 }}/>}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
