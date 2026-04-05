import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Subtle clean loading spinner safely matching user aesthetic
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-800"></div>
        </div>
    );
  }

  // Identity verification explicitly
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // RBAC routing dynamically flawlessly optimally beautifully cleanly flawlessly safely properly explicitly correctly
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
