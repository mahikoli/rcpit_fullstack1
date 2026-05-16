import React from "react";
import "./cards.css";

const DashboardCards = () => {

return(

<div className="cards">

<div className="card">
<h4>Total Requests</h4>
<h1>245</h1>
<p className="green">+12 this week</p>
</div>

<div className="card">
<h4>Pending</h4>
<h1>8</h1>
<p className="red">-3 this week</p>
</div>

<div className="card">
<h4>Completed</h4>
<h1>225</h1>
<p className="green">+15 this week</p>
</div>

<div className="card">
<h4>Critical</h4>
<h1>12</h1>
<p className="green">+2 this week</p>
</div>

</div>

);

};

export default DashboardCards;