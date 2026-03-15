// src/pages/admin/Dashboard.jsx
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { employes, departements, conges, presences } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const departementsList = Array.isArray(departements) ? departements : departements?.results || [];
  const congesList = Array.isArray(conges) ? conges : conges?.results || [];
  const presencesList = Array.isArray(presences) ? presences : presences?.results || [];

  const aujourd = new Date().toISOString().split("T")[0];

  // Mise à jour de l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Statistiques calculées
  const actifs = employesList.filter(e => e.actif !== false).length;
  const congesEnAttente = congesList.filter(c => c.status === "pending" || c.status === "En attente");
  const enAttente = congesEnAttente.length;
  const presentAujourd = presencesList.filter(p => p.date === aujourd).length;
  const congesValides = congesList.filter(c => c.status === "approved").length;
  const tauxPresence = employesList.length > 0 ? Math.round((presentAujourd / employesList.length) * 100) : 0;

  // Formatage de la date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString('fr-FR', dateOptions);
  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: "24px" }}>
 
      {/* STATISTIQUES PRINCIPALES - Cartes améliorées */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {/* Carte 1 - Employés */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 16px 32px rgba(37,99,235,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.03)";
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #2563eb10, #2563eb05)",
            borderRadius: "50%",
            transform: "translate(30px, -30px)"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              boxShadow: "0 8px 16px rgba(37,99,235,0.25)"
            }}>👥</div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a" }}>
                {actifs}
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                Employés actifs
              </div>
            </div>
          </div>
          <div style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#2563eb",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
          </div>
        </div>

        {/* Carte 2 - Départements */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 16px 32px rgba(139,92,246,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.03)";
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #8b5cf610, #8b5cf605)",
            borderRadius: "50%",
            transform: "translate(30px, -30px)"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              boxShadow: "0 8px 16px rgba(139,92,246,0.25)"
            }}>🏢</div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a" }}>
                {departementsList.length}
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                Départements
              </div>
            </div>
          </div>
        </div>

        {/* Carte 3 - Congés en attente */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 16px 32px rgba(245,158,11,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.03)";
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #f59e0b10, #f59e0b05)",
            borderRadius: "50%",
            transform: "translate(30px, -30px)"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              boxShadow: "0 8px 16px rgba(245,158,11,0.25)"
            }}>🏖️</div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a" }}>
                {enAttente}
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                Congés en attente
              </div>
            </div>
          </div>
          <div style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#f59e0b",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
          </div>
        </div>

        {/* Carte 4 - Présents */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 16px 32px rgba(34,197,94,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.03)";
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #22c55e10, #22c55e05)",
            borderRadius: "50%",
            transform: "translate(30px, -30px)"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              boxShadow: "0 8px 16px rgba(34,197,94,0.25)"
            }}>✅</div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a" }}>
                {presentAujourd}
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                Présents aujourd'hui
              </div>
            </div>
          </div>
          <div style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#22c55e",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
          </div>
        </div>
      </div>

      {/* DEUXIÈME LIGNE - Graphiques et listes */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "24px"
      }}>
        {/* DERNIERS EMPLOYÉS - Version améliorée */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
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
              }}>👥</span>
              Derniers employés
            </h3>
            <button style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              Voir tout
              <span>→</span>
            </button>
          </div>

          {employesList.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#94a3b8"
            }}>
              <span style={{ fontSize: "40px", opacity: 0.5 }}>👥</span>
              <p style={{ marginTop: "12px" }}>Aucun employé enregistré</p>
            </div>
          ) : (
            <div>
              {employesList.slice(0, 5).map((emp, index) => (
                <div
                  key={emp.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < 4 ? "1px solid #f1f5f9" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, #2563eb${10 + index * 5}, #1d4ed8${10 + index * 5})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      color: "#2563eb",
                      fontWeight: 600
                    }}>
                      {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "#0f172a" }}>
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {emp.department_name || "Non assigné"} · {emp.promotion_name || "Non défini"}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: "11px" }}>
                    Actif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONGÉS EN ATTENTE - Version améliorée */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#fef7e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                color: "#996e24"
              }}>🏖️</span>
              Congés en attente
            </h3>
            <span style={{
              background: "#fef7e0",
              color: "#996e24",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600
            }}>
              {enAttente} demande{enAttente > 1 ? 's' : ''}
            </span>
          </div>

          {congesEnAttente.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#94a3b8"
            }}>
              <span style={{ fontSize: "40px", opacity: 0.5 }}>🏖️</span>
              <p style={{ marginTop: "12px" }}>Aucune demande en attente</p>
            </div>
          ) : (
            <div>
              {congesEnAttente.slice(0, 5).map((c, index) => {
                const emp = employesList.find(e => e.id === c.employee);
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: index < congesEnAttente.length - 1 ? "1px solid #f1f5f9" : "none"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "#0f172a" }}>
                        {emp?.first_name} {emp?.last_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        {c.reason} · Du {new Date(c.start_date).toLocaleDateString('fr-FR')} au {new Date(c.end_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <span className="badge badge-yellow">
                      En attente
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TROISIÈME LIGNE - Statistiques supplémentaires */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "24px"
      }}>
        {/* Carte - Présences du jour */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "#e7f0fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "#1a5fa6"
            }}>⏰</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                {presentAujourd} / {employesList.length}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Employés présents
              </div>
            </div>
          </div>
          <div style={{
            width: "100%",
            height: "8px",
            background: "#f1f5f9",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${tauxPresence}%`,
              height: "100%",
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              borderRadius: "4px"
            }} />
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            fontSize: "12px",
            color: "#64748b"
          }}>
          </div>
        </div>

        {/* Carte - Congés validés */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "#e6f7e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "#0a7143"
            }}>✅</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                {congesValides}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Congés validés
              </div>
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            Ce mois-ci
          </div>
        </div>

        {/* Carte - Départements actifs */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "#475569"
            }}>🏢</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                {departementsList.length}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Départements
              </div>
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            {employesList.length} employés répartis
          </div>
        </div>
      </div>
    </div>
  );
}