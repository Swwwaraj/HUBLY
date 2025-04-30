import { Link, useLocation } from "react-router-dom"
import { Home, MessageSquare, BarChart2, Users, Settings } from "react-feather"
import HublyLogo from "./HublyLogo"
import "../styles/sidebar.css"

const Sidebar = () => {
  const location = useLocation()
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <HublyLogo />
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}>
          <Home size={20} className="sidebar-icon" />
          <span className="sidebar-text">Dashboard</span>
        </Link>
        <Link to="/contact-center" className={`sidebar-item ${isActive("/contact-center") ? "active" : ""}`}>
          <MessageSquare size={20} className="sidebar-icon" />
          <span className="sidebar-text">Contact Center</span>
        </Link>
        <Link to="/analytics" className={`sidebar-item ${isActive("/analytics") ? "active" : ""}`}>
          <BarChart2 size={20} className="sidebar-icon" />
          <span className="sidebar-text">Analytics</span>
        </Link>
        <Link to="/team" className={`sidebar-item ${isActive("/team") ? "active" : ""}`}>
          <Users size={20} className="sidebar-icon" />
          <span className="sidebar-text">Team</span>
        </Link>
        <Link to="/settings" className={`sidebar-item ${isActive("/settings") ? "active" : ""}`}>
          <Settings size={20} className="sidebar-icon" />
          <span className="sidebar-text">Settings</span>
        </Link>
        <Link to="/chatbot" className={`sidebar-item ${isActive("/chatbot") ? "active" : ""}`}>
          <div className="chatbot-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="currentColor"
              />
              <path
                d="M8 14C9.10457 14 10 13.1046 10 12C10 10.8954 9.10457 10 8 10C6.89543 10 6 10.8954 6 12C6 13.1046 6.89543 14 8 14Z"
                fill="currentColor"
              />
              <path
                d="M16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14Z"
                fill="currentColor"
              />
              <path
                d="M12 17.5C14.33 17.5 16.3 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="sidebar-text">Chat bot</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <button className="help-button">
          <span className="help-icon">?</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
