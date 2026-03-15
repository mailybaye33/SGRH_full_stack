// src/pages/admin/Presences.jsx

import { useApp } from "../../context/AppContext";

export default function Presences() {

  const { presences, employes } = useApp();

  const presencesList = Array.isArray(presences)
    ? presences
    : presences?.results || [];

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const getEmployeeName = (id) => {

    const emp = employesList.find(
      e => String(e.id) === String(id)
    );

    return emp
      ? `${emp.first_name} ${emp.last_name}`
      : "Employé inconnu";

  };

  return (

    <div className="card">

      <h2 className="page-title">Présences</h2>

      <table>

        <thead>

          <tr>
            <th>Employé</th>
            <th>Date</th>
            <th>Entrée</th>
            <th>Sortie</th>
            <th>Heures</th>
          </tr>

        </thead>

        <tbody>

          {presencesList.length === 0 ? (

            <tr>
              <td colSpan="5">Aucune présence</td>
            </tr>

          ) : (

            presencesList.map(p => (

              <tr key={p.id}>

                <td>{getEmployeeName(p.employee)}</td>

                <td>{p.date}</td>

                <td>{p.check_in || "-"}</td>

                <td>{p.check_out || "-"}</td>

                <td>{p.worked_hours || 0}</td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  );

}