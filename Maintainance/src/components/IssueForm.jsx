import { useState } from "react";
import QRScanner from "./QRScanner.jsx";
import { ClipboardList, QrCode, CheckCircle, PenTool, AlertCircle } from "lucide-react";
import "./IssueForm.css";

const IT_SUBTYPES = [
  "Not working",
  "Screen not visible",
  "Mouse not working",
  "Keyboard not working",
  "Network/Internet issue",
  "System hanging",
  "Software issue",
  "Other"
];

const ELEC_SUBTYPES = [
  "Not working",
  "Switchboard problem",
  "Fan not working",
  "AC not working",
  "Light not working",
  "Power fluctuation",
  "Short circuit",
  "Other"
];

/**
 * Reusable IssueForm Component
 * Props:
 *   onSubmitSuccess - callback after successful submission
 *   compact         - boolean, show in compact mode (no user detail fields pre-filled)
 *   initialData     - object with { labName, roomName, equipmentName, equipmentId, equipmentType }
 */
export default function IssueForm({ onSubmitSuccess, compact = false, initialData = {} }) {
  const [equipmentType, setEquipmentType] = useState(initialData.equipmentType || "");
  const [showScanner, setShowScanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itData, setItData] = useState({
    labName: initialData.labName || "",
    roomName: initialData.roomName || "",
    pcName: initialData.equipmentName || "",
    pcId: initialData.equipmentId || ""
  });

  const [electricalData, setElectricalData] = useState({
    labName: initialData.labName || "",
    roomName: initialData.roomName || "",
    equipmentName: initialData.equipmentName || "",
    equipmentId: initialData.equipmentId || ""
  });

  const [description, setDescription] = useState("");
  const [issueSubtype, setIssueSubtype] = useState("");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [email] = useState(localStorage.getItem("userEmail") || "");
  const [prn, setPrn] = useState("");

  const handleScanSuccess = async (decodedText) => {
    setShowScanner(false);
    try {
      let qrId = decodedText;
      try {
        const parsed = JSON.parse(decodedText);
        qrId = parsed.id || parsed.equipmentId || parsed.unique_id || decodedText;
      } catch (_) { /* plain string */ }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${encodeURIComponent(qrId)}`);
      if (res.ok) {
        const data = await res.json();
        setEquipmentType(data.equipment_type);
        if (data.equipment_type === "IT") {
          setItData({ labName: data.lab_name, roomName: data.room_name, pcName: data.equipment_name, pcId: data.unique_id });
        } else {
          setElectricalData({ labName: data.lab_name, roomName: data.room_name, equipmentName: data.equipment_name, equipmentId: data.unique_id });
        }
        setSuccessMessage("✅ Equipment details auto-filled from QR code!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setErrorMessage("Equipment not found. Please enter details manually.");
        setTimeout(() => setErrorMessage(""), 4000);
      }
    } catch (_) {
      setErrorMessage("Network error while fetching equipment details.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const resetForm = () => {
    setDescription("");
    setEquipmentType("");
    setIssueSubtype("");
    setItData({ labName: "", roomName: "", pcName: "", pcId: "" });
    setElectricalData({ labName: "", roomName: "", equipmentName: "", equipmentId: "" });
    setPrn("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

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
      email,
      prn,
      student_dept: localStorage.getItem("userDepartment") || "IT"
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();

        if (result.duplicate) {
          const confirmJoin = window.confirm(
            `A similar issue already exists.\n\nDescription: "${result.existing_description?.slice(0, 80)}..."\n\nDo you want to join this existing report?`
          );
          if (confirmJoin) {
            const joinRes = await fetch(`${import.meta.env.VITE_API_URL}/issues/${result.issue_id}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
            });
            if (joinRes.ok) {
              setSuccessMessage("You've joined the existing issue report!");
              resetForm();
              if (onSubmitSuccess) onSubmitSuccess();
            } else {
              setErrorMessage("Failed to join existing report.");
            }
          }
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage("Issue report submitted successfully! A technician will be assigned shortly.");
        resetForm();
        if (onSubmitSuccess) onSubmitSuccess();
        setTimeout(() => setSuccessMessage(""), 6000);
      } else {
        const err = await response.json();
        setErrorMessage("Error: " + (err.detail || "Failed to submit issue."));
      }
    } catch (_) {
      setErrorMessage("Network error. Please ensure the backend server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtypes = equipmentType === "IT" ? IT_SUBTYPES : ELEC_SUBTYPES;

  return (
    <div className="if-wrapper">
      {successMessage && (
        <div className="if-banner success">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="if-banner error">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="if-form">
        {/* Equipment Category */}
        <div className="if-section">
          <div className="if-section-label">
            <PenTool size={14} /> Equipment Category
          </div>
          <div className="if-radio-group">
            {["IT", "Electrical"].map(type => (
              <label
                key={type}
                className={`if-radio-card ${equipmentType === type ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="eqType"
                  value={type}
                  checked={equipmentType === type}
                  onChange={(e) => { setEquipmentType(e.target.value); setIssueSubtype(""); }}
                />
                <span className="if-radio-dot" />
                <span>{type === "IT" ? "💻 IT Equipment" : "⚡ Electrical"}</span>
              </label>
            ))}
          </div>

          {/* QR Scanner Button */}
          <button
            type="button"
            className="if-qr-btn"
            onClick={() => setShowScanner(true)}
          >
            <QrCode size={15} /> Scan Equipment QR Code
          </button>
        </div>

        {/* Equipment Fields */}
        {equipmentType === "IT" && (
          <div className="if-fields-grid animated-fade-in">
            <div className="if-field">
              <label>Lab Name *</label>
              <input className="if-input" placeholder="e.g. Network Lab" value={itData.labName}
                onChange={e => setItData({ ...itData, labName: e.target.value })} required />
            </div>
            <div className="if-field">
              <label>Room Number *</label>
              <input className="if-input" placeholder="e.g. 302" value={itData.roomName}
                onChange={e => setItData({ ...itData, roomName: e.target.value })} required />
            </div>
            <div className="if-field">
              <label>Equipment Name *</label>
              <input className="if-input" placeholder="e.g. Dell Optiplex" value={itData.pcName}
                onChange={e => setItData({ ...itData, pcName: e.target.value })} required />
            </div>
            <div className="if-field">
              <label>Equipment ID *</label>
              <input className="if-input" placeholder="e.g. PC-05" value={itData.pcId}
                onChange={e => setItData({ ...itData, pcId: e.target.value })} required />
            </div>
          </div>
        )}

        {equipmentType === "Electrical" && (
          <div className="if-fields-grid animated-fade-in">
            <div className="if-field">
              <label>Lab Name *</label>
              <input className="if-input" placeholder="e.g. Workshop" value={electricalData.labName}
                onChange={e => setElectricalData({ ...electricalData, labName: e.target.value })} required />
            </div>
            <div className="if-field">
              <label>Room Number *</label>
              <input className="if-input" placeholder="e.g. 104" value={electricalData.roomName}
                onChange={e => setElectricalData({ ...electricalData, roomName: e.target.value })} required />
            </div>
            <div className="if-field">
              <label>Equipment *</label>
              <input className="if-input" placeholder="e.g. Ceiling Fan, AC" value={electricalData.equipmentName}
                onChange={e => setElectricalData({ ...electricalData, equipmentName: e.target.value })} required />
            </div>
            <div className="if-field">
              <label>Equipment ID</label>
              <input className="if-input" placeholder="e.g. EL-02 (optional)" value={electricalData.equipmentId}
                onChange={e => setElectricalData({ ...electricalData, equipmentId: e.target.value })} />
            </div>
          </div>
        )}

        {/* Issue Type & Description */}
        {equipmentType && (
          <div className="if-section animated-fade-in">
            <div className="if-field">
              <label>Issue Type *</label>
              <select
                className="if-input"
                value={issueSubtype}
                onChange={e => setIssueSubtype(e.target.value)}
                required
              >
                <option value="">Select Issue Type</option>
                {subtypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="if-field">
              <label>Issue Description *</label>
              <textarea
                className="if-input"
                rows={4}
                placeholder="Describe the problem in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
                required
              />
            </div>
          </div>
        )}

        {/* User Details */}
        <div className="if-section">
          <div className="if-section-label">
            <AlertCircle size={14} /> Your Details
          </div>
          <div className="if-fields-stack">
            <div className="if-field">
              <label>Full Name *</label>
              <input className="if-input" placeholder="Your Name" value={userName}
                onChange={e => setUserName(e.target.value)} required />
            </div>
            <div className="if-field">
              <label>Email ID</label>
              <input
                className="if-input"
                type="email"
                value={email}
                readOnly
                style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
              />
            </div>
            <div className="if-field">
              <label>PRN Number *</label>
              <input className="if-input" placeholder="Enter your PRN" value={prn}
                onChange={e => setPrn(e.target.value)} required />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="if-submit-btn"
          disabled={!equipmentType || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Issue Report"}
        </button>
        <p className="if-disclaimer">
          Your report will be assigned to the responsible technician immediately.
        </p>
      </form>

      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanFailure={err => console.log("QR scan error:", err)}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
