// src/pages/admin/Promotions.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Promotions() {
  const { promotions, addPromotion, deletePromotion } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    name: "",
    base_salary: "",
    description: ""
  });

  const promotionsList = Array.isArray(promotions)
    ? promotions
    : promotions?.results || [];

  // Vérifier si le nom de la promotion est unique
  const isNameUnique = (name, currentId = null) => {
    return !promotionsList.some(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name) {
      errors.name = "Le nom de la promotion est requis";
    } else if (form.name.length < 3) {
      errors.name = "Le nom doit contenir au moins 3 caractères";
    } else if (!isNameUnique(form.name)) {
      errors.name = "Ce nom de promotion existe déjà";
    }

    if (!form.base_salary) {
      errors.base_salary = "Le salaire de base est requis";
    } else if (form.base_salary <= 0) {
      errors.base_salary = "Le salaire doit être supérieur à 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filteredPromotions = promotionsList.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      await addPromotion({
        name: form.name,
        base_salary: Number(form.base_salary),
        description: form.description
      });
      setForm({ name: "", base_salary: "", description: "" });
      setShowModal(false);
      setFormErrors({});
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      if (error.response?.data?.name) {
        setFormErrors({ name: "Ce nom de promotion existe déjà" });
      } else {
        setApiError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Supprimer la promotion "${name}" ?`)) {
      try {
        await deletePromotion(id);
      } catch (error) {
        if (error.response?.status === 400) {
          alert("Impossible de supprimer cette promotion : elle est utilisée par des employés");
        } else {
          alert("Erreur lors de la suppression");
        }
      }
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
          onClick={() => {
            setShowModal(true);
            setFormErrors({});
            setApiError("");
          }}
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
          <span style={{ fontSize: "18px" }}>➕</span>
          Ajouter
        </button>
      </div>

      {/* Message d'erreur global */}
      {apiError && (
        <div style={{
          background: "#fee2e2",
          color: "#dc2626",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>⚠️</span>
          {apiError}
        </div>
      )}

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
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Nom</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Salaire</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Description</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucune promotion
                </td>
              </tr>
            ) : (
              filteredPromotions.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {p.name}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{
                      background: "#f0f9ff",
                      color: "#2563eb",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 600
                    }}>
                      {p.base_salary} MRU
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                    {p.description || "-"}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === "modal-overlay") {
            setShowModal(false);
            setFormErrors({});
          }
        }}>
          <div style={{ 
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "500px",
            maxWidth: "95%"
          }}>
            <h3 style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "24px"
            }}>
              Ajouter une promotion
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Nom <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  name="name"
                  placeholder="Nom"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${formErrors.name ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  required
                />
                {formErrors.name && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Salaire (MRU) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="number"
                  name="base_salary"
                  placeholder="Salaire"
                  value={form.base_salary}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${formErrors.base_salary ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  required
                />
                {formErrors.base_salary && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {formErrors.base_salary}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Description</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px"
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm({ name: "", base_salary: "", description: "" });
                    setFormErrors({});
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}