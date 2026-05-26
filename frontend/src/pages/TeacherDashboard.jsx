import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const TeacherDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  
  // Assignment creation states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creationMessage, setCreationMessage] = useState('');
  const [assignments, setAssignments] = useState([]);

  // Submissions tracking states
  const [submissions, setSubmissions] = useState([]);

  // Grading operations states
  const [targetSubmissionId, setTargetSubmissionId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradingMessage, setGradingMessage] = useState('');

  // 1. Fetch all assignments created across the system
  const fetchAssignments = async () => {
    try {
      const response = await API.get('/tasks/assignments/all');
      if (response.data && response.data.success && Array.isArray(response.data.assignments)) {
        setAssignments(response.data.assignments);
      }
    } catch (err) {
      console.error("Error fetching ongoing logs:", err);
    }
  };

  // 2. Fetch all student project submissions
  const fetchSubmissions = async () => {
    try {
      const response = await API.get('/tasks/submissions/all');
      
      // 🛠️ FRONTEND FIX: Read the exact payload key from your response body object wrapper
      if (response.data && response.data.success && Array.isArray(response.data.submissions)) {
        setSubmissions(response.data.submissions);
      } else if (Array.isArray(response.data)) {
        setSubmissions(response.data); // Fallback array parser wrapper guard
      }
    } catch (err) {
      console.error("Error fetching incoming student submissions:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreationMessage('');
    try {
      await API.post('/tasks/assignments/new', { title, description, dueDate });
      setCreationMessage('Assignment published successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchAssignments();
    } catch (err) {
      setCreationMessage(`Error: ${err.response?.data?.message || 'Failed to create.'}`);
    }
  };

  // 3. Pre-fill the evaluation form with dual schema key checking fallback structures
  const selectSubmissionForGrading = (sub) => {
    const resolvedStudentName = sub.student?.name || sub.studentId?.name || 'Unknown Student';
    const resolvedAssignmentTitle = sub.assignment?.title || sub.assignmentId?.title || 'Selected Assignment';

    setTargetSubmissionId(sub._id);
    setStudentName(resolvedStudentName);
    setAssignmentTitle(resolvedAssignmentTitle);
    setGrade(sub.grade !== undefined && sub.grade !== null ? sub.grade : '');
    setFeedback(sub.feedback || '');
  };

  // Ensure your handleGradeSubmission uses the correct API route string mapping:
const handleGradeSubmission = async (e) => {
  e.preventDefault();
  setGradingMessage('');
  try {
    // Hits the PUT endpoint we defined in your routes: /api/tasks/submissions/:id/grade
    await API.put(`/tasks/submissions/${targetSubmissionId}/grade`, {
      grade: Number(grade),
      feedback
    });
    
    setGradingMessage('Evaluation marks updated successfully!');
    setTargetSubmissionId(''); // Close evaluation form container
    
    // Refresh both queues instantly
    fetchSubmissions();
    fetchAssignments();
  } catch (err) {
    setGradingMessage(`Error: ${err.response?.data?.message || 'Failed to submit score.'}`);
  }
};

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ddd', paddingBottom: '10px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Instructor Platform Control Hub</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Welcome, <strong>{user?.name}</strong> ({user?.role})</p>
        </div>
        <button onClick={logout} style={{ height: '40px', padding: '0 15px', marginTop: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </header>

      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        {/* Creation Form */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '6px', backgroundColor: '#fff' }}>
          <h2 style={{ borderBottom: '2px solid #28a745', paddingBottom: '8px', color: '#28a745' }}>Draft New Assignment Prompt</h2>
          {creationMessage && <p style={{ color: creationMessage.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{creationMessage}</p>}
          <form onSubmit={handleCreateAssignment}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Assignment Title:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Detailed Description:</label>
              <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Target Due Date:</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Publish Task</button>
          </form>
        </div>

        {/* Evaluation Grading Form */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '6px', backgroundColor: '#fff' }}>
          <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '8px', color: '#007bff' }}>Evaluate & Grade Submissions</h2>
          {gradingMessage && <p style={{ color: gradingMessage.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{gradingMessage}</p>}
          
          {targetSubmissionId ? (
            <form onSubmit={handleGradeSubmission}>
              <p style={{ background: '#e9ecef', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                Evaluating project from: <strong>{studentName}</strong> <br/>
                For Assignment: <strong>{assignmentTitle}</strong>
              </p>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Numeric Score (Grade):</label>
                <input type="number" placeholder="e.g. 90" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Feedback Notes:</label>
                <textarea rows="3" placeholder="Provide constructive code assessment notes..." value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 2, padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Commit Grade</button>
                <button type="button" onClick={() => setTargetSubmissionId('')} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', background: '#f8f9fa', borderRadius: '4px', border: '1px dashed #ccc', marginTop: '10px' }}>
              <p style={{ margin: 0 }}>Select an entry from the <strong>Incoming Student Projects Queue</strong> below to begin grading evaluations.</p>
            </div>
          )}
        </div>
      </div>

      {/* TABLE DATA CONTAINER */}
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ccc' }}>
        <h2 style={{ color: '#495057', marginTop: 0 }}>Incoming Student Projects Queue ({submissions.length})</h2>
        {submissions.length === 0 ? <p style={{ color: '#777' }}>No student repository links have been posted yet.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#343a40', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Student</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Assignment</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Project Link Repository</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Submitted At</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Status / Grade</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => {
                const displayStudentName = sub.student?.name || sub.studentId?.name || 'Anonymous User';
                const displayStudentEmail = sub.student?.email || sub.studentId?.email || 'N/A';
                const displayAssignmentTitle = sub.assignment?.title || sub.assignmentId?.title || 'Unknown Assignment';

                return (
                  <tr key={sub._id} style={{ background: sub.grade !== undefined && sub.grade !== null ? '#f8f9fa' : '#fff' }}>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <strong>{displayStudentName}</strong><br/>
                      <span style={{ fontSize: '11px', color: '#666' }}>{displayStudentEmail}</span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      {displayAssignmentTitle}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <a href={sub.submissionData} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: '500' }}>
                        {sub.submissionData || "Open Repository ↗"}
                      </a>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', fontSize: '13px' }}>
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : 'Just Now'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      {sub.grade !== undefined && sub.grade !== null ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>Graded: {sub.grade}/100</span>
                      ) : (
                        <span style={{ color: '#856404', background: '#fff3cd', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Pending Review</span>
                      )}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <button 
                        onClick={() => selectSubmissionForGrading(sub)}
                        style={{ padding: '5px 10px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {sub.grade !== undefined && sub.grade !== null ? 'Re-Grade' : 'Evaluate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* LIVE PROMPTS OVERVIEW LIST */}
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ccc' }}>
        <h2 style={{ color: '#495057', marginTop: 0 }}>Live Active Prompts Overview ({assignments.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {assignments.map(assign => (
            <div key={assign._id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px solid #eee', borderLeft: '5px solid #007bff' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>{assign.title}</h3>
              <p style={{ color: '#555', fontSize: '14px' }}>{assign.description}</p>
              <p style={{ fontSize: '12px', margin: '0', color: '#777' }}><strong>Created By:</strong> {assign.createdBy?.name || 'Unknown Manager'}</p>
              <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#777' }}><strong>Due Target Date:</strong> {new Date(assign.dueDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;