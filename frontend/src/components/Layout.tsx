import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FileText, Warehouse,
  Activity, Users, LogOut, Wifi, Info
} from "lucide-react";
import { useAuthStore } from "../store/auth";

const NAV = [
  { to:"/about",         icon:Info,            label:"PharmaChain"  },
  { to:"/",              icon:LayoutDashboard, label:"Dashboard"    },
  { to:"/batches",       icon:Package,         label:"Lotes"        },
  { to:"/inventory",     icon:Warehouse,       label:"Estoque"      },
  { to:"/prescriptions", icon:FileText,        label:"Receitas"     },
  { to:"/explorer",      icon:Activity,        label:"Blockchain"   },
  { to:"/users",         icon:Users,           label:"Participantes"},
];

export default function Layout() {
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate("/login"); }

  return (
    <div style={{
      display:"flex", flexDirection:"column", minHeight:"100vh",
      background:"#F0FAF4", fontFamily:"'Plus Jakarta Sans',sans-serif"
    }}>

      {/* ── Top Navbar ── */}
      <header style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(255,255,255,0.95)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(22,163,74,0.12)",
        boxShadow:"0 2px 20px rgba(22,163,74,0.06)",
        display:"flex", alignItems:"center",
        padding:"0 28px", height:60, gap:8
      }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:20 }}>
          <div style={{
            width:32, height:32, borderRadius:9,
            background:"linear-gradient(135deg,#16A34A,#4ADE80)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, boxShadow:"0 4px 12px rgba(22,163,74,0.3)"
          }}>💊</div>
          <span style={{ color:"#0F2417", fontWeight:800, fontSize:15, letterSpacing:"-0.3px" }}>
            PharmaChain
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display:"flex", alignItems:"center", gap:2, flex:1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to==="/"} style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:6,
              padding:"6px 11px", borderRadius:8, fontSize:13,
              color: isActive ? "#16A34A" : "#4B6B58",
              textDecoration:"none", transition:"all 0.15s",
              background: isActive ? "#DCFCE7" : "transparent",
              fontWeight: isActive ? 700 : 500,
            })}>
              <Icon size={14}/> {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            background:"#DCFCE7", padding:"4px 12px", borderRadius:20
          }}>
            <Wifi size={12} color="#16A34A"/>
            <span style={{ fontSize:11, color:"#16A34A", fontWeight:600 }}>Polygon Amoy</span>
          </div>
          <span style={{
            background:"#F0FAF4", color:"#16A34A",
            border:"1px solid rgba(22,163,74,0.2)",
            fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20
          }}>{role}</span>
          <button onClick={handleLogout} style={{
            display:"flex", alignItems:"center", gap:6,
            border:"1px solid rgba(22,163,74,0.15)",
            background:"white", cursor:"pointer", color:"#4B6B58",
            fontSize:13, borderRadius:8, padding:"6px 10px", fontFamily:"inherit"
          }}>
            <LogOut size={14}/> Sair
          </button>
        </div>

      </header>

      {/* ── Main ── */}
      <main style={{ flex:1, padding:"36px 40px", background:"#F0FAF4" }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background:"#020F07", borderTop:"1px solid rgba(22,163,74,0.1)",
        padding:"16px 40px", textAlign:"center"
      }}>
        <p style={{ color:"#374151", fontSize:12 }}>
          Copyright © 2026 PharmaChain. Todos os direitos reservados.
          Matheus Augusto Roseira Santana · Salvador, Bahia.
        </p>
      </footer>

    </div>
  );
}
