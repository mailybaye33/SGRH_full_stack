// Components/layaut/Header.jsx

const titles = {
  // Pages admin
  dashboard: "Tableau de bord",
  employes: "Gestion des Employés",
  departements: "Gestion des Départements",
  salaires: "Gestion des Salaires",
  conges: "Gestion des Congés",
  presences: "Gestion des Présences",
  promotions: "Gestion des Promotions",
  utilisateurs: "Gestion des Utilisateurs",
  
  // Pages employé
  "mon-profil": "Mon Profil",
  "mon-salaire": "Mon Salaire",
  "mes-conges": "Mes Congés",
  "mes-presences": "Mes Présences",
  "mes-promotions": "Mes Promotions",
};

export default function Header({ page }) {
  const now = new Date().toLocaleDateString("fr-FR", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  return (
    <header style={{
      background: "white", 
      borderBottom: "1px solid #e2e8f0",
      padding: "16px 28px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"
    }}>
      <h1 style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: "#0f172a" 
      }}>
        {titles[page] || "Accueil"}
      </h1>
      <span style={{ 
        fontSize: 13, 
        color: "#64748b" 
      }}>
        {now}
      </span>
    </header>
  );
}