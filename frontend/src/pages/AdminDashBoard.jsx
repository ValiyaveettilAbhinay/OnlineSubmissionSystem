import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const AdminDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [systemStats, setSystemStats] = useState({ totalAssignments: 0 });

  const fetchAdminMetrics = async () => {
    try {
      const response = await API.get('/tasks/assignments/all');
      if (response.data.success) {
        setAssignments(response.data.assignments);
        setSystemStats({ totalAssignments: response.data.count });
      }
    } catch (err) {
      console.error("Admin metrics collection error:", err);
    }
  };

  useEffect(() => {
    fetchAdminMetrics();
  }, []);

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #dc3545', paddingBottom: '10px' }}>
        <div>
          <h1 style={{ color: '#dc3545', margin: 0 }}>Root Administrator Command Center</h1>
          <p>Logged in as: <strong>{user?.name}</strong> ({user?.email})</p>
        </div>
        <button onClick={logout} style={{ height: '40px', padding: '0 15px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '15px' }}>
          Logout
        </button>
      </header>

      {/* Overview Metric Blocks */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '20px', borderRadius: '6px', flex: 1, border: '1px solid #f5c6cb' }}>
          <h3>Total Assignments System-Wide</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{systemStats.totalAssignments}</p>
        </div>
        <div style={{ background: '#e2e3e5', color: '#383d41', padding: '20px', borderRadius: '6px', flex: 1, border: '1px solid #d6d8db' }}>
          <h3>System Health State</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '15px 0 0 0', color: '#155724' }}>● Operational</p>
        </div>
      </div>

      {/* Global Systems Audit Lists */}
      <div style={{ marginTop: '30px' }}>
        <h2>Global Assignments Audit Log</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#343a40', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>Assignment ID</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>Title</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>Created By</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(item => (
              <tr key={item._id} style={{ background: '#fff' }}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6', fontFamily: 'monospace', fontSize: '13px' }}>{item._id}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>{item.title}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.createdBy?.name || 'System'} ({item.createdBy?.email || 'N/A'})</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{new Date(item.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;