import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, FileText, Warehouse,
  Activity, Users, LogOut, Wifi, Info
} from "lucide-react";
import { useAuthStore } from "../store/auth";

const NAV = [
  { to:"/about",     icon:Info,            label:"PharmaChain"  },
  { to:"/",          icon:LayoutDashboard, label:"Dashboard"    },
  { to:"/batches",   icon:Package,         label:"Lotes"        },
  { to:"/inventory", icon:Warehouse,       label:"Estoque"      },
  { to:"/rx",        icon:FileText,        label:"Receitas"     },
  { to:"/explorer",  icon:Activity,        label:"Blockchain"   },
  { to:"/users",     icon:Users,           label:"Participantes"},
];

const activeStyle = {
  background: "rgba(0,113,227,0.10)",
  color:      "var(--accent)",
  fontWeight: 600,
};

export default function Layout() {
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate("/login"); }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>

      {/* ── Top Navbar ── */}
      <motion.header
        initial={{ y:-40, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ duration:0.4 }}
        style={{
          position:"sticky", top:0, zIndex:100,
          background:"rgba(10,22,40,0.97)", backdropFilter:"blur(12px)",
          borderBottom:"1px solid rgba(255,255,255,0.08)",
          display:"flex", alignItems:"center",
          padding:"0 28px", height:58, gap:8
        }}
      >
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:24 }}>
          <div style={{
            width:30, height:30, borderRadius:8,
            background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:15
          }}>💊</div>
          <span style={{ color:"white", fontWeight:700, fontSize:15, letterSpacing:"-0.3px" }}>
            PharmaChain
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display:"flex", alignItems:"center", gap:2, flex:1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to==="/"} style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:6,
              padding:"6px 12px", borderRadius:8, fontSize:13,
              color: isActive ? "white" : "rgba(255,255,255,0.6)",
              textDecoration:"none", transition:"all 0.15s",
              background: isActive ? "rgba(59,130,246,0.2)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}>
              <Icon size={14}/> {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background:"rgba(16,185,129,0.15)", padding:"4px 12px", borderRadius:20 }}>
            <Wifi size={12} color="#10b981"/>
            <span style={{ fontSize:11, color:"#10b981", fontWeight:500 }}>Polygon Amoy</span>
          </div>
          <span style={{
            background:"rgba(59,130,246,0.2)", color:"#93c5fd",
            fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20
          }}>{role}</span>
          <button onClick={handleLogout} style={{
            display:"flex", alignItems:"center", gap:6,
            border:"none", background:"rgba(255,255,255,0.08)", cursor:"pointer",
            color:"rgba(255,255,255,0.7)", fontSize:13, borderRadius:8,
            padding:"6px 12px", transition:"background 0.15s"
          }}>
            <LogOut size={14}/> Sair
          </button>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <main style={{ flex:1, padding:"36px 40px", background:"var(--bg)", overflowY:"auto" }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background:"#020817", borderTop:"1px solid rgba(255,255,255,0.06)",
        padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"center"
      }}>
        <p style={{ color:"#475569", fontSize:12, textAlign:"center" }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados. Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>
    </div>
  );
}
