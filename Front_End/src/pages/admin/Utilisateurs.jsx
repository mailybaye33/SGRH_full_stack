// src/pages/admin/Utilisateurs.jsx
import { useEffect, useState } from "react";

export default function Utilisateurs() {
  const API = "http://127.0.0.1:8000/api/users/";
  const token = localStorage.getItem("token");

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "ADMIN",
    password: ""
  });

  const loadUsers = async () => {
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Token ${token}` }
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setUtilisateurs(list);
    } catch (error) {
      setApiError("Erreur lors du chargement des utilisateurs");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = utilisateurs.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validation du téléphone mauritanien
  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(2|3|4)\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const errors = {};

    if (!form.username) {
      errors.username = "Le nom d'utilisateur est requis";
    } else if (form.username.length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (!form.email) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Format d'email invalide";
    }

    if (form.phone && !validatePhone(form.phone)) {
      errors.phone = "Le téléphone doit commencer par 2,3 ou 4 et avoir 8 chiffres";
    }

    if (!editingId && !form.password) {
      errors.password = "Le mot de passe est requis";
    } else if (!editingId && form.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}${editingId}/` : API;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.username) {
          setFormErrors({ username: "Ce nom d'utilisateur existe déjà" });
        } else if (errorData.email) {
          setFormErrors({ email: "Cet email existe déjà" });
        } else {
          setApiError("Erreur lors de l'enregistrement");
        }
        return;
      }

      resetForm();
      loadUsers();
    } catch (error) {
      setApiError("Erreur de connexion au serveur");
    }
  };

  const handleEdit = (user) => {
    setForm({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      password: ""
    });
    setEditingId(user.id);
    setShowModal(true);
    setFormErrors({});
    setApiError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      const response = await fetch(`${API}${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` }
      });
      if (response.ok) {
        loadUsers();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const resetForm = () => {
    setForm({ username: "", email: "", phone: "", role: "ADMIN", password: "" });
    setEditingId(null);
    setShowModal(false);
    setFormErrors({});
    setApiError("");
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
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Utilisateur</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Email</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Téléphone</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Rôle</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucun utilisateur
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>
                    {u.username}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {u.phone || "-"}
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: u.role === "ADMIN" ? "#e7f0fe" : "#f1f5f9",
                      color: u.role === "ADMIN" ? "#1a5fa6" : "#475569",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(u)}
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
                        onClick={() => handleDelete(u.id)}
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "450px",
            maxWidth: "95%"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "24px" }}>
              {editingId ? "Modifier" : "Ajouter"} utilisateur
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Nom d'utilisateur <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${formErrors.username ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: "12px"
                  }}
                  required
                />
                {formErrors.username && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Email <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${formErrors.email ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: "12px"
                  }}
                  required
                />
                {formErrors.email && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Téléphone <span style={{ color: "#64748b", fontSize: "12px" }}>(8 chiffres, commence par 2,3,4)</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${formErrors.phone ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: "12px"
                  }}
                />
                {formErrors.phone && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Rôle</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px"
                  }}
                >
                  <option value="ADMIN">Administrateur</option>
                  <option value="EMPLOYE">Employé</option>
                </select>
              </div>

              {!editingId && (
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Mot de passe <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.password ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px"
                    }}
                    required={!editingId}
                  />
                  {formErrors.password && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.password}
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={resetForm}
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
    </div>
  );
}