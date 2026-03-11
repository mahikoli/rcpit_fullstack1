import { Link } from "react-router-dom"


function Navbar(){

  return(

    <div className="navbar">

      <h2>Equipment System</h2>

      <div>

        <Link to="/dashboard">Dashboard</Link>

        <Link to="/add-equipment">Add Equipment</Link>

        <Link to="/report-issue">Report Issue</Link>

        <Link to="/">Logout</Link>

      </div>

    </div>

  )

}

export default Navbar