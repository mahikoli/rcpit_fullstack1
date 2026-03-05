import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

export default function Register() {
  

  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="logo">🎓</div>

        <h2>College ERP System</h2>
        <p className="subtitle">Equipment & Maintenance Management</p>

        {/* STEP 1 : SELECT ROLE */}

        {step === 1 && (
          <>
            <h3>Select Role</h3>

            <div className="role-buttons">

              <button onClick={() => selectRole("User")}>
                User
              </button>

              <button onClick={() => selectRole("staff")}>
                Staff
              </button>

            </div>
          </>
        )}

        {/* STEP 2 : STUDENT FORM */}

        {step === 2 && role === "User" && (
          <>
            <div className="form-grid">

  <div className="input-group">
    <label>Name</label>
    <input type="text" placeholder="Enter name" />
  </div>

  <div className="input-group">
    <label>Email</label>
    <input type="email" placeholder="Enter email" />
  </div>

  <div className="input-group">
    <label>PRN</label>
    <input type="text" placeholder="Enter PRN" />
  </div>

  <div className="input-group">
    <label>Mobile</label>
    <input type="text" placeholder="Enter mobile number" />
  </div>

  <div className="input-group">
    <label>Year</label>
    <input type="text" placeholder="Enter year" />
  </div>

  <div className="input-group">
    <label>Branch</label>
    <input type="text" placeholder="Enter branch" />
  </div>

  <div className="input-group">
    <label>Password</label>
    <input type="password" placeholder="Enter password" />
  </div>

  <div className="input-group">
    <label>Confirm Password</label>
    <input type="password" placeholder="Confirm password" />
  </div>

</div>

<button className="login-btn full-width">Register</button>
<p className="back-login" onClick={() => navigate("/Login")}>
  Back to Login
</p>
          </>
        )}

        {/* STEP 2 : STAFF FORM */}

        {step === 2 && role === "staff" && (
          <>
            <div className="form-grid">

  <div className="input-group">
    <label>Name</label>
    <input type="text" placeholder="Enter name" />
  </div>

  <div className="input-group">
    <label>Email</label>
    <input type="email" placeholder="Enter email" />
  </div>

  <div className="input-group">
    <label>Qualification</label>
    <select>
      <option>10</option>
      <option>12</option>
      <option>UG</option>
      <option>PG</option>
    </select>
  </div>

  <div className="input-group">
    <label>Mobile</label>
    <input type="text" placeholder="Enter mobile number" />
  </div>

  <div className="input-group">
    <label>Password</label>
    <input type="password" placeholder="Enter password" />
  </div>

  <div className="input-group">
    <label>Confirm Password</label>
    <input type="password" placeholder="Confirm password" />
  </div>

  <button className="login-btn full-width">
    Register
  </button>
  <p className="back-login" onClick={() => navigate("/Login")}>
  Back to Login
  </p>

</div>
          </>
        )}

      </div>

    </div>
  );
}