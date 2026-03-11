import React from "react";
import {
  Home,
  ClipboardList,
  UserPlus,
  Users,
  Box,
  FileText,
  Settings
} from "lucide-react";
import "./sidebar.css";

export default function Sidebar({ activeTab, setActiveTab }) {

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "issues", label: "All Issues", icon: ClipboardList },
    { id: "assign", label: "Assign Technician", icon: UserPlus },
    { id: "users", label: "Users", icon: Users },
    { id: "equipment", label: "Equipment Management", icon: Box },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          <Settings size={22} color="white"/>
        </div>

        <div>
          <h2>College ERP</h2>
          <p>Admin Portal</p>
        </div>
      </div>

      <ul className="menu">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <li
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => setActiveTab(item.id)}
            >

              <Icon size={18} />

              <span>{item.label}</span>

            </li>
          );
        })}

      </ul>

    </div>
  );
}