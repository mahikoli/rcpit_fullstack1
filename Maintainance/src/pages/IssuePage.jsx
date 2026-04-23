import { useState } from "react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import QRScanner from "../components/QRScanner.jsx";
import { QrCode, ClipboardList, PenTool, CheckCircle, AlertCircle } from "lucide-react";
import "./IssuePage.css";

function IssuePage() {
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
  const [email, setEmail] = useState("");
  const [prn, setPrn] = useState("");

  const handleScanSuccess = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      if (equipmentType === "IT") {
        setItData({
          labName: data.lab || data.labName || "",
          roomName: data.room || data.roomName || "",
          pcName: data.name || data.pcName || "",
          pcId: data.id || data.pcId || ""
        });
      } else if (equipmentType === "Electrical") {
        setElectricalData({
          labName: data.lab || data.labName || "",
          roomName: data.room || data.roomName || "",
          equipmentName: data.name || data.equipmentName || "",
          equipmentId: data.id || data.equipmentId || ""
        });
      }
      setShowScanner(false);
      setSuccessMessage("Equipment details auto-filled successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error("Invalid QR format. Expected JSON.", e);
      alert("Invalid QR format. Please scan a valid equipment QR code.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      equipmentType,
      equipmentDetails: equipmentType === "IT" ? itData : electricalData,
      description,
      userDetails: {
        userName,
        email,
        prn
      }
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          equipment_type: data.equipmentType,
          lab_name: data.equipmentDetails.labName,
          room_name: data.equipmentDetails.roomName,
          equipment_name: data.equipmentType === "IT" ? data.equipmentDetails.pcName : data.equipmentDetails.equipmentName,
          equipment_id: data.equipmentType === "IT" ? data.equipmentDetails.pcId : data.equipmentDetails.equipmentId,
          issue_subtype: issueSubtype,
          description: data.description,
          user_name: data.userDetails.userName,
          email: data.userDetails.email,
          prn: data.userDetails.prn,
          issue_subtype: issueSubtype,
          student_dept: localStorage.getItem("userDepartment") || "IT"
        })
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
            } else {
              alert("Failed to join the existing request.");
            }
          }
          return;
        }

        setSuccessMessage("Issue Reported Successfully!");
        resetForm();
      } else {
        alert("Failed to report issue");
      }
    } catch (error) {
      console.error("Error reporting issue:", error);
      alert("Error connecting to server");
    }
  };

  const resetForm = () => {
    setEquipmentType("");
    setIssueSubtype("");
    setDescription("");
    setUserName("");
    setEmail("");
    setPrn("");
    setItData({ labName: "", roomName: "", pcName: "", pcId: "" });
    setElectricalData({ labName: "", roomName: "", equipmentName: "", equipmentId: "" });
  };

  return (
    <div className="issue-page-wrapper">
      <div className="issue-container">
        <div className="issue-header">
          <div className="header-icon">
            <ClipboardList size={32} />
          </div>
          <div className="header-text">
            <h2>Report Equipment Issue</h2>
            <p>Help us maintain college resources by reporting faults</p>
          </div>
        </div>

        {successMessage && (
          <div className="success-banner">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-section">
            <h3><PenTool size={18} /> Equipment Information</h3>
            <div className="form-group">
              <label>Equipment Category</label>
              <div className="radio-group">
                <label className={`radio-card ${equipmentType === 'IT' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="eqType"
                    value="IT"
                    onChange={(e) => setEquipmentType(e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="dot"></span>
                    <span>IT Equipment</span>
                  </div>
                </label>
                <label className={`radio-card ${equipmentType === 'Electrical' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="eqType"
                    value="Electrical"
                    onChange={(e) => setEquipmentType(e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="dot"></span>
                    <span>Electrical</span>
                  </div>
                </label>
              </div>
            </div>

            {equipmentType && (
              <div className="qr-action-row">
                <button
                  type="button"
                  className="qr-scan-btn"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode size={18} /> Scan QR Code
                </button>
                <span className="qr-hint">Scan equipment label for auto-fill</span>
              </div>
            )}

            {equipmentType === "IT" && (
              <div className="equipment-grid animated-fade-in">
                <div className="input-wrap">
                  <label>Lab Name</label>
                  <input
                    placeholder="e.g. Network Lab"
                    value={itData.labName}
                    onChange={(e) => setItData({ ...itData, labName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>Room Number</label>
                  <input
                    placeholder="e.g. 302"
                    value={itData.roomName}
                    onChange={(e) => setItData({ ...itData, roomName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>Equipment Name</label>
                  <input
                    placeholder="e.g. Dell Optiplex"
                    value={itData.pcName}
                    onChange={(e) => setItData({ ...itData, pcName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>Equipment ID</label>
                  <input
                    placeholder="e.g. PC-05"
                    value={itData.pcId}
                    onChange={(e) => setItData({ ...itData, pcId: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {equipmentType === "Electrical" && (
              <div className="equipment-grid animated-fade-in">
                <div className="input-wrap">
                  <label>Lab Name</label>
                  <input
                    placeholder="e.g. Physics Lab"
                    value={electricalData.labName}
                    onChange={(e) => setElectricalData({ ...electricalData, labName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>Room Number</label>
                  <input
                    placeholder="e.g. 104"
                    value={electricalData.roomName}
                    onChange={(e) => setElectricalData({ ...electricalData, roomName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>Equipment Name</label>
                  <input
                    placeholder="e.g. AC, Projector"
                    value={electricalData.equipmentName}
                    onChange={(e) => setElectricalData({ ...electricalData, equipmentName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>Equipment ID</label>
                  <input
                    placeholder="e.g. AC-02"
                    value={electricalData.equipmentId}
                    onChange={(e) => setElectricalData({ ...electricalData, equipmentId: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {equipmentType && (
              <div className="animated-fade-in">
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Issue Type</label>
                  <select 
                    className="modern-select"
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

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Issue Description</label>
                  <textarea
                    rows="4"
                    placeholder="Please describe the fault in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          <div className="form-divider"></div>

          <div className="form-section">
            <h3><AlertCircle size={18} /> Your Details</h3>
            <div className="userDetails-grid">
              <div className="input-wrap">
                <label>Full Name</label>
                <input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="input-wrap">
                <label>Email ID</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-wrap">
                <label>PRN Number</label>
                <input
                  placeholder="Enter PRN"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={!equipmentType}>
            Submit Issue Report
          </button>
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

export default IssuePage;