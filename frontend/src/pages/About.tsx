import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock, Cpu, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div style={{ maxWidth:1000 }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>

        {/* Hero */}
        <div style={{
          background:"linear-gradient(135deg,#0a1628,#1e3a8a)",
          borderRadius:20, padding:"52px 48px", marginBottom:32, position:"relative", overflow:"hidden"
        }}>
          <div style={{
            position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)"
          }}/>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)",
            borderRadius:20, padding:"5px 14px", marginBottom:20
          }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }}/>
            <span style={{ color:"#93c5fd", fontSize:12, fontWeight:500 }}>Rede Blockchain Ativa</span>
          </div>
          <h1 style={{ color:"white", fontSize:42, fontWeight:800, letterSpacing:"-1px", marginBottom:16, lineHeight:1.15 }}>
            O que é o<br/><span style={{ color:"#60a5fa" }}>PharmaChain?</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:16, maxWidth:560, lineHeight:1.8 }}>
            Uma plataforma de rastreabilidade farmacêutica baseada em blockchain, projetada para
            garantir a integridade, transparência e conformidade de toda a cadeia logística de
            medicamentos no Brasil — do fabricante ao paciente.
          </p>
        </div>

        {/* Cards principais */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:32 }}>
          {[
            { icon:Shield,   color:"#3b82f6", bg:"#dbeafe", title:"Conformidade ANVISA", desc:"Atende RDC 204/2017 e normativas vigentes. Auditoria completa disponível a qualquer momento." },
            { icon:Zap,      color:"#10b981", bg:"#d1fae5", title:"Tempo Real",           desc:"Transferências, alertas de temperatura e recalls processados em menos de 2 segundos." },
            { icon:Globe,    color:"#8b5cf6", bg:"#ede9fe", title:"Rede Pública",          desc:"Blockchain Polygon Amoy — sem servidor central, disponível 24/7 globalmente." },
            { icon:Lock,     color:"#f59e0b", bg:"#fef3c7", title:"LGPD & Segurança",     desc:"CPFs anonimizados via SHA-256. Receitas criptografadas AES-256-GCM. Zero dados expostos." },
            { icon:Cpu,      color:"#ef4444", bg:"#fee2e2", title:"Smart Contracts",       desc:"Contratos auditados OpenZeppelin. Lógica imutável, sem intermediários humanos." },
            { icon:BarChart3,color:"#0ea5e9", bg:"#e0f2fe", title:"Analytics",             desc:"Dashboard em tempo real com métricas de estoque, transferências e vencimentos." },
          ].map(({ icon: Icon, color, bg, title, desc }, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.08 }}
              style={{
                background:"white", borderRadius:16, padding:28,
                border:"1px solid #e2e8f0", transition:"transform 0.2s,box-shadow 0.2s"
              }}
              whileHover={{ y:-4, boxShadow:"0 20px 40px rgba(0,0,0,0.08)" }}
            >
              <div style={{
                width:44, height:44, borderRadius:12, background:bg,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16
              }}>
                <Icon size={20} color={color}/>
              </div>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#0a1628", marginBottom:8 }}>{title}</h3>
              <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Fluxo */}
        <div style={{
          background:"white", borderRadius:20, padding:40,
          border:"1px solid #e2e8f0", marginBottom:32
        }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#0a1628", marginBottom:8 }}>
            Fluxo de Rastreabilidade
          </h2>
          <p style={{ color:"#64748b", fontSize:14, marginBottom:32 }}>
            Cada etapa gera um registro imutável na blockchain, verificável por qualquer participante autorizado.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto" }}>
            {[
              { step:"01", label:"Fabricante", desc:"Registra lote + GTIN", color:"#3b82f6" },
              { step:"02", label:"Distribuidor", desc:"Recebe + assina NF-e", color:"#8b5cf6" },
              { step:"03", label:"Farmácia", desc:"Confirma recebimento", color:"#10b981" },
              { step:"04", label:"Médico", desc:"Emite receita digital", color:"#f59e0b" },
              { step:"05", label:"Paciente", desc:"Retira medicamento", color:"#ef4444" },
            ].map((item, i, arr) => (
              <div key={i} style={{ display:"flex", alignItems:"center", flex:1, minWidth:140 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{
                    width:48, height:48, borderRadius:12, background:item.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 10px", color:"white", fontWeight:700, fontSize:13
                  }}>{item.step}</div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#0a1628", marginBottom:4 }}>{item.label}</p>
                  <p style={{ fontSize:11, color:"#64748b" }}>{item.desc}</p>
                </div>
                {i < arr.length-1 && (
                  <div style={{ width:32, height:2, background:"#e2e8f0", flexShrink:0 }}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            { num:"100%", label:"Rastreabilidade", color:"#3b82f6" },
            { num:"< 2s", label:"Registro blockchain", color:"#10b981" },
            { num:"0",    label:"Ponto central de falha", color:"#f59e0b" },
            { num:"24/7", label:"Disponibilidade", color:"#8b5cf6" },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.5+i*0.1 }}
              style={{
                background:"white", borderRadius:16, padding:"28px 20px",
                border:"1px solid #e2e8f0", textAlign:"center"
              }}
            >
              <p style={{ fontSize:38, fontWeight:800, color:item.color, marginBottom:8 }}>{item.num}</p>
              <p style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
