import React from "react";
import "./allissues.css";

export default function AllIssues() {

const issues = [
{
id:"ISS-001",
equipment:"Printer Model 1",
location:"Office 101, Science Block",
technician:"Emily Davis",
avatar:"ED",
status:"In Progress",
confirmation:"N/A"
},
{
id:"ISS-002",
equipment:"Computer Model 2",
location:"Classroom 102, Science Block",
technician:"Robert Tech",
avatar:"RT",
status:"Assigned",
confirmation:"N/A"
},
{
id:"ISS-003",
equipment:"Printer Model 3",
location:"Lab B2, Main Building",
technician:"Emily Davis",
avatar:"ED",
status:"Closed",
confirmation:"Pending"
},
{
id:"ISS-004",
equipment:"Computer Model 4",
location:"Room 203, Engineering Block",
technician:"Emily Davis",
avatar:"ED",
status:"In Progress",
confirmation:"N/A"
},
{
id:"ISS-005",
equipment:"Computer Model 5",
location:"Classroom 102, Science Block",
technician:"James Martinez",
avatar:"JM",
status:"Closed",
confirmation:"Confirmed"
},
{
id:"ISS-006",
equipment:"Fan Model 6",
location:"Lab A1, Admin Block",
technician:"Emily Davis",
avatar:"ED",
status:"Closed",
confirmation:"Confirmed"
},
{
id:"ISS-007",
equipment:"Fan Model 7",
location:"Lab B2, Engineering Block",
technician:"Robert Tech",
avatar:"RT",
status:"Waiting Confirmation",
confirmation:"Confirmed"
}
];

return (
<div className="issues-container">

<div className="issues-table-wrapper">
<table className="issues-table">

<thead>
<tr>
<th>ISSUE ID</th>
<th>EQUIPMENT</th>
<th>LOCATION</th>
<th>ASSIGNED TECHNICIAN</th>
<th>STATUS</th>
<th>STUDENT CONFIRMATION</th>
<th>ACTIONS</th>
</tr>
</thead>

<tbody>

{issues.map((issue,index)=>(
<tr key={index}>

<td>{issue.id}</td>

<td>{issue.equipment}</td>

<td>{issue.location}</td>

<td className="tech-cell">

<div className="avatar">
{issue.avatar}
</div>

<span>{issue.technician}</span>

</td>

<td>
<span className={`status ${issue.status.replace(" ","").toLowerCase()}`}>
{issue.status}
</span>
</td>

<td>
<span className={`confirm ${issue.confirmation.toLowerCase()}`}>
{issue.confirmation}
</span>
</td>

<td className="actions">

{issue.status === "Waiting Confirmation" &&
<button className="close-btn">Close</button>
}

<span className="delete">🗑</span>

</td>

</tr>
))}

</tbody>

</table>
</div>

</div>
);
}