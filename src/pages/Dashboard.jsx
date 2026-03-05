import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./dashboard.css";

export default function Dashboard() {

  const [activeTab, setActiveTab] = useState("dashboard");

  const issues = [
    {
      id: "ISS-001",
      equipment: "Microscope Model 1",
      location: "Room 203",
      priority: "High",
      createdDate: "2026-02-26",
    },
    {
      id: "ISS-002",
      equipment: "AC Unit",
      location: "Room 101",
      priority: "Medium",
      createdDate: "2026-02-25",
    },
    {
      id: "ISS-003",
      equipment: "Projector",
      location: "Lab A1",
      priority: "Low",
      createdDate: "2026-02-24",
    },
  ];

  return (

    <div className="dashboard">

      {/* Sidebar Component */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="main">

        <h1>All Issues</h1>

        {/* Stats Cards */}
        <div className="stats">

          <div className="card">
            <p>Total Issues</p>
            <h2>25</h2>
          </div>

          <div className="card">
            <p>Pending</p>
            <h2>1</h2>
          </div>

          <div className="card">
            <p>In Progress</p>
            <h2>13</h2>
          </div>

          <div className="card">
            <p>Waiting Confirmation</p>
            <h2>5</h2>
          </div>

          <div className="card">
            <p>Closed</p>
            <h2>6</h2>
          </div>

        </div>


        {/* Issues Table */}

        {activeTab === "dashboard" && (

          <div className="table">

            <table>

              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Equipment</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {issues.map((issue) => (

                  <tr key={issue.id}>

                    <td>{issue.id}</td>

                    <td>{issue.equipment}</td>

                    <td>{issue.location}</td>

                    <td>
                      <span
                        className={
                          issue.priority === "High"
                            ? "priority high"
                            : issue.priority === "Medium"
                            ? "priority medium"
                            : "priority low"
                        }
                      >
                        {issue.priority}
                      </span>
                    </td>

                    <td>{issue.createdDate}</td>

                    <td>
                      <button className="assign">
                        Assign Technician
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}