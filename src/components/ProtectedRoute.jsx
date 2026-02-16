import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requireOrganizer = false }) {
  const { isAuthenticated, isOrganizer, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-islamic-blue text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireOrganizer && !isOrganizer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-500 mb-4">Accès refusé</h2>
          <p className="text-gray-700 mb-6">Vous devez être organisateur pour accéder à cette page.</p>
          <a href="/" className="bg-islamic-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;