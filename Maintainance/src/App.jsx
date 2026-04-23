
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AddEquipment from "./pages/AddEquipment";
import IssuePage from "./pages/IssuePage";
import StudentDashboard from "./pages/StudentDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import MyIssues from "./pages/MyIssues";
import SolvedIssues from "./pages/SolvedIssues";
import Sidebar from "./components/sidebar";
import StudentSidebar from "./components/StudentSidebar";

import "./App.css";

function App() {
  return (

    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Register */}
      <Route path="/register" element={<Register />} />

      {/* Admin Dashboard */}
      <Route
        path="/dashboard"
        element={<AdminDashboard />}
      />

      {/* Student Dashboard */}
      <Route
        path="/student-dashboard"
        element={<StudentDashboard />}
      />

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
      <Route
        path="/technician"
        element={<TechnicianDashboard />}
      />


    </Routes>

  );
}

export default App;