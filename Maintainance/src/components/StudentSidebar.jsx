import { Link } from "react-router-dom";
import "./StudentSidebar.css";
import logo from "../assets/logo.png";

function StudentSidebar() {
  return (
    <div className="student-sidebar">

      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="College Logo" />
        <h2>College ERP</h2>
        <p>Student Portal</p>
      </div>

      <ul className="menu">

        <li>
          <Link to="/student-dashboard">
            <i className="fi fi-br-grid"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        <li>
          <Link to="/report-issue">
            <i class="fi fi-br-bug"></i>
            <span>Report Issue</span>
          </Link>
        </li>

        <li>
          <Link to="/myissue">
            <i class="fi fi-br-list"></i>
            <span>My Issues</span>
          </Link>
        </li>

        <li>
          <Link to="/SolvedIssues">
            <i class="fi fi-br-check"></i>
            <span>Solved Issues</span>
          </Link>
        </li>

        <li>
          <Link to="/login">
            <i class="fi fi-br-sign-out-alt"></i>
            <span>Logout</span>
          </Link>
        </li>

      </ul>

    </div>
  );
}

export default StudentSidebar;