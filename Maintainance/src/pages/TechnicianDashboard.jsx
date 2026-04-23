
import "./TechnicianDashboard.css";
import collegeLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ─── UTILS ──────────────────────────────────────────────────────────────────
const TABS = ["All", "Assigned", "In Progress", "Completed"];
const FILTER_MAP = { All: null, Assigned: "Assigned", "In Progress": "In Progress", Completed: "Completed" };
const STATUS_LABEL = { Assigned: "Assigned", "In Progress": "In Progress", Completed: "Completed" };

const CIRCUMFERENCE = 2 * Math.PI * 38;


// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("All");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedIssueForDetails, setSelectedIssueForDetails] = useState(null);
  const [estDays, setEstDays] = useState("");
  const [comment, setComment] = useState("");
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: localStorage.getItem("userName") || "",
    mobile: localStorage.getItem("userMobile") || "",
    department: localStorage.getItem("userField") || "IT",
    qualification: localStorage.getItem("userQualification") || "",
    lab_name: localStorage.getItem("userLab") || "",
    room_number: localStorage.getItem("userRoom") || ""
  });
  const profileRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Technician";

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchIssues();
  }, [userId]);

  const fetchIssues = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues/technician/${userId}`);
      const data = await response.json();
      setIssues(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      setLoading(false);
    }
  };

  const updateStatus = async (issueId, newStatus) => {
    if (newStatus === 'In Progress') {
      const issue = issues.find(i => i.id === issueId);
      setSelectedIssue(issue);
      setUpdateModal(true);
      return;
    }
    
    // Default call for other statuses (like Completed)
    sendUpdate(issueId, newStatus, "", "");
  };

  const sendUpdate = async (issueId, status, days, msg) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: status,
          estimated_days: days,
          comment: msg
        })
      });
      if (response.ok) {
        fetchIssues();
        setUpdateModal(false);
        setEstDays("");
        setComment("");
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: localStorage.getItem("userEmail"),
          role: "staff",
          ...editFormData
        })
      });

      if (response.ok) {
        localStorage.setItem("userName", editFormData.name);
        localStorage.setItem("userMobile", editFormData.mobile);
        localStorage.setItem("userField", editFormData.department);
        localStorage.setItem("userQualification", editFormData.qualification);
        localStorage.setItem("userLab", editFormData.lab_name);
        localStorage.setItem("userRoom", editFormData.room_number);
        
        setIsEditProfileModalOpen(false);
        alert("Profile updated successfully!");
        window.location.reload(); // Simple way to refresh all UI components
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to update profile"));
      }
    } catch (error) {
      alert("Network error updating profile");
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered =
    FILTER_MAP[activeTab] === null
      ? issues
      : issues.filter((i) => i.status === FILTER_MAP[activeTab]);

  // Dynamic Stats
  const stats = [
    { label: "Assigned",    value: issues.filter(i => i.status === "Assigned").length, sub: "📌 Pending action", icon: "📋", cls: "s1" },
    { label: "In Progress", value: issues.filter(i => i.status === "In Progress").length, sub: "⚡ Active now",      icon: "⚙️", cls: "s2" },
    { label: "Completed",   value: issues.filter(i => i.status === "Completed").length, sub: "🎯 Total done",       icon: "✅", cls: "s4" },
  ];

  const highCount = issues.filter(i => i.priority === "High").length;
  const medCount = issues.filter(i => i.priority === "Medium").length;
  const lowCount = issues.filter(i => i.priority === "Low").length;
  const totalCount = issues.length || 1;

  const bars = [
    { label: "High",   pct: (highCount/totalCount)*100, color: "#ef4444", countColor: "#dc2626", count: highCount },
    { label: "Medium", pct: (medCount/totalCount)*100, color: "#f59e0b", countColor: "#d97706", count: medCount },
    { label: "Low",    pct: (lowCount/totalCount)*100, color: "#22c55e", countColor: "#16a34a", count: lowCount },
  ];

  const completedCount = issues.filter(i => i.status === "Completed").length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const circumference = 2 * Math.PI * 38;

  return (
    <div className="td-wrapper">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="td-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`td-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="td-brand">
          <div className="sd-brand-icon">
  <img
    src={collegeLogo}
    alt="College Logo"
    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
  />
</div>
          <div className="td-brand-name">TechDesk Pro</div>
          <div className="td-brand-sub">Staff Panel</div>
          <button className="td-sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        {/* Nav */}
        <nav className="td-nav">
          {[
            { id: "dashboard", icon: "⊞", label: "Dashboard", section: "Overview" },
            { id: "issues",    icon: "📋", label: "All Issues",  badge: issues.length, badgeType: "warn",    section: null },
            { id: "assigned",  icon: "📌", label: "Assigned",    badge: issues.filter(i => i.status === "Assigned").length, section: "My Work" },
            { id: "inprogress",icon: "⚙️", label: "In Progress", badge: issues.filter(i => i.status === "In Progress").length, section: null },
            { id: "completed", icon: "✅", label: "Completed",   badge: issues.filter(i => i.status === "Completed").length, badgeType: "success", section: null },
            { id: "reports",   icon: "📊", label: "Reports",     section: "Tools" },
            { id: "schedule",  icon: "🗓️", label: "Schedule",    section: null },
            { id: "messages",  icon: "💬", label: "Messages",    badge: "0", section: null },
            
          ].map((item) => (
            <div key={item.id}>
              {item.section && <div className="td-nav-label">{item.section}</div>}
              <div
                className={`td-nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === "issues") setActiveTab("All");
                  if (item.id === "assigned") setActiveTab("Assigned");
                  if (item.id === "inprogress") setActiveTab("In Progress");
                  if (item.id === "completed") setActiveTab("Completed");
                  setSidebarOpen(false);
                }}
              >
                <span className="td-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge !== undefined && item.badge !== null && (
                  <span className={`td-nav-badge ${item.badgeType || ""}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="td-sidebar-footer" ref={profileRef}>

  {/* Profile Dropdown */}
  {profileOpen && (
    <div className="td-profile-dropdown">
      <div className="td-dropdown-header">
        <div className="td-dropdown-avatar">{userName.charAt(0).toUpperCase()}</div>
        <div className="td-dropdown-info">
          <div className="td-dropdown-name">{userName}</div>
          <div className="td-dropdown-role">{localStorage.getItem("userEmail")}</div>
        </div>
      </div>
      <div className="td-dropdown-divider" />
      <button
        className="td-dropdown-item"
        onClick={() => {
          setActiveNav("profile");
          setProfileOpen(false);
        }}
      >
        👤 My Profile
      </button>
      <button
        className="td-dropdown-item"
        onClick={() => setProfileOpen(false)}
      >
        ⚙️ Account Settings
      </button>
      <div className="td-dropdown-divider" />
      <button
        className="td-dropdown-item logout"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        🚪 Logout
      </button>
    </div>
  )}

  {/* Profile Button */}
  <div
    className={`td-profile ${profileOpen ? "active" : ""}`}
    onClick={() => setProfileOpen(!profileOpen)}
  >
    <div className="td-avatar">{userName.substring(0, 2).toUpperCase()}</div>
    <div>
      <div className="td-name">{userName}</div>
      <div className="td-role">{localStorage.getItem("userField") || "Technician"}</div>
    </div>
    <span className="td-profile-arrow">{profileOpen ? "▲" : "▼"}</span>
  </div>

</div>
      </aside>

      {/* ── MAIN ── */}
      <main className="td-main">
        {/* Topbar */}
        <div className="td-topbar">
  <div className="td-topbar-left" style={{ display: 'flex', alignItems: 'center' }}>
    <button className="td-hamburger" onClick={() => setSidebarOpen(true)}>
      ☰
    </button>
    <div>
      <div className="td-page-title">
        {activeNav === "dashboard" ? `Good morning, ${userName.split(' ')[0]} 👋` : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
      </div>
      <div className="td-page-sub">
        {activeNav === "dashboard" ? `${issues.filter(i => i.status !== 'Completed').length} open issues today` : `Viewing ${activeTab} Issues`}
      </div>
    </div>
  </div>
  <div className="td-topbar-actions">
    <div className="td-search">🔍 <span className="td-search-text">Search issues...</span></div>
    <div className="td-icon-btn">
      🔔<span className="td-notif-dot" />
    </div>
  </div>
</div>

        {/* ── DASHBOARD VIEW ── */}
        {activeNav === "dashboard" && (
          <>
            {/* Stats */}
            <div className="td-stats-grid">
              {stats.map((s) => (
                <div key={s.label} className={`td-stat-card ${s.cls}`}>
                  <div className="td-stat-label">{s.label}</div>
                  <div className="td-stat-value">{s.value}</div>
                  <div className="td-stat-sub">{s.sub}</div>
                  <div className="td-stat-icon">{s.icon}</div>
                </div>
              ))}
            </div>

            {/* Content grid */}
            <div className="td-content-grid">
              {/* Left: Issue queue */}
              <div>
                <div className="td-sec-header">
                  <div className="td-sec-title">Issue Queue</div>
                  <div className="td-sec-action" onClick={() => setActiveNav("issues")}>View all →</div>
                </div>

                <div className="td-filter-tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      className={`td-tab ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="td-issues-list">
                  {filtered.map((issue) => (
                    <div key={issue.id} className={`td-issue-card ${issue.priority.toLowerCase()}`}>
                      <div className="td-issue-top">
                        <div>
                          <div className="td-issue-title">{issue.equipment_name}</div>
                          {issue.reporter_count > 1 && (
                            <div className="td-reporter-badge" style={{ fontSize: '10px', color: '#7c3aed', background: '#ede9fe', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: '700' }}>
                              👥 Reported by {issue.reporter_count} students
                            </div>
                          )}
                        </div>
                        <div className="td-badges-row">
                          <span className={`td-badge priority-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                          <span className={`td-badge status-${issue.status.toLowerCase().replace(' ', '')}`}>{issue.status}</span>
                        </div>
                      </div>
                      <div className="td-issue-meta">
                        <span>📍 {issue.lab_name}, {issue.room_name}</span>
                        <span>🕐 {issue.created_at.split(' ')[0]}</span>
                      </div>
                      <div className="td-issue-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <button 
                          className="td-chip c1" 
                          onClick={() => {
                            setSelectedIssueForDetails(issue);
                            setDetailsModal(true);
                          }}
                        >
                          🔍 View Details
                        </button>
                        {issue.status === 'Assigned' && (
                          <button className="td-chip c2" onClick={() => updateStatus(issue.id, 'In Progress')}>Start Work</button>
                        )}
                        {issue.status === 'In Progress' && (
                          <button className="td-chip c4" onClick={() => updateStatus(issue.id, 'Completed')}>Mark Completed</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && <div className="td-empty-notice">No issues found in this category.</div>}
                </div>
              </div>

              {/* Right: panels */}
              <div className="td-right-panel">
                {/* Progress */}
                <div className="td-panel-card">
                  <div className="td-sec-title">Weekly Progress</div>
                  <div className="td-ring-wrap">
                    <svg width="96" height="96" viewBox="0 0 96 96" className="td-ring-svg">
                      <circle cx="48" cy="48" r="38" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="48" cy="48" r="38"
                        fill="none" stroke="#16a34a" strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - completionPct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="td-ring-center">
                      <div className="td-ring-pct">{completionPct}%</div>
                      <div className="td-ring-lbl">done</div>
                    </div>
                  </div>
                  <div className="td-ring-sub">{completedCount} of {totalCount} issues resolved</div>
                  {bars.map((b) => (
                    <div key={b.label} className="td-mini-row">
                      <div className="td-mini-name">{b.label}</div>
                      <div className="td-mini-bar-wrap">
                        <div className="td-mini-bar" style={{ width: `${b.pct}%`, background: b.color }} />
                      </div>
                      <div className="td-mini-num" style={{ color: b.countColor }}>{b.count}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="td-panel-card">
                  <div className="td-sec-title" style={{ marginBottom: 10 }}>Quick Actions</div>
                  <div className="td-chips">
                    <button className="td-chip c1">+ New Issue</button>
                    <button className="td-chip c2">📎 Upload Photo</button>
                    <button className="td-chip c3">📤 Submit Report</button>
                    <button className="td-chip c4">🔔 Set Reminder</button>
                  </div>
                </div>

                {/* Activity */}
                <div className="td-panel-card">
                  <div className="td-sec-title" style={{ marginBottom: 10 }}>Recent Activity</div>
                  {issues.slice(0, 4).map((a, i) => (
                    <div key={i} className="td-activity-item">
                      <div className="td-act-dot" style={{ background: a.status === 'Completed' ? '#16a34a' : '#2563eb' }} />
                      <div>
                        <div className="td-act-text">
                          <strong>#ISS-{String(a.id).padStart(3, '0')}</strong> is <strong>{a.status}</strong>
                        </div>
                        <div className="td-act-time">{a.created_at.split(' ')[0]}</div>
                      </div>
                    </div>
                  ))}
                  {issues.length === 0 && <div className="td-empty-notice">No recent activity.</div>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CLEAN ISSUES VIEW ── */}
        {["issues", "assigned", "inprogress", "completed"].includes(activeNav) && (
          <div className="td-clean-view animated-fade-in" style={{ padding: '0 20px' }}>
            <div className="td-sec-header" style={{ marginBottom: '24px' }}>
              <div className="td-sec-title" style={{ fontSize: '24px' }}>{activeTab} Issues</div>
              <div className="td-sec-action">{filtered.length} total found</div>
            </div>
            
            <div className="td-issues-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filtered.map((issue) => (
                <div key={issue.id} className={`td-issue-card ${issue.priority.toLowerCase()}`} style={{ margin: 0 }}>
                  <div className="td-issue-top">
                    <div>
                      <div className="td-issue-title">{issue.equipment_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--td-muted)', marginTop: '4px' }}>#ISS-{String(issue.id).padStart(3, '0')}</div>
                    </div>
                    <div className="td-badges-row">
                      <span className={`td-badge priority-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                      <span className={`td-badge status-${issue.status.toLowerCase().replace(' ', '')}`}>{issue.status}</span>
                    </div>
                  </div>
                  <div className="td-issue-meta">
                    <span>📍 {issue.lab_name}, {issue.room_name}</span>
                    <span>🕐 {issue.created_at.split(' ')[0]}</span>
                  </div>
                  <div className="td-issue-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button className="td-chip c1" onClick={() => { setSelectedIssueForDetails(issue); setDetailsModal(true); }}>🔍 Details</button>
                    {issue.status === 'Assigned' && <button className="td-chip c2" onClick={() => updateStatus(issue.id, 'In Progress')}>Start Work</button>}
                    {issue.status === 'In Progress' && <button className="td-chip c4" onClick={() => updateStatus(issue.id, 'Completed')}>Complete</button>}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="td-empty-notice">No {activeTab.toLowerCase()} issues assigned to you.</div>}
            </div>
          </div>
        )}

        {/* ── PROFILE VIEW ── */}
        {activeNav === "profile" && (
          <div className="td-profile-view">
            <div className="td-profile-card">
              <div className="td-profile-header">
                <div className="td-profile-avatar-large">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <div className="td-profile-title">
                  <h2>{userName}</h2>
                  <p>Technician • {localStorage.getItem("userLab") || "Central Lab"}</p>
                </div>
              </div>
              <div className="td-profile-body">
                <div className="td-info-group">
                  <span className="td-info-label">Full Name</span>
                  <div className="td-info-value">{userName}</div>
                </div>
                <div className="td-info-group">
                  <span className="td-info-label">Email Address</span>
                  <div className="td-info-value">{localStorage.getItem("userEmail")}</div>
                </div>
                <div className="td-info-group">
                  <span className="td-info-label">Mobile Number</span>
                  <div className="td-info-value">{localStorage.getItem("userMobile") || "Not Provided"}</div>
                </div>
                <div className="td-info-group">
                  <span className="td-info-label">Department</span>
                  <div className="td-info-value">{localStorage.getItem("userField") || "IT"}</div>
                </div>
                <div className="td-info-group">
                  <span className="td-info-label">Qualification</span>
                  <div className="td-info-value">{localStorage.getItem("userQualification") || "N/A"}</div>
                </div>
                <div className="td-info-group">
                  <span className="td-info-label">Primary Lab</span>
                  <div className="td-info-value">{localStorage.getItem("userLab") || "N/A"}</div>
                </div>
                <div className="td-info-group">
                  <span className="td-info-label">Room Number</span>
                  <div className="td-info-value">{localStorage.getItem("userRoom") || "N/A"}</div>
                </div>
              </div>
              <div className="td-profile-footer" style={{ padding: '20px 30px', borderTop: '1px solid var(--td-border)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="td-btn-submit" 
                  onClick={() => setIsEditProfileModalOpen(true)}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FALLBACK FOR OTHER PAGES ── */}
        {!["dashboard", "profile", "issues", "assigned", "inprogress", "completed"].includes(activeNav) && (
          <div className="td-empty-notice" style={{ marginTop: '100px', fontSize: '18px' }}>
            🚧 <strong>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</strong> page is under development.
          </div>
        )}
      </main>

      {/* ── UPDATE MODAL ── */}
      {updateModal && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <div className="td-modal-header">
              <h3>Start Work Update</h3>
              <button 
                className="td-modal-close"
                onClick={() => setUpdateModal(false)}
              >×</button>
            </div>
            <div className="td-modal-body">
              <p>Issue: <strong>{selectedIssue?.equipment_name}</strong></p>
              
              <div className="td-field">
                <label>Estimated Days to Complete</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2-3 days"
                  value={estDays}
                  onChange={(e) => setEstDays(e.target.value)}
                />
              </div>

              <div className="td-field">
                <label>Technician Comment (Optional)</label>
                <textarea 
                  placeholder="Describe what needs to be done..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
            <div className="td-modal-footer">
              <button 
                className="td-btn-cancel"
                onClick={() => setUpdateModal(false)}
              >Cancel</button>
              <button 
                className="td-btn-submit"
                onClick={() => sendUpdate(selectedIssue.id, 'In Progress', estDays, comment)}
                disabled={!estDays}
              >Start & Notify User</button>
            </div>
          </div>
        </div>
      )}
      {/* ── DETAILS MODAL ── */}
      {detailsModal && selectedIssueForDetails && (
        <div className="td-modal-overlay nav-open" onClick={() => setDetailsModal(false)}>
          <div className="td-modal td-details-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-header">
              <h3>Issue Details #ISS-{String(selectedIssueForDetails.id).padStart(3, '0')}</h3>
              <button 
                className="td-modal-close"
                onClick={() => setDetailsModal(false)}
              >×</button>
            </div>
            <div className="td-modal-body">
              <div className="td-details-grid">
                <div className="td-details-section">
                  <h4 className="td-details-title">📋 Equipment Info</h4>
                  <div className="td-details-info">
                    <p><strong>Name:</strong> {selectedIssueForDetails.equipment_name}</p>
                    <p><strong>Reporters:</strong> {selectedIssueForDetails.reporter_count || 1} users</p>
                    <p><strong>ID:</strong> {selectedIssueForDetails.equipment_id || 'N/A'}</p>
                    <p><strong>Type:</strong> {selectedIssueForDetails.equipment_type}</p>
                    <p><strong>Location:</strong> {selectedIssueForDetails.lab_name}, {selectedIssueForDetails.room_name}</p>
                  </div>
                </div>
                <div className="td-details-section">
                  <h4 className="td-details-title">👤 Reporter Info</h4>
                  <div className="td-details-info">
                    <p><strong>Name:</strong> {selectedIssueForDetails.user_name}</p>
                    <p><strong>PRN:</strong> {selectedIssueForDetails.prn || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedIssueForDetails.email}</p>
                  </div>
                </div>
              </div>

              <div className="td-details-section" style={{ marginTop: '20px' }}>
                <h4 className="td-details-title">⚠️ Issue Info</h4>
                <div className="td-details-info">
                  <p><strong>Category:</strong> {selectedIssueForDetails.issue_subtype || 'General'}</p>
                  <p><strong>Priority:</strong> {selectedIssueForDetails.priority}</p>
                  <div className="td-details-desc-box" style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--td-muted)', textTransform: 'uppercase' }}>Description:</strong>
                    <div className="td-details-desc" style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--td-text)' }}>{selectedIssueForDetails.description || 'No description provided.'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="td-modal-footer">
              <div style={{ marginRight: 'auto' }}>
                <span className={`td-badge status-${selectedIssueForDetails.status.toLowerCase().replace(' ', '')}`}>
                  {selectedIssueForDetails.status}
                </span>
              </div>
              <button 
                className="td-btn-cancel"
                onClick={() => setDetailsModal(false)}
              >Close</button>
              {selectedIssueForDetails.status === 'Assigned' && (
                <button 
                  className="td-btn-submit"
                  onClick={() => {
                    setDetailsModal(false);
                    updateStatus(selectedIssueForDetails.id, 'In Progress');
                  }}
                >Start Work</button>
              )}
              {selectedIssueForDetails.status === 'In Progress' && (
                <button 
                  className="td-btn-submit"
                  onClick={() => {
                    setDetailsModal(false);
                    updateStatus(selectedIssueForDetails.id, 'Completed');
                  }}
                >Mark Completed</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditProfileModalOpen && (
        <div className="td-modal-overlay">
          <div className="td-modal" style={{ maxWidth: '500px' }}>
            <div className="td-modal-header">
              <h3>Edit Profile</h3>
              <button className="td-modal-close" onClick={() => setIsEditProfileModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="td-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="td-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={editFormData.name} 
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="td-field">
                    <label>Mobile Number</label>
                    <input 
                      type="text" 
                      value={editFormData.mobile} 
                      onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="td-field">
                    <label>Department</label>
                    <select 
                      className="td-select"
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--td-border)' }}
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                      required
                    >
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
                  <div className="td-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Qualification</label>
                    <input 
                      type="text" 
                      value={editFormData.qualification} 
                      onChange={(e) => setEditFormData({...editFormData, qualification: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="td-field">
                    <label>Primary Lab</label>
                    <input 
                      type="text" 
                      value={editFormData.lab_name} 
                      onChange={(e) => setEditFormData({...editFormData, lab_name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="td-field">
                    <label>Room Number</label>
                    <input 
                      type="text" 
                      value={editFormData.room_number} 
                      onChange={(e) => setEditFormData({...editFormData, room_number: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>
              <div className="td-modal-footer">
                <button type="button" className="td-btn-cancel" onClick={() => setIsEditProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="td-btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
