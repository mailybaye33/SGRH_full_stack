// src/pages/admin/Employes.jsx
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Employes() {
  const {
    employes,
    departements,
    promotions,
    addEmploye,
    updateEmploye,
    deleteEmploye
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: "",
    hire_date: "",
    department: "",
    promotion: "",
    create_user: false
  });

  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const departementsList = Array.isArray(departements) ? departements : departements?.results || [];
  const promotionsList = Array.isArray(promotions) ? promotions : promotions?.results || [];

  // Validation du téléphone mauritanien
  const validatePhone = (phone) => {
    if (!phone) return true; // Optionnel
    const phoneRegex = /^(2|3|4)\d{7}$/;
    return phoneRegex.test(phone);
  };

  // Vérifier si l'email existe déjà
  const isEmailUnique = (email, currentId = null) => {
    return !employesList.some(emp => 
      emp.email.toLowerCase() === email.toLowerCase() && 
      emp.id !== currentId
    );
  };

  // Vérifier si le téléphone existe déjà
  const isPhoneUnique = (phone, currentId = null) => {
    if (!phone) return true;
    return !employesList.some(emp => 
      emp.phone === phone && 
      emp.id !== currentId
    );
  };

  const validateForm = () => {
    const errors = {};

    // Validation email
    if (!form.email) {
      errors.email = "L'email est requis";
    } else if (!isEmailUnique(form.email, editingId)) {
      errors.email = "Cet email est déjà utilisé";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Format d'email invalide";
    }

    // Validation téléphone
    if (form.phone && !validatePhone(form.phone)) {
      errors.phone = "Le téléphone doit commencer par 2,3 ou 4 et avoir 8 chiffres";
    } else if (form.phone && !isPhoneUnique(form.phone, editingId)) {
      errors.phone = "Ce numéro de téléphone est déjà utilisé";
    }

    // Validation prénom
    if (!form.first_name) {
      errors.first_name = "Le prénom est requis";
    } else if (form.first_name.length < 2) {
      errors.first_name = "Le prénom doit contenir au moins 2 caractères";
    }

    // Validation nom
    if (!form.last_name) {
      errors.last_name = "Le nom est requis";
    } else if (form.last_name.length < 2) {
      errors.last_name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation dates
    if (!form.birth_date) {
      errors.birth_date = "La date de naissance est requise";
    } else {
      const birthDate = new Date(form.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.birth_date = "L'employé doit avoir au moins 18 ans";
      }
    }

    if (!form.hire_date) {
      errors.hire_date = "La date d'embauche est requise";
    }

    // Validation département
    if (!form.department) {
      errors.department = "Le département est requis";
    }

    // Validation promotion
    if (!form.promotion) {
      errors.promotion = "La promotion est requise";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filteredEmployes = employesList.filter(emp => {
    const matchesSearch = 
      emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment ? 
      (emp.department?.id === parseInt(selectedDepartment) || emp.department === parseInt(selectedDepartment)) : 
      true;
    
    return matchesSearch && matchesDepartment;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
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
      const payload = {
        ...form,
        department: Number(form.department),
        promotion: Number(form.promotion)
      };

      if (editingId) {
        await updateEmploye(editingId, payload);
      } else {
        await addEmploye(payload);
      }
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      if (error.response?.data) {
        // Gestion des erreurs API
        const apiErrors = error.response.data;
        if (apiErrors.email) {
          setFormErrors(prev => ({ ...prev, email: "Cet email est déjà utilisé" }));
        }
        if (apiErrors.phone) {
          setFormErrors(prev => ({ ...prev, phone: "Ce numéro de téléphone est déjà utilisé" }));
        }
        setApiError("Erreur lors de l'enregistrement. Vérifiez les champs.");
      } else {
        setApiError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleEdit = (emp) => {
    setForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      birth_date: emp.birth_date,
      hire_date: emp.hire_date,
      department: emp.department?.id || emp.department,
      promotion: emp.promotion?.id || emp.promotion,
      create_user: false
    });
    setEditingId(emp.id);
    setShowModal(true);
    setFormErrors({});
    setApiError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet employé ?")) {
      try {
        await deleteEmploye(id);
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      birth_date: "",
      hire_date: "",
      department: "",
      promotion: "",
      create_user: false
    });
    setEditingId(null);
    setShowModal(false);
    setFormErrors({});
    setApiError("");
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Recherche, filtre et bouton sur la même ligne */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        alignItems: "center"
      }}>
        <div style={{ flex: 2, position: "relative" }}>
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
              outline: "none",
              background: "white"
            }}
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: "30px",
            border: "1px solid #e2e8f0",
            fontSize: "15px",
            outline: "none",
            background: "white",
            cursor: "pointer"
          }}
        >
          <option value="">Département</option>
          {departementsList.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
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

      {/* Tableau des employés */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%" }}>
          <thead>
            <tr style={{ background: "#fafbfc" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Employé</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Email</th>
              <th style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Téléphone</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Département</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Promotion</th>
              <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                  Aucun employé trouvé
                </td>
              </tr>
            ) : (
              filteredEmployes.map(emp => (
                <tr key={emp.id}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "#e6f7e6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0a7143"
                      }}>
                        {getInitials(emp.first_name, emp.last_name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{emp.first_name} {emp.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>{emp.email}</td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>{emp.phone || "-"}</td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
                      {emp.department_name ||
                        departementsList.find(d => d.id === emp.department)?.name ||
                        "-"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px"
                    }}>
                      {emp.promotion_name ||
                        promotionsList.find(p => p.id === emp.promotion)?.name ||
                        "-"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(emp)}
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
                        onClick={() => handleDelete(emp.id)}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === "modal-overlay") resetForm();
        }}>
          <div style={{ 
            width: "650px", 
            padding: "32px",
            background: "white",
            borderRadius: "24px",
            maxWidth: "95%"
          }}>
            <h3 style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "24px"
            }}>
              {editingId ? "Modifier employé" : "Ajouter employé"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Prénom */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Prénom <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    name="first_name"
                    placeholder="Prénom"
                    value={form.first_name}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.first_name ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  />
                  {formErrors.first_name && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.first_name}
                    </p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Nom <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    name="last_name"
                    placeholder="Nom"
                    value={form.last_name}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.last_name ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  />
                  {formErrors.last_name && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.last_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Email <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.email ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  />
                  {formErrors.email && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Téléphone <span style={{ color: "#64748b", fontSize: "12px" }}>(8 chiffres, commence par 2,3,4)</span>
                  </label>
                  <input
                    name="phone"
                    placeholder="Téléphone"
                    value={form.phone}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.phone ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                  />
                  {formErrors.phone && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Date de naissance */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Date naissance <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.birth_date ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  />
                  {formErrors.birth_date && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.birth_date}
                    </p>
                  )}
                </div>

                {/* Date d'embauche */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Date embauche <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={form.hire_date}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.hire_date ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  />
                  {formErrors.hire_date && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.hire_date}
                    </p>
                  )}
                </div>

                {/* Département */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Département <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.department ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  >
                    <option value="">Département</option>
                    {departementsList.map(dep => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.department && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.department}
                    </p>
                  )}
                </div>

                {/* Promotion */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    Promotion <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="promotion"
                    value={form.promotion}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: `1px solid ${formErrors.promotion ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      outline: "none"
                    }}
                    required
                  >
                    <option value="">Promotion</option>
                    {promotionsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.promotion && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors.promotion}
                    </p>
                  )}
                </div>

                {/* Checkbox */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      name="create_user"
                      checked={form.create_user}
                      onChange={handleChange}
                    />
                    Créer un compte utilisateur
                  </label>
                </div>
              </div>

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px"
              }}>
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