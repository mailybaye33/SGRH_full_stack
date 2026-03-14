// Components/layaut/Sidebar.jsx
import { Component } from "lucide-react";
import { useApp } from "../../context/AppContext";

const menuAdmin = [
  { id: "dashboard", icon: "📊", label: "Tableau de bord" },
  { id: "employes", icon: "👥", label: "Employés" },
  { id: "departements", icon: "🏢", label: "Départements" },
  { id: "salaires", icon: "💰", label: "Salaires" },
  { id: "conges", icon: "🏖️", label: "Congés" },
  { id: "presences", icon: "⏰", label: "Présences" },
  { id: "promotions", icon: "📈", label: "Promotions" },
  { id: "utilisateurs", icon: "🔐", label: "Utilisateurs" },
];

const menuEmploye = [
  { id: "dashboard-employe", icon: "📊", label: "Tableau de bord" },
  { id: "mon-salaire", icon: "💰", label: "Mon salaire" },
  { id: "mes-conges", icon: "🏖️", label: "Mes congés" },
  { id: "mes-presences", icon: "⏰", label: "Mes présences" },
];

export default function Sidebar({ page, setPage }) {
  const { currentUser, logout } = useApp();
  const isAdmin = currentUser?.role === "ADMIN";
  const menu = isAdmin ? menuAdmin : menuEmploye;

  return (
    <aside style={{
      width: 240, 
      background: "#0f172a", 
      color: "white",
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      position: "sticky", 
      top: 0, 
      height: "100vh"
    }}>
      {/* Logo */}
      <div style={{ 
        padding: "24px 20px 16px", 
        borderBottom: "1px solid #1e293b" 
      }}>
        <div style={{ 
          fontSize: 20, 
          fontWeight: 800, 
          color: "#60a5fa", 
          letterSpacing: "-0.5px" 
        }}>
          🏢 Gestion RH
        </div>
        <div style={{ 
          fontSize: 11, 
          color: "#475569", 
          marginTop: 4 
        }}>
          {isAdmin ? "Administrateur" : "Espace Employé"}
        </div>
      </div>

      {/* Menu */}
      <nav style={{ 
        flex: 1, 
        padding: "12px 10px", 
        display: "flex", 
        flexDirection: "column", 
        gap: 2 
      }}>
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", 
              alignItems: "center", 
              gap: 10,
              padding: "10px 12px", 
              borderRadius: 8, 
              border: "none", 
              cursor: "pointer",
              background: page === item.id ? "#1e40af" : "transparent",
              color: page === item.id ? "white" : "#94a3b8",
              fontSize: 14, 
              fontWeight: page === item.id ? 600 : 400,
              transition: "all 0.15s", 
              textAlign: "left", 
              width: "100%",
            }}
            onMouseEnter={e => page !== item.id && (e.target.style.background = "#1e293b")}
            onMouseLeave={e => page !== item.id && (e.target.style.background = "transparent")}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Info utilisateur et logout */}
      <div style={{ 
        padding: "16px 10px", 
        borderTop: "1px solid #1e293b" 
      }}>
        <div style={{ 
          fontSize: 12, 
          color: "#94a3b8", 
          padding: "0 12px 8px", 
          wordBreak: "break-all" 
        }}>
          <div>{currentUser?.email}</div>
          {currentUser?.employeeName && (
            <div style={{ color: "#60a5fa", marginTop: 2, fontSize: 11 }}>
              👤 {currentUser.employeeName}
            </div>
          )}
          <div style={{ 
            marginTop: 4, 
            fontSize: 10, 
            color: isAdmin ? "#fbbf24" : "#94a3b8",
            fontWeight: isAdmin ? 600 : 400
          }}>
            {isAdmin ? "🔑 Administrateur" : "👤 Employé"}
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            padding: "10px 12px", 
            borderRadius: 8, 
            border: "none", 
            cursor: "pointer",
            background: "transparent", 
            color: "#ef4444", 
            fontSize: 14, 
            width: "100%",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.target.style.background = "#1e293b"}
          onMouseLeave={e => e.target.style.background = "transparent"}
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
