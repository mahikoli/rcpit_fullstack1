import { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  async function handleLogin() {
    if (!email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
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

      if (role !== data.role) {
        alert("Selected role does not match your account role");
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.role === "admin") navigate("/dashboard");
      else if (data.role === "student") navigate("/student-dashboard");
      else if (data.role === "staff") navigate("/technician");

    } catch {
      alert("Backend not running");
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="logo-box">
          <FaGraduationCap size={28} color="white" />
        </div>

        <h2>College ERP System</h2>
        <p className="subtitle">Equipment & Maintenance Management</p>

        <p className="role-title">Select Role</p>

        <div className="role-buttons">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>

          <button
            className={role === "staff" ? "active" : ""}
            onClick={() => setRole("staff")}
          >
            Technician
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