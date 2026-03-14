import { useApp } from "../../context/AppContext";

export default function MesPresences() {

  const { presences, employes, currentUser, checkIn, checkOut } = useApp();

  // sécuriser les données
  const presencesList = Array.isArray(presences)
    ? presences
    : presences?.results || [];

  const employesList = Array.isArray(employes)
    ? employes
    : employes?.results || [];

  // trouver l'employé connecté
  const employe = employesList.find(
    e => String(e.user_id) === String(currentUser?.id)
  );

  // filtrer seulement ses présences
  const mesPresences = presencesList.filter(
    p => p.employee === employe?.id
  );

  const today = new Date().toISOString().split("T")[0];

  // présence d'aujourd'hui
  const todayPresence = mesPresences.find(
    p => p.date === today
  );

  const alreadyCheckedIn = todayPresence && todayPresence.check_in;
  const alreadyCheckedOut = todayPresence && todayPresence.check_out;

  return (

    <div className="card">

      <div className="page-header">

        <h2>Mes présences</h2>

        <div style={{ display: "flex", gap: 10 }}>

          <button
            className="btn btn-success"
            onClick={checkIn}
            disabled={alreadyCheckedIn}
          >
            Pointer entrée
          </button>

          <button
            className="btn btn-primary"
            onClick={checkOut}
            disabled={!alreadyCheckedIn || alreadyCheckedOut}
          >
            Pointer sortie
          </button>

        </div>

      </div>

      <table>

        <thead>
          <tr>
            <th>Date</th>
            <th>Entrée</th>
            <th>Sortie</th>
            <th>Heures</th>
          </tr>
        </thead>

        <tbody>

          {mesPresences.length === 0 ? (

            <tr>
              <td colSpan="4">Aucune présence enregistrée</td>
            </tr>

          ) : (

            mesPresences.map(p => (

              <tr key={p.id}>

                <td>{p.date}</td>
                <td>{p.check_in || "-"}</td>
                <td>{p.check_out || "-"}</td>
                <td>{p.worked_hours || "0"}</td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  );

}