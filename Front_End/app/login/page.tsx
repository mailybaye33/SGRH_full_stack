'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfLoading, setCsrfLoading] = useState(true);
  const router = useRouter();

  // Récupérer le token CSRF au chargement
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/api/csrf-token/', {
        credentials: 'include', // Important pour les cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken || '');
        console.log('CSRF token reçu');
      } else {
        console.error('Erreur CSRF:', response.status);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du CSRF:', err);
    } finally {
      setCsrfLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Préparer les headers avec CSRF
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter le token CSRF s'il est disponible
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch('http://localhost:8000/users/api/login/', {
        method: 'POST',
        headers,
        credentials: 'include', // Important pour les cookies de session
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Connexion réussie
        localStorage.setItem('user', JSON.stringify(data.user || data));
        router.push('/dashboard');
      } else {
        // Erreur
        setError(data.message || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Connexion SGRH</h1>
      
      {/* État CSRF */}
      <div style={{
        ...styles.csrfStatus,
        backgroundColor: csrfToken ? '#e8f5e9' : '#fff3e0',
      }}>
        {csrfLoading ? 'Chargement CSRF...' : 
         csrfToken ? '✅ CSRF prêt' : '⚠️ CSRF non disponible'}
      </div>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
          disabled={loading || csrfLoading}
        />
        
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          disabled={loading || csrfLoading}
        />
        
        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: (loading || csrfLoading) ? 0.7 : 1,
            cursor: (loading || csrfLoading) ? 'not-allowed' : 'pointer',
          }}
          disabled={loading || csrfLoading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      
      <div style={styles.testInfo}>
        <p>Pour tester : admin / admin123</p>
        <button
          onClick={fillTestCredentials}
          style={styles.smallButton}
          disabled={loading || csrfLoading}
        >
          Remplir avec admin
        </button>
        
        <button
          onClick={fetchCsrfToken}
          style={{...styles.smallButton, marginLeft: '10px'}}
          disabled={loading}
        >
          Rafraîchir CSRF
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '20px',
  },
  csrfStatus: {
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  input: {
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
  },
  testInfo: {
    marginTop: '30px',
    textAlign: 'center' as const,
    color: '#666',
  },
  smallButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};