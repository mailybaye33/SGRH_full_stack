// src/pages/admin/Departements.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import api from "../../services/api";

export default function Departements() {
  const {
    departements,
    addDepartement,
    updateDepartement,
    deleteDepartement
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const departementsList = Array.isArray(departements)
    ? departements
    : departements?.results || [];

  // Vérifier si le nom du département est unique
  const isNameUnique = (name, currentId = null) => {
    return !departementsList.some(dep => 
      dep.name.toLowerCase() === name.toLowerCase() && 
      dep.id !== currentId
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name) {
      errors.name = "Le nom du département est requis";
    } else if (form.name.length < 3) {
      errors.name = "Le nom doit contenir au moins 3 caractères";
    } else if (!isNameUnique(form.name, editingId)) {
      errors.name = "Ce nom de département existe déjà";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filteredDepartements = departementsList.filter(dep =>
    dep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dep.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
      if (editingId) {
        await updateDepartement(editingId, form);
      } else {
        await addDepartement(form);
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      if (error.response?.data?.name) {
        setFormErrors({ name: "Ce nom de département existe déjà" });
      } else {
        setApiError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleEdit = (dep) => {
    setForm({
      name: dep.name,
      description: dep.description
    });
    setEditingId(dep.id);
    setShowModal(true);
    setFormErrors({});
    setApiError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce département ?")) {
      try {
        await deleteDepartement(id);
      } catch (error) {
        if (error.response?.status === 400) {
          alert("Impossible de supprimer ce département : il contient des employés");
        } else {
          alert("Erreur lors de la suppression");
        }
      }
    }
  };

  const handleViewEmployees = async (id) => {
    try {
      const res = await api.get(`/departments/${id}/employees/`);
      setEmployees(res.data);
      setShowEmployees(true);
    } catch (error) {
      alert("Erreur lors du chargement des employés");
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
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Description</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Employés</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartements.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucun département
                </td>
              </tr>
            ) : (
              filteredDepartements.map(dep => (
                <tr key={dep.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {dep.name}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                    {dep.description || "-"}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: "#e6f7e6",
                      color: "#0a7143",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
                      {dep.employees_count || 0}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleViewEmployees(dep.id)}
                        style={{
                          padding: "8px 12px",
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "16px"
                        }}
                        title="Voir employés"
                      >
                        👥
                      </button>
                      <button
                        onClick={() => handleEdit(dep)}
                        style={{
                          padding: "8px 12px",
                          background: "#f59e0b",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "16px"
                        }}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(dep.id)}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === "modal-overlay") {
            setShowModal(false);
            setEditingId(null);
            setForm({ name: "", description: "" });
            setFormErrors({});
          }
        }}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "450px",
            maxWidth: "95%"
          }}>
            <h3 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "24px" }}>
              {editingId ? "Modifier" : "Ajouter"} département
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Nom <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${formErrors.name ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    fontSize: "15px",
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
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
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setForm({ name: "", description: "" });
                    setFormErrors({});
                  }}
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
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Liste Employés */}
      {showEmployees && (
        <div className="modal-overlay" onClick={() => setShowEmployees(false)}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "400px",
            maxWidth: "95%"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px" }}>
              Employés du département
            </h3>
            {employees.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
                Aucun employé dans ce département
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {employees.map(emp => (
                  <li key={emp.id} style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: "#e6f7e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#0a7143"
                    }}>
                      {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                    </span>
                    {emp.first_name} {emp.last_name}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setShowEmployees(false)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}