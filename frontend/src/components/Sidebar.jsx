"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, MessageSquare, BarChart2, Users, Settings, LogOut } from "react-feather"
import HublyLogo from "./HublyLogo"
import { useAuth } from "../context/AuthContext"
import "../styles/sidebar.css"

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-logo">
        <HublyLogo />
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
          <div className="sidebar-icon">
            <Home size={20} />
          </div>
          <span className="sidebar-text">Dashboard</span>
        </Link>
        <Link
          to="/contact-center"
          className={`sidebar-item ${location.pathname === "/contact-center" ? "active" : ""}`}
        >
          <div className="sidebar-icon">
            <MessageSquare size={20} />
          </div>
          <span className="sidebar-text">Contact Center</span>
        </Link>
        <Link to="/analytics" className={`sidebar-item ${location.pathname === "/analytics" ? "active" : ""}`}>
          <div className="sidebar-icon">
            <BarChart2 size={20} />
          </div>
          <span className="sidebar-text">Analytics</span>
        </Link>
        <Link to="/chat-bot" className={`sidebar-item ${location.pathname === "/chat-bot" ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 12C16 12.41 15.66 12.75 15.25 12.75H8.75C8.34 12.75 8 12.41 8 12C8 11.59 8.34 11.25 8.75 11.25H15.25C15.66 11.25 16 11.59 16 12ZM15.25 9.75H8.75C8.34 9.75 8 9.41 8 9C8 8.59 8.34 8.25 8.75 8.25H15.25C15.66 8.25 16 8.59 16 9C16 9.41 15.66 9.75 15.25 9.75ZM15.25 15.75H8.75C8.34 15.75 8 15.41 8 15C8 14.59 8.34 14.25 8.75 14.25H15.25C15.66 14.25 16 14.59 16 15C16 15.41 15.66 15.75 15.25 15.75Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="sidebar-text">Chat Bot</span>
        </Link>
        <Link to="/team" className={`sidebar-item ${location.pathname === "/team" ? "active" : ""}`}>
          <div className="sidebar-icon">
            <Users size={20} />
          </div>
          <span className="sidebar-text">Team</span>
        </Link>
        <Link to="/settings" className={`sidebar-item ${location.pathname === "/settings" ? "active" : ""}`}>
          <div className="sidebar-icon">
            <Settings size={20} />
          </div>
          <span className="sidebar-text">Settings</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
