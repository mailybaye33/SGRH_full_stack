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

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const departementsList = Array.isArray(departements)
    ? departements
    : departements?.results || [];

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (editingId) {

      await updateDepartement(editingId, form);

    } else {

      await addDepartement(form);

    }

    setForm({
      name: "",
      description: ""
    });

    setEditingId(null);
    setShowModal(false);

  };

  const handleEdit = (dep) => {

    setForm({
      name: dep.name,
      description: dep.description
    });

    setEditingId(dep.id);
    setShowModal(true);

  };

  const handleDelete = async (id) => {

    if (window.confirm("Supprimer ce département ?")) {

      await deleteDepartement(id);

    }

  };

  const handleViewEmployees = async (id) => {

    const res = await api.get(`/departments/${id}/employees/`);

    setEmployees(res.data);
    setShowEmployees(true);

  };

  return (

    <div className="card">

      <div className="page-header">

        <h2 className="page-title">Départements</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Ajouter Département
        </button>

      </div>

      <table>

        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Employés</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {departementsList.map(dep => (

            <tr key={dep.id}>

              <td>{dep.name}</td>

              <td>{dep.description}</td>

              <td>{dep.employees_count}</td>

              <td>

                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleViewEmployees(dep.id)}
                >
                  Voir employés
                </button>

                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(dep)}
                >
                  Modifier
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(dep.id)}
                >
                  Supprimer
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>{editingId ? "Modifier Département" : "Ajouter Département"}</h3>

            <form onSubmit={handleSubmit} className="form-grid">

              <input
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                required
              />

              <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
              />

              <div className="modal-footer">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>

                <button>
                  {editingId ? "Modifier" : "Ajouter"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {showEmployees && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>Employés du département</h3>

            <ul>

              {employees.map(emp => (

                <li key={emp.id}>
                  {emp.first_name} {emp.last_name}
                </li>

              ))}

            </ul>

            <button
              onClick={() => setShowEmployees(false)}
            >
              Fermer
            </button>

          </div>

        </div>

      )}

    </div>

  );

}