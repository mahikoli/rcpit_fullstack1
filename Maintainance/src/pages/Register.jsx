import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import logo from "../assets/logo.png";

export default function Register() {

  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    year: "",
    qualification: "",
    lab_name: "",
    room_number: "",
    password: "",
    confirmPassword: "",
    department: "IT"
  });

  const navigate = useNavigate();

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (role === "hod") {
      const authorizedHodEmails = [
        "hodcomp@rcpit.ac.in",
        "hodetc@rcpit.ac.in",
        "hodmech@rcpit.ac.in",
        "hodelect@rcpit.ac.in",
        "shailaja.patil@rcpit.ac.in",
        "hodcivil@rcpit.ac.in",
        "ujwala.patil@rcpit.ac.in",
        "hodaids@rcpit.ac.in",
        "hodit@rcpit.ac.in",
        "satish.desale@rcpit.ac.in"
      ];
      if (!authorizedHodEmails.includes(formData.email.toLowerCase())) {
        alert("Your email is not authorized for HOD registration. Please contact the administrator.");
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          year: role === "User" ? formData.year : "",
          qualification: role === "staff" ? formData.qualification : "",
          lab_name: role === "staff" ? formData.lab_name : "",
          room_number: role === "staff" ? formData.room_number : "",
          password: formData.password,
          role: role,
          department: formData.department
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.detail || "Registration Failed");
      }

    } catch (error) {
      console.log(error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <img src={logo} alt="College Logo" className="logo-img" onError={(e) => {
            e.target.style.display = 'none';
          }}/>
        </div>
        <h2>College ERP System</h2>
        <p className="subtitle">Equipment & Maintenance Management</p>

        {/* STEP 1 : SELECT ROLE */}
        {step === 1 && (
          <div className="animated-fade-in">
            <h3>Select Your Role</h3>
            <div className="role-selection-grid">
              <button className="role-btn-modern" onClick={() => selectRole("User")}>
                <div className="role-icon">👤</div>
                <span>User (Student)</span>
              </button>
              <button className="role-btn-modern" onClick={() => selectRole("staff")}>
                <div className="role-icon">🛠️</div>
                <span>Staff (Technician)</span>
              </button>
              <button className="role-btn-modern" onClick={() => selectRole("hod")}>
                <div className="role-icon">👨‍🏫</div>
                <span>HOD Registration</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 : FORM */}
        {step === 2 && (
          <div className="animated-fade-in">
            <div className="form-header">
              <h3>
                {role === "User" ? "Student Registration" : role === "hod" ? "HOD Registration" : "Staff Registration"}
              </h3>
              <p onClick={() => setStep(1)} className="change-role">Change Role</p>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Email ID</label>
                <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Mobile No.</label>
                <input type="text" name="mobile" placeholder="Enter mobile number" value={formData.mobile} onChange={handleChange} required />
              </div>

              {role !== "staff" && (
                <div className="input-group">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="modern-select" required>
                    <option value="Aplied Science & Humanities">Aplied Science & Humanities</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Computer Science & Engineering(Data Science)">Computer Science & Engineering(Data Science)</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Electronics & TeleCommunication Engineering">Electronics & TeleCommunication Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
              )}

              {role === "User" || role === "hod" ? (
                <div className="input-group">
                  <label>Current Year</label>
                  <select name="year" value={formData.year} onChange={handleChange} className="modern-select" required>
                    <option value="">Select Year</option>
                    <option value="FY">First Year (FY)</option>
                    <option value="SY">Second Year (SY)</option>
                    <option value="TY">Third Year (TY)</option>
                    <option value="BTech">B.Tech (Final Year)</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label>Qualification</label>
                    <input type="text" name="qualification" placeholder="e.g. B.E. Electrical" value={formData.qualification} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Lab Name</label>
                    <input type="text" name="lab_name" placeholder="Enter Lab Name" value={formData.lab_name} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Room Number</label>
                    <input type="text" name="room_number" placeholder="Enter Room Number" value={formData.room_number} onChange={handleChange} required />
                  </div>
                </>
              )}

              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Create password" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <button className="login-btn full-width" onClick={handleRegister}>
              Create Account
            </button>

            <p className="back-login" onClick={() => navigate("/Login")}>
              Already have an account? <span>Login</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}