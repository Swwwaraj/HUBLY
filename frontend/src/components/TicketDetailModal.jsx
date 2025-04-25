"use client"

import { useState, useEffect } from "react"
import { X, Edit, MessageSquare, User, Clock, Tag } from "react-feather"
import { ticketsAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { teamAPI } from "../services/api"
import { getSocket } from "../services/socket"

const TicketDetailModal = ({ ticket, onClose }) => {
  const [currentTicket, setCurrentTicket] = useState(ticket)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [teamMembers, setTeamMembers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    assignedTo: ticket.assignedTo?._id || "",
  })

  const { user } = useAuth()

  // Fetch team members for assignment
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamAPI.getAll()
        setTeamMembers(response.data)
      } catch (error) {
        console.error("Error fetching team members:", error)
      }
    }

    fetchTeamMembers()
  }, [])

  // Listen for ticket updates
  useEffect(() => {
    const socket = getSocket()

    if (socket) {
      socket.on("ticket-updated", (updatedTicket) => {
        if (updatedTicket._id === currentTicket._id) {
          setCurrentTicket(updatedTicket)
        }
      })

      return () => {
        socket.off("ticket-updated")
      }
    }
  }, [currentTicket._id])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!comment.trim()) return

    try {
      setLoading(true)

      const updatedTicket = {
        ...currentTicket,
        comments: [
          ...currentTicket.comments,
          {
            author: user.id,
            content: comment,
            createdAt: new Date(),
          },
        ],
      }

      const response = await ticketsAPI.update(currentTicket._id, updatedTicket)
      setCurrentTicket(response.data)
      setComment("")

      // Emit socket event for real-time updates
      const socket = getSocket()
      if (socket) {
        socket.emit("update-ticket", {
          ticketId: currentTicket._id,
          updates: { comments: updatedTicket.comments },
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("Failed to add comment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    try {
      setLoading(true)

      const response = await ticketsAPI.update(currentTicket._id, { status })
      setCurrentTicket(response.data)

      // Emit socket event for real-time updates
      const socket = getSocket()
      if (socket) {
        socket.emit("update-ticket", {
          ticketId: currentTicket._id,
          updates: { status },
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await ticketsAPI.update(currentTicket._id, editForm)
      setCurrentTicket(response.data)
      setIsEditing(false)

      // Emit socket event for real-time updates
      const socket = getSocket()
      if (socket) {
        socket.emit("update-ticket", {
          ticketId: currentTicket._id,
          updates: editForm,
        })
      }
    } catch (error) {
      console.error("Error updating ticket:", error)
      setError("Failed to update ticket. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container ticket-detail-modal">
        <div className="modal-header">
          <h2>Ticket Details</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {isEditing ? (
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                  className="form-control"
                  rows={5}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={editForm.priority}
                    onChange={handleEditChange}
                    className="form-control"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="form-control"
                  >
                    <option value="unresolved">Unresolved</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="assignedTo">Assign To</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={editForm.assignedTo}
                  onChange={handleEditChange}
                  className="form-control"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="ticket-header">
                <h3 className="ticket-title">{currentTicket.title}</h3>
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="ticket-meta">
                <div className="meta-item">
                  <Clock size={16} />
                  <span>Created: {formatDate(currentTicket.createdAt)}</span>
                </div>

                <div className="meta-item">
                  <User size={16} />
                  <span>
                    Created by: {currentTicket.createdBy?.firstName} {currentTicket.createdBy?.lastName}
                  </span>
                </div>

                {currentTicket.assignedTo && (
                  <div className="meta-item">
                    <User size={16} />
                    <span>
                      Assigned to: {currentTicket.assignedTo.firstName} {currentTicket.assignedTo.lastName}
                    </span>
                  </div>
                )}

                <div className="meta-item">
                  <Tag size={16} />
                  <span className={`priority-badge ${currentTicket.priority}`}>Priority: {currentTicket.priority}</span>
                </div>
              </div>

              <div className="ticket-description">
                <h4>Description</h4>
                <p>{currentTicket.description}</p>
              </div>

              <div className="ticket-status-actions">
                <button
                  className={`status-button ${currentTicket.status === "unresolved" ? "active" : ""}`}
                  onClick={() => handleStatusChange("unresolved")}
                >
                  Unresolved
                </button>
                <button
                  className={`status-button ${currentTicket.status === "in-progress" ? "active" : ""}`}
                  onClick={() => handleStatusChange("in-progress")}
                >
                  In Progress
                </button>
                <button
                  className={`status-button ${currentTicket.status === "resolved" ? "active" : ""}`}
                  onClick={() => handleStatusChange("resolved")}
                >
                  Resolved
                </button>
              </div>

              <div className="ticket-comments">
                <h4>
                  <MessageSquare size={16} />
                  <span>Comments</span>
                </h4>

                {currentTicket.comments && currentTicket.comments.length > 0 ? (
                  <div className="comments-list">
                    {currentTicket.comments.map((comment, index) => (
                      <div key={index} className="comment-item">
                        <div className="comment-avatar">
                          <div className="avatar-circle"></div>
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                            <span className="comment-time">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="comment-text">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comments">No comments yet.</p>
                )}

                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="comment-input"
                    rows={3}
                  />
                  <button type="submit" className="btn-primary" disabled={loading || !comment.trim()}>
                    {loading ? "Sending..." : "Add Comment"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetailModal
