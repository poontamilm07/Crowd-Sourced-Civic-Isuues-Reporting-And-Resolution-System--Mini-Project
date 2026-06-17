import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────
// Protected Route Component
// Restricts access based on user role
// ─────────────────────────────────────────

const ProtectedRoute = ({
  children,
  allowedRole,
}) => {
  const { user, isLoggedIn } = useAuth();

  // If not logged in → redirect to login
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // If role does not match → redirect to
  // their correct dashboard
  if (allowedRole && user?.role !== allowedRole) {
    switch (user?.role) {
      case 'CITIZEN':
        return (
          <Navigate
            to="/citizen/dashboard"
            replace
          />
        );
      case 'ADMIN':
        return (
          <Navigate
            to="/admin/dashboard"
            replace
          />
        );
      case 'AUTHORITY':
        return (
          <Navigate
            to="/authority/dashboard"
            replace
          />
        );
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If all checks pass → show the page
  return children;
};

export default ProtectedRoute;