// src/pages/employe/MesPresences.jsx
import { useApp } from "../../context/AppContext";
import { useState } from "react";

export default function MesPresences() {
  const { presences, employes, currentUser, checkIn, checkOut } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const presencesList = Array.isArray(presences) ? presences : presences?.results || [];
  const employesList = Array.isArray(employes) ? employes : employes?.results || [];

  if (!currentUser) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Chargement...</p>
      </div>
    );
  }

  const employe = employesList.find(e => String(e.user_id) === String(currentUser.id));

  if (!employe) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Aucun employé trouvé</p>
      </div>
    );
  }

  const mesPresences = presencesList.filter(p => String(p.employee) === String(employe.id));
  const today = new Date().toISOString().split("T")[0];
  const todayPresence = mesPresences.find(p => p.date === today);
  const alreadyCheckedIn = todayPresence && todayPresence.check_in;
  const alreadyCheckedOut = todayPresence && todayPresence.check_out;

  const filteredPresences = mesPresences.filter(p =>
    p.date?.includes(searchTerm)
  );

  return (
    <div style={{ padding: "24px" }}>
      {/* Titre
      <h1 style={{
        fontSize: "24px",
        fontWeight: 600,
        color: "#0f172a",
        marginBottom: "24px"
      }}>
        Mes présences
      </h1> */}

      {/* État du jour */}
      {todayPresence && (
        <div style={{
          background: "#f0f9ff",
          borderRadius: "16px",
          padding: "16px 24px",
          marginBottom: "24px",
          border: "1px solid #bae6fd",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <span style={{ fontSize: "24px" }}>📌</span>
          <div>
            <span style={{ fontWeight: 600, color: "#0369a1" }}>Aujourd'hui : </span>
            {todayPresence.check_in ? (
              <span style={{ color: "#0369a1" }}>
                Entrée à {todayPresence.check_in}
                {todayPresence.check_out && ` - Sortie à ${todayPresence.check_out}`}
              </span>
            ) : (
              <span style={{ color: "#0369a1" }}>Pas encore pointé</span>
            )}
          </div>
        </div>
      )}

      {/* Recherche et boutons sur la même ligne */}
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
            placeholder="Rechercher par date"
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
        <div style={{ display: "flex", gap: "12px", whiteSpace: "nowrap" }}>
          <button
            onClick={checkIn}
            disabled={alreadyCheckedIn}
            style={{
              padding: "12px 24px",
              background: alreadyCheckedIn ? "#cbd5e1" : "#059669",
              color: "white",
              border: "none",
              borderRadius: "30px",
              cursor: alreadyCheckedIn ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              fontWeight: 500,
              opacity: alreadyCheckedIn ? 0.6 : 1
            }}
          >
            <span>⬇️</span>
            Entrée
          </button>
          <button
            onClick={checkOut}
            disabled={!alreadyCheckedIn || alreadyCheckedOut}
            style={{
              padding: "12px 24px",
              background: !alreadyCheckedIn || alreadyCheckedOut ? "#cbd5e1" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "30px",
              cursor: !alreadyCheckedIn || alreadyCheckedOut ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              fontWeight: 500,
              opacity: !alreadyCheckedIn || alreadyCheckedOut ? 0.6 : 1
            }}
          >
            <span>⬆️</span>
            Sortie
          </button>
        </div>
      </div>

      {/* Tableau des présences */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafbfc" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Date</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Entrée</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Sortie</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Heures</th>
            </tr>
          </thead>
          <tbody>
            {filteredPresences.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucune présence enregistrée
                </td>
              </tr>
            ) : (
              filteredPresences.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {new Date(p.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: p.check_in ? "#e6f7e6" : "#f1f5f9",
                      color: p.check_in ? "#0a7143" : "#64748b",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
                      {p.check_in || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: p.check_out ? "#fee9e7" : "#f1f5f9",
                      color: p.check_out ? "#b33a3a" : "#64748b",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
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