// src/pages/admin/Dashboard.jsx
import { useApp } from "../../context/AppContext";
import StatCard from "../../components/layout/StatCard";

export default function Dashboard() {

  const { employes, departements, conges, presences } = useApp();

  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const departementsList = Array.isArray(departements) ? departements : departements?.results || [];
  const congesList = Array.isArray(conges) ? conges : conges?.results || [];
  const presencesList = Array.isArray(presences) ? presences : presences?.results || [];

  const aujourd = new Date().toISOString().split("T")[0];

  // employés actifs
  const actifs = employesList.filter(e => e.actif !== false).length;

  // congés en attente
  const congesEnAttente = congesList.filter(
    c => c.status === "pending" || c.status === "En attente"
  );

  const enAttente = congesEnAttente.length;

  // présents aujourd'hui
  const presentAujourd = presencesList.filter(
    p => p.date === aujourd
  ).length;

  const statsData = {
    total_employees: actifs,
    departments_count: departementsList.length,
    pending_leaves: enAttente,
    present_today: presentAujourd
  };

  return (

    <div>

      {/* STATISTIQUES */}
      <div style={{
        display: "flex",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap"
      }}>

        <StatCard
          icon="👥"
          label="Employés actifs"
          value={statsData.total_employees}
          color="#3b82f6"
        />

        <StatCard
          icon="🏢"
          label="Départements"
          value={statsData.departments_count}
          color="#8b5cf6"
        />

        <StatCard
          icon="🏖️"
          label="Congés en attente"
          value={statsData.pending_leaves}
          color="#f59e0b"
        />

        <StatCard
          icon="✅"
          label="Présents aujourd'hui"
          value={statsData.present_today}
          color="#22c55e"
        />

      </div>


      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20
      }}>


        {/* DERNIERS EMPLOYÉS */}
        <div className="card">

  <h3 style={{
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 16,
    color: "#0f172a"
  }}>
    👥 Derniers employés
  </h3>

  {employesList.length === 0 ? (

    <p style={{ color: "#64748b", fontSize: 14 }}>
      Aucun employé enregistré
    </p>

  ) : (

    employesList.slice(0,5).map(emp => (

      <div
        key={emp.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: "1px solid #f1f5f9"
        }}
      >

        <div>

          <div style={{
            fontWeight: 600,
            fontSize: 14
          }}>
            {emp.first_name} {emp.last_name}
          </div>

          <div style={{
            fontSize: 12,
            color: "#64748b"
          }}>
            {emp.department_name} — {emp.promotion_name}
          </div>

        </div>

        <span className="badge badge-green">
          Actif
        </span>

      </div>

    ))

  )}

</div>


        {/* CONGÉS EN ATTENTE */}
        <div className="card">

          <h3 style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 16,
            color: "#0f172a"
          }}>
            🏖️ Congés en attente
          </h3>

          {congesEnAttente.length === 0 ? (

            <p style={{
              color: "#64748b",
              fontSize: 14
            }}>
              Aucune demande en attente
            </p>

          ) : (

            congesEnAttente.map(c => {

              const emp = employesList.find(
                e => e.id === c.employee
              );

              return (

                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9"
                  }}
                >

                  <div>

                    <div style={{
                      fontWeight: 600,
                      fontSize: 14
                    }}>
                      {emp?.first_name} {emp?.last_name}
                    </div>

                    <div style={{
                      fontSize: 12,
                      color: "#64748b"
                    }}>
                      {c.reason} · {c.start_date} → {c.end_date}
                    </div>

                  </div>

                  <span className="badge badge-yellow">
                    En attente
                  </span>

                </div>

              );

            })

          )}

        </div>

      </div>

    </div>

  );

}