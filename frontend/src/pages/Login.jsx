import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.post('/auth/login', { email, password });
      const data = response.data;

      login(data.user, data.token);

      const userRole = data.user.role.toLowerCase();

      // Tiny timeout deferment to give React state room to settle
      setTimeout(() => {
        if (userRole === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (userRole === 'student') {
          navigate('/student-dashboard');
        } else if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else {
          setError(`Unknown user system access role: ${data.user.role}`);
        }
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed execution.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '6px', fontFamily: 'sans-serif', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2>Online Submission System - Login</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px' }}>
          Log In
        </button>
      </form>

      {/* --- NEW SIGNUP NAVIGATIONAL LINK FOOTER --- */}
      <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px', fontSize: '14px', color: '#555' }}>
        Don't have an account yet?{' '}
        <span 
          onClick={() => navigate('/register')} 
          style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          Sign Up Here
        </span>
      </div>
    </div>
  );
};

export default Login;