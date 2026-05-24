import React from "react";
import logo from "../assets/logo.png";
import "./sidebar.css";

import {
  Home,
  ClipboardList,
  UserPlus,
  Users,
  Package,
  FileText
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "issues", label: "All Issues", icon: <ClipboardList size={20} /> },
    { id: "assign", label: "Assign Technician", icon: <UserPlus size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "equipment", label: "Equipment Management", icon: <Package size={20} /> },
    { id: "reports", label: "Reports", icon: <FileText size={20} /> }
  ];

  return (
    <div className="sidebar">

      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="College Logo" />
        <h2>College ERP</h2>
        <p>Admin Portal</p>
      </div>

      <div className="divider"></div>

      {/* Menu */}
      <ul className="menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={activeTab === item.id ? "active" : ""}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

    </div>
  );
}