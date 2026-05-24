
function Button({text, onClick}){

  return(

    <button
      className="login-btn"
      onClick={onClick}
    >
      {text}
    </button>

  )

}

export default Button