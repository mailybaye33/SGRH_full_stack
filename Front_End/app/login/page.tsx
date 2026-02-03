'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Récupérer le token CSRF au chargement de la page
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      await axios.get('http://localhost:8000/users/api/csrf-token/', {
        withCredentials: true
      });
    } catch (err) {
      console.error('Erreur lors de la récupération du token CSRF:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // IMPORTANT: Utiliser l'URL correcte avec /users/
      const response = await axios.post(
        'http://localhost:8000/users/api/login/', // Notez le /users/ dans l'URL
        { username, password },
        {
          withCredentials: true, // Important pour les cookies de session
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Utiliser la fonction getCookie
          },
        }
      );

      console.log('Réponse API:', response.data); // Pour déboguer
      
      // Vérifier le format de réponse
      if (response.data.success) {
        // Stocker l'utilisateur
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Stocker le session ID si disponible
        if (response.data.sessionid) {
          localStorage.setItem('sessionid', response.data.sessionid);
        }
        
        // Rediriger vers le dashboard
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Erreur de connexion');
      }
      
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      
      // Meilleure gestion des erreurs
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 400) {
          // Erreurs de validation Django
          if (data.errors && data.errors.non_field_errors) {
            setError(data.errors.non_field_errors[0]);
          } else if (data.non_field_errors) {
            setError(data.non_field_errors[0]);
          } else if (data.detail) {
            setError(data.detail);
          } else if (typeof data === 'object') {
            // Afficher la première erreur
            const errors = data.errors || data;
            const firstError = Object.values(errors)[0];
            setError(Array.isArray(firstError) ? firstError[0] : firstError);
          } else {
            setError('Identifiants incorrects');
          }
        } else if (status === 401) {
          setError('Non autorisé');
        } else if (status === 403) {
          setError('Accès interdit');
        } else if (status === 404) {
          setError('Endpoint API non trouvé. Vérifiez l\'URL.');
        } else if (status === 500) {
          setError('Erreur interne du serveur');
        } else {
          setError(`Erreur serveur (${status})`);
        }
      } else if (err.request) {
        setError('Le serveur ne répond pas. Vérifiez que:');
        setError(prev => prev + '\n1. Django est lancé sur http://localhost:8000');
        setError(prev => prev + '\n2. L\'URL de l\'API est correcte');
        setError(prev => prev + '\n3. Il n\'y a pas de problème CORS');
      } else {
        setError('Erreur: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour récupérer le cookie CSRF
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  }

  // Version simplifiée pour tester (sans CSRF)
  const handleSubmitSimple = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/users/api/login/',
        { username, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Réponse:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Erreur de connexion');
      }
      
    } catch (err: any) {
      console.error('Erreur:', err);
      
      if (err.response) {
        // Afficher l'erreur directement depuis Django
        if (err.response.data && typeof err.response.data === 'object') {
          const errorData = err.response.data;
          
          // Différents formats d'erreur possibles
          if (errorData.errors) {
            // Format avec clé 'errors'
            const errorMsg = Object.values(errorData.errors)[0];
            setError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
          } else if (errorData.non_field_errors) {
            // Format standard DRF
            setError(errorData.non_field_errors[0]);
          } else if (errorData.detail) {
            // Format avec clé 'detail'
            setError(errorData.detail);
          } else {
            // Autre format
            const firstError = Object.values(errorData)[0];
            setError(Array.isArray(firstError) ? firstError[0] : firstError);
          }
        } else if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError('Impossible de joindre le serveur Django. Vérifiez que:');
        setError(prev => prev + '\n1. Le serveur Django est lancé (python manage.py runserver)');
        setError(prev => prev + '\n2. L\'URL est correcte: http://localhost:8000');
      } else {
        setError('Erreur: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour tester l'API directement
  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Test API - Status:', response.status);
      console.log('Test API - Data:', data);
      
      if (response.ok) {
        alert('API fonctionne! Réponse: ' + JSON.stringify(data, null, 2));
      } else {
        alert('Erreur API: ' + JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('Test API error:', err);
      alert('Erreur de connexion à l\'API');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            SGRH - Connexion
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            API: http://localhost:8000/users/api/login/
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                whiteSpace: 'pre-line'
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmitSimple}> {/* Utiliser la version simple */}
            <TextField
              fullWidth
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoComplete="username"
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoComplete="current-password"
            />
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Test avec admin/admin123
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={testAPI}
              sx={{ mt: 1 }}
            >
              Tester l'API
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Pour déboguer:</strong>
              <br />1. Vérifiez que Django tourne sur http://localhost:8000
              <br />2. Ouvrez DevTools (F12) → Network
              <br />3. Vérifiez la requête POST vers /users/api/login/
              <br />4. Vérifiez la réponse dans l'onglet "Response"
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}