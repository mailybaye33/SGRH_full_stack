// src/pages/employe/MonSalaire.jsx
import { useApp } from "../../context/AppContext";
import { useState } from "react";

export default function MonSalaire() {
  const { salaires, employes, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const salairesList = Array.isArray(salaires) ? salaires : salaires?.results || [];

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
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>💰</div>
        <p style={{ color: "#64748b" }}>Aucun salaire trouvé</p>
      </div>
    );
  }

  const monSalaire = salairesList.filter(s => s.employee === employe.id);
  
  const filteredSalaires = monSalaire.filter(s =>
    `${s.month}/${s.year}`.includes(searchTerm)
  );

  const totalGagne = monSalaire.reduce((acc, s) => acc + (s.final_salary || 0), 0);
  const dernierSalaire = monSalaire.length > 0 ? monSalaire[0] : null;
  const moyenneMensuelle = monSalaire.length > 0 ? Math.round(totalGagne / monSalaire.length) : 0;

  return (
    <div style={{ padding: "24px" }}>
      {/* Recherche et dernier salaire sur la même ligne */}
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
            placeholder="Rechercher par mois/année"
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
        <div style={{
          background: "#f0f9ff",
          padding: "12px 24px",
          borderRadius: "30px",
          border: "1px solid #bae6fd",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          whiteSpace: "nowrap"
        }}>
          <span style={{ color: "#0369a1", fontWeight: 500 }}>Dernier salaire:</span>
          <span style={{ fontWeight: 700, color: "#0369a1", fontSize: "18px" }}>
            {dernierSalaire ? dernierSalaire.final_salary : 0} MRU
          </span>
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {/* Carte 1 - Total gagné */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#e7f0fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#1a5fa6"
            }}>📊</div>
            <div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Total gagné</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>
                {totalGagne.toLocaleString()} MRU
              </div>
            </div>
          </div>
        </div>

        {/* Carte 2 - Nombre de bulletins */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#e6f7e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#0a7143"
            }}>📅</div>
            <div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Nombre de bulletins</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>
                {monSalaire.length}
              </div>
            </div>
          </div>
        </div>

        {/* Carte 3 - Moyenne mensuelle */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fef7e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#996e24"
            }}>⭐</div>
            <div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Moyenne mensuelle</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>
                {moyenneMensuelle.toLocaleString()} MRU
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des salaires */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafbfc" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Mois</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Année</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Bonus</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Déductions</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Salaire final</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaires.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucun salaire disponible
                </td>
              </tr>
            ) : (
              filteredSalaires.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {new Date(2000, s.month - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {s.year}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center", color: "#059669", fontWeight: 500 }}>
                    +{s.total_bonus}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center", color: "#dc2626", fontWeight: 500 }}>
                    -{s.total_deductions}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center", fontWeight: 700 }}>
                    {s.final_salary} MRU
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