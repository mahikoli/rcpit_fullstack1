import { useState, useEffect } from "react";
import StudentSidebar from "../components/StudentSidebar";
import "./SolvedIssues.css";

function IssueDetailModal({ issue, onClose }) {
  if (!issue) return null;

  const statusLabel = {
    Pending: "Pending",
    Assigned: "Assigned",
    "In Progress": "In Progress",
    Completed: "Resolved",
    Solved: "Resolved"
  }[issue.status] || issue.status;

  const statusColor = {
    Pending: "#f59e0b",
    Assigned: "#3b82f6",
    "In Progress": "#8b5cf6",
    Completed: "#16a34a",
    Solved: "#16a34a"
  }[issue.status] || "#64748b";

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="sd-modal-header">
          <div className="sd-modal-title-row">
            <div>
              <div className="sd-modal-issue-id">{issue.equipment_type}</div>
              <div className="sd-modal-title">{issue.equipment_name}</div>
            </div>
            <button className="sd-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="sd-modal-badges">
            <span className={`sd-badge cat-${issue.equipment_type?.toLowerCase()}`}>{issue.equipment_type}</span>
            <span className="sd-badge" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}55` }}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="sd-modal-body">
          <div className="sd-modal-section">
            <div className="sd-modal-section-title">📋 Equipment Details</div>
            <div className="sd-modal-info-grid">
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Lab / Location</div>
                <div className="sd-modal-info-value">📍 {issue.lab_name}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Room Number</div>
                <div className="sd-modal-info-value">🚪 {issue.room_name}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Equipment ID</div>
                <div className="sd-modal-info-value">🔖 {issue.equipment_id || "—"}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Reported On</div>
                <div className="sd-modal-info-value">🕐 {new Date(issue.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="sd-modal-section">
            <div className="sd-modal-section-title">📝 Issue Description</div>
            <div className="sd-modal-description">{issue.description || "No description provided."}</div>
          </div>

          <div className="sd-modal-section">
            <div className="sd-modal-section-title">🔧 Technician Info</div>
            <div className="sd-modal-info-grid">
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Resolved By</div>
                <div className="sd-modal-info-value">👷 {issue.technician_name || "Assigned Technician"}</div>
              </div>
            </div>
          </div>

          {issue.technician_comment && (
            <div className="sd-modal-section">
              <div className="sd-modal-section-title">💬 Technician Note</div>
              <div className="sd-modal-comment-box">
                <div className="sd-modal-comment-text">{issue.technician_comment}</div>
              </div>
            </div>
          )}
        </div>

        <div className="sd-modal-footer">
          <button className="sd-modal-footer-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function SolvedIssues() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/issues`);
        if (response.ok) {
          const data = await response.json();
          // Filter solved issues + current user
          const solvedIssues = data.filter(i => 
             (i.status === "Solved" || i.status === "Completed") && i.email === userEmail
          );
          setIssues(solvedIssues);
        }
      } catch (error) {
        console.error("Error fetching solved issues:", error);
      }
    };
    fetchIssues();
  }, [userEmail]);

  return (
    <div className="layout">
      <StudentSidebar />
      <div className="main-container">
        <h2>Resolved Issues</h2>
        <div className="issue-count">
          Total Resolved Issues: <b>{issues.length}</b>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
          💡 Click on any row to view full details and technician comments.
        </p>
        <table className="issue-table">
          <thead>
            <tr>
              <th>Lab</th>
              <th>Equipment</th>
              <th>Issue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr 
                key={issue.id} 
                onClick={() => setSelectedIssue(issue)}
                style={{ cursor: 'pointer' }}
                className="clickable-row"
              >
                <td>{issue.lab_name}</td>
                <td>{issue.equipment_name}</td>
                <td style={{ textAlign: 'left', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {issue.description}
                </td>
                <td className="solved">{issue.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {issues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No resolved issues yet.
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
        />
      )}
    </div>
  );
}

export default SolvedIssues;