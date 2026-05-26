import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useContext(AuthContext);

  // Fallback: If Context state hasn't processed yet, look directly at localStorage
  const activeUser = user || JSON.parse(localStorage.getItem('user'));
  const activeToken = token || localStorage.getItem('token');

  // 1. If no token or user session exists, send them to login
  if (!activeToken || !activeUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Safely normalize the user's role to lowercase
  const userRole = activeUser.role ? activeUser.role.toLowerCase() : '';

  // 3. Make sure allowedRoles are also checked in lowercase
  if (allowedRoles) {
    const lowercaseRoles = allowedRoles.map(role => role.toLowerCase());
    
    if (!lowercaseRoles.includes(userRole)) {
      // If unauthorized, kick them back to login instead of an empty root "/"
      return <Navigate to="/login" replace />;
    }
  }

  // Everything matches! Render the requested dashboard page
  return children;
};

export default ProtectedRoute;