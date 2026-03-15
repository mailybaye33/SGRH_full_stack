// src/pages/admin/Conges.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Conges() {
  const { conges, employes, updateCongeStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const congesList = Array.isArray(conges)
    ? conges
    : conges?.results || [];

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const getEmployeeName = (id) => {
    const emp = employesList.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Inconnu";
  };

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

  const filteredConges = congesList.filter(c =>
    getEmployeeName(c.employee).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (id) => updateCongeStatus(id, "approved");
  const handleReject = (id) => updateCongeStatus(id, "rejected");

  return (
    <div style={{ padding: "24px" }}>
      {/* Recherche */}
      <div style={{
        marginBottom: "24px",
        position: "relative",
        maxWidth: "400px"
      }}>
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

      {/* Tableau */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafbfc" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Employé</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Début</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Fin</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Statut</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
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
                    {getEmployeeName(c.employee)}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {new Date(c.start_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {new Date(c.end_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      ...getStatusStyle(c.status),
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
                      {getStatusLabel(c.status)}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    {c.status === "pending" && (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleApprove(c.id)}
                          style={{
                            padding: "8px 12px",
                            background: "#059669",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "16px"
                          }}
                          title="Accepter"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          style={{
                            padding: "8px 12px",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "16px"
                          }}
                          title="Refuser"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}