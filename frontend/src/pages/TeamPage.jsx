"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../styles/team.css"
import HublyLogo from "../components/HublyLogo"
import { Home, MessageSquare, BarChart2, Users, Settings, Edit, Trash, Plus, ChevronDown } from "react-feather"
import { useAuth } from "../context/AuthContext"
import { teamAPI } from "../services/api"

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "member",
  })

  const { user } = useAuth()

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await teamAPI.getAll()
        setTeamMembers(response.data)
      } catch (error) {
        console.error("Error fetching team members:", error)
        setError("Failed to load team members. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTeamMembers()
    }
  }, [user])

  const handleAddMember = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setNewMember({
      name: "",
      email: "",
      role: "member",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMember({
      ...newMember,
      [name]: value,
    })
  }

  const handleSaveMember = async () => {
    // Validate inputs
    if (!newMember.name || !newMember.email) {
      return
    }

    try {
      setLoading(true)
      const [firstName, ...lastNameParts] = newMember.name.split(" ")
      const lastName = lastNameParts.join(" ")

      const response = await teamAPI.add({
        firstName,
        lastName: lastName || "",
        email: newMember.email,
        role: newMember.role,
      })

      // Since we're just inviting, we'll add a placeholder member
      const newTeamMember = {
        _id: Date.now().toString(), // Temporary ID
        firstName,
        lastName: lastName || "",
        email: newMember.email,
        role: newMember.role,
        phone: "+1 (000) 000-0000", // Default phone
        invited: true,
      }

      setTeamMembers([...teamMembers, newTeamMember])
      handleCloseAddModal()
    } catch (error) {
      console.error("Error adding team member:", error)
      setError("Failed to add team member. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditMember = (id) => {
    // In a real app, this would open a form to edit the team member
    console.log("Edit team member", id)
  }

  const handleDeleteMember = (id) => {
    setMemberToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDeleteMember = async () => {
    if (memberToDelete) {
      try {
        setLoading(true)
        await teamAPI.delete(memberToDelete)
        setTeamMembers(teamMembers.filter((member) => member._id !== memberToDelete))
        setShowDeleteModal(false)
        setMemberToDelete(null)
      } catch (error) {
        console.error("Error deleting team member:", error)
        setError("Failed to delete team member. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const cancelDeleteMember = () => {
    setShowDeleteModal(false)
    setMemberToDelete(null)
  }

  return (
    <div className="team-page">
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
          <Link to="/chat-bot" className="sidebar-item">
            <div className="chat-bot-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 12C16 12.41 15.66 12.75 15.25 12.75H8.75C8.34 12.75 8 12.41 8 12C8 11.59 8.34 11.25 8.75 11.25H15.25C15.66 11.25 16 11.59 16 12ZM15.25 9.75H8.75C8.34 9.75 8 9.41 8 9C8 8.59 8.34 8.25 8.75 8.25H15.25C15.66 8.25 16 8.59 16 9C16 9.41 15.66 9.75 15.25 9.75ZM15.25 15.75H8.75C8.34 15.75 8 15.41 8 15C8 14.59 8.34 14.25 8.75 14.25H15.25C15.66 14.25 16 14.59 16 15C16 15.41 15.66 15.75 15.25 15.75Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="sidebar-text">Chat Bot</span>
          </Link>
          <Link to="/team" className="sidebar-item active">
            <Users size={20} />
            <span className="sidebar-text">Team</span>
          </Link>
          <Link to="/settings" className="sidebar-item">
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

      <div className="team-content">
        <div className="team-header">
          <h1 className="team-title">Team</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-indicator">Loading team members...</div>
        ) : (
          <div className="team-table-container">
            <table className="team-table">
              <thead>
                <tr>
                  <th className="full-name-column">
                    Full Name <span className="sort-icon">↓</span>
                  </th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-message">
                      No team members found. Add team members to get started.
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="member-name-cell">
                        <div className="member-avatar">
                          <div className={`avatar-circle ${member.avatar || "blue"}`}></div>
                        </div>
                        {member.firstName} {member.lastName}
                      </td>
                      <td>{member.phone || "+1 (000) 000-0000"}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td className="actions-cell">
                        <button className="action-button" onClick={() => handleEditMember(member._id)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-button" onClick={() => handleDeleteMember(member._id)}>
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {user?.role === "admin" && (
          <div className="team-actions">
            <button className="add-member-button" onClick={handleAddMember}>
              <Plus size={16} /> Add Team members
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-member-modal">
            <div className="modal-content">
              <h2 className="modal-title">Add Team members</h2>
              <p className="modal-description">
                Add new team members to collaborate on tickets and chats. New teammates will receive an invitation to
                join your team.
              </p>

              <div className="form-group">
                <label htmlFor="name">User name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="User name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email ID</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email ID"
                  value={newMember.email}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Designation</label>
                <div className="select-wrapper">
                  <select
                    id="role"
                    name="role"
                    value={newMember.role}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-button" onClick={handleCloseAddModal}>
                  Cancel
                </button>
                <button className="save-button" onClick={handleSaveMember}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-member-modal">
            <div className="modal-content">
              <p className="modal-message">This teammate will be deleted.</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDeleteMember}>
                  Cancel
                </button>
                <button className="confirm-button" onClick={confirmDeleteMember}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamPage
