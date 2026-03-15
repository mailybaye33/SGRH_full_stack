/* src/pages/Login.jsx */

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const errors = {};

    if (!email) {
      errors.email = "L'email est requis";
    } else if (!validateEmail(email)) {
      errors.email = "Format d'email invalide";
    }

    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (!validatePassword(password)) {
      errors.password = "Minimum 6 caractères";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors({ ...fieldErrors, email: null });
    }
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors({ ...fieldErrors, password: null });
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Email ou mot de passe incorrect.");
      }
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) return null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        borderRadius: "32px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 20px 40px rgba(0,0,0,0.03), 0 8px 20px rgba(0,0,0,0.02)"
      }}>
        {/* Logo et titre */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            margin: "0 auto 20px",
            color: "white",
            boxShadow: "0 12px 24px rgba(37,99,235,0.2)"
          }}>
            🏢
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: "8px",
            letterSpacing: "-0.5px"
          }}>
            Gestion RH
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: "15px"
          }}>
            Connectez-vous à votre espace
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* EMAIL */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 500,
              color: "#475569",
              marginBottom: "6px"
            }}>
              Email <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "16px",
                color: fieldErrors.email ? "#dc2626" : "#94a3b8",
                zIndex: 1
              }}>
                ✉️
              </span>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={(e) => {
                  if (!fieldErrors.email) {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (email && !validateEmail(email)) {
                    setFieldErrors({
                      ...fieldErrors,
                      email: "Format email invalide"
                    });
                  }
                  if (!fieldErrors.email) {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }
                }}
                placeholder="email@exemple.com"
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  borderRadius: "16px",
                  border: `2px solid ${fieldErrors.email ? "#dc2626" : "#e2e8f0"}`,
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "#ffffff"
                }}
              />
            </div>
            {fieldErrors.email && (
              <p style={{
                color: "#dc2626",
                fontSize: "12px",
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span style={{ fontSize: "14px" }}>⚠️</span>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 500,
              color: "#475569",
              marginBottom: "6px"
            }}>
              Mot de passe <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "16px",
                color: fieldErrors.password ? "#dc2626" : "#94a3b8",
                zIndex: 1
              }}>
                🔒
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onFocus={(e) => {
                  if (!fieldErrors.password) {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (password && !validatePassword(password)) {
                    setFieldErrors({
                      ...fieldErrors,
                      password: "Minimum 6 caractères"
                    });
                  }
                  if (!fieldErrors.password) {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }
                }}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 44px",
                  borderRadius: "16px",
                  border: `2px solid ${fieldErrors.password ? "#dc2626" : "#e2e8f0"}`,
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "#ffffff"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: fieldErrors.password ? "#dc2626" : "#64748b",
                  padding: "4px",
                  zIndex: 2
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {fieldErrors.password && (
              <p style={{
                color: "#dc2626",
                fontSize: "12px",
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span style={{ fontSize: "14px" }}>⚠️</span>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* GLOBAL ERROR */}
          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "14px 16px",
              borderRadius: "14px",
              marginBottom: "24px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #fecaca"
            }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: loading ? "none" : "0 8px 20px rgba(37,99,235,0.25)",
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#1d4ed8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid white",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></span>
                Connexion...
              </>
            ) : (
              <>
                <span>🔐</span>
                Se connecter
              </>
            )}
          </button>

          {/* Mot de passe oublié */}
          <div style={{
            textAlign: "center",
            marginTop: "20px"
          }}>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "4px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#2563eb"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid #f1f5f9",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "12px",
            color: "#94a3b8"
          }}>
            © 2024 Gestion RH. Tous droits réservés.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}