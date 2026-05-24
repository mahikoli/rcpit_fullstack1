import { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");

  async function handleLogin() {
    if (!email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      let dbRole = data.role || "";
      if (dbRole.toLowerCase() === "student") dbRole = "User";
      else if (dbRole.toLowerCase() === "user") dbRole = "User";

      if (role !== dbRole) {
        alert("Selected role does not match your account role");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("userName", data.user_name);
      localStorage.setItem("userEmail", email);
      if (data.field_name) {
        localStorage.setItem("userField", data.field_name);
      } else {
        localStorage.removeItem("userField");
      }
      if (data.admin_role) {
        localStorage.setItem("adminRole", data.admin_role);
      } else {
        localStorage.removeItem("adminRole");
      }
      if (data.department) {
        localStorage.setItem("userDepartment", data.department);
      } else {
        localStorage.removeItem("userDepartment");
      }
      if (data.user_email) {
        localStorage.setItem("userEmail", data.user_email);
      }
      if (data.user_mobile) {
        localStorage.setItem("userMobile", data.user_mobile);
      }
      if (data.qualification) {
        localStorage.setItem("userQualification", data.qualification);
      }
      if (data.lab_name) {
        localStorage.setItem("userLab", data.lab_name);
      }
      if (data.room_number) {
        localStorage.setItem("userRoom", data.room_number);
      }
      if (data.year) {
        localStorage.setItem("userYear", data.year);
      }

      if (dbRole === "admin") navigate("/dashboard");
      else if (dbRole === "User") navigate("/student-dashboard");
      else if (dbRole === "staff") navigate("/technician");
      else if (dbRole.toLowerCase() === "technician") navigate("/technician");
      else if (dbRole === "Staff") navigate("/technician");

    } catch {
      alert("Backend not running");
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="logo">
          <img src={logo} alt="College Logo" className="logo-img" onError={(e) => {
            e.target.style.display = 'none';
          }}/>
        </div>

        <h2>College ERP System</h2>
        <p className="subtitle">Equipment & Maintenance Management</p>

        <p className="role-title">Select Role</p>

        <div className="role-buttons">
          <button
            className={role === "User" ? "active" : ""}
            onClick={() => setRole("User")}
          >
            User
          </button>

          <button
            className={role === "staff" ? "active" : ""}
            onClick={() => setRole("staff")}
          >
            Staff
          </button>

          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
        <p className="register-text">
          Don't have an account? 
          <span className="register-link" onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>

        <p className="bottom-text">
          Secure access to college equipment management
        </p>

      </div>
    </div>
  );
}

export default Login;