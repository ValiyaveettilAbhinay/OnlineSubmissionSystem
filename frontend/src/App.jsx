import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register'; 
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashBoard'; 
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Pathways */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Access Boundary - Supporting both casings */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Teacher Access Boundary - Supporting both casings */}
          <Route 
            path="/teacher-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'Teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Master Admin Access Boundary - Supporting both casings */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Wildcard Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;