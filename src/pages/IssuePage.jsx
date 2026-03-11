import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./IssuePage.css";

function IssuePage() {

  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);

  const handleCategoryChange = (e) => {

    const value = e.target.value;
    setCategory(value);

    if(value === "IT"){
      setEquipmentList([
        "PC",
        "Mouse",
        "Keyboard",
        "Monitor",
        "Printer"
      ]);
    }

    else if(value === "Electrical"){
      setEquipmentList([
        "Fan",
        "Light",
        "Switch",
        "Projector",
        "AC"
      ]);
    }

    else{
      setEquipmentList([]);
    }

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    alert("Issue Submitted Successfully");

    navigate("/student-dashboard");

  };

  const goBack = () => {
    navigate("/student-dashboard");
  };

  return (

    <div className="issue-page">

      <div className="issue-card">

        <div className="issue-header">
          <h2>Report Equipment Issue</h2>
          <p>Fill the form to report faulty equipment</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <input type="text" required />
            <label>Student Name</label>
          </div>


          {/* Lab */}
          <div className="form-group">
            <input type="text" required />
            <label>Lab Name</label>
          </div>


          {/* Classroom */}
          <div className="form-group">
            <input type="text" required />
            <label>Classroom Number</label>
          </div>


          {/* Category */}
          <div className="form-group">
            <select value={category} onChange={handleCategoryChange} required>
              <option value=""></option>
              <option value="IT">IT Equipment</option>
              <option value="Electrical">Electrical Equipment</option>
            </select>
            <label>Equipment Category</label>
          </div>


          {/* Equipment */}
          <div className="form-group">
            <select required>
              <option value=""></option>

              {equipmentList.map((item, index) => (
                <option key={index}>
                  {item}
                </option>
              ))}

            </select>
            <label>Select Equipment</label>
          </div>


          {/* Description */}
          <div className="form-group">
            <textarea required></textarea>
            <label>Describe Issue</label>
          </div>


          {/* Buttons */}
          <div className="btn-group">

            <button type="submit" className="submit-btn">
              Submit Issue
            </button>

            <button type="button" className="back-btn" onClick={goBack}>
              Back
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default IssuePage;