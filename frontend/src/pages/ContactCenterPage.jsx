"use client"

import { useState, useEffect } from "react"
import "../styles/contact-center.css"
import Sidebar from "../components/Sidebar"
import { Send } from "react-feather"
import { chatAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { initSocket, joinChatRoom, leaveChatRoom, sendChatMessage } from "../services/socket"

const ContactCenterPage = () => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [showTeammates, setShowTeammates] = useState(false)
  const [showTicketStatus, setShowTicketStatus] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [chatResolved, setChatResolved] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useAuth()

  // Initialize socket
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token")
      if (token) {
        const socket = initSocket(token)

        // Listen for new messages
        socket.on("chat:message", ({ chatId, message }) => {
          if (activeChat && activeChat._id === chatId) {
            setMessages((prev) => [...prev, message])
          }

          // Update chat preview
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat._id === chatId ? { ...chat, lastMessage: message.content, updatedAt: new Date() } : chat,
            ),
          )
        })

        // Listen for new chats
        socket.on("chat:new", ({ chat }) => {
          setChats((prev) => [chat, ...prev])
        })

        return () => {
          socket.off("chat:message")
          socket.off("chat:new")
        }
      }
    }
  }, [user, activeChat])

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true)
        const response = await chatAPI.getAll()
        setChats(response.data)

        // Set first chat as active if available
        if (response.data.length > 0 && !activeChat) {
          handleChatSelect(response.data[0])
        }
      } catch (error) {
        console.error("Error fetching chats:", error)
        setError("Failed to load chats. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchChats()
    }
  }, [user])

  // Fetch messages when active chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return

      try {
        // Join chat room
        joinChatRoom(activeChat._id)

        // Get chat details
        const response = await chatAPI.getById(activeChat._id)
        setMessages(response.data.messages || [])
        setChatResolved(response.data.status === "resolved")
      } catch (error) {
        console.error("Error fetching messages:", error)
        setError("Failed to load messages. Please try again.")
      }
    }

    fetchMessages()

    // Leave chat room when component unmounts or active chat changes
    return () => {
      if (activeChat) {
        leaveChatRoom(activeChat._id)
      }
    }
  }, [activeChat])

  const handleChatSelect = (chat) => {
    setActiveChat(chat)
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
    if (inputValue.trim() && activeChat) {
      // Send message via socket
      sendChatMessage(activeChat._id, inputValue)
      setInputValue("")
    }
  }

  const handleCloseChat = () => {
    setShowCloseModal(true)
  }

  const confirmCloseChat = async () => {
    if (activeChat) {
      try {
        await chatAPI.update(activeChat._id, { status: "resolved" })
        setChatResolved(true)
        setShowCloseModal(false)

        // Update chat in list
        setChats((prevChats) =>
          prevChats.map((chat) => (chat._id === activeChat._id ? { ...chat, status: "resolved" } : chat)),
        )
      } catch (error) {
        console.error("Error resolving chat:", error)
        setError("Failed to resolve chat. Please try again.")
      }
    }
  }

  const cancelCloseChat = () => {
    setShowCloseModal(false)
  }

  const handleStatusChange = async (status) => {
    if (activeChat) {
      try {
        await chatAPI.update(activeChat._id, { status })
        setChatResolved(status === "resolved")
        setShowTicketStatus(false)

        // Update chat in list
        setChats((prevChats) => prevChats.map((chat) => (chat._id === activeChat._id ? { ...chat, status } : chat)))
      } catch (error) {
        console.error("Error updating chat status:", error)
        setError("Failed to update status. Please try again.")
      }
    }
  }

  // Format date for messages
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}

    messages.forEach((message) => {
      const date = formatMessageDate(message.timestamp)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }))
  }

  return (
    <div className="contact-center-page">
      <Sidebar />
      <div className="contact-center-container">
        <div className="contact-center-content">
          <div className="chat-list-sidebar">
            <div className="chat-list-header">
              <h3>Chats</h3>
            </div>
            {loading ? (
              <div className="loading-indicator">Loading chats...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : chats.length === 0 ? (
              <div className="empty-state">No chats available</div>
            ) : (
              <div className="chat-list">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-item ${activeChat && activeChat._id === chat._id ? "active" : ""}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="chat-avatar">
                      <div className="avatar-circle red">{chat.userInfo?.name?.charAt(0) || "A"}</div>
                    </div>
                    <div className="chat-preview">
                      <div className="chat-name">{chat.userInfo?.name || "Anonymous"}</div>
                      <div className="chat-last-message">
                        {chat.messages && chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1].content
                          : "No messages yet"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chat-main">
            {activeChat ? (
              <>
                <div className="chat-header">
                  <div className="chat-ticket-info">
                    {activeChat.ticketId ? `Ticket# ${activeChat.ticketId}` : "No ticket assigned"}
                  </div>
                  <div className="chat-actions">
                    <button className="pin-button">
                      <span className="pin-icon">📌</span>
                    </button>
                  </div>
                </div>
                <div className="chat-messages">
                  {groupMessagesByDate(messages).map((group, groupIndex) => (
                    <div className="message-group" key={groupIndex}>
                      <div className="message-date">{group.date}</div>
                      {group.messages.map((message, messageIndex) => (
                        <div
                          key={message._id || messageIndex}
                          className={`message ${message.sender === "user" ? "user" : "agent"}`}
                        >
                          {message.sender === "user" && (
                            <div className="message-avatar">
                              <div className="avatar-circle gray">{activeChat.userInfo?.name?.charAt(0) || "A"}</div>
                            </div>
                          )}
                          <div className="message-content">
                            <div className={`message-sender ${message.sender === "agent" ? "right" : ""}`}>
                              {message.sender === "user"
                                ? activeChat.userInfo?.name || "Anonymous"
                                : user?.firstName || "Agent"}
                            </div>
                            <div className={`message-text ${message.sender === "agent" ? "right" : ""}`}>
                              {message.content}
                            </div>
                          </div>
                          {message.sender === "agent" && (
                            <div className="message-avatar">
                              <div className="avatar-circle blue">{user?.firstName?.charAt(0) || "A"}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
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
              </>
            ) : (
              <div className="no-chat-selected">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          </div>

          {activeChat && (
            <div className="contact-details-sidebar">
              <div className="contact-details-header">
                <div className="contact-avatar">
                  <div className="avatar-circle red">{activeChat.userInfo?.name?.charAt(0) || "A"}</div>
                </div>
                <div className="contact-title">{activeChat.userInfo?.name || "Anonymous"}</div>
                <button className="share-button">
                  <span className="share-icon">🔗</span>
                </button>
              </div>
              <div className="contact-details-section">
                <h3 className="section-title">Details</h3>
                <div className="contact-detail-item">
                  <div className="detail-icon">👤</div>
                  <div className="detail-content">Contacts</div>
                  <div className="detail-edit">1</div>
                </div>
                <div className="contact-detail-item">
                  <div className="detail-icon">📞</div>
                  <div className="detail-content">{activeChat.userInfo?.phone || "No phone"}</div>
                </div>
                <div className="contact-detail-item">
                  <div className="detail-icon">✉️</div>
                  <div className="detail-content">{activeChat.userInfo?.email || "No email"}</div>
                </div>
              </div>
              <div className="contact-details-section">
                <h3 className="section-title">Teammates</h3>
                <div className="dropdown-container">
                  <div className="dropdown-header" onClick={toggleTeammates}>
                    <div className="dropdown-avatar">
                      <div className="avatar-circle blue">{user?.firstName?.charAt(0) || "A"}</div>
                    </div>
                    <div className="dropdown-title">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className={`dropdown-icon ${showTeammates ? "open" : ""}`}>▼</div>
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
                    <div className={`dropdown-icon ${showTicketStatus ? "open" : ""}`}>▼</div>
                  </div>
                  {showTicketStatus && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" onClick={() => handleStatusChange("resolved")}>
                        <div className="dropdown-title">Resolved</div>
                      </div>
                      <div className="dropdown-item" onClick={() => handleStatusChange("unresolved")}>
                        <div className="dropdown-title">Unresolved</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
