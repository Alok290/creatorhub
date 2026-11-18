import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  allowedRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === 'CREATOR') {
      return <Navigate to="/creator/dashboard" replace />;
    } else if (role === 'MERCHANT') {
      return <Navigate to="/merchant/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

