import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Direct standard users back to their dashboard if trying to open Admin screens
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    // If user info is corrupted, clear storage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
