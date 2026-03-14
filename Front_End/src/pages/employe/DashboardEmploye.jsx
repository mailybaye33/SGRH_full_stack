// src /pages/employe/DashboardEmploye.jsx
import { useApp } from "../../context/AppContext";

export default function DashboardEmploye() {

  const { employes, promotions, conges, currentUser } = useApp();

  if (!currentUser) {
    return <p>Chargement...</p>;
  }

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const promotionsList = Array.isArray(promotions)
    ? promotions
    : promotions?.results || [];

  const congesList = Array.isArray(conges)
    ? conges
    : conges?.results || [];

  // si les employés ne sont pas encore chargés
  if (!employesList || employesList.length === 0) {
    return <p>Chargement des données...</p>;
  }

  // trouver l'employé connecté
  const employe = employesList.find(
    e => String(e.user_id) === String(currentUser.id)
  );

  if (!employe) {
    return (
      <div className="card">
        <h2>Tableau de bord</h2>
        <p>Aucun profil trouvé</p>
      </div>
    );
  }

  // trouver la promotion
  const promotion = promotionsList.find(
    p => p.id === employe.promotion
  );

  // congés de l'employé
  const mesConges = congesList.filter(
    c => c.employee === employe.id
  );

  const congesValides = mesConges.filter(
    c => c.status === "approved"
  ).length;

  const congesAttente = mesConges.filter(
    c => c.status === "pending"
  ).length;

  return (

    <div>

      <h2 style={{ marginBottom: 20 }}>Tableau de bord</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20
        }}
      >

        <div className="card">
          <h3>Mon profil</h3>

          <p><b>Nom :</b> {employe.first_name} {employe.last_name}</p>
          <p><b>Email :</b> {employe.email}</p>
          <p><b>Téléphone :</b> {employe.phone || "-"}</p>
          <p><b>Département :</b> {employe.name || "-"}</p>
        </div>

        <div className="card">
          <h3>Ma promotion</h3>

          <p><b>Poste :</b> {promotion?.name || "-"}</p>
          <p><b>Salaire horaire :</b> {promotion?.base_salary || "-"}</p>
        </div>

        <div className="card">
          <h3>Congés validés</h3>
          <h1>{congesValides}</h1>
        </div>

        <div className="card">
          <h3>Congés en attente</h3>
          <h1>{congesAttente}</h1>
        </div>

      </div>

    </div>

  );
}