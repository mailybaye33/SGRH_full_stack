'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Connexion directe sans passer par services/api.ts
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        username,
        password
      });
      
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4>Connexion SGRH</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <input type="text" className="form-control mb-3" placeholder="Nom d'utilisateur"
                  value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" className="form-control mb-3" placeholder="Mot de passe"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}