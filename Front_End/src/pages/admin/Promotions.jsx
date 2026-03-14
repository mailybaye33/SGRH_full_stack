import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Promotions() {

  const { promotions, addPromotion, deletePromotion } = useApp();

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    base_salary: "",
    description: ""
  });

  const promotionsList = Array.isArray(promotions)
    ? promotions
    : promotions?.results || [];

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    await addPromotion({
      name: form.name,
      base_salary: Number(form.base_salary),
      description: form.description
    });

    setForm({
      name: "",
      base_salary: "",
      description: ""
    });

    setShowModal(false);

  };

  return (

    <div className="card">

      <div className="page-header">

        <h2>Promotions</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Ajouter Promotion
        </button>

      </div>

      <table>

        <thead>
          <tr>
            <th>Nom</th>
            <th>Salaire de base</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {promotionsList.map(p => (

            <tr key={p.id}>

              <td>{p.name}</td>
              <td>{p.base_salary}</td>
              <td>{p.description}</td>

              <td>

                <button
                  className="btn btn-danger"
                  onClick={() => deletePromotion(p.id)}
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

            <h3>Ajouter Promotion</h3>

            <form onSubmit={handleSubmit}>

              <input
                name="name"
                placeholder="Nom du poste"
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="base_salary"
                placeholder="Salaire de base"
                value={form.base_salary}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
              />

              <div className="modal-actions">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>

                <button type="submit">
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