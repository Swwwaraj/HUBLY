"use client"

import { useState, useEffect } from "react"
import "../styles/team.css"
import { Edit, Trash, Plus, ChevronDown, Copy } from "react-feather"
import { useAuth } from "../context/AuthContext"
import { teamAPI } from "../services/api"
import { authAPI } from "../services/api"
import Sidebar from "../components/Sidebar"

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
  const [inviteUrl, setInviteUrl] = useState("")
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true)
        const response = await teamAPI.getAll()
        setTeamMembers(response.data)
      } catch (error) {
        console.error("Error fetching team members:", error)
        setError("Failed to load team members. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

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
    setInviteUrl("")
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
    if (!newMember.email) {
      return
    }

    try {
      const response = await authAPI.inviteTeamMember({
        email: newMember.email,
        role: newMember.role,
      })

      setInviteUrl(response.data.inviteUrl)

      // Since we're just inviting, we'll add a placeholder member
      const newTeamMember = {
        _id: Date.now().toString(), // Temporary ID
        firstName: newMember.name.split(" ")[0] || "",
        lastName: newMember.name.split(" ").slice(1).join(" ") || "",
        email: newMember.email,
        role: newMember.role,
        phone: "+1 (000) 000-0000", // Default phone
        invited: true,
      }

      setTeamMembers([...teamMembers, newTeamMember])
    } catch (error) {
      console.error("Error adding team member:", error)
      setError("Failed to add team member. Please try again.")
    }
  }

  const handleCopyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl)
    setShowCopyTooltip(true)
    setTimeout(() => setShowCopyTooltip(false), 2000)
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
        await teamAPI.delete(memberToDelete)
        setTeamMembers(teamMembers.filter((member) => member._id !== memberToDelete))
        setShowDeleteModal(false)
        setMemberToDelete(null)
      } catch (error) {
        console.error("Error deleting team member:", error)
        setError("Failed to delete team member. Please try again.")
      }
    }
  }

  const cancelDeleteMember = () => {
    setShowDeleteModal(false)
    setMemberToDelete(null)
  }

  return (
    <div className="team-page">
      <Sidebar />
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
                {teamMembers.map((member) => (
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
                ))}
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
                Talk with colleagues in a group chat. Messages in this group are only visible to its participants. New
                teammates may only be invited by administrators.
              </p>

              {!inviteUrl ? (
                <>
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
                      Create Invitation
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="invite-url-container">
                    <p>Share this invitation link with your team member:</p>
                    <div className="invite-url-box">
                      <input type="text" readOnly value={inviteUrl} className="invite-url-input" />
                      <button className="copy-button" onClick={handleCopyInviteUrl}>
                        <Copy size={16} />
                        {showCopyTooltip && <span className="copy-tooltip">Copied!</span>}
                      </button>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="save-button" onClick={handleCloseAddModal}>
                      Done
                    </button>
                  </div>
                </>
              )}
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
