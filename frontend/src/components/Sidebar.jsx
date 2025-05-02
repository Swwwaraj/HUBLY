"use client"

import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/sidebar.css"
import { useState } from "react"

const Sidebar = () => {
  const { user, logout } = useAuth()
  const [expanded, setExpanded] = useState(true)

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  return (
    <div className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <div className="toggle-button" onClick={toggleSidebar}>
        {expanded ? "←" : "→"}
      </div>
      <div className="sidebar-content">
        <div className="sidebar-header">{expanded && <h2>Hubly CRM</h2>}</div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="icon">
                  <i className="fas fa-home"></i>
                </span>
                {expanded && <span className="text">Dashboard</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact-center" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="icon">
                  <i className="fas fa-comments"></i>
                </span>
                {expanded && <span className="text">Contact Center</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="icon">
                  <i className="fas fa-chart-bar"></i>
                </span>
                {expanded && <span className="text">Analytics</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/chatbot" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="icon">
                  <i className="fas fa-robot"></i>
                </span>
                {expanded && <span className="text">Chat Bot</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/team" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="icon">
                  <i className="fas fa-users"></i>
                </span>
                {expanded && <span className="text">Team</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="icon">
                  <i className="fas fa-cog"></i>
                </span>
                {expanded && <span className="text">Settings</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-button">
            <span className="icon">
              <i className="fas fa-sign-out-alt"></i>
            </span>
            {expanded && <span className="text">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
