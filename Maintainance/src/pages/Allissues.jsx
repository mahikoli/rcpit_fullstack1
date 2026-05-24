import React, { useState, useEffect, useMemo } from "react";
import "./allissues.css";

const STATUS_COLOR = {
  Pending: { bg: "#fef3c7", color: "#d97706" },
  Assigned: { bg: "#dbeafe", color: "#2563eb" },
  "In Progress": { bg: "#ede9fe", color: "#7c3aed" },
  Resolved: { bg: "#dcfce7", color: "#16a34a" },
  Completed: { bg: "#d1fae5", color: "#059669" },
};

export default function AllIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
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
      const res = await fetch(url);
      if (res.ok) setIssues(await res.json());
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete issue #ISS-${String(id).padStart(3, "0")}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/issues/${id}`, { method: "DELETE" });
      if (res.ok) fetchIssues();
      else alert("Failed to delete issue.");
    } catch {
      alert("Network error.");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return issues.filter(iss => {
      const matchStatus = statusFilter === "All" || iss.status === statusFilter;
      const matchSearch = !q ||
        iss.equipment_name?.toLowerCase().includes(q) ||
        iss.lab_name?.toLowerCase().includes(q) ||
        iss.user_name?.toLowerCase().includes(q) ||
        String(iss.id).includes(q);
      return matchStatus && matchSearch;
    });
  }, [issues, search, statusFilter]);

  return (
    <div className="issues-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>All Issues</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{filtered.length} of {issues.length} issues</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", minWidth: 200 }}
            placeholder="🔍 Search by equipment, lab, user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer", background: "#fff", outline: "none" }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {["All", "Pending", "Assigned", "In Progress", "Resolved", "Completed"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="issues-table-wrapper">
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 36 }}>⏳</div>
            <div style={{ marginTop: 8 }}>Loading issues...</div>
          </div>
        ) : (
          <table className="issues-table">
            <thead>
              <tr>
                <th>ISSUE ID</th>
                <th>EQUIPMENT</th>
                <th>LOCATION</th>
                <th>REPORTED BY</th>
                <th>ASSIGNED TECHNICIAN</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    {search || statusFilter !== "All" ? "No issues match your filters." : "No issues found."}
                  </td>
                </tr>
              ) : (
                filtered.map(issue => {
                  const sc = STATUS_COLOR[issue.status] || { bg: "#f1f5f9", color: "#475569" };
                  return (
                    <tr key={issue.id} style={issue.is_escalated ? { background: "#fff7ed" } : {}}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 700, color: "#7c3aed", fontFamily: "monospace" }}>
                            #ISS-{String(issue.id).padStart(3, "0")}
                          </span>
                          {issue.is_escalated && (
                            <span style={{ fontSize: 10, background: "#fef3c7", color: "#d97706", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>
                              🔥 Escalated
                            </span>
                          )}
                          {(issue.reporter_count || 1) > 1 && (
                            <span style={{ fontSize: 10, background: "#dbeafe", color: "#2563eb", borderRadius: 4, padding: "1px 5px" }}>
                              👥 {issue.reporter_count} reporters
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{issue.equipment_name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{issue.issue_subtype || "General"}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "#475569" }}>
                        📍 {issue.lab_name}, {issue.room_name}
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{issue.user_name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{issue.email}</div>
                      </td>
                      <td>
                        {issue.technician_name ? (
                          <div className="tech-cell" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="avatar" style={{ flexShrink: 0 }}>
                              {issue.technician_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13 }}>{issue.technician_name}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: sc.bg, color: sc.color
                        }}>
                          {issue.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>
                        {issue.created_at ? issue.created_at.split(" ")[0] : "—"}
                      </td>
                      <td className="actions">
                        <span
                          className="delete"
                          onClick={() => handleDelete(issue.id)}
                          title="Delete Issue"
                          style={{ cursor: "pointer", fontSize: 16 }}
                        >
                          🗑
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}