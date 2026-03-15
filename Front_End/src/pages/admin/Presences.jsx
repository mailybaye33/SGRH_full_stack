// src/pages/admin/Presences.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Presences() {
  const { presences, employes } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const presencesList = Array.isArray(presences)
    ? presences
    : presences?.results || [];

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const getEmployeeName = (id) => {
    const emp = employesList.find(e => String(e.id) === String(id));
    return emp ? `${emp.first_name} ${emp.last_name}` : "Employé inconnu";
  };

  const filteredPresences = presencesList.filter(p =>
    getEmployeeName(p.employee).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.date?.includes(searchTerm)
  );

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
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Date</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Entrée</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Sortie</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Heures</th>
            </tr>
          </thead>
          <tbody>
            {filteredPresences.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucune présence
                </td>
              </tr>
            ) : (
              filteredPresences.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {getEmployeeName(p.employee)}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {new Date(p.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{ background: "#e6f7e6", color: "#0a7143", padding: "4px 10px", borderRadius: "20px" }}>
                      {p.check_in || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{ background: "#fee9e7", color: "#b33a3a", padding: "4px 10px", borderRadius: "20px" }}>
                      {p.check_out || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center", fontWeight: 600 }}>
                    {p.worked_hours || 0}h
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