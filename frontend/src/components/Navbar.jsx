import { Link } from "react-router-dom"
import "../styles/navbar.css"
import HublyLogo from "../components/HublyLogo"

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <HublyLogo />
        </Link>
        <div className="navbar-buttons">
          <Link to="/login" className="navbar-login">
            Login
          </Link>
          <Link to="/signup" className="navbar-signup">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
