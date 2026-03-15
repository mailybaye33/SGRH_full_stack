// src/pages/admin/Salaires.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Salaires() {
  const { salaires, employes, addSalaire, deleteSalaire } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    employee: "",
    month: "",
    year: "",
    start_date: "",
    end_date: ""
  });

  const salairesList = Array.isArray(salaires)
    ? salaires
    : salaires?.results || [];

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const filteredSalaires = salairesList.filter(s =>
    s.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSalaire(form);
    setShowModal(false);
    setForm({ employee: "", month: "", year: "", start_date: "", end_date: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce salaire ?")) {
      await deleteSalaire(id);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
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
            whiteSpace: "nowrap"
          }}
        >
          <span style={{ fontSize: "18px" }}>💰</span>
          Calculer
        </button>
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
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Mois</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Bonus</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Déductions</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Salaire</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaires.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucun salaire
                </td>
              </tr>
            ) : (
              filteredSalaires.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {s.employee_name}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {s.month}/{s.year}
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
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        padding: "8px 12px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Calcul Salaire */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "500px",
            maxWidth: "95%"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "24px" }}>
              Calculer un salaire
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Employé</label>
                <select
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px"
                  }}
                  required
                >
                  <option value="">Sélectionner</option>
                  {employesList.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Mois</label>
                  <input
                    type="number"
                    name="month"
                    min="1"
                    max="12"
                    value={form.month}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px"
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Année</label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px"
                    }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Début</label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Fin</label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px"
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Calculer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}