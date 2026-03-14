// src/pages/admin/Conges.jsx

import { useApp } from "../../context/AppContext";

export default function Conges() {

  const { conges, employes, updateCongeStatus } = useApp();

  const congesList = Array.isArray(conges)
    ? conges
    : conges?.results || [];

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const getStatusLabel = (status) => {

    if (status === "pending") return "En attente";
    if (status === "approved") return "Accepté";
    if (status === "rejected") return "Refusé";

    return status;

  };

  const handleApprove = (id) => {
    updateCongeStatus(id, "approved");
  };

  const handleReject = (id) => {
    updateCongeStatus(id, "rejected");
  };

  return (

    <div className="card">

      <h2 className="page-title">Gestion des congés</h2>

      <table>

        <thead>

          <tr>

            <th>Employé</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Statut</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {congesList.map(c => {

            const emp = employesList.find(
              e => e.id === c.employee
            );

            const isDisabled = c.status !== "pending";

            return (

              <tr key={c.id}>

                <td>
                  {emp?.first_name} {emp?.last_name}
                </td>

                <td>{c.start_date}</td>

                <td>{c.end_date}</td>

                <td>{getStatusLabel(c.status)}</td>

                <td>

                  <button
                    disabled={isDisabled}
                    onClick={() => handleApprove(c.id)}
                    style={{
                      background: "#22c55e",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      marginRight: 6,
                      borderRadius: 4,
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer"
                    }}
                  >
                    Accepter
                  </button>

                  <button
                    disabled={isDisabled}
                    onClick={() => handleReject(c.id)}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 4,
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer"
                    }}
                  >
                    Refuser
                  </button>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );

}