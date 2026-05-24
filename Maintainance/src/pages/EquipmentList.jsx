import { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";

export default function EquipmentList({ embedded = false, fieldFilter = null }) {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/equipments`;
      if (fieldFilter) url += `?field=${fieldFilter}`;
      const res = await fetch(url);
      if (res.ok) setEquipments(await res.json());
    } catch (err) {
      console.error("Failed to fetch equipments:", err);
    } finally {
      setLoading(false);
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
      link.download = `QR_${equipmentName.replace(/[^a-zA-Z0-9]/g, "_")}_${uniqueId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Failed to download QR Code.");
    }
  };

  const deleteEquipment = async (uniqueId) => {
    if (!window.confirm(`Delete equipment "${uniqueId}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${uniqueId}`, { method: "DELETE" });
      if (res.ok) {
        alert("Equipment deleted.");
        fetchEquipments();
      } else {
        const err = await res.json();
        alert("Error: " + (err.detail || "Delete failed."));
      }
    } catch {
      alert("Network error.");
    }
  };

  const openEditModal = (eq) => {
    setEditingEquipment({ ...eq });
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${editingEquipment.unique_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEquipment)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingEquipment(null);
        fetchEquipments();
      } else {
        const err = await res.json();
        setEditError(err.detail || "Update failed.");
      }
    } catch {
      setEditError("Network error updating equipment.");
    }
  };

  const filtered = useMemo(() => {
    return equipments.filter(eq => {
      const matchType = typeFilter === "All" || eq.equipment_type === typeFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        eq.unique_id?.toLowerCase().includes(q) ||
        eq.equipment_name?.toLowerCase().includes(q) ||
        eq.lab_name?.toLowerCase().includes(q) ||
        eq.room_name?.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [equipments, typeFilter, search]);

  const itCount = equipments.filter(e => e.equipment_type === "IT").length;
  const elecCount = equipments.filter(e => e.equipment_type === "Electrical").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "Total Equipment", value: equipments.length, color: "#7c3aed", bg: "#ede9fe" },
          { label: "IT Equipment", value: itCount, color: "#2563eb", bg: "#eff6ff" },
          { label: "Electrical", value: elecCount, color: "#d97706", bg: "#fef3c7" }
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
            padding: "14px 18px", display: "flex", flexDirection: "column", gap: 4
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="ad-select"
          style={{ maxWidth: 280, padding: "9px 14px" }}
          placeholder="🔍 Search by ID, name or lab..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "IT", "Electrical"].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                background: typeFilter === t ? "#7c3aed" : "#fff",
                color: typeFilter === t ? "#fff" : "#475569",
                transition: "all 0.2s"
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          {filtered.length} equipment{filtered.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Table */}
      <div className="ad-table-wrap">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 32 }}>⚙️</div>
            <div style={{ marginTop: 8, fontWeight: 500 }}>Loading equipment...</div>
          </div>
        ) : (
          <table className="ad-table">
            <thead>
              <tr>
                <th>Unique ID</th>
                <th>Category</th>
                <th>Equipment Name</th>
                <th>Lab</th>
                <th>Room</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq, i) => (
                <tr key={i}>
                  <td>
                    <span style={{
                      fontFamily: "monospace", fontWeight: 700, fontSize: 13,
                      color: "#7c3aed", background: "#ede9fe", padding: "3px 8px",
                      borderRadius: 6, letterSpacing: "0.04em"
                    }}>
                      {eq.unique_id}
                    </span>
                  </td>
                  <td>
                    <span className={`ad-badge ${eq.equipment_type === "IT" ? "status-assigned" : "priority-low"}`}>
                      {eq.equipment_type === "IT" ? "💻 IT" : "⚡ Electrical"}
                    </span>
                  </td>
                  <td>
                    <span className="ad-eq-name">{eq.equipment_name}</span>
                  </td>
                  <td style={{ color: "#475569", fontSize: 13 }}>📍 {eq.lab_name}</td>
                  <td style={{ color: "#475569", fontSize: 13 }}>🚪 {eq.room_name}</td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                      <button
                        onClick={() => handleDownloadQR(eq.unique_id, eq.equipment_name)}
                        style={{
                          padding: "5px 11px", borderRadius: 7, border: "none",
                          background: "#e0f2fe", color: "#0369a1",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}
                        title="Download QR Code"
                      >
                        📥 QR
                      </button>
                      <button
                        onClick={() => openEditModal(eq)}
                        style={{
                          padding: "5px 11px", borderRadius: 7, border: "none",
                          background: "#ede9fe", color: "#7c3aed",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}
                        title="Edit Equipment"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteEquipment(eq.unique_id)}
                        style={{
                          padding: "5px 11px", borderRadius: 7, border: "none",
                          background: "#fee2e2", color: "#ef4444",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}
                        title="Delete Equipment"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px 20px", color: "#94a3b8" }}>
                    {search || typeFilter !== "All"
                      ? "No equipment matches your filters."
                      : "No equipment added yet. Add equipment from the 'Add Equipment' section."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingEquipment && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content" style={{ maxWidth: 480 }}>
            <div className="ad-modal-header">
              <h3>✏️ Edit Equipment</h3>
              <button className="close-btn" onClick={() => { setIsEditModalOpen(false); setEditingEquipment(null); }}>×</button>
            </div>
            <form onSubmit={handleUpdateEquipment}>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Unique ID (Read-Only)</label>
                  <input className="ad-select" style={{ width: "100%", background: "#f8fafc", cursor: "not-allowed" }} value={editingEquipment.unique_id} readOnly />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Category *</label>
                    <select
                      className="ad-select"
                      style={{ width: "100%" }}
                      value={editingEquipment.equipment_type}
                      onChange={e => setEditingEquipment({ ...editingEquipment, equipment_type: e.target.value })}
                      required
                    >
                      <option value="IT">IT Equipment</option>
                      <option value="Electrical">Electrical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Room Number *</label>
                    <input
                      className="ad-select"
                      style={{ width: "100%" }}
                      value={editingEquipment.room_name}
                      onChange={e => setEditingEquipment({ ...editingEquipment, room_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Lab Name *</label>
                    <input
                      className="ad-select"
                      style={{ width: "100%" }}
                      value={editingEquipment.lab_name}
                      onChange={e => setEditingEquipment({ ...editingEquipment, lab_name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Equipment Name *</label>
                    <input
                      className="ad-select"
                      style={{ width: "100%" }}
                      value={editingEquipment.equipment_name}
                      onChange={e => setEditingEquipment({ ...editingEquipment, equipment_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {editError && (
                  <div style={{ color: "#ef4444", fontSize: 13, background: "#fee2e2", padding: "8px 12px", borderRadius: 8 }}>
                    ⚠️ {editError}
                  </div>
                )}
              </div>
              <div className="ad-modal-footer">
                <button type="button" className="ad-btn-cancel" onClick={() => { setIsEditModalOpen(false); setEditingEquipment(null); }}>Cancel</button>
                <button type="submit" className="ad-btn-save">💾 Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
