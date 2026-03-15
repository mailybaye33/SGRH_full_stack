import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Salaires() {

  const {
    salaires,
    employes,
    addSalaire,
    deleteSalaire
  } = useApp();

  const [showModal, setShowModal] = useState(false);

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

    setForm({
      employee: "",
      month: "",
      year: "",
      start_date: "",
      end_date: ""
    });

  };

  const handleDelete = async (id) => {

    if (window.confirm("Supprimer ce salaire ?")) {

      await deleteSalaire(id);

    }

  };

  return (

    <div className="card">

      <div className="page-header">

        <h2 className="page-title">Gestion des Salaires</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Calculer Salaire
        </button>

      </div>

      <table>

        <thead>

          <tr>
            <th>Employé</th>
            <th>Mois</th>
            <th>Bonus</th>
            <th>Déductions</th>
            <th>Salaire Final</th>
            <th>Actions</th>
          </tr>

        </thead>

<tbody>

  {salairesList.length === 0 ? (

    <tr>
      <td colSpan="6">Aucun salaire calculé</td>
    </tr>

  ) : (

    salairesList.map(s => (

      <tr key={s.first_name}>

        <td>{s.employee_name}</td>

        <td>{s.month}/{s.year}</td>

        <td>{s.total_bonus}</td>

        <td>{s.total_deductions}</td>

        <td><b>{s.final_salary} MRU</b></td>

        <td>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(s.id)}
          >
            Supprimer
          </button>

        </td>

      </tr>

    ))

  )}

</tbody>

      </table>

      {/* MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>Calculer un salaire</h3>

            <form onSubmit={handleSubmit} className="form-grid">

              {/* EMPLOYE */}

              <select
                name="employee"
                value={form.employee}
                onChange={handleChange}
                className="form-control"
                required
              >

                <option value="">Choisir Employé</option>

                {employesList.map(emp => (

                  <option key={emp.id} value={emp.id}>

                    {emp.first_name} {emp.last_name}

                  </option>

                ))}

              </select>

              {/* MOIS */}

              <input
                type="number"
                name="month"
                placeholder="Mois (1-12)"
                min="1"
                max="12"
                value={form.month}
                onChange={handleChange}
                className="form-control"
                required
              />

              {/* ANNEE */}

              <input
                type="number"
                name="year"
                placeholder="Année"
                value={form.year}
                onChange={handleChange}
                className="form-control"
                required
              />

              {/* PERIODE PARTIELLE */}

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="form-control"
              />

              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="form-control"
              />

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>

                <button className="btn btn-primary">

                  Calculer Salaire

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}