// src /pages/employe/MesConges.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function MesConges() {

  const { conges, employes, currentUser, addConge } = useApp();

  const [showModal, setShowModal] = useState(false);

  const [reason, setReason] = useState("Congé annuel");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!currentUser) return <p>Chargement...</p>;

  const employe = employes.find(
    e => String(e.user_id) === String(currentUser.id)
  );

  if (!employe) return <p>Profil employé introuvable</p>;

  const mesConges = conges.filter(
    c => c.employee === employe.id
  );

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await addConge({
        employee: employe.id,
        reason: reason,
        start_date: startDate,
        end_date: endDate
      });

      setShowModal(false);

      setStartDate("");
      setEndDate("");
      setReason("Congé annuel");

    } catch (error) {

      console.error(error);
      alert("Erreur lors de l'envoi");

    }

  };
  const getStatusLabel = (status) => {

  if (status === "pending") return "En attente";
  if (status === "approved") return "Accepté";
  if (status === "rejected") return "Refusé";

  return status;

};

  return (

    <div>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20
      }}>

        <h2>Mes congés</h2>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          Demander un congé
        </button>

      </div>

      {/* TABLE */}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>

        <thead>

          <tr>
            <th>Raison</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Jours</th>
            <th>Statut</th>
          </tr>

        </thead>

        <tbody>

          {mesConges.map(c => (

            <tr key={c.id}>

              <td>{c.reason}</td>
              <td>{c.start_date}</td>
              <td>{c.end_date}</td>
              <td>{c.days}</td>
              <td>{getStatusLabel(c.status)}</td>
            </tr>

          ))}

        </tbody>

      </table>


      {/* =============================
          MODAL
      ============================= */}

      {showModal && (

        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>

          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "10px",
            width: "400px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.2)"
          }}>

            <h3 style={{ marginBottom: 20 }}>
              Demande de congé
            </h3>

            <form onSubmit={handleSubmit}>

              {/* RAISON */}

              <div style={{ marginBottom: 15 }}>

                <label>Raison</label>

                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="Congé annuel">Congé annuel</option>
                  <option value="Congé maladie">Congé maladie</option>
                  <option value="Congé personnel">Congé personnel</option>
                  <option value="Congé sans solde">Congé sans solde</option>
                </select>

              </div>

              {/* DATE DEBUT */}

              <div style={{ marginBottom: 15 }}>

                <label>Date début</label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />

              </div>

              {/* DATE FIN */}

              <div style={{ marginBottom: 20 }}>

                <label>Date fin</label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />

              </div>

              {/* BUTTONS */}

              <div style={{
                display: "flex",
                justifyContent: "space-between"
              }}>

                <button
                  type="submit"
                  style={{
                    background: "#16a34a",
                    color: "white",
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px"
                  }}
                >
                  Envoyer
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px"
                  }}
                >
                  Annuler
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}