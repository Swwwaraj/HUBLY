"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/settings.css"
import HublyLogo from "../components/HublyLogo"
import { Home, MessageSquare, BarChart2, FileText, Users, Settings, Info } from "react-feather"

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    firstName: "Sarthak",
    lastName: "Pal",
    email: "sarthakpal08@gmail.com",
    password: "••••••••••••",
    confirmPassword: "••••••••••••",
  })
  const [showTooltip, setShowTooltip] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile({
      ...profile,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validate form
    if (profile.password !== profile.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    // In a real app, this would make an API call to update the profile
    console.log("Profile updated:", profile)
    setSaveSuccess(true)

    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

  return (
    <div className="settings-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">
          <HublyLogo />
        </div>
        <div className="sidebar-menu">
          <Link to="/dashboard" className="sidebar-item">
            <Home size={20} />
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link to="/contact-center" className="sidebar-item">
            <MessageSquare size={20} />
            <span className="sidebar-text">Contact Center</span>
          </Link>
          <Link to="/analytics" className="sidebar-item">
            <BarChart2 size={20} />
            <span className="sidebar-text">Analytics</span>
          </Link>
          <Link to="/documents" className="sidebar-item">
            <FileText size={20} />
            <span className="sidebar-text">Documents</span>
          </Link>
          <Link to="/team" className="sidebar-item">
            <Users size={20} />
            <span className="sidebar-text">Team</span>
          </Link>
          <Link to="/settings" className="sidebar-item active">
            <Settings size={20} />
            <span className="sidebar-text">Settings</span>
          </Link>
        </div>
        <div className="sidebar-footer">
          <button className="help-button">
            <span className="help-icon">?</span>
          </button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Edit Profile</h2>
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="form-control"
                />
                <button
                  type="button"
                  className="info-button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={profile.password}
                  onChange={handleInputChange}
                  className="form-control"
                />
                <button
                  type="button"
                  className="info-button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={profile.confirmPassword}
                  onChange={handleInputChange}
                  className="form-control"
                />
                <button
                  type="button"
                  className="info-button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            {showTooltip && <div className="tooltip">User will logout out immediately</div>}

            {saveSuccess && <div className="success-message">Profile updated successfully!</div>}

            <div className="form-actions">
              <button type="submit" className="save-button">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
