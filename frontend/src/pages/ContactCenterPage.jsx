"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/contact-center.css"
import HublyLogo from "../components/HublyLogo"
import { Home, MessageSquare, BarChart2, FileText, Users, Settings, ChevronDown, Send } from "react-feather"

const ContactCenterPage = () => {
  const [activeChat, setActiveChat] = useState(1)
  const [showTeammates, setShowTeammates] = useState(false)
  const [showTicketStatus, setShowTicketStatus] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [chatResolved, setChatResolved] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "user",
      text: "I have a question",
      time: "March 7, 2023",
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId)
  }

  const toggleTeammates = () => {
    setShowTeammates(!showTeammates)
    setShowTicketStatus(false)
  }

  const toggleTicketStatus = () => {
    setShowTicketStatus(!showTicketStatus)
    setShowTeammates(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "agent",
        text: inputValue,
        time: new Date().toLocaleString(),
      }
      setMessages([...messages, newMessage])
      setInputValue("")
    }
  }

  const handleCloseChat = () => {
    setShowCloseModal(true)
  }

  const confirmCloseChat = () => {
    setChatResolved(true)
    setShowCloseModal(false)
  }

  const cancelCloseChat = () => {
    setShowCloseModal(false)
  }

  const handleStatusChange = (status) => {
    if (status === "Resolved") {
      setChatResolved(true)
    } else {
      setChatResolved(false)
    }
    setShowTicketStatus(false)
  }

  return (
    <div className="contact-center-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">
          <HublyLogo />
        </div>
        <div className="sidebar-menu">
          <Link to="/dashboard" className="sidebar-item">
            <Home size={20} />
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link to="/contact-center" className="sidebar-item active">
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

      <div className="contact-center-container">
        <div className="contact-center-content">
          <div className="chat-list-sidebar">
            <div className="chat-list-header">
              <h3>Chats</h3>
            </div>
            <div className="chat-list">
              <div className={`chat-item ${activeChat === 1 ? "active" : ""}`} onClick={() => handleChatSelect(1)}>
                <div className="chat-avatar">
                  <div className="avatar-circle red"></div>
                </div>
                <div className="chat-preview">
                  <div className="chat-name">Chat 1</div>
                  <div className="chat-last-message">I have a question</div>
                </div>
              </div>
              <div className={`chat-item ${activeChat === 2 ? "active" : ""}`} onClick={() => handleChatSelect(2)}>
                <div className="chat-avatar">
                  <div className="avatar-circle purple"></div>
                </div>
                <div className="chat-preview">
                  <div className="chat-name">Chat 2</div>
                  <div className="chat-last-message">Ask me anything!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-main">
            <div className="chat-header">
              <div className="chat-ticket-info">Ticket# 2025-00123</div>
              <div className="chat-actions">
                <button className="pin-button">
                  <span className="pin-icon">📌</span>
                </button>
              </div>
            </div>
            <div className="chat-messages">
              <div className="message-group">
                <div className="message-date">March 7, 2023</div>
                <div className="message user">
                  <div className="message-avatar">
                    <div className="avatar-circle gray"></div>
                  </div>
                  <div className="message-content">
                    <div className="message-sender">Chat 1</div>
                    <div className="message-text">I have a question</div>
                  </div>
                </div>
                <div className="replying-indicator">Replying to missed chat</div>
                <div className="message agent">
                  <div className="message-content">
                    <div className="message-sender right">Joe Doe</div>
                    <div className="message-text right">
                      <a href="https://app.hubly.com/onboarding" className="message-link">
                        https://app.hubly.com/onboarding
                      </a>
                    </div>
                  </div>
                  <div className="message-avatar">
                    <div className="avatar-circle blue"></div>
                  </div>
                </div>
              </div>
              {chatResolved && <div className="chat-resolved-message">This chat has been resolved</div>}
            </div>
            <div className="chat-input-container">
              <form onSubmit={handleSendMessage} className="chat-form">
                <input
                  type="text"
                  placeholder="Type here"
                  className="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={chatResolved}
                />
                <button type="submit" className="send-button" disabled={chatResolved}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          <div className="contact-details-sidebar">
            <div className="contact-details-header">
              <div className="contact-avatar">
                <div className="avatar-circle red"></div>
              </div>
              <div className="contact-title">Chat</div>
              <button className="share-button">
                <span className="share-icon">🔗</span>
              </button>
            </div>
            <div className="contact-details-section">
              <h3 className="section-title">Details</h3>
              <div className="contact-detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">Contacts</div>
                <div className="detail-edit">2</div>
              </div>
              <div className="contact-detail-item">
                <div className="detail-icon">📞</div>
                <div className="detail-content">+919954698612</div>
              </div>
              <div className="contact-detail-item">
                <div className="detail-icon">✉️</div>
                <div className="detail-content">shubham.raghav20s@gmail.com</div>
              </div>
            </div>
            <div className="contact-details-section">
              <h3 className="section-title">Teammates</h3>
              <div className="dropdown-container">
                <div className="dropdown-header" onClick={toggleTeammates}>
                  <div className="dropdown-avatar">
                    <div className="avatar-circle blue"></div>
                  </div>
                  <div className="dropdown-title">Joe Doe</div>
                  <ChevronDown size={16} className={`dropdown-icon ${showTeammates ? "open" : ""}`} />
                </div>
              </div>
            </div>
            <div className="contact-details-section">
              <div className="dropdown-container">
                <div className="dropdown-header" onClick={toggleTicketStatus}>
                  <div className="dropdown-icon-container">
                    <div className="ticket-icon">🎫</div>
                  </div>
                  <div className="dropdown-title">Ticket status</div>
                  <ChevronDown size={16} className={`dropdown-icon ${showTicketStatus ? "open" : ""}`} />
                </div>
                {showTicketStatus && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleStatusChange("Resolved")}>
                      <div className="dropdown-title">Resolved</div>
                    </div>
                    <div className="dropdown-item" onClick={() => handleStatusChange("Unresolved")}>
                      <div className="dropdown-title">Unresolved</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCloseModal && (
        <div className="modal-overlay">
          <div className="close-chat-modal">
            <div className="modal-content">
              <p className="modal-message">Chat will be closed</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelCloseChat}>
                  Cancel
                </button>
                <button className="confirm-button" onClick={confirmCloseChat}>
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

export default ContactCenterPage
