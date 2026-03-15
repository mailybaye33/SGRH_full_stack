// components/layout/Header.jsx
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";

export default function Header() {
  const location = useLocation();
  const { currentUser, employes } = useApp();
  const [employeeName, setEmployeeName] = useState("");
  
  const titles = {
    // Pages admin
    "/dashboard": "Tableau de bord",
    "/employees": "Employés",
    "/departments": "Départements",
    "/salaries": "Salaires",
    "/leaves": "Congés",
    "/attendance": "Présences",
    "/promotions": "Promotions",
    "/users": "Utilisateurs",
    
    // Pages employé
    "/my-salary": "Mon Salaire",
    "/my-leaves": "Mes Congés",
    "/my-attendance": "Mes Présences",
  };

  // Récupérer le nom de l'employé
  useEffect(() => {
    if (currentUser && employes) {
      const employesList = Array.isArray(employes) ? employes : employes?.results || [];
      const employe = employesList.find(e => String(e.user_id) === String(currentUser.id));
      if (employe) {
        setEmployeeName(`${employe.first_name} ${employe.last_name}`);
      } else {
        setEmployeeName(currentUser?.username || "Utilisateur");
      }
    }
  }, [currentUser, employes]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  const timeStr = now.toLocaleTimeString("fr-FR", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  const isAdmin = currentUser?.role === "ADMIN";
  const currentTitle = titles[location.pathname] || "Tableau de bord";

  // Obtenir l'initiale pour l'avatar
  const getInitial = () => {
    if (employeeName && employeeName !== "Utilisateur") {
      return employeeName.charAt(0).toUpperCase();
    }
    return currentUser?.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <header style={{
      background: "white",
      borderBottom: "1px solid #f1f5f9",
      padding: "20px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
    }}>
      {/* Left side - Title with icon */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #2563eb10, #2563eb20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2563eb",
          fontSize: "20px"
        }}>
          {getIconForPath(location.pathname)}
        </div>
        <div>
          <h1 style={{ 
            fontSize: "24px", 
            fontWeight: 600, 
            color: "#0f172a",
            letterSpacing: "-0.3px",
            marginBottom: "4px"
          }}>
            {currentTitle}
          </h1>
          <span style={{ 
            fontSize: "13px", 
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isAdmin ? "#2563eb" : "#059669"
            }} />
            {isAdmin ? "Espace Administrateur" : "Espace Employé"}
          </span>
        </div>
      </div>

      {/* Right side - Date and user */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Date/Time card */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "#f8fafc",
          padding: "8px 16px",
          borderRadius: "40px",
          border: "1px solid #e2e8f0"
        }}>
          <span style={{ fontSize: "16px" }}>📅</span>
          <span style={{ 
            fontSize: "14px", 
            fontWeight: 500,
            color: "#334155"
          }}>
            {dateStr}
          </span>
          <span style={{ 
            width: "4px", 
            height: "4px", 
            background: "#cbd5e1", 
            borderRadius: "50%" 
          }} />
          <span style={{ 
            fontSize: "14px", 
            fontWeight: 600,
            color: "#2563eb"
          }}>
            {timeStr}
          </span>
        </div>

        {/* User avatar - Maintenant avec le nom complet */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingLeft: "12px",
          borderLeft: "1px solid #e2e8f0"
        }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: 600,
              color: "#0f172a"
            }}>
              {employeeName || currentUser?.username || "Utilisateur"}
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#64748b"
            }}>
              {isAdmin ? "Administrateur" : "Employé"}
            </div>
          </div>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(37,99,235,0.2)"
          }}>
            {getInitial()}
          </div>
        </div>
      </div>
    </header>
  );
}

// Helper function to get icon based on path
function getIconForPath(path) {
  const icons = {
    "/dashboard": "📊",
    "/employees": "👥",
    "/departments": "🏢",
    "/salaries": "💰",
    "/leaves": "🏖️",
    "/attendance": "⏰",
    "/promotions": "📈",
    "/users": "🔐",
    "/my-salary": "💰",
    "/my-leaves": "🏖️",
    "/my-attendance": "⏰"
  };
  return icons[path] || "📋";
}