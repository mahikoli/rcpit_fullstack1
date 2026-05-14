import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Lazy load components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AddEquipment = lazy(() => import("./pages/AddEquipment"));
const IssuePage = lazy(() => import("./pages/IssuePage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TechnicianDashboard = lazy(() => import("./pages/TechnicianDashboard"));
const MyIssues = lazy(() => import("./pages/MyIssues"));
const SolvedIssues = lazy(() => import("./pages/SolvedIssues"));
const Sidebar = lazy(() => import("./components/sidebar"));
const StudentSidebar = lazy(() => import("./components/StudentSidebar"));

// Loading fallback
const Loading = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />

        {/* Student Dashboard */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        {/* Add Equipment */}
        <Route
          path="/add-equipment"
          element={
            <div className="app">
              <Sidebar />
              <div className="main-content">
                <AddEquipment />
              </div>
            </div>
          }
        />

        {/* Report Issue */}
        <Route
          path="/report-issue"
          element={
            <div className="app">
              <StudentSidebar />
              <div className="main-content">
                <IssuePage />
              </div>
            </div>
          }
        />

        {/* My Issues */}
        <Route
          path="/myissue"
          element={
            <div className="app">
              <StudentSidebar />
              <div className="main-content">
                <MyIssues />
              </div>
            </div>
          }
        />
        
        <Route
          path="/SolvedIssues"
          element={
            <div className="app">
              <StudentSidebar />
              <div className="main-content">
                <SolvedIssues />
              </div>
            </div>
          }
        />

        {/* Technician */}
        <Route path="/technician" element={<TechnicianDashboard />} />
      </Routes>
    </Suspense>
  );
}

export default App;