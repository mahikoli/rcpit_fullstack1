import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import collegeLogo from "../assets/logo.png";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

// Real technicians will be fetched from the API
const PIE_COLORS = ["#f59e0b", "#7c3aed", "#2563eb", "#16a34a"];

const NAV_ITEMS = [
  { key: "dashboard", icon: "⊞",  label: "Dashboard"         },
  { key: "issues",    icon: "📋",  label: "All Issues"        },
  { key: "users",     icon: "👥",  label: "Users"             },
  { key: "equipment", icon: "🔧",  label: "Equipment"         },
  { key: "add-equipment", icon: "➕", label: "Add Equipment"   },
  { key: "notices",   icon: "📢",  label: "Notices"           },
  { key: "complaints",icon: "⚠️",  label: "Complaints"        },
  { key: "reports",   icon: "📄",  label: "Reports"           },
];

const PRIORITY_CLASS = { High: "priority-high", Medium: "priority-medium", Low: "priority-low" };
const STATUS_CLASS   = { Pending: "status-pending", Assigned: "status-assigned", "In Progress": "status-inprogress", Completed: "status-completed" };

function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className={`ad-stat-card ${colorClass}`}>
      <div className="ad-stat-icon">{icon}</div>
      <div className="ad-stat-label">{label}</div>
      <div className="ad-stat-value">{value}</div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [equipmentsList, setEquipmentsList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [noticeForm, setNoticeForm] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [userTab, setUserTab] = useState("student"); // 'student' or 'staff'
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [isStuck, setIsStuck] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: localStorage.getItem("userName") || "",
    mobile: localStorage.getItem("userMobile") || "",
    department: localStorage.getItem("userDepartment") || "Information Technology"
  });
  const adminField = localStorage.getItem("userField");
  const adminDept = localStorage.getItem("userDepartment");
  const isIT = adminField === "IT" || adminDept === "Information Technology" || adminDept === "Computer Engineering";
  const isElectrical = adminField === "Electrical" || adminDept === "Electrical Engineering";

  const scrollRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsStuck(scrollRef.current.scrollTop > 5);
      }
    };
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
    fetchEquipments();
    fetchTechnicians();
    fetchNotifications();
    fetchNotices();
    if (localStorage.getItem("adminRole") === "hod") {
      fetchComplaints();
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      const dept = localStorage.getItem("userDepartment") || "";
      const url = dept ? `${import.meta.env.VITE_API_URL}/complaints?department=${encodeURIComponent(dept)}` : `${import.meta.env.VITE_API_URL}/complaints`;
      const res = await fetch(url);
      if (res.ok) setComplaints(await res.json());
    } catch (e) { console.error("Failed to fetch complaints:", e); }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notices`);
      if (res.ok) setNotices(await res.json());
    } catch (e) { console.error("Failed to fetch notices:", e); }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.body.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeForm.title,
          body: noticeForm.body,
          posted_by: localStorage.getItem("userName") || "Admin"
        })
      });
      if (res.ok) {
        setNoticeForm({ title: "", body: "" });
        fetchNotices();
        alert("Notice posted successfully!");
      }
    } catch (e) { alert("Network error posting notice"); }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notices/${id}`, { method: "DELETE" });
      if (res.ok) fetchNotices();
    } catch (e) { alert("Failed to delete notice"); }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/admin`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn("Expected array for notifications, got:", data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/technicians`);
      if (!response.ok) throw new Error("Failed to fetch technicians");
      const data = await response.json();
      if (Array.isArray(data)) {
        setTechnicians(data);
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
      setTechnicians([]);
    }
  };

  const fetchEquipments = async () => {
    try {
      const field = localStorage.getItem("userField");
      let url = `${import.meta.env.VITE_API_URL}/equipments`;
      if (field) url += `?field=${field}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch equipments");
      const data = await response.json();
      if (Array.isArray(data)) {
        setEquipmentsList(data);
      } else {
        setEquipmentsList([]);
      }
    } catch (error) {
      console.error("Failed to fetch equipments:", error);
      setEquipmentsList([]);
    }
  };

  const handleDownloadQR = async (uniqueId, equipmentName) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(uniqueId)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR_${equipmentName.replace(/[^a-zA-Z0-9]/g, '_')}_${uniqueId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert("Failed to download QR Code.");
    }
  };

  const deleteEquipment = async (uniqueId) => {
    if (!window.confirm(`Are you sure you want to delete equipment ${uniqueId}?`)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${uniqueId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert("Equipment deleted successfully");
        fetchEquipments();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to delete equipment"));
      }
    } catch (error) {
      alert("Network Error: Could not delete equipment");
    }
  };

  const openEditModal = (eq) => {
    setEditingEquipment({ ...eq });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEquipment(null);
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${editingEquipment.unique_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEquipment)
      });
      if (response.ok) {
        alert("Equipment updated successfully");
        closeEditModal();
        fetchEquipments();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to update equipment"));
      }
    } catch (error) {
      alert("Network Error: Could not update equipment");
    }
  };

  const fetchIssues = async () => {
    try {
      const field = localStorage.getItem("userField");
      const adminRole = localStorage.getItem("adminRole");
      const dept = localStorage.getItem("userDepartment");
      
      let url = `${import.meta.env.VITE_API_URL}/issues`;
      const params = new URLSearchParams();
      if (field) params.append("field", field);
      if (adminRole) params.append("admin_role", adminRole);
      if (dept) params.append("dept", dept);
      
      if (params.toString()) url += `?${params.toString()}`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn("Expected array for issues, got:", data);
        setIssues([]);
        return;
      }

      const mappedIssues = data.map(issue => ({
        id: `ISS-${String(issue.id).padStart(3, '0')}`,
        equipment: issue.equipment_name,
        location: `${issue.lab_name}, ${issue.room_name}`,
        priority: issue.priority,
        date: issue.created_at ? issue.created_at.split(' ')[0] : "N/A",
        status: issue.status,
        technician: issue.technician_name || "",
        technicianId: issue.technician_id,
        category: issue.issue_subtype || "General",
        dbId: issue.id,
        createdRaw: issue.created_at,
        isEscalated: issue.is_escalated,
        dept: issue.student_dept
      }));
      
      setIssues(mappedIssues);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
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
          role: "admin",
          ...editFormData
        })
      });

      if (response.ok) {
        localStorage.setItem("userName", editFormData.name);
        localStorage.setItem("userMobile", editFormData.mobile);
        localStorage.setItem("userDepartment", editFormData.department);
        
        setIsProfileModalOpen(false);
        alert("Profile updated successfully!");
        window.location.reload();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to update profile"));
      }
    } catch (error) {
      alert("Network error updating profile");
    }
  };

  // Disabled: manual assignment removed
  async function assignTechnician(dbId, techName) {
    return;
  }

  // Dynamic Stats
  const totalReports      = issues.length;
  const pendingReports    = issues.filter(i => i.status === "Pending").length;
  const underMaintenance  = issues.filter(i => i.status === "In Progress" || i.status === "Assigned").length;
  const completedReports  = issues.filter(i => i.status === "Completed" || i.status === "Solved").length;

  // Dynamic Pie Data
  const pieData = [
    { name: "Pending",     value: pendingReports },
    { name: "Assigned",    value: issues.filter(i => i.status === "Assigned").length },
    { name: "In Progress", value: issues.filter(i => i.status === "In Progress").length },
    { name: "Completed",   value: completedReports },
  ].filter(d => d.value > 0);

  // Dynamic Line Data (simplified: count reports per day for the last few days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = issues.filter(iss => iss.date === dateStr).length;
    return { day: dateStr.split('-').slice(1).join('/'), reports: count };
  });

  // Dynamic Activity Feed
  const recentActivities = issues.slice(0, 5).map(iss => ({
    dot: iss.isEscalated ? '#ef4444' : (iss.status === 'Pending' ? '#f59e0b' : '#16a34a'),
    text: <>
      {iss.isEscalated && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>[ESCALATED] </span>}
      <strong>{iss.id}</strong> — {iss.equipment} is <strong>{iss.status}</strong>
    </>,
    time: "Latest"
  }));

  return (
    <div className="ad-wrapper">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="ad-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-brand">
          <div className="ad-brand-icon">
            <img
              src={collegeLogo}
              alt="College Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }}
            />
          </div>
          <div className="ad-brand-name">College ERP</div>
          <div className="ad-brand-sub">Admin Portal</div>
          <button className="ad-sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav-label">Navigation</div>
          {NAV_ITEMS.filter(n => !(n.key === "complaints" && localStorage.getItem("adminRole") !== "hod")).map(n => {
            let badgeValue = 0;
            if (n.key === "issues") badgeValue = Array.isArray(issues) ? issues.length : 0;
            if (n.key === "users") {
              badgeValue = Array.isArray(users) ? users.filter(u => u.role === "User" || u.role === "staff").length : 0;
            }

            return (
                <div
                  key={n.key}
                  className={`ad-nav-item${page === n.key ? " active" : ""}`}
                  onClick={() => {
                    setPage(n.key);
                    setSidebarOpen(false); // Close sidebar on nav on mobile
                  }}
                >
                <span className="ad-nav-icon">{n.icon}</span>
                {n.label}
                {badgeValue > 0 && (
                  <span className={`ad-nav-badge ${n.key === 'issues' && issues.some(i => i.status === 'Pending') ? 'warn' : ''}`}>
                    {badgeValue}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ad-sidebar-footer" ref={profileRef}>
          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="ad-profile-dropdown">
              <div className="ad-dropdown-avatar">{localStorage.getItem("adminRole") === "hod" ? "H" : "A"}</div>
              <div className="ad-dropdown-name">{localStorage.getItem("userName") || "Super Admin"}</div>
              <div className="ad-dropdown-role">{localStorage.getItem("adminRole") === "hod" ? "Department Head" : "Administrator"}</div>
              <div style={{ fontSize: '11px', color: 'var(--ad-muted)', textAlign: 'center', marginTop: '4px' }}>
                {localStorage.getItem("userEmail")}
              </div>
              <div className="ad-dropdown-divider" />
              <button 
                className="ad-dropdown-item" 
                onClick={() => {
                  setPage("profile");
                  setProfileOpen(false);
                }}
              >
                👤 My Profile
              </button>
              <button className="ad-dropdown-item" onClick={() => setProfileOpen(false)}>
                ⚙️ Settings
              </button>
              <div className="ad-dropdown-divider" />
              <button 
                className="ad-dropdown-item logout" 
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
            className={`ad-profile ${profileOpen ? "active" : ""}`}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="ad-avatar">{localStorage.getItem("adminRole") === "hod" ? "H" : "A"}</div>
            <div>
              <div className="ad-name">{localStorage.getItem("userName") || "User"}</div>
              <div className="ad-role">{localStorage.getItem("adminRole") === "hod" ? "HOD" : "Super Admin"}</div>
            </div>
            <span className="ad-profile-arrow">{profileOpen ? "▲" : "▼"}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ad-main" ref={scrollRef}>

        {/* Topbar */}
        <div className={`ad-topbar ${isStuck ? 'stuck' : ''}`}>
          <div className="ad-top-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <div>
              <div className="ad-page-title">
                {page === "dashboard" && (
                  localStorage.getItem("adminRole") === "hod" 
                    ? `HOD Dashboard - ${localStorage.getItem("userDepartment") || ""} Escalated Issues`
                    : `${localStorage.getItem("userField") || ""} Admin Dashboard`
                )}
                {page === "issues"     && "All Issues"}
                {page === "users"      && "Users"}
                {page === "equipment"  && "Equipment List"}
                {page === "add-equipment" && "Add New Equipment"}
                {page === "notices"    && "Notices"}
                {page === "complaints" && "Complaints"}
                {page === "reports"    && "Reports"}
              </div>
              <div className="ad-page-sub">College ERP · Admin Panel · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="ad-topbar-actions">
            <div className="ad-search">🔍 Search...</div>
            <div className="ad-icon-btn" onClick={() => {
              // Optionally show a list, for now we just show the count
              const msg = Array.isArray(notifications) && notifications.length > 0 ? notifications.map(n => n.message).join('\n') : "No notifications";
              alert(msg);
            }}>
              🔔
              {Array.isArray(notifications) && notifications.some(n => !n.is_read) && <span className="ad-notif-dot" />}
            </div>
            <div className={`ad-nav-item${page === 'profile' ? ' active' : ''}`} onClick={() => setPage("profile")} style={{ display: 'none' }}></div>
            <div className="ad-icon-btn ad-add-btn">+</div>
          </div>
        </div>

        {/* ── DASHBOARD PAGE ── */}
        {page === "dashboard" && (
          <>
            <div className="ad-stats-grid">
              <StatCard label="Total Reports"   value={totalReports}      icon="📋"  colorClass="s1" />
              <StatCard label="Pending"         value={pendingReports}    icon="⏳"  colorClass="s3" />
              <StatCard label="In Progress"    value={underMaintenance}  icon="🔧"  colorClass="s4" />
              <StatCard label="Completed"       value={completedReports}  icon="✅"  colorClass="s2" />
            </div>

            <div className="ad-charts-grid">
              <div className="ad-chart-card">
                <div className="ad-sec-title">Reports Overview</div>
                <div className="ad-chart-body">
                  <PieChart width={220} height={200}>
                    <Pie data={pieData} dataKey="value" cx={105} cy={90} outerRadius={80} innerRadius={40}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <div className="ad-pie-legend">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="ad-legend-item">
                        <span className="ad-legend-dot" style={{ background: PIE_COLORS[i] }} />
                        <span className="ad-legend-name">{d.name}</span>
                        <span className="ad-legend-val">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ad-chart-card">
                <div className="ad-sec-title">Reports Analytics</div>
                <div style={{ marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="reports" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="ad-chart-card">
                <div className="ad-sec-title">Recent Activity</div>
                <div className="ad-activity-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((a, i) => (
                      <div key={i} className="ad-activity-item">
                        <span className="ad-act-dot" style={{ background: a.dot }} />
                        <div>
                          <div className="ad-act-text">{a.text}</div>
                          <div className="ad-act-time">{a.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ad-empty-notice">No recent reports found</div>
                  )}
                </div>
              </div>

              <div className="ad-chart-card">
                <div className="ad-sec-title">Quick Actions</div>
                <div className="ad-quick-actions">
                  {[
                    { cls: "c1", label: "➕ Add Equipment",      action: () => setPage("add-equipment") },
                    { cls: "c3", label: "📋 View All Issues",     action: () => setPage("issues")    },
                    { cls: "c4", label: "📄 Generate Report",     action: () => setPage("reports")   },
                  ].map(b => (
                    <button key={b.label} className={`ad-chip ${b.cls}`} onClick={b.action}>{b.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── ALL ISSUES PAGE ── */}
        {page === "issues" && (
          <>
            <div className="ad-sec-header" style={{ marginBottom: 16 }}>
              <span className="ad-badge-count">{issues.length} total issues</span>
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>Equipment</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map(issue => (
                    <tr key={issue.id} className={issue.isEscalated ? "row-escalated" : ""}>
                      <td>
                        <span className="ad-issue-id">{issue.id}</span>
                        {issue.isEscalated && <div className="escalated-tag">🔥 Escalated</div>}
                      </td>
                      <td><span className="ad-eq-name">{issue.equipment}</span></td>
                      <td><span className="ad-category">🏷️ {issue.category}</span></td>
                      <td><span className="ad-location">📍 {issue.location}</span></td>
                      <td><span className={`ad-badge ${PRIORITY_CLASS[issue.priority]}`}>{issue.priority}</span></td>
                      <td className="ad-date">{issue.date}</td>
                      <td><span className={`ad-badge ${STATUS_CLASS[issue.status]}`}>{issue.status}</span></td>
                      <td className="ad-tech">{issue.technician || <span className="ad-unassigned">Not Assigned</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ASSIGN PAGE REMOVED ── */}

        {/* ── USERS PAGE ── */}
        {page === "users" && (
          <div className="ad-users-view animated-fade-in">
            <div className="ad-view-header">
              <div className="ad-tab-switcher">
                <button
                  className={userTab === "student" ? "active" : ""}
                  onClick={() => setUserTab("student")}
                >
                  Students ({users.filter(u => u.role === "User").length})
                </button>
                <button
                  className={userTab === "staff" ? "active" : ""}
                  onClick={() => setUserTab("staff")}
                >
                  Staff/Technicians ({users.filter(u => u.role === "staff").length})
                </button>
              </div>
            </div>

            <div className="ad-table-card">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>MOBILE NO.</th>
                    {userTab === "student" ? <th>YEAR</th> : <th>QUALIFICATION</th>}
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => userTab === "student" ? u.role === "User" : u.role === "staff")
                    .map(u => (
                      <tr key={u.id}>
                        <td className="ad-font-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.mobile || "N/A"}</td>
                        <td>{userTab === "student" ? (u.year || "N/A") : (u.qualification || "N/A")}</td>
                        <td>
                          <button className="ad-action-btn delete">Remove</button>
                        </td>
                      </tr>
                    ))}
                  {users.filter(u => userTab === "student" ? u.role === "User" : u.role === "staff").length === 0 && (
                    <tr>
                      <td colSpan="5" className="ad-empty-row">No {userTab}s found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EQUIPMENT PAGE ── */}
        {page === "equipment" && (
          <div className="ad-equipment-view animated-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* View Equipment Table */}
            <div>
              <div className="ad-sec-header" style={{ marginBottom: 16 }}>
                <span className="ad-sec-title">All Equipment</span>
                <span className="ad-badge-count">{equipmentsList.length} total</span>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Unique ID</th>
                      <th>Category</th>
                      <th>Equipment Name</th>
                      <th>Location</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentsList.map((eq, i) => (
                      <tr key={i}>
                        <td className="ad-font-bold" style={{ color: 'var(--ad-purple)', fontFamily: "'Space Grotesk', monospace" }}>{eq.unique_id}</td>
                        <td><span className={`ad-badge ${eq.equipment_type === 'IT' ? 'status-assigned' : 'priority-low'}`}>{eq.equipment_type}</span></td>
                        <td><span className="ad-eq-name">{eq.equipment_name}</span></td>
                        <td><span className="ad-location">📍 {eq.lab_name}, {eq.room_name}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button 
                              type="button"
                              onClick={() => handleDownloadQR(eq.unique_id, eq.equipment_name)}
                              className="ad-chip c2" 
                              style={{ padding: '6px 12px', fontSize: '11px', border: 'none', cursor: 'pointer' }}
                            >
                              QR
                            </button>
                            <button 
                              type="button"
                              onClick={() => openEditModal(eq)}
                              className="ad-chip c1" 
                              style={{ padding: '6px 12px', fontSize: '11px', border: 'none', cursor: 'pointer', background: 'var(--ad-purple-light)', color: 'var(--ad-purple)' }}
                            >
                              Edit
                            </button>
                            <button 
                              type="button"
                              onClick={() => deleteEquipment(eq.unique_id)}
                              className="ad-chip delete" 
                              style={{ padding: '6px 12px', fontSize: '11px', border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#ef4444' }}
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {equipmentsList.length === 0 && (
                      <tr><td colSpan="5" className="ad-empty-row" style={{ padding: '20px', textAlign: 'center', color: 'var(--ad-muted)' }}>No equipment added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
              <div className="ad-modal-overlay">
                <div className="ad-modal-content">
                  <div className="ad-modal-header">
                    <h3>Edit Equipment</h3>
                    <button className="close-btn" onClick={closeEditModal}>×</button>
                  </div>
                  <form onSubmit={handleUpdateEquipment}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label>Unique ID (Read Only)</label>
                        <input className="ad-select" style={{ width: '100%' }} value={editingEquipment.unique_id} readOnly />
                      </div>
                      <div>
                        <label>Category</label>
                        <select 
                          className="ad-select" 
                          style={{ width: '100%' }} 
                          value={editingEquipment.equipment_type}
                          onChange={(e) => setEditingEquipment({...editingEquipment, equipment_type: e.target.value})}
                          required
                        >
                          {(isIT || (!isIT && !isElectrical)) && <option value="IT">IT Equipment</option>}
                          {(isElectrical || (!isIT && !isElectrical)) && <option value="Electrical">Electrical</option>}
                        </select>
                      </div>
                      <div>
                        <label>Lab Name</label>
                        <input 
                          className="ad-select" 
                          style={{ width: '100%' }} 
                          value={editingEquipment.lab_name}
                          onChange={(e) => setEditingEquipment({...editingEquipment, lab_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label>Room Number</label>
                        <input 
                          className="ad-select" 
                          style={{ width: '100%' }} 
                          value={editingEquipment.room_name}
                          onChange={(e) => setEditingEquipment({...editingEquipment, room_name: e.target.value})}
                          required
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label>Equipment Name</label>
                        <input 
                          className="ad-select" 
                          style={{ width: '100%' }} 
                          value={editingEquipment.equipment_name}
                          onChange={(e) => setEditingEquipment({...editingEquipment, equipment_name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="ad-modal-footer">
                      <button type="button" onClick={closeEditModal} className="ad-btn-cancel">Cancel</button>
                      <button type="submit" className="ad-btn-save">Update Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD EQUIPMENT PAGE ── */}
        {page === "add-equipment" && (
          <div className="ad-equipment-view animated-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Add Equipment Form */}
            <div>
              <div className="ad-sec-header" style={{ marginBottom: 16 }}>
                <span className="ad-sec-title">Add New Equipment</span>
              </div>
              <div className="ad-table-card" style={{ padding: '24px' }}>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData);
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/equipments`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    if (res.ok) {
                      alert('Equipment Added Successfully!');
                      e.target.reset();
                      fetchEquipments();
                      setPage("equipment");
                    } else {
                      const err = await res.json();
                      alert('Error: ' + (err.detail || 'Failed to add equipment'));
                    }
                  } catch(error) {
                    alert('Network Error connecting to backend');
                  }
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Unique ID (From QR)</label>
                      <input name="unique_id" className="ad-select" style={{ width: '100%', padding: '10px' }} required placeholder="e.g. PC-05 or EL-02" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Category</label>
                      <select name="equipment_type" className="ad-select" style={{ width: '100%', padding: '10px' }} required defaultValue={isIT ? "IT" : (isElectrical ? "Electrical" : "")}>
                        {(!isIT && !isElectrical) && <option value="">Select Category</option>}
                        {(isIT || (!isIT && !isElectrical)) && <option value="IT">IT Equipment</option>}
                        {(isElectrical || (!isIT && !isElectrical)) && <option value="Electrical">Electrical</option>}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Lab Name</label>
                      <input name="lab_name" className="ad-select" style={{ width: '100%', padding: '10px' }} required placeholder="e.g. Network Lab" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Room Number</label>
                      <input name="room_name" className="ad-select" style={{ width: '100%', padding: '10px' }} required placeholder="e.g. 302" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Equipment Name</label>
                      <input name="equipment_name" className="ad-select" style={{ width: '100%', padding: '10px' }} required placeholder="e.g. Dell Optiplex or Ceiling Fan" />
                    </div>
                  </div>
                  <button type="submit" className="ad-chip c1" style={{ marginTop: '20px', padding: '12px 24px', width: '100%', textAlign: 'center', fontSize: '14px', background: 'var(--ad-purple)', color: '#fff' }}>
                    Save Equipment
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTICES PAGE ── */}
        {page === "notices" && (
          <div className="ad-equipment-view animated-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Post Notice Form */}
            <div className="ad-table-card" style={{ padding: '24px' }}>
              <div className="ad-sec-header" style={{ marginBottom: 16 }}>
                <span className="ad-sec-title">📢 Post New Notice</span>
              </div>
              <form onSubmit={handlePostNotice}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Notice Title</label>
                    <input
                      className="ad-select"
                      style={{ width: '100%', padding: '10px' }}
                      placeholder="e.g. Lab Maintenance on Wednesday"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Notice Body</label>
                    <textarea
                      className="ad-select"
                      style={{ width: '100%', padding: '10px', minHeight: '90px', resize: 'vertical' }}
                      placeholder="Write the notice details here..."
                      value={noticeForm.body}
                      onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="ad-chip c1" style={{ padding: '12px 24px', width: '100%', textAlign: 'center', fontSize: '14px', background: 'var(--ad-purple)', color: '#fff' }}>
                    📢 Post Notice
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Notices List */}
            <div>
              <div className="ad-sec-header" style={{ marginBottom: 16 }}>
                <span className="ad-sec-title">All Notices</span>
                <span className="ad-badge-count">{notices.length} total</span>
              </div>
              {notices.length === 0 ? (
                <div className="ad-table-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--ad-muted)' }}>No notices posted yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notices.map(n => (
                    <div key={n.id} className="ad-table-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ad-purple)', marginBottom: '4px' }}>📌 {n.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--ad-text)', lineHeight: 1.6 }}>{n.body}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ad-muted)', marginTop: '6px' }}>
                          By {n.posted_by || 'Admin'} · {n.created_at ? n.created_at.split(' ')[0] : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="ad-chip delete"
                        style={{ padding: '6px 14px', fontSize: '12px', border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#ef4444', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMPLAINTS PAGE ── */}
        {page === "complaints" && localStorage.getItem("adminRole") === "hod" && (
          <div className="ad-equipment-view animated-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="ad-sec-header">
              <span className="ad-sec-title">⚠️ Student Complaints</span>
              <span className="ad-badge-count">{complaints.length} total</span>
            </div>
            
            {complaints.length === 0 ? (
              <div className="ad-table-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--ad-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🙌</div>
                <div style={{ fontWeight: 600, color: 'var(--ad-text)', marginBottom: '5px' }}>No Complaints Found</div>
                <div>Great! There are currently no student complaints regarding your lab assistants.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {complaints.map(c => (
                  <div key={c.id} className="ad-table-card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ad-text)', marginBottom: '4px' }}>
                          Complaint Against: <span style={{ color: '#ef4444' }}>{c.lab_assistant_name}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--ad-purple)', fontWeight: 600 }}>Lab: {c.lab_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'var(--ad-muted)' }}>{c.created_at ? c.created_at.split(' ')[0] : ''}</div>
                      </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                      {c.description}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ad-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <span>👤 Reported by: <strong style={{ color: 'var(--ad-text)' }}>{c.student_name}</strong> ({c.student_email})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLACEHOLDER PAGES ── */}
        {["reports"].includes(page) && (
          <div className="ad-placeholder">
            <div className="ad-placeholder-icon">
              {page === "equipment" ? "🔧" : "📄"}
            </div>
            <div className="ad-placeholder-title">
              {page.charAt(0).toUpperCase() + page.slice(1)} Page
            </div>
            <div className="ad-placeholder-sub">This section is under construction.</div>
          </div>
        )}
        {/* ── PROFILE PAGE ── */}
        {page === "profile" && (
          <div className="ad-profile-view animated-fade-in">
            <div className="ad-profile-card">
              <div className="ad-profile-header">
                <div className="ad-profile-avatar-large">{localStorage.getItem("adminRole") === "hod" ? "H" : "A"}</div>
                <div className="ad-profile-title-box">
                  <div className="ad-profile-main-name">{localStorage.getItem("userName")}</div>
                  <div className="ad-profile-main-role">{localStorage.getItem("adminRole") === "hod" ? `HOD - ${localStorage.getItem("userDepartment")}` : "Super Admin"} • RCPIT Maintainance</div>
                </div>
              </div>
              
              <div className="ad-profile-details">
                <div className="ad-detail-item">
                  <div className="ad-detail-icon">👤</div>
                  <div>
                    <div className="ad-detail-label">Full Name</div>
                    <div className="ad-detail-value">{localStorage.getItem("userName")}</div>
                  </div>
                </div>
                <div className="ad-detail-item">
                  <div className="ad-detail-icon">📧</div>
                  <div>
                    <div className="ad-detail-label">Email Address</div>
                    <div className="ad-detail-value">{localStorage.getItem("userEmail")}</div>
                  </div>
                </div>
                <div className="ad-detail-item">
                  <div className="ad-detail-icon">📱</div>
                  <div>
                    <div className="ad-detail-label">Mobile Number</div>
                    <div className="ad-detail-value">{localStorage.getItem("userMobile") || "Not Provided"}</div>
                  </div>
                </div>
                <div className="ad-detail-item">
                  <div className="ad-detail-icon">🛡️</div>
                  <div>
                    <div className="ad-detail-label">Access Level</div>
                    <div className="ad-detail-value">{localStorage.getItem("adminRole") === "hod" ? "Department Head" : "Super Admin"}</div>
                  </div>
                </div>
              </div>

              <div className="ad-profile-actions">
                <button 
                  className="ad-btn-edit" 
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  Edit Profile
                </button>
                <button className="ad-btn-pass">Change Password</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── EDIT PROFILE MODAL ── */}
      {isProfileModalOpen && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content" style={{ maxWidth: '450px' }}>
            <div className="ad-modal-header">
              <h3>Edit My Profile</h3>
              <button className="ad-modal-close" onClick={() => setIsProfileModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="ad-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                    <input 
                      className="ad-select" 
                      style={{ width: '100%' }} 
                      value={editFormData.name} 
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Mobile Number</label>
                    <input 
                      className="ad-select" 
                      style={{ width: '100%' }} 
                      value={editFormData.mobile} 
                      onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                      required 
                    />
                  </div>
                  {localStorage.getItem("adminRole") === "hod" && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ad-muted)', marginBottom: '6px', display: 'block' }}>Department</label>
                      <select 
                        className="ad-select" 
                        style={{ width: '100%' }} 
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
                  )}
                </div>
              </div>
              <div className="ad-modal-footer">
                <button type="button" className="ad-btn-cancel" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="ad-btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
