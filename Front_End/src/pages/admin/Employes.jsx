// src  /pages/admin/Employes.jsx
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

  // gérer pagination DRF
  const employesList = Array.isArray(employes) ? employes : employes?.results || [];
  const departementsList = Array.isArray(departements) ? departements : departements?.results || [];
  const promotionsList = Array.isArray(promotions) ? promotions : promotions?.results || [];

  // =============================
  // HANDLE INPUT
  // =============================

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });

  };

  // =============================
  // SUBMIT
  // =============================

  const handleSubmit = async (e) => {

    e.preventDefault();

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

  };

  // =============================
  // EDIT
  // =============================

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

  };

  // =============================
  // DELETE
  // =============================

  const handleDelete = async (id) => {

    if (window.confirm("Supprimer cet employé ?")) {
      await deleteEmploye(id);
    }

  };

  // =============================
  // RESET FORM
  // =============================

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

  };

  return (

    <div className="card">

      <div className="page-header">

        <h2 className="page-title">Employés</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Ajouter Employé
        </button>

      </div>

      <table className="table">

        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Département</th>
            <th>Promotion</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {employesList.length === 0 && (
            <tr>
              <td colSpan="7">Aucun employé</td>
            </tr>
          )}

          {employesList.map(emp => (

            <tr key={emp.id}>

              <td>{emp.first_name} {emp.last_name}</td>

              <td>{emp.email}</td>

              <td>{emp.phone || "-"}</td>

              <td>
                {emp.department_name ||
                  departementsList.find(d => d.id === emp.department)?.name ||
                  "-"}
              </td>

              <td>
                {emp.promotion_name ||
                  promotionsList.find(p => p.id === emp.promotion)?.name ||
                  "-"}
              </td>

              

              <td>

                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(emp)}
                >
                  Modifier
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(emp.id)}
                >
                  Supprimer
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>


      {/* =============================
          MODAL
      ============================= */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>{editingId ? "Modifier Employé" : "Ajouter Employé"}</h3>

            <form onSubmit={handleSubmit} className="form-grid">

              <input
                name="first_name"
                placeholder="Prénom"
                value={form.first_name}
                onChange={handleChange}
                required
              />

              <input
                name="last_name"
                placeholder="Nom"
                value={form.last_name}
                onChange={handleChange}
                required
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                name="phone"
                placeholder="Téléphone"
                value={form.phone}
                onChange={handleChange}
              />

              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="hire_date"
                value={form.hire_date}
                onChange={handleChange}
                required
              />

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >

                <option value="">Choisir Département</option>

                {departementsList.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}

              </select>

              <select
                name="promotion"
                value={form.promotion}
                onChange={handleChange}
                required
              >

                <option value="">Choisir Promotion</option>

                {promotionsList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.base_salary}
                  </option>
                ))}

              </select>

              <label style={{ gridColumn: "span 2" }}>

                <input
                  type="checkbox"
                  name="create_user"
                  checked={form.create_user}
                  onChange={handleChange}
                />

                Créer un compte utilisateur

              </label>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                >
                  Annuler
                </button>

                <button type="submit" className="btn btn-primary">
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