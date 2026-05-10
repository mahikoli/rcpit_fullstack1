import { useState, useEffect, useRef } from "react";
import "./StudentDashboard.css";
import collegeLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import QRScanner from "../components/QRScanner.jsx";
import { 
  MapPin, Clock, User, ChevronRight, Cpu, Zap, 
  Info, AlertCircle, CheckCircle, PenTool, ClipboardList, QrCode, Hash
} from "lucide-react";

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard",     section: "overview", badge: null, badgeType: "" },
  { icon: "📋", label: "My Issues",     section: "overview", badge: 3,    badgeType: "warn" },
  { icon: "➕", label: "Report Issue",  section: "actions",  badge: null, badgeType: "" },
  { icon: "🕐", label: "Issue History", section: "actions",  badge: null, badgeType: "" },
  { icon: "✅", label: "Resolved",      section: "actions",  badge: 2,    badgeType: "success" },
  { icon: "⚠️", label: "Complain",      section: "actions",  badge: null, badgeType: "" },
  { icon: "📢", label: "Announcements", section: "more",     badge: 1,    badgeType: "" },
  { icon: "💬", label: "Messages",      section: "more",     badge: null, badgeType: "" },
];

const CAT_CLASS = {
  Hardware: "cat-hardware",
  Network:  "cat-network",
  Software: "cat-software",
  Other:    "cat-other",
};

function IssueCard({ issue, onClick }) {
  const statusLabel = {
    Pending: "Pending",
    Assigned: "Assigned",
    "In Progress": "In Progress",
    Completed: "Solved"
  }[issue.status] || issue.status;

  const CategoryIcon = issue.equipment_type === "IT" ? Cpu : Zap;

  return (
    <div
      className={`sd-ticket-card ${issue.status?.toLowerCase().replace(/ /g, '')}`}
      onClick={onClick}
    >
      <div className="sd-ticket-accent" />
      
      <div className="sd-ticket-main">
        <div className="sd-ticket-top">
          <div className="sd-ticket-category">
            <CategoryIcon size={12} />
            <span>{issue.equipment_type}</span>
          </div>
          <div className={`sd-ticket-status status-${issue.status?.toLowerCase().replace(/ /g, '')}`}>
            {statusLabel}
          </div>
        </div>

        <div className="sd-ticket-body">
          <h3 className="sd-ticket-title">{issue.equipment_name}</h3>
          <p className="sd-ticket-subtitle">{issue.issue_subtype || "General Issue"}</p>
        </div>

        <div className="sd-ticket-footer">
          <div className="sd-ticket-meta">
            <Clock size={12} />
            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
          </div>
          <div className="sd-ticket-action">
            <span>Details</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueDetailModal({ issue, onClose, onDelete, onConfirm }) {
  if (!issue) return null;

  const statusLabel = {
    Pending: "Pending",
    Assigned: "Assigned",
    "In Progress": "In Progress",
    Completed: "Resolved"
  }[issue.status] || issue.status;

  const statusColor = {
    Pending: "#f59e0b",
    Assigned: "#3b82f6",
    "In Progress": "#8b5cf6",
    Completed: "#16a34a"
  }[issue.status] || "#64748b";

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sd-modal-header">
          <div className="sd-modal-title-row">
            <div>
              <div className="sd-modal-issue-id">{issue.equipment_type}</div>
              <div className="sd-modal-title">{issue.equipment_name}</div>
            </div>
            <button className="sd-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="sd-modal-badges">
            <span className={`sd-badge cat-${issue.equipment_type?.toLowerCase()}`}>{issue.equipment_type}</span>
            <span className="sd-badge" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}55` }}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="sd-modal-body">
          {/* Equipment Info */}
          <div className="sd-modal-section">
            <div className="sd-modal-section-title">📋 Equipment Details</div>
            <div className="sd-modal-info-grid">
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Lab / Location</div>
                <div className="sd-modal-info-value">📍 {issue.lab_name}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Room Number</div>
                <div className="sd-modal-info-value">🚪 {issue.room_name}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Equipment ID</div>
                <div className="sd-modal-info-value">🔖 {issue.equipment_id || "—"}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Issue Category</div>
                <div className="sd-modal-info-value">🏷️ {issue.issue_subtype || "General"}</div>
              </div>
              <div className="sd-modal-info-item">
                <div className="sd-modal-info-label">Reported On</div>
                <div className="sd-modal-info-value">🕐 {new Date(issue.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="sd-modal-section">
            <div className="sd-modal-section-title">📝 Issue Description</div>
            <div className="sd-modal-description">{issue.description || "No description provided."}</div>
          </div>

          {/* Technician Info */}
          <div className="sd-modal-section">
            <div className="sd-modal-section-title">🔧 Technician Info</div>
            {issue.technician_name ? (
              <div className="sd-modal-info-grid">
                <div className="sd-modal-info-item">
                  <div className="sd-modal-info-label">Assigned To</div>
                  <div className="sd-modal-info-value">👷 {issue.technician_name}</div>
                </div>
                <div className="sd-modal-info-item">
                  <div className="sd-modal-info-label">Estimated Days</div>
                  <div className="sd-modal-info-value est-days">
                    {issue.estimated_days
                      ? <><span className="sd-days-badge">{issue.estimated_days}</span> days to resolve</>
                      : <span style={{ color: 'var(--sd-muted)' }}>Not specified yet</span>
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="sd-modal-unassigned">⏳ No technician assigned yet. Please wait.</div>
            )}
          </div>

          {/* Technician Comment */}
          {issue.technician_comment && (
            <div className="sd-modal-section">
              <div className="sd-modal-section-title">💬 Technician Note</div>
              <div className="sd-modal-comment-box">
                <div className="sd-modal-comment-icon">💬</div>
                <div className="sd-modal-comment-text">{issue.technician_comment}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sd-modal-footer">
          <button 
            className="sd-modal-footer-remove" 
            onClick={() => {
              if (window.confirm("Are you sure you want to remove this issue report? This action cannot be undone.")) {
                onDelete(issue.id);
              }
            }}
          >
            🗑️ Remove Issue
          </button>
          <button className="sd-modal-footer-close" onClick={onClose}>Close</button>
          
          {issue.status === 'Resolved' && (
            <button 
              className="sd-modal-footer-confirm" 
              onClick={() => {
                if (window.confirm("Is the issue fixed? Clicking confirm will officially close this request.")) {
                  onConfirm(issue.id);
                }
              }}
            >
              ✅ Confirm & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PAGE COMPONENTS ──────────────────────────────────────────────────────────

function DashboardPage({ 
  issues, 
  totalIssues, 
  solvedIssues, 
  pendingIssues, 
  resolvedPct, 
  CIRCUMF, 
  ringOffset, 
  onIssueClick,
  onNavigate,
  searchQuery,
  notices
}) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? issues : issues.filter((i) => i.status === filter);
  
  const displayedIssues = filtered.filter(i => 
    !searchQuery || (i.equipment_id && i.equipment_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="sd-stats-grid">
        <div className="sd-stat-card s1">
          <div className="sd-stat-icon">📋</div>
          <div className="sd-stat-label">Total Issues</div>
          <div className="sd-stat-value">{totalIssues}</div>
          <div className="sd-stat-sub">📌 All reported</div>
        </div>
        <div className="sd-stat-card s2">
          <div className="sd-stat-icon">✅</div>
          <div className="sd-stat-label">Solved Issues</div>
          <div className="sd-stat-value">{solvedIssues}</div>
          <div className="sd-stat-sub">🎯 Resolved this week</div>
        </div>
        <div className="sd-stat-card s3">
          <div className="sd-stat-icon">⏳</div>
          <div className="sd-stat-label">Pending Issues</div>
          <div className="sd-stat-value">{pendingIssues}</div>
          <div className="sd-stat-sub">⚡ Awaiting action</div>
        </div>
      </div>

      <div className="sd-content-grid">
        <div>
          <div className="sd-sec-header">
            <span className="sd-sec-title">Recent Issues</span>
            <span className="sd-sec-action" onClick={() => onNavigate("My Issues")} style={{ cursor: "pointer" }}>View all →</span>
          </div>
          <div className="sd-filter-tabs">
            {["all", "pending", "solved"].map((f) => (
              <button
                key={f}
                className={`sd-tab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="sd-issues-list">
            {displayedIssues.length > 0 ? (
              displayedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => onIssueClick(issue)}
                />
              ))
            ) : (
              <div className="sd-empty">No issues found matching your search.</div>
            )}
          </div>
        </div>

        <div className="sd-right-panel">
          <div className="sd-panel-card">
            <div className="sd-sec-title">Resolution Rate</div>
            <div className="sd-ring-wrap">
              <svg className="sd-ring-svg" width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="#16a34a" strokeWidth="8"
                  strokeDasharray={CIRCUMF}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="sd-ring-center">
                <div className="sd-ring-pct">{resolvedPct}%</div>
                <div className="sd-ring-lbl">resolved</div>
              </div>
            </div>
            <div className="sd-ring-sub">{solvedIssues} of {totalIssues} issues resolved</div>
            <div className="sd-mini-row">
              <span className="sd-mini-name">Solved</span>
              <div className="sd-mini-bar-wrap">
                <div className="sd-mini-bar" style={{ width: `${resolvedPct}%`, background: "#22c55e" }} />
              </div>
              <span className="sd-mini-num" style={{ color: "#16a34a" }}>{solvedIssues}</span>
            </div>
            <div className="sd-mini-row">
              <span className="sd-mini-name">Pending</span>
              <div className="sd-mini-bar-wrap">
                <div className="sd-mini-bar" style={{ width: `${100 - resolvedPct}%`, background: "#f59e0b" }} />
              </div>
              <span className="sd-mini-num" style={{ color: "#d97706" }}>{pendingIssues}</span>
            </div>
          </div>

          <div className="sd-panel-card">
            <div className="sd-sec-title" style={{ marginBottom: "12px" }}>Quick Actions</div>
            <div className="sd-chips">
              <button className="sd-chip c1" onClick={() => onNavigate("Report Issue")}>➕ Report New Issue</button>
              <button className="sd-chip c2" onClick={() => onNavigate("My Issues")}>📋 View All Issues</button>
              <button className="sd-chip c3">📅 Check Schedule</button>
              <button className="sd-chip c4">💬 Message Support</button>
            </div>
          </div>

          <div className="sd-notice" style={{ flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div className="sd-notice-icon">📢</div>
              <div className="sd-notice-title" style={{ fontSize: 15, fontWeight: 700 }}>Notices</div>
            </div>
            {notices && notices.length > 0 ? (
              notices.slice(0, 3).map(n => (
                <div key={n.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--sd-purple, #7c3aed)', marginBottom: 3 }}>📌 {n.title}</div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                    {n.posted_by ? `By ${n.posted_by} · ` : ''}{n.created_at ? n.created_at.split(' ')[0] : ''}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>No notices posted yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MyIssuesPage({ issues, onIssueClick, searchQuery }) {
  const displayedIssues = issues.filter(i => 
    !searchQuery || (i.equipment_id && i.equipment_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  return (
    <>
      <div className="sd-sec-header">
        <span className="sd-sec-title">My Issues</span>
        <span className="sd-sec-action">{issues.length} total</span>
      </div>
      <div className="sd-issues-list">
        {displayedIssues.length === 0 ? (
          <div className="sd-empty">{searchQuery ? "No issues found matching your search." : "No issues found."}</div>
        ) : (
          displayedIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
            />
          ))
        )}
      </div>
    </>
  );
}

function IssueHistoryPage({ issues, onIssueClick }) {
  return (
    <>
      <div className="sd-sec-header">
        <span className="sd-sec-title">Issue History</span>
        <span className="sd-sec-action">{issues.length} records</span>
      </div>
      <div className="sd-issues-list">
        {issues.length === 0 ? (
          <div className="sd-empty">No history available.</div>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
            />
          ))
        )}
      </div>
    </>
  );
}

function ResolvedPage({ issues, onIssueClick }) {
  const resolved = issues.filter((i) => i.status === "Completed" || i.status === "Solved");
  return (
    <>
      <div className="sd-sec-header">
        <span className="sd-sec-title">Resolved Issues</span>
        <span className="sd-sec-action">{resolved.length} resolved</span>
      </div>
      <div className="sd-issues-list">
        {resolved.length === 0 ? (
          <div className="sd-empty">No resolved issues yet.</div>
        ) : (
          resolved.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
            />
          ))
        )}
      </div>
    </>
  );
}


function ReportIssuePage({ onIssueSubmitted }) {
  const [equipmentType, setEquipmentType] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [itData, setItData] = useState({
    labName: "",
    roomName: "",
    pcName: "",
    pcId: ""
  });

  const [electricalData, setElectricalData] = useState({
    labName: "",
    roomName: "",
    equipmentName: "",
    equipmentId: ""
  });

  const [description, setDescription] = useState("");
  const [issueSubtype, setIssueSubtype] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [prn, setPrn] = useState("");

  const handleScanSuccess = async (decodedText) => {
    setShowScanner(false);
    try {
      let qrId = decodedText;
      try {
        const parsed = JSON.parse(decodedText);
        qrId = parsed.id || parsed.equipmentId || parsed.unique_id || decodedText;
      } catch (e) {
        // It's a plain string
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${encodeURIComponent(qrId)}`);
      if (res.ok) {
        const data = await res.json();
        setEquipmentType(data.equipment_type);
        if (data.equipment_type === "IT") {
           setItData({ labName: data.lab_name, roomName: data.room_name, pcName: data.equipment_name, pcId: data.unique_id });
        } else {
           setElectricalData({ labName: data.lab_name, roomName: data.room_name, equipmentName: data.equipment_name, equipmentId: data.unique_id });
        }
        setSuccessMessage("Equipment details fetched successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        alert("Equipment not found in database. You may enter details manually.");
      }
    } catch (e) {
      console.error("Scan API Error:", e);
      alert("Network Error while fetching equipment details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDetails = equipmentType === "IT" ? itData : electricalData;

    const payload = {
      equipment_type: equipmentType,
      lab_name: currentDetails.labName,
      room_name: currentDetails.roomName,
      equipment_name: equipmentType === "IT" ? currentDetails.pcName : currentDetails.equipmentName,
      equipment_id: equipmentType === "IT" ? currentDetails.pcId : currentDetails.equipmentId,
      issue_subtype: issueSubtype,
      description,
      user_name: userName,
      email: email,
      prn: prn,
      student_dept: localStorage.getItem("userDepartment") || "IT"
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.duplicate) {
          const confirmJoin = window.confirm(
            `This issue has already been submitted by another person.\n\nDescription: "${result.existing_description.slice(0, 50)}..."\n\nDo you want to join this existing request? (Kya aap is issue ko join hona chahte hain?)`
          );
          
          if (confirmJoin) {
            const joinRes = await fetch(`${import.meta.env.VITE_API_URL}/issues/${result.issue_id}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email })
            });
            if (joinRes.ok) {
              setSuccessMessage("You have successfully joined the existing request!");
              resetForm();
              if (onIssueSubmitted) onIssueSubmitted();
            } else {
              alert("Failed to join the existing request.");
            }
          }
          return;
        }

        setSuccessMessage("Issue Report Submitted Successfully!");
        resetForm();
        if (onIssueSubmitted) onIssueSubmitted();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to submit report"));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please ensure backend is running.");
    }
  };

  const resetForm = () => {
    setDescription("");
    setEquipmentType("");
    setIssueSubtype("");
    setItData({ labName: "", roomName: "", pcName: "", pcId: "" });
    setElectricalData({ labName: "", roomName: "", equipmentName: "", equipmentId: "" });
  };

  return (
    <div className="sd-report-form-container animated-fade-in">
      <div className="sd-panel-card" style={{ maxWidth: 800 }}>
        <div className="sd-sec-header" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="sd-report-icon-box">
              <ClipboardList size={20} />
            </div>
            <div>
              <div className="sd-sec-title">Report a New Issue</div>
              <div style={{ fontSize: 12, color: "var(--sd-muted)" }}>Fill in the details or scan equipment QR</div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="sd-success-banner">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sd-modern-form">
          <div className="sd-form-grid">
            {/* Left Side: Equipment Info */}
            <div className="sd-form-section">
              <div className="sd-section-label">
                <PenTool size={14} /> Equipment Category
              </div>
              
              <div className="sd-radio-cards">
                <label className={`sd-radio-card ${equipmentType === 'IT' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="eqType"
                    value="IT"
                    onChange={(e) => setEquipmentType(e.target.value)}
                  />
                  <div className="sd-radio-check" />
                  <span>IT Equipment</span>
                </label>
                
                <label className={`sd-radio-card ${equipmentType === 'Electrical' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="eqType"
                    value="Electrical"
                    onChange={(e) => setEquipmentType(e.target.value)}
                  />
                  <div className="sd-radio-check" />
                  <span>Electrical</span>
                </label>
              </div>

              <div className="sd-qr-row" style={{ marginTop: '16px', background: 'var(--sd-purple-light)', border: '1px dashed var(--sd-purple)' }}>
                <button
                  type="button"
                  className="sd-qr-btn"
                  onClick={() => setShowScanner(true)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <QrCode size={16} /> Scan Equipment QR Code
                </button>
                <div style={{ fontSize: '11px', color: 'var(--sd-purple)', marginTop: '8px', textAlign: 'center' }}>
                  Auto-fill equipment details from database
                </div>
              </div>

              {equipmentType === "IT" && (
                <div className="sd-fields-grid animated-fade-in">
                  <div className="sd-field">
                    <label>Lab Name</label>
                    <input className="sd-input" placeholder="e.g. Network Lab" value={itData.labName} onChange={(e) => setItData({ ...itData, labName: e.target.value })} required />
                  </div>
                  <div className="sd-field">
                    <label>Room Number</label>
                    <input className="sd-input" placeholder="e.g. 302" value={itData.roomName} onChange={(e) => setItData({ ...itData, roomName: e.target.value })} required />
                  </div>
                  <div className="sd-field">
                    <label>Equipment Name</label>
                    <input className="sd-input" placeholder="e.g. Dell Optiplex" value={itData.pcName} onChange={(e) => setItData({ ...itData, pcName: e.target.value })} required />
                  </div>
                  <div className="sd-field">
                    <label>Equipment ID</label>
                    <input className="sd-input" placeholder="e.g. PC-05" value={itData.pcId} onChange={(e) => setItData({ ...itData, pcId: e.target.value })} required />
                  </div>
                </div>
              )}

              {equipmentType === "Electrical" && (
                <div className="sd-fields-grid animated-fade-in">
                  <div className="sd-field">
                    <label>Lab Name</label>
                    <input className="sd-input" placeholder="e.g. Workshop" value={electricalData.labName} onChange={(e) => setElectricalData({ ...electricalData, labName: e.target.value })} required />
                  </div>
                  <div className="sd-field">
                    <label>Room Number</label>
                    <input className="sd-input" placeholder="e.g. 104" value={electricalData.roomName} onChange={(e) => setElectricalData({ ...electricalData, roomName: e.target.value })} required />
                  </div>
                  <div className="sd-field">
                    <label>Equipment</label>
                    <input className="sd-input" placeholder="e.g. AC, Fan" value={electricalData.equipmentName} onChange={(e) => setElectricalData({ ...electricalData, equipmentName: e.target.value })} required />
                  </div>
                  <div className="sd-field">
                    <label>ID</label>
                    <input className="sd-input" placeholder="e.g. EL-02" value={electricalData.equipmentId} onChange={(e) => setElectricalData({ ...electricalData, equipmentId: e.target.value })} required />
                  </div>
                </div>
              )}
              
              {equipmentType && (
                <div className="animated-fade-in">
                  <div className="sd-field" style={{ marginTop: 16 }}>
                    <label>Issue Type</label>
                    <select 
                      className="sd-input"
                      value={issueSubtype}
                      onChange={(e) => setIssueSubtype(e.target.value)}
                      required
                    >
                      <option value="">Select Issue Type</option>
                      <option value="Not working">Not working</option>
                      <option value="Screen no visible">Screen no visible</option>
                      <option value="Mouse not working">Mouse not working</option>
                      <option value="Keyboard not working">Keyboard not working</option>
                      <option value="Switchboard problem">Switchboard problem</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="sd-field" style={{ marginTop: 16 }}>
                    <label>Issue Description</label>
                    <textarea
                      className="sd-input"
                      rows={4}
                      placeholder="Describe the problem in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ resize: "none" }}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: User Details */}
            <div className="sd-form-section">
              <div className="sd-section-label">
                <AlertCircle size={14} /> Your Details
              </div>
              <div className="sd-fields-stack">
                <div className="sd-field">
                  <label>Full Name</label>
                  <input className="sd-input" placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div className="sd-field">
                  <label>Email ID</label>
                  <input 
                    className="sd-input" 
                    type="email" 
                    placeholder="name@college.edu" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    readOnly={!!localStorage.getItem("userEmail")} 
                    style={localStorage.getItem("userEmail") ? { backgroundColor: "#f1f5f9", cursor: "not-allowed" } : {}}
                    required 
                  />
                  {!localStorage.getItem("userEmail") && (
                    <span style={{ fontSize: '10px', color: 'var(--sd-orange)' }}>
                      ⚠️ Please re-login once to auto-fill this.
                    </span>
                  )}
                </div>
                <div className="sd-field">
                  <label>PRN Number</label>
                  <input className="sd-input" placeholder="Enter PRN" value={prn} onChange={(e) => setPrn(e.target.value)} required />
                </div>
              </div>

              <div className="sd-submit-box">
                <button type="submit" className="sd-submit-btn" disabled={!equipmentType}>
                  Submit Report
                </button>
                <p className="sd-disclaimer">Your report will be assigned to a technician immediately.</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanFailure={(error) => console.log(error)}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

function ComplainStaffPage() {
  const [formData, setFormData] = useState({
    labAssistantName: "",
    labName: "",
    description: ""
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [myComplaints, setMyComplaints] = useState([]);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const email = localStorage.getItem("userEmail") || "";
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints`);
      if (res.ok) {
        const data = await res.json();
        // Filter out complaints submitted by this user
        setMyComplaints(data.filter(c => c.student_email === email));
      }
    } catch (e) {
      console.error("Failed to fetch my complaints:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: localStorage.getItem("userName") || "Student",
          student_email: localStorage.getItem("userEmail") || "",
          department: localStorage.getItem("userDepartment") || "IT",
          lab_assistant_name: formData.labAssistantName,
          lab_name: formData.labName,
          description: formData.description
        })
      });

      if (response.ok) {
        setSuccessMsg("Complaint submitted successfully to HOD.");
        setFormData({ labAssistantName: "", labName: "", description: "" });
        fetchMyComplaints(); // Refresh the list
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        alert("Failed to submit complaint.");
      }
    } catch (error) {
      console.error("Complaint submit error:", error);
      alert("Network error.");
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/${id}`, { method: "DELETE" });
      if (res.ok) fetchMyComplaints();
      else alert("Failed to delete complaint.");
    } catch (e) {
      alert("Error deleting complaint.");
    }
  };

  return (
    <div className="sd-report-form-container animated-fade-in">
      <div className="sd-panel-card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="sd-sec-header" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="sd-report-icon-box" style={{ background: "#fee2e2", color: "#ef4444" }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="sd-sec-title">Complain Against Lab Assistant</div>
              <div style={{ fontSize: 12, color: "var(--sd-muted)" }}>This complaint will only be sent to the HOD</div>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="sd-success-banner">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sd-modern-form">
          <div className="sd-fields-stack">
            <div className="sd-field">
              <label>Lab Assistant Name</label>
              <input 
                className="sd-input" 
                placeholder="Enter Name" 
                value={formData.labAssistantName} 
                onChange={(e) => setFormData({...formData, labAssistantName: e.target.value})} 
                required 
              />
            </div>
            <div className="sd-field">
              <label>Lab Name</label>
              <input 
                className="sd-input" 
                placeholder="e.g. Database Lab" 
                value={formData.labName} 
                onChange={(e) => setFormData({...formData, labName: e.target.value})} 
                required 
              />
            </div>
            <div className="sd-field">
              <label>Complaint Description</label>
              <textarea 
                className="sd-input" 
                rows={5} 
                placeholder="Describe the issue with the lab assistant..." 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="sd-submit-btn" style={{ background: "#ef4444" }}>
              Submit Complaint
            </button>
          </div>
        </form>
      </div>

      {/* My Past Complaints */}
      <div className="sd-panel-card" style={{ maxWidth: 600, margin: "24px auto 0" }}>
        <div className="sd-sec-header" style={{ marginBottom: 16 }}>
          <div className="sd-sec-title">My Past Complaints</div>
          <div className="sd-badge-count">{myComplaints.length}</div>
        </div>

        {myComplaints.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--sd-muted)", padding: "20px" }}>
            You haven't submitted any complaints yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myComplaints.map(c => (
              <div key={c.id} style={{ padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", borderLeft: "4px solid #ef4444" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--sd-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Against: <span style={{ color: "#ef4444" }}>{c.lab_assistant_name}</span></span>
                    <button 
                      onClick={() => handleDeleteComplaint(c.id)}
                      style={{ padding: "4px 8px", fontSize: "11px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--sd-muted)", paddingTop: "4px" }}>
                    {c.created_at ? c.created_at.split(" ")[0] : ""}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--sd-purple)", fontWeight: 600, marginBottom: "8px" }}>
                  Lab: {c.lab_name}
                </div>
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                  {c.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

function StudentDashboard() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: localStorage.getItem("userName") || "",
    mobile: localStorage.getItem("userMobile") || "",
    department: localStorage.getItem("userDepartment") || "Information Technology",
    year: localStorage.getItem("userYear") || ""
  });
  const [searchQuery, setSearchQuery] = useState("");
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

  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    fetchIssues();
    fetchNotifications();
    fetchNotices();
  }, []);

  const fetchNotifications = async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/notifications/user/${userEmail}`);
      if (resp.ok) {
        const data = await resp.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  const fetchNotices = async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/notices`);
      if (resp.ok) {
        const data = await resp.json();
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch notices:", e);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues`);
      if (response.ok) {
        const data = await response.json();
        // Filter issues for current student
        const myIssues = data.filter(i => i.email === userEmail);
        setIssues(myIssues);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmIssue = async (issueId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}/confirm`, {
        method: "PUT",
      });
      if (response.ok) {
        setSelectedIssue(null);
        fetchIssues();
        alert("Thank you for confirming! The issue is now officially completed.");
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to confirm issue"));
      }
    } catch (error) {
      console.error("Confirm error:", error);
      alert("Network error. Please ensure backend is running.");
    }
  };

  const handleDeleteIssue = async (issueId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSelectedIssue(null);
        fetchIssues();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to remove issue"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error. Please ensure backend is running.");
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
          role: "user",
          ...editFormData
        })
      });

      if (response.ok) {
        localStorage.setItem("userName", editFormData.name);
        localStorage.setItem("userMobile", editFormData.mobile);
        localStorage.setItem("userDepartment", editFormData.department);
        localStorage.setItem("userYear", editFormData.year);
        
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

  const totalIssues   = issues.length;
  const solvedIssues  = issues.filter((i) => i.status === "completed" || i.status === "solved").length;
  const pendingIssues = issues.filter((i) => i.status === "pending").length;
  const resolvedPct   = Math.round((solvedIssues / totalIssues) * 100);
  const CIRCUMF       = 2 * Math.PI * 40;
  const ringOffset    = CIRCUMF - (resolvedPct / 100) * CIRCUMF;

  const navSections   = ["overview", "actions", "more"];
  const sectionLabels = { overview: "Overview", actions: "Actions", more: "More" };

  const pageMeta = {
    "Dashboard":      { title: "Good morning, Student 👋",  sub: `${pendingIssues} pending issues · ${formattedDate} | ${formattedTime}` },
    "My Issues":      { title: "My Issues 📋",              sub: `${totalIssues} total issues reported` },
    "Issue History":  { title: "Issue History 🕐",          sub: "All your past reported issues" },
    "Resolved":       { title: "Resolved Issues ✅",        sub: `${solvedIssues} issues resolved` },
    "Report Issue":   { title: "Report an Issue ➕",        sub: "Fill in the details below" },
    "Complain":       { title: "Complain ⚠️",              sub: "Complain against Lab Assistant (Visible only to HOD)" },
    "Profile":        { title: "My Profile 👤",            sub: "View and manage your personal info" },
    "Announcements":  { title: "Announcements 📢",          sub: "Latest updates from your institution" },
    "Messages":       { title: "Messages 💬",               sub: "Your conversations with support" },
    "Settings":       { title: "Settings ⚙",               sub: "Manage your account preferences" },
  };

  const meta = pageMeta[activeNav] || { title: activeNav, sub: "" };

  const renderPage = () => {
    if (loading) return <div className="sd-empty">Loading your issues...</div>;

    switch (activeNav) {
      case "Dashboard":
        return (
          <DashboardPage
            issues={issues}
            totalIssues={totalIssues}
            solvedIssues={solvedIssues}
            pendingIssues={pendingIssues}
            resolvedPct={resolvedPct}
            CIRCUMF={CIRCUMF}
            ringOffset={ringOffset}
            onIssueClick={(iss) => setSelectedIssue(iss)}
            onNavigate={setActiveNav}
            searchQuery={searchQuery}
            notices={notices}
          />
        );
      case "My Issues":
        return <MyIssuesPage issues={issues} onIssueClick={(iss) => setSelectedIssue(iss)} searchQuery={searchQuery} />;
      case "Issue History":
        return <IssueHistoryPage issues={issues} onIssueClick={(iss) => setSelectedIssue(iss)} />;
      case "Resolved":
        return <ResolvedPage issues={issues} onIssueClick={(iss) => setSelectedIssue(iss)} />;
      case "Report Issue":
        return <ReportIssuePage onIssueSubmitted={fetchIssues} />;
      case "Complain":
        return <ComplainStaffPage />;
      case "Profile":
        return (
          <div className="sd-profile-view animated-fade-in">
            <div className="sd-profile-card">
              <div className="sd-profile-header">
                <div className="sd-profile-avatar-large">{localStorage.getItem("userName")?.charAt(0) || "S"}</div>
                <div className="ad-profile-title-box">
                  <div className="sd-profile-main-name">{localStorage.getItem("userName") || "Student Account"}</div>
                  <div className="sd-profile-main-role">Active • RCPIT Student</div>
                </div>
              </div>
              
              <div className="sd-profile-details">
                <div className="sd-detail-item">
                  <div className="sd-detail-icon">👤</div>
                  <div className="sd-detail-info">
                    <div className="sd-detail-label">Full Name</div>
                    <div className="sd-detail-value">{localStorage.getItem("userName")}</div>
                  </div>
                </div>
                
                <div className="sd-detail-item">
                  <div className="sd-detail-icon">📧</div>
                  <div className="sd-detail-info">
                    <div className="sd-detail-label">Email Address</div>
                    <div className="sd-detail-value">{localStorage.getItem("userEmail")}</div>
                  </div>
                </div>
                
                <div className="sd-detail-item">
                  <div className="sd-detail-icon">🆔</div>
                  <div className="sd-detail-info">
                    <div className="sd-detail-label">Mobile Number</div>
                    <div className="sd-detail-value">{localStorage.getItem("userMobile") || "Not Provided"}</div>
                  </div>
                </div>

                <div className="sd-detail-item">
                  <div className="sd-detail-icon">🏢</div>
                  <div className="sd-detail-info">
                    <div className="sd-detail-label">Department</div>
                    <div className="sd-detail-value">{localStorage.getItem("userDepartment") || "Not Provided"}</div>
                  </div>
                </div>

                {localStorage.getItem("userYear") && (
                  <div className="sd-detail-item">
                    <div className="sd-detail-icon">🎓</div>
                    <div className="sd-detail-info">
                      <div className="sd-detail-label">Current Year</div>
                      <div className="sd-detail-value">{localStorage.getItem("userYear")}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sd-profile-actions">
                <button 
                  className="sd-btn-edit" 
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  Edit Profile
                </button>
                <button className="sd-btn-pass">Change Password</button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="sd-empty" style={{ marginTop: 40 }}>
            🚧 "{activeNav}" page coming soon...
          </div>
        );
    }
  };

  return (
    <div className="sd-wrapper">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sd-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`sd-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sd-brand">
          <div className="sd-brand-icon">
            <img
              src={collegeLogo}
              alt="College Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
          <div className="sd-brand-name">TechDesk Pro</div>
          <div className="sd-brand-sub">Student Panel</div>
          <button className="sd-sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <nav className="sd-nav">
          {navSections.map((sec) => (
            <div key={sec} className="sd-nav-section">
              <div className="sd-nav-label">{sectionLabels[sec]}</div>
              {NAV_ITEMS.filter((n) => n.section === sec).map((n) => {
                let badgeVal = n.badge;
                if (n.label === "My Issues") badgeVal = totalIssues;
                if (n.label === "Resolved") badgeVal = solvedIssues;
                
                return (
                  <div
                    key={n.label}
                    className={`sd-nav-item${activeNav === n.label ? " active" : ""}`}
                    onClick={() => {
                      setActiveNav(n.label);
                      setSidebarOpen(false); // Close sidebar on nav click (mobile)
                    }}
                  >
                    <span className="sd-nav-icon">{n.icon}</span>
                    {n.label}
                    {badgeVal !== null && badgeVal > 0 && (
                      <span className={`sd-nav-badge${n.badgeType ? " " + n.badgeType : ""}`}>
                        {badgeVal}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sd-sidebar-footer" ref={profileRef}>
          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="sd-profile-dropdown">
              <div className="sd-dropdown-avatar">ST</div>
              <div className="sd-dropdown-name">{localStorage.getItem("userName") || "Student"}</div>
              <div className="sd-dropdown-role">{localStorage.getItem("userEmail")}</div>
              <div className="sd-dropdown-divider" />
              <button 
                className="sd-dropdown-item" 
                onClick={() => {
                  setActiveNav("Profile");
                  setProfileOpen(false);
                }}
              >
                👤 My Profile
              </button>
              <button className="sd-dropdown-item" onClick={() => setProfileOpen(false)}>
                ⚙️ Settings
              </button>
              <div className="sd-dropdown-divider" />
              <button 
                className="sd-dropdown-item logout" 
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}

          {/* Profile Switcher */}
          <div 
            className={`sd-profile ${profileOpen ? 'active' : ''}`}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="sd-avatar">
              {localStorage.getItem("userName")?.charAt(0) || "S"}
            </div>
            <div>
              <div className="sd-name">{localStorage.getItem("userName") || "Student"}</div>
              <div className="sd-role">
                {localStorage.getItem("userYear") ? `${localStorage.getItem("userYear")} Student` : "RCPIT Student"}
              </div>
            </div>
            <span className="sd-profile-arrow">{profileOpen ? "▲" : "▼"}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="sd-main" ref={scrollRef}>
        <div className={`sd-topbar ${isStuck ? 'stuck' : ''}`}>
          <div className="sd-top-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <div>
              <div className="sd-page-title">{meta.title}</div>
              <div className="sd-page-sub">{meta.sub}</div>
            </div>
          </div>
          <div className="sd-topbar-actions">
            <div className="sd-search-container">
              <span className="sd-search-icon">🔍</span>
              <input 
                type="text" 
                className="sd-search-input" 
                placeholder="Search by Equipment ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sd-icon-btn" onClick={() => {
              const msg = notifications.length > 0 ? notifications.map(n => n.message).join('\n') : "No notifications";
              alert(msg);
            }}>
              🔔
              {notifications.some(n => !n.is_read) && <span className="sd-notif-dot" />}
            </div>
            <div className="sd-icon-btn sd-add-btn" onClick={() => setActiveNav("Report Issue")}>+</div>
          </div>
        </div>

        {renderPage()}
      </main>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onDelete={handleDeleteIssue}
          onConfirm={handleConfirmIssue}
        />
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      {isProfileModalOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal-box" style={{ maxWidth: '450px', padding: '24px' }}>
            <div className="sd-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div className="sd-modal-title" style={{ fontSize: '20px' }}>Edit My Profile</div>
              <button className="sd-modal-close" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="sd-fields-stack" style={{ gap: '16px' }}>
                <div className="sd-field">
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '14px', marginBottom: '6px', display: 'block' }}>Full Name</label>
                  <input 
                    className="sd-input" 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="sd-field">
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '14px', marginBottom: '6px', display: 'block' }}>Mobile Number</label>
                  <input 
                    className="sd-input" 
                    value={editFormData.mobile} 
                    onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                    required 
                  />
                </div>
                <div className="sd-field">
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '14px', marginBottom: '6px', display: 'block' }}>Department</label>
                  <select 
                    className="sd-input" 
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
                <div className="sd-field">
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '14px', marginBottom: '6px', display: 'block' }}>Current Year</label>
                  <select 
                    className="sd-input" 
                    value={editFormData.year} 
                    onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}
                    required
                  >
                    <option value="FY">First Year (FY)</option>
                    <option value="SY">Second Year (SY)</option>
                    <option value="TY">Third Year (TY)</option>
                    <option value="BTech">B.Tech (Final Year)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="sd-modal-footer-close" style={{ flex: 1 }} onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="sd-submit-btn" style={{ flex: 1, marginTop: 0 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
