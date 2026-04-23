import { useState } from "react"
import Navbar from "../components/Navbar"
import InputField from "../components/InputField"
import Button from "../components/Button"

function AddEquipment(){

  const [name,setName] = useState("")
  const [location,setLocation] = useState("")

  function add(){

    alert("Equipment Added")

  }

  return(

    <div>

      <Navbar />

      <div className="page">

        <h2>Add Equipment</h2>

        <InputField
          type="text"
          placeholder="Equipment Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <InputField
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e)=>setLocation(e.target.value)}
        />

        <Button text="Add Equipment" onClick={add} />

      </div>

    </div>

  )

}

export default AddEquipment