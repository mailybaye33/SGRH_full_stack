// src/pages/employe/MesConges.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function MesConges() {
  const { conges, employes, currentUser, addConge } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reason, setReason] = useState("Congé annuel");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!currentUser) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Chargement...</p>
      </div>
    );
  }

  const employe = employes.find(e => String(e.user_id) === String(currentUser.id));

  if (!employe) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Profil employé introuvable</p>
      </div>
    );
  }

  const mesConges = conges.filter(c => c.employee === employe.id);
  
  const filteredConges = mesConges.filter(c =>
    c.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.start_date?.includes(searchTerm) ||
    c.end_date?.includes(searchTerm)
  );

  const congesValides = mesConges.filter(c => c.status === "approved").length;
  const congesAttente = mesConges.filter(c => c.status === "pending").length;
  const congesRefuses = mesConges.filter(c => c.status === "rejected").length;

  const getStatusLabel = (status) => {
    if (status === "pending") return "En attente";
    if (status === "approved") return "Accepté";
    if (status === "rejected") return "Refusé";
    return status;
  };

  const getStatusStyle = (status) => {
    if (status === "pending") return { background: "#fef7e0", color: "#996e24" };
    if (status === "approved") return { background: "#e6f7e6", color: "#0a7143" };
    if (status === "rejected") return { background: "#fee9e7", color: "#b33a3a" };
    return { background: "#f1f5f9", color: "#475569" };
  };

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

  return (
    <div style={{ padding: "24px" }}>
      {/* Titre
      <h1 style={{
        fontSize: "24px",
        fontWeight: 600,
        color: "#0f172a",
        marginBottom: "24px"
      }}>
        Mes congés
      </h1> */}

      {/* Statistiques des congés */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#e6f7e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "#0a7143"
            }}>✅</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>{congesValides}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Acceptés</div>
            </div>
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#fef7e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "#996e24"
            }}>⏳</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>{congesAttente}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>En attente</div>
            </div>
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#fee9e7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "#b33a3a"
            }}>❌</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>{congesRefuses}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Refusés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recherche et bouton sur la même ligne */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        alignItems: "center"
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "16px",
            color: "#94a3b8"
          }}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 20px 12px 48px",
              borderRadius: "30px",
              border: "1px solid #e2e8f0",
              fontSize: "15px",
              outline: "none"
            }}
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "15px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(37,99,235,0.2)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1d4ed8";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "18px" }}>➕</span>
          Demander un congé
        </button>
      </div>

      {/* Tableau des congés */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafbfc" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Raison</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Début</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Fin</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Jours</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredConges.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucune demande de congé
                </td>
              </tr>
            ) : (
              filteredConges.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {c.reason}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {new Date(c.start_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {new Date(c.end_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center", fontWeight: 500 }}>
                    {c.days || "-"}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      ...getStatusStyle(c.status),
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 500
                    }}>
                      {getStatusLabel(c.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL - Demande de congé */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "450px",
            maxWidth: "95%"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "#e7f0fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#1a5fa6"
              }}>🏖️</span>
              Demander un congé
            </h3>

            <form onSubmit={handleSubmit}>
              {/* RAISON */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#475569" }}>
                  Raison
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "15px",
                    outline: "none"
                  }}
                >
                  <option value="Congé annuel">Congé annuel</option>
                  <option value="Congé maladie">Congé maladie</option>
                  <option value="Congé personnel">Congé personnel</option>
                  <option value="Congé sans solde">Congé sans solde</option>
                </select>
              </div>

              {/* DATE DEBUT */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#475569" }}>
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "15px",
                    outline: "none"
                  }}
                />
              </div>

              {/* DATE FIN */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#475569" }}>
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "15px",
                    outline: "none"
                  }}
                />
              </div>

              {/* BOUTONS */}
              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end"
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "12px 24px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 500
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 32px",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#047857"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#059669"}
                >
                  <span>📤</span>
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}