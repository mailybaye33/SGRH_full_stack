/* src/pages/Login.jsx */

import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Login() {

  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    const success = await login(email, password);

    if (!success) {
      setError("Email ou mot de passe incorrect.");
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
    }}>

      <div style={{
        background: "white",
        borderRadius: 24,
        padding: "52px 44px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)"
      }}>

        {/* Header */}

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "linear-gradient(135deg,#1e40af,#3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            margin: "0 auto 20px"
          }}>
            🏢
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800 }}>
            Gestion RH
          </h1>

          <p style={{ color: "#64748b" }}>
            Connectez-vous à votre espace
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="form-group">

            <label>Email</label>

            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>Mot de passe</label>

            <div style={{ position:"relative" }}>

              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                style={{
                  position:"absolute",
                  right:10,
                  top:"50%",
                  transform:"translateY(-50%)",
                  border:"none",
                  background:"none",
                  cursor:"pointer"
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div style={{
              background:"#fee2e2",
              color:"#dc2626",
              padding:10,
              borderRadius:8,
              marginBottom:12,
              fontSize:13
            }}>
              ⚠ {error}
            </div>

          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width:"100%", height:50 }}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

        </form>

        <p style={{
          textAlign:"center",
          fontSize:12,
          marginTop:20,
          color:"#94a3b8"
        }}>
          © 2024 Gestion RH
        </p>

      </div>

    </div>
  );
}