// src/pages/employe/DashboardEmploye.jsx
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";

export default function DashboardEmploye() {
const { employes, promotions, conges, departements, currentUser } = useApp();  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Chargement...</p>
      </div>
    );
  }

  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const promotionsList = Array.isArray(promotions) ? promotions : promotions?.results || [];
  const congesList = Array.isArray(conges) ? conges : conges?.results || [];
  const departementsList = Array.isArray(departements) ? departements : departements?.results || [];

  const employe = employesList.find(e => String(e.user_id) === String(currentUser.id));
  
  if (!employe) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>👤</div>
        <p style={{ color: "#64748b" }}>Aucun profil employé trouvé</p>
      </div>
    );
  }
  const department = departementsList.find(
  d => d.id === employe.department
);
  const promotion = promotionsList.find(p => p.id === employe.promotion);
  const mesConges = congesList.filter(c => c.employee === employe.id);
  const congesValides = mesConges.filter(c => c.status === "approved").length;
  const congesAttente = mesConges.filter(c => c.status === "pending").length;

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString('fr-FR', dateOptions);
  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: "24px" }}>
      {/* En-tête avec date */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px"
      }}>
        {/* <div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "4px"
          }}>
            👋 Bonjour, {employe.first_name}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Voici votre espace personnel
          </p>
        </div> */}
        {/* <div style={{
          background: "white",
          padding: "10px 20px",
          borderRadius: "30px",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px"
        }}>
          <span>📅</span>
          <span style={{ color: "#475569" }}>{formattedDate}</span>
          <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%" }} />
          <span style={{ color: "#2563eb", fontWeight: 500 }}>{formattedTime}</span>
        </div> */}
      </div>

      {/* Cartes de statistiques */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {/* Carte Profil */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "#e6f7e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#0a7143"
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>
              {employe.first_name} {employe.last_name}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              {employe.email}
            </div>
          </div>
        </div>

        {/* Carte Poste */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "#e7f0fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#1a5fa6"
          }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>
              {promotion?.name || "Non défini"}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              {promotion?.base_salary ? `${promotion.base_salary} MRU` : "-"}
            </div>
          </div>
        </div>

        {/* Carte Congés validés */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "#e6f7e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#0a7143"
          }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
              {congesValides}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Congés validés
            </div>
          </div>
        </div>

        {/* Carte Congés en attente */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "#fef7e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#996e24"
          }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
              {congesAttente}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              En attente
            </div>
          </div>
        </div>
      </div>

      {/* Informations détaillées */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}>
        {/* Détails du profil */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid #f1f5f9"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "#e6f7e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#0a7143"
            }}>📋</span>
            Mes informations
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>Nom complet</span>
              <span style={{ fontWeight: 500, color: "#0f172a" }}>{employe.first_name} {employe.last_name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>Email</span>
              <span style={{ fontWeight: 500, color: "#0f172a" }}>{employe.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>Téléphone</span>
              <span style={{ fontWeight: 500, color: "#0f172a" }}>{employe.phone || "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: "#64748b" }}>Département</span>
<span style={{ fontWeight: 500, color: "#0f172a" }}>
{department?.name || "Non assigné"}
</span>            </div>
          </div>
        </div>

        {/* Détails de la promotion */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid #f1f5f9"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "#e7f0fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#1a5fa6"
            }}>📈</span>
            Ma promotion
          </h3>
          {promotion ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Poste</span>
                <span style={{ fontWeight: 500, color: "#0f172a" }}>{promotion.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Salaire de base</span>
                <span style={{ fontWeight: 600, color: "#059669" }}>{promotion.base_salary} MRU</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>Description</span>
                <span style={{ fontWeight: 500, color: "#0f172a", textAlign: "right", maxWidth: "60%" }}>
                  {promotion.description || "-"}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
              Aucune promotion assignée
            </p>
          )}
        </div>
      </div>
    </div>
  );
}