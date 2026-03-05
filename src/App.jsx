import {  Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddEquipment from "./pages/AddEquipment";
import IssuePage from "./pages/IssuePage";
import ReportIssueDashboard from "./pages/ReportIssueDashboard";
import TechnicianDashboard  from "./pages/TechnicianDashboard";

import "./App.css";

function App(){

  return(

    

      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Add Equipment */}
        <Route path="/add-equipment" element={<AddEquipment />} />

        {/* Report Issue Form */}
        <Route path="/report-issue" element={<IssuePage />} />

        {/* Student Report Issue Dashboard */}
        <Route path="/student-dashboard" element={<ReportIssueDashboard />} />
        <Route path="/technician" element={<TechnicianDashboard />} />
      </Routes>

  

  );

}

export default App;