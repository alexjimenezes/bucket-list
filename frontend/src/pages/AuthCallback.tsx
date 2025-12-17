import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthCallback() {
  const { refetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
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
