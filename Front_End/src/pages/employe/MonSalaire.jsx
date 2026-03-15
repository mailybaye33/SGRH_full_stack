import { useApp } from "../../context/AppContext";

export default function MonSalaire() {

  const { salaires, employes, currentUser } = useApp();

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  const salairesList = Array.isArray(salaires)
    ? salaires
    : salaires?.results || [];

  if (!currentUser) return <p>Chargement...</p>;

  // trouver l'employé connecté
  const employe = employesList.find(
    e => String(e.user_id) === String(currentUser.id)
  );

  if (!employe) {
    return (
      <div className="card">
        <h2>Mon salaire</h2>
        <p>Aucun salaire trouvé</p>
      </div>
    );
  }

  const monSalaire = salairesList.filter(
    s => s.employee === employe.id
  );

  return (

    <div className="card">

      <h2>Mon salaire</h2>

      <table>

        <thead>
  <tr>
    <th>Mois</th>
    <th>Année</th>
    <th>Bonus</th>
    <th>Déductions</th>
    <th>Salaire final</th>
  </tr>
</thead>

<tbody>

  {monSalaire.length === 0 ? (

    <tr>
      <td colSpan="5">Aucun salaire disponible</td>
    </tr>

  ) : (

    monSalaire.map(s => (

      <tr key={s.id}>

        <td>{s.month}</td>

        <td>{s.year}</td>

        <td>{s.total_bonus}</td>

        <td>{s.total_deductions}</td>

        <td><b>{s.final_salary} €</b></td>

      </tr>

    ))

  )}

</tbody>

      </table>

    </div>

  );

}