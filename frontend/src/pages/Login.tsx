import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";


export default function Login() {
  const [cnpj, setCnpj]         = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const login    = useAuthStore(s => s.login);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { cnpj, password });
      login(data.token, data.role, data.address, data.participantId);
      navigate("/");
      toast.success("Bem-vindo ao PharmaChain");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)"
    }}>
      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:[0.25,0.46,0.45,0.94] }}
        className="card"
        style={{ width: 380, padding: 40 }}
      >
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:56, height:56, borderRadius:16, background:"var(--accent)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 16px", fontSize:24
          }}>💊</div>
          <h1 style={{ fontSize:22, marginBottom:4 }}>PharmaChain</h1>
          <p style={{ color:"var(--text2)", fontSize:14 }}>
            Rastreabilidade farmacêutica em blockchain
          </p>
        </div>


        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:"block", marginBottom:6 }}>
              CNPJ
            </label>
            <input className="input" type="text" placeholder="00.000.000/0001-00"
              value={cnpj} onChange={e => setCnpj(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:"block", marginBottom:6 }}>
              Senha
            </label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit"
            style={{ marginTop:8, height:44, fontSize:15, width:"100%" }}
            disabled={loading}
          >
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

