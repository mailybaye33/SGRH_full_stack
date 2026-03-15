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

  const { currentUser, logout } = useApp();

  const location = useLocation();

  const isAdmin = currentUser?.role === "ADMIN";

  const menu = isAdmin ? menuAdmin : menuEmploye;

  return (

    <aside
      style={{
        width: 240,
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
      }}
    >

      {/* Logo */}

      <div
        style={{
          padding: "24px 20px 16px",
          borderBottom: "1px solid #1e293b",
        }}
      >

        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#60a5fa",
          }}
        >
          🏢 Gestion RH
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#475569",
            marginTop: 4,
          }}
        >
          {isAdmin ? "Administrateur" : "Espace Employé"}
        </div>

      </div>

      {/* Menu */}

      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
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
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                background: active ? "#1e40af" : "transparent",
                color: active ? "white" : "#94a3b8",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
              }}
            >

              <span>{item.icon}</span>

              <span>{item.label}</span>

            </Link>

          );

        })}

      </nav>

      {/* Utilisateur */}

      <div
        style={{
          padding: "16px 10px",
          borderTop: "1px solid #1e293b",
        }}
      >

        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            padding: "0 12px 8px",
          }}
        >

          <div>{currentUser?.email}</div>

          <div
            style={{
              marginTop: 4,
              fontSize: 10,
              color: isAdmin ? "#fbbf24" : "#94a3b8",
            }}
          >
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
            width: "100%",
          }}
        >

          🚪 Déconnexion

        </button>

      </div>

    </aside>

  );

}