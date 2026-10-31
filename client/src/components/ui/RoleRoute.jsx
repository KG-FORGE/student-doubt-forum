import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';

export function RoleRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // If user doesn't have role, redirect to appropriate home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;
