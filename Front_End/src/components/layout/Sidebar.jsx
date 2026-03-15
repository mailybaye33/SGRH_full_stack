// components/layout/Sidebar.jsx
import { useApp } from "../../context/AppContext";
import { Link, useLocation } from "react-router-dom";

const menuAdmin = [
  { path: "/dashboard", icon: "📊", label: "Tableau de bord" },
  { path: "/employees", icon: "👥", label: "Employés" },
  { path: "/departments", icon: "🏢", label: "Départements" },
  { path: "/salaries", icon: "💰", label: "Salaires" },
  { path: "/leaves", icon: "🏖️", label: "Congés" },
  { path: "/attendance", icon: "⏰", label: "Présences" },
  { path: "/promotions", icon: "📈", label: "Promotions" },
  { path: "/users", icon: "🔐", label: "Utilisateurs" },
];

const menuEmploye = [
  { path: "/dashboard", icon: "📊", label: "Tableau de bord" },
  { path: "/my-salary", icon: "💰", label: "Mon salaire" },
  { path: "/my-leaves", icon: "🏖️", label: "Mes congés" },
  { path: "/my-attendance", icon: "⏰", label: "Mes présences" },
];

export default function Sidebar() {
  const { currentUser, employes, logout } = useApp();
  const location = useLocation();
  const isAdmin = currentUser?.role === "ADMIN";
  const menu = isAdmin ? menuAdmin : menuEmploye;

  // Trouver l'employé connecté dans la liste des employés
  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const employe = employesList.find(e => String(e.user_id) === String(currentUser?.id));

  // Récupérer le prénom et nom
  const firstName = employe?.first_name || currentUser?.username?.split(' ')[0] || "Utilisateur";
  const lastName = employe?.last_name || "";
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const email = employe?.email || currentUser?.email || "";

  // Initiales pour l'avatar
  const getInitials = () => {
    if (employe?.first_name && employe?.last_name) {
      return `${employe.first_name.charAt(0)}${employe.last_name.charAt(0)}`.toUpperCase();
    }
    return currentUser?.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <aside
      style={{
        width: 280,
        background: "white",
        color: "#1e293b",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        borderRight: "1px solid #f1f5f9",
        boxShadow: "2px 0 12px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              boxShadow: "0 8px 16px rgba(37,99,235,0.2)",
            }}
          >
            🏢
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.5px",
            }}
          >
            Gestion RH
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            paddingLeft: "56px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isAdmin ? "#2563eb" : "#059669",
            }}
          />
          {isAdmin ? "Administrateur" : "Espace Employé"}
        </div>
      </div>

      {/* Menu */}
      <nav
        style={{
          flex: 1,
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                background: active ? "#f0f9ff" : "transparent",
                borderLeft: active ? "4px solid #2563eb" : "4px solid transparent",
                color: active ? "#2563eb" : "#64748b",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.color = "#334155";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#2563eb",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section avec prénom et nom */}
      <div
        style={{
          margin: "20px 16px",
          padding: "16px",
          borderRadius: "16px",
          background: "#f8fafc",
          border: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
            }}
          >
            {getInitials()}
          </div> */}
          {/* <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: "2px",
              }}
            >
              {fullName}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>{isAdmin ? "🔑" : "👤"}</span>
              {isAdmin ? "Administrateur" : "Employé"}
            </div>
          </div> */}
        </div>

        {/* Email de l'utilisateur
        {email && (
          <div style={{
            fontSize: "11px",
            color: "#64748b",
            marginBottom: "12px",
            padding: "4px 0",
            borderTop: "1px dashed #e2e8f0",
            borderBottom: "1px dashed #e2e8f0",
            textAlign: "center"
          }}>
            {email}
          </div>
        )} */}

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background: "white",
            color: "#ef4444",
            width: "100%",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            border: "1px solid #fee2e2",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fef2f2";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#fee2e2";
          }}
        >
          <span>🚪</span>
          Déconnexion
        </button>
      </div>

      {/* Version Info */}
      <div
        style={{
          padding: "16px 24px",
          fontSize: "11px",
          color: "#94a3b8",
          borderTop: "1px solid #f1f5f9",
          textAlign: "center",
        }}
      >
        Version 2.0.0
      </div>
    </aside>
  );
}