import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tokenStorage } from '../lib/api';

export function AuthCallback() {
  const { refetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      // The backend passes the JWT as ?token= to avoid cross-site cookie issues.
      // Safari (ITP) and Firefox (strict ETP) silently drop SameSite=None cookies
      // set during cross-origin OAuth redirects, so we carry the token in the URL
      // and persist it in localStorage instead.
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        tokenStorage.set(token);
        // Clean the token out of the URL bar immediately
        window.history.replaceState({}, document.title, '/auth/callback');
      }

      await refetch();
      navigate('/');
    }
    handleCallback();
  }, [refetch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}
