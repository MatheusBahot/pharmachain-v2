import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, FileText, Warehouse,
  Activity, Users, LogOut, Wifi
} from "lucide-react";
import { useAuthStore } from "../store/auth";


const NAV = [
  { to:"/",          icon:LayoutDashboard, label:"Dashboard"    },
  { to:"/batches",   icon:Package,         label:"Lotes"         },
  { to:"/inventory", icon:Warehouse,        label:"Estoque"       },
  { to:"/rx",        icon:FileText,         label:"Receitas"      },
  { to:"/explorer",  icon:Activity,         label:"Blockchain"    },
  { to:"/users",     icon:Users,            label:"Participantes" },
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
    <div style={{ display:"flex", minHeight:"100vh" }}>


      {/* ── Sidebar ── */}
      <motion.nav
        initial={{ x:-40, opacity:0 }} animate={{ x:0, opacity:1 }}
        transition={{ duration:0.4 }}
        style={{
          width:220, background:"var(--surface)", borderRight:"1px solid var(--border)",
          display:"flex", flexDirection:"column", padding:"24px 12px",
          position:"sticky", top:0, height:"100vh",
        }}
      >
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 8px 28px" }}>
          <div style={{
            width:36, height:36, borderRadius:10, background:"var(--accent)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18
          }}>💊</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, letterSpacing:"-0.02em" }}>PharmaChain</div>
            <div style={{ fontSize:11, color:"var(--text2)", marginTop:1 }}>v2.0</div>
          </div>
        </div>


        {/* Nav items */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to==="/"} style={({ isActive }) => ({
              display:       "flex",
              alignItems:    "center",
              gap:           10,
              padding:       "9px 12px",
              borderRadius:  "var(--r)",
              fontSize:      14,
              color:         "var(--text2)",
              textDecoration:"none",
              transition:    "all 0.15s",
              ...(isActive ? activeStyle : {}),
            })}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>


        {/* Network indicator */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"10px 12px", borderRadius:"var(--r)",
          background:"rgba(52,199,89,0.08)", marginBottom:8
        }}>
          <Wifi size={14} color="var(--green)" />
          <span style={{ fontSize:12, color:"var(--green)", fontWeight:500 }}>
            Polygon Amoy • Online
          </span>
        </div>


        {/* Role badge */}
        <div style={{ padding:"0 8px 16px" }}>
          <span className="badge badge-blue" style={{ fontSize:11 }}>{role}</span>
        </div>


        {/* Logout */}
        <button onClick={handleLogout}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"9px 12px", border:"none", background:"transparent",
            cursor:"pointer", color:"var(--text2)", fontSize:14,
            borderRadius:"var(--r)", width:"100%",
          }}
        >
          <LogOut size={16}/> Sair
        </button>
      </motion.nav>


      {/* ── Main content ── */}
      <main style={{ flex:1, padding:"32px 36px", overflowY:"auto" }}>
        <Outlet />
      </main>


    </div>
  );
}

