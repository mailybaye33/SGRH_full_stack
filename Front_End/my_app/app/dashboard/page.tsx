'use client';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between">
        <h2>Tableau de Bord</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Déconnexion</button>
      </div>
      <p>Bienvenue !</p>
    </div>
  );
}