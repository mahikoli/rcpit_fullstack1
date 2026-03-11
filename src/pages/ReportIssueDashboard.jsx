import React, { useState } from "react";
import "./ReportIssueDashboard.css";

function ReportIssueDashboard() {

  const [activePage, setActivePage] = useState("dashboard");

  const logout = () => {
    window.location.href = "/";
  };

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Student Panel</h2>
        </div>

        <div className="sidebar-menu">
          <button 
            className={`menu-btn ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          <button 
            className={`menu-btn ${activePage === "report" ? "active" : ""}`}
            onClick={() => setActivePage("report")}
          >
            Report Issue
          </button>

          <button className="menu-btn logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="main">

        {/* Dashboard View */}
        {activePage === "dashboard" && (
          <>
            <div className="topbar">
              <h2>Welcome, Student 👋</h2>
            </div>

            <div className="card-container">
              <div className="dashboard-card">
                <h3>Report Equipment Issue</h3>
                <p>Report faulty equipment like PC, mouse, etc.</p>
                <button onClick={() => setActivePage("report")}>
                  Report Now
                </button>
                
              </div>
              <div className="dashboard-card">
                <h3>My Issue</h3>
                <p>Report faulty equipment like PC, mouse, etc.</p>
                <button onClick={() => setActivePage("report")}>
                  Seen Now
                </button>
                
              </div>
                
            </div>
          </>
        )}

        {/* Report Form View */}
        {activePage === "report" && (
          <div className="report-form">
            <h2>Report Issue</h2>

            <form>
              <input type="text" placeholder="Equipment Name" required />
              <input type="text" placeholder="Room Number" required />
              <textarea placeholder="Describe the issue" required />
              <input type="file" />
              <button type="submit">Submit Issue</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReportIssueDashboard;