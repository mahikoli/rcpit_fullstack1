import React, { useState } from "react";
import "./TechnicianDashboard.css";

const TechnicianDashboard = () => {
  const [issues, setIssues] = useState([
    {
      id: "ISS-101",
      equipment: "PC",
      location: "Lab 2 - Room 204",
      description: "Monitor not turning on",
      priority: "High",
      status: "Assigned",
      image: "https://via.placeholder.com/150"
    },
    {
      id: "ISS-102",
      equipment: "Fan",
      location: "Classroom 101",
      description: "Fan making noise",
      priority: "Medium",
      status: "In Progress",
      image: "https://via.placeholder.com/150"
    }
  ]);

  const updateStatus = (id, newStatus) => {
    const updatedIssues = issues.map((issue) =>
      issue.id === id ? { ...issue, status: newStatus } : issue
    );
    setIssues(updatedIssues);
  };

  return (
    <div className="tech-container">
      
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Technician Panel</h2>
        <ul>
          <li>Dashboard</li>
          <li>Assigned Issues</li>
          <li>In Progress</li>
          <li>Completed</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Summary Cards */}
        <div className="cards">
          <div className="card">
            <h3>Assigned</h3>
            <p>{issues.filter(i => i.status === "Assigned").length}</p>
          </div>
          <div className="card">
            <h3>In Progress</h3>
            <p>{issues.filter(i => i.status === "In Progress").length}</p>
          </div>
          <div className="card">
            <h3>Completed</h3>
            <p>{issues.filter(i => i.status === "Completed").length}</p>
          </div>
        </div>

        {/* Issue List */}
        <div className="issue-list">
          {issues.map((issue) => (
            <div key={issue.id} className="issue-card">
              
              <div className="issue-left">
                <img src={issue.image} alt="issue" />
              </div>

              <div className="issue-right">
                <h4>{issue.id} - {issue.equipment}</h4>
                <p><strong>Location:</strong> {issue.location}</p>
                <p>{issue.description}</p>
                <span className={`badge ${issue.priority.toLowerCase()}`}>
                  {issue.priority}
                </span>
                <span className={`status ${issue.status.replace(" ", "").toLowerCase()}`}>
                  {issue.status}
                </span>

                <div className="actions">
                  {issue.status === "Assigned" && (
                    <button onClick={() => updateStatus(issue.id, "In Progress")}>
                      Start Work
                    </button>
                  )}

                  {issue.status === "In Progress" && (
                    <button onClick={() => updateStatus(issue.id, "Completed")}>
                      Mark Solved
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TechnicianDashboard;