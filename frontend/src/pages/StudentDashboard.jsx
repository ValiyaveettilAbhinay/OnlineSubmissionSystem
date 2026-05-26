import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const StudentDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [projectLinks, setProjectLinks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [showSubmitted, setShowSubmitted] = useState(false); 

  const fetchAssignments = async () => {
    try {
      const response = await API.get('/tasks/assignments/all');
      // ENHANCEMENT: Explicit verification that data payload exists and contains the collection array
      if (response.data && response.data.success && Array.isArray(response.data.assignments)) {
        setAssignments(response.data.assignments);
      } else if (Array.isArray(response.data)) {
        // Fallback fallback mechanism in case raw array format bypasses root normalization wrappers
        setAssignments(response.data);
      }
    } catch (err) {
      console.error("Error reading available assignments", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleLinkChange = (id, val) => {
    setProjectLinks(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmitting = async (assignmentId) => {
    const linkToSend = projectLinks[assignmentId] || '';

    if (!linkToSend.trim() || !linkToSend.startsWith('http')) {
      alert('Please enter a valid project URL (starting with http:// or https://)');
      return;
    }

    setIsSubmitting(prev => ({ ...prev, [assignmentId]: true }));

    try {
      const response = await API.post('/tasks/submissions/submit', {
        assignmentId,
        submissionData: linkToSend
      });
      
      alert(response.data.message || 'Project submitted successfully!');
      setProjectLinks(prev => ({ ...prev, [assignmentId]: '' }));
      fetchAssignments(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Submission routing encountered an error.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  // --- 🛠️ FRONTEND SAFETY ENHANCEMENT ---
  // Guard the array filtering operation against unexpected non-array shapes
  const safeAssignments = Array.isArray(assignments) ? assignments : [];

  const pendingAssignments = safeAssignments.filter(assign => assign && assign.hasSubmitted !== true);
  const submittedAssignments = safeAssignments.filter(assign => assign && assign.hasSubmitted === true);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ddd', paddingBottom: '10px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Student Dashboard Hub</h1>
        <button onClick={logout} style={{ height: '35px', padding: '0 15px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </header>

      {/* VIEW TOGGLE BUTTONS */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setShowSubmitted(false)}
          style={{
            padding: '10px 20px',
            background: !showSubmitted ? '#007bff' : '#e2e3e5',
            color: !showSubmitted ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Pending Assignments ({pendingAssignments.length})
        </button>
        <button 
          onClick={() => setShowSubmitted(true)}
          style={{
            padding: '10px 20px',
            background: showSubmitted ? '#6c757d' : '#e2e3e5',
            color: showSubmitted ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Submitted Projects ({submittedAssignments.length})
        </button>
      </div>
      
      {/* RENDER LOGIC */}
      {!showSubmitted ? (
        <div>
          <h2 style={{ marginTop: '25px', color: '#007bff' }}>Todo Queue (Unsubmitted)</h2>
          {pendingAssignments.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#fff', border: '1px dashed #ccc', borderRadius: '6px', color: '#666' }}>
              🎉 All caught up! No tasks pending review.
            </div>
          ) : pendingAssignments.map(assign => (
            <div key={assign._id} style={{ border: '1px solid #eee', padding: '20px', marginBottom: '15px', borderRadius: '6px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ marginTop: 0, color: '#222' }}>{assign.title}</h3>
              <p style={{ color: '#555' }}>{assign.description}</p>
              <p style={{ fontSize: '13px', color: '#dc3545', fontWeight: 'bold' }}>
                🗓️ Due Date: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'No deadline'}
              </p>
              
              <div style={{ marginTop: '15px', borderTop: '1px dashed #eee', paddingTop: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                  Project Submission Link:
                </label>
                <input 
                  type="url"
                  placeholder="e.g., https://github.com/your-username/repo"
                  disabled={isSubmitting[assign._id]}
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' }}
                  value={projectLinks[assign._id] || ''}
                  onChange={(e) => handleLinkChange(assign._id, e.target.value)}
                />
                <button 
                  onClick={() => handleSubmitting(assign._id)} 
                  disabled={isSubmitting[assign._id]}
                  style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  {isSubmitting[assign._id] ? 'Submitting Link...' : 'Submit Project'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 style={{ marginTop: '25px', color: '#6c757d' }}>Completed Submissions Portfolio</h2>
          {submittedAssignments.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#fff', border: '1px dashed #ccc', borderRadius: '6px', color: '#666' }}>
              No completed submissions found yet.
            </div>
          ) : submittedAssignments.map(assign => (
            <div key={assign._id} style={{ border: '1px solid #28a745', padding: '20px', marginBottom: '15px', borderRadius: '6px', background: '#f8fdf9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0, color: '#1e4620' }}>{assign.title}</h3>
                <span style={{ padding: '4px 10px', background: '#28a745', color: '#fff', fontSize: '12px', borderRadius: '12px', fontWeight: 'bold' }}>✓ Submitted</span>
              </div>
              <p style={{ color: '#444' }}>{assign.description}</p>
              
              {/* Grading Review Output */}
              <div style={{ marginTop: '15px', padding: '15px', background: '#fff', borderRadius: '6px', border: '1px solid #d4edda', borderLeft: '5px solid #28a745' }}>
                <strong style={{ color: '#155724' }}>Instructor Evaluation Status:</strong>
                <p style={{ margin: '8px 0' }}>
                  <strong>Grade:</strong> {assign.grade !== undefined && assign.grade !== null ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>{assign.grade} / 100</span>
                  ) : (
                    <span style={{ color: '#856404', background: '#fff3cd', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>Awaiting Review</span>
                  )}
                </p>
                {assign.feedback ? (
                  <p style={{ margin: '0', fontSize: '14px', color: '#155724', background: '#f4f9f4', padding: '8px', borderRadius: '4px', border: '1px dashed #c3e6cb' }}>
                    <strong>Feedback:</strong> "{assign.feedback}"
                  </p>
                ) : (
                  <p style={{ margin: '0', fontSize: '13px', color: '#777', fontStyle: 'italic' }}>No descriptive notes left by evaluator yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;