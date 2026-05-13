function inputField({type, placeholder, value, onChange}){

  return(

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input-field"
    />

  )

}

export default inputField