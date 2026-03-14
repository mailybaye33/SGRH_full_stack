import { useEffect, useState } from "react";

export default function Utilisateurs() {

  const API = "http://127.0.0.1:8000/api/users/";
  const token = localStorage.getItem("token");

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "ADMIN",
    password: ""
  });

  const loadUsers = async () => {

    const res = await fetch(API, {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    const data = await res.json();

    const list = Array.isArray(data) ? data : data?.results || [];

    setUtilisateurs(list);

  };

  useEffect(() => {

    loadUsers();

  }, []);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const method = editingId ? "PUT" : "POST";

    const url = editingId ? `${API}${editingId}/` : API;

    await fetch(url, {

      method: method,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`
      },

      body: JSON.stringify(form)

    });

    resetForm();
    loadUsers();

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

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    await fetch(`${API}${id}/`, {

      method: "DELETE",

      headers: {
        Authorization: `Token ${token}`
      }

    });

    loadUsers();

  };

  const resetForm = () => {

    setForm({
      username: "",
      email: "",
      phone: "",
      role: "ADMIN",
      password: ""
    });

    setEditingId(null);
    setShowModal(false);

  };

  return (

    <div className="card">

      <div className="page-header">

        <h2>Utilisateurs</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Ajouter Utilisateur
        </button>

      </div>

      <table>

        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {utilisateurs.map(u => (

            <tr key={u.id}>

              <td>
                {u.employee
                  ? `${u.employee.first_name} ${u.employee.last_name}`
                  : u.username}
              </td>

              <td>{u.email}</td>

              <td>{u.employee_phone || u.phone || "-"}</td>

              <td>{u.role}</td>

              <td>

                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(u)}
                >
                  Modifier
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u.id)}
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

            <h3>{editingId ? "Modifier Utilisateur" : "Ajouter Utilisateur"}</h3>

            <form onSubmit={handleSubmit}>

              <input
                name="username"
                placeholder="Username"
                value={form.username}
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

              {!editingId && (

                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

              )}

              <button type="submit">
                {editingId ? "Modifier" : "Ajouter"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}