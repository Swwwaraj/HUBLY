"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import "../styles/dashboard.css"
import HublyLogo from "../components/HublyLogo"
import { Search, MessageSquare, BarChart2, FileText, Users, Settings, LogOut } from "react-feather"
import { useAuth } from "../context/AuthContext"
import { ticketsAPI } from "../services/api"
import { initSocket } from "../services/socket"
import TicketDetailModal from "../components/TicketDetailModal"

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)

  const { user, logout } = useAuth()
  const socketInitialized = useRef(false)

  // Initialize socket connection
  useEffect(() => {
    if (user && !socketInitialized.current) {
      const token = localStorage.getItem("token")
      if (token) {
        const socket = initSocket(token)
        socketInitialized.current = true

        // Listen for ticket updates
        socket.on("ticket-updated", (updatedTicket) => {
          setTickets((prevTickets) =>
            prevTickets.map((ticket) => (ticket._id === updatedTicket._id ? updatedTicket : ticket)),
          )
        })

        // Listen for new tickets
        socket.on("ticket:new", ({ ticket }) => {
          setTickets((prevTickets) => [ticket, ...prevTickets])
        })

        return () => {
          socket.off("ticket-updated")
          socket.off("ticket:new")
        }
      }
    }
  }, [user])

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null) // Clear any previous errors

        console.log("Fetching tickets...")
        const response = await ticketsAPI.getAll()
        console.log("Tickets response:", response)

        if (response && response.data) {
          setTickets(response.data)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching tickets:", error)

        // Provide more specific error messages based on the error
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Server error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`)
        } else if (error.request) {
          // The request was made but no response was received
          setError("No response from server. Please check your connection.")
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTickets()
    }
  }, [user])

  // Filter tickets based on active tab and search query
  useEffect(() => {
    let result = [...tickets]

    // Apply tab filter
    if (activeTab === "resolved") {
      result = result.filter((ticket) => ticket.status === "resolved")
    } else if (activeTab === "unresolved") {
      result = result.filter((ticket) => ticket.status === "unresolved")
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(query) ||
          ticket.description?.toLowerCase().includes(query) ||
          `ticket# ${formatTicketNumber(ticket)}`.toLowerCase().includes(query),
      )
    }

    setFilteredTickets(result)
  }, [tickets, activeTab, searchQuery])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is applied in the useEffect
  }

  const handleLogout = () => {
    logout()
  }

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetail(true)
  }

  const handleTicketClose = () => {
    setShowTicketDetail(false)
    setSelectedTicket(null)
  }

  // Format ticket number with year and sequential number
  const formatTicketNumber = (ticket) => {
    const date = new Date(ticket.createdAt)
    const year = date.getFullYear()

    // Get last 5 digits of ticket ID and pad with zeros
    const ticketId = ticket._id.toString()
    const sequentialNumber = ticketId.slice(-5).padStart(5, "0")

    return `${year}-${sequentialNumber}`
  }

  // Format date to show time
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Format posted time
  const formatPostedTime = (dateString) => {
    const date = new Date(dateString)
    return `Posted at ${date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })}`
  }

  // Calculate time elapsed since ticket creation
  const getTimeElapsed = (dateString) => {
    const created = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - created) / (1000 * 60))
      return `${diffInMinutes}:00`
    }

    return `${diffInHours}:00`
  }

  // Get first message from ticket
  const getFirstMessage = (ticket) => {
    if (ticket.description) {
      // Get first line or first 50 characters
      const firstLine = ticket.description.split("\n")[0]
      return firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine
    }
    return "No message"
  }

  // Get user info from ticket
  const getUserInfo = (ticket) => {
    // If ticket is from chat, try to get user info
    if (ticket.source === "chat" && ticket.sourceId) {
      const userInfo = ticket.userInfo || {}
      return {
        name: userInfo.name || "Anonymous User",
        phone: userInfo.phone || "+91 0000000000",
        email: userInfo.email || "example@gmail.com",
      }
    }

    // Otherwise use creator info
    return {
      name: ticket.createdBy?.firstName
        ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName || ""}`
        : "Anonymous User",
      phone: ticket.createdBy?.phone || "+91 0000000000",
      email: ticket.createdBy?.email || "example@gmail.com",
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">
          <HublyLogo />
        </div>
        <div className="sidebar-menu">
          <Link to="/dashboard" className="sidebar-item active">
            <div className="sidebar-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link to="/contact-center" className="sidebar-item">
            <div className="sidebar-icon">
              <MessageSquare size={20} />
            </div>
            <span className="sidebar-text">Contact Center</span>
          </Link>
          <Link to="/analytics" className="sidebar-item">
            <div className="sidebar-icon">
              <BarChart2 size={20} />
            </div>
            <span className="sidebar-text">Analytics</span>
          </Link>
          <Link to="/documents" className="sidebar-item">
            <div className="sidebar-icon">
              <FileText size={20} />
            </div>
            <span className="sidebar-text">Documents</span>
          </Link>
          <Link to="/team" className="sidebar-item">
            <div className="sidebar-icon">
              <Users size={20} />
            </div>
            <span className="sidebar-text">Team</span>
          </Link>
          <Link to="/settings" className="sidebar-item">
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

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>

        <div className="dashboard-search">
          <form onSubmit={handleSearch}>
            <div className="search-input-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search for ticket"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="dashboard-tabs">
          <div className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>
            <MessageSquare size={16} className="tab-icon" />
            <span>All Tickets</span>
          </div>
          <div
            className={`tab-item ${activeTab === "resolved" ? "active" : ""}`}
            onClick={() => handleTabChange("resolved")}
          >
            <span>Resolved</span>
          </div>
          <div
            className={`tab-item ${activeTab === "unresolved" ? "active" : ""}`}
            onClick={() => handleTabChange("unresolved")}
          >
            <span>Unresolved</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading tickets...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {filteredTickets.map((ticket) => {
              const userInfo = getUserInfo(ticket)
              return (
                <div className="ticket-item" key={ticket._id}>
                  <div className="ticket-header">
                    <div className="ticket-avatar">
                      <div className="avatar-circle orange"></div>
                    </div>
                    <div className="ticket-title">Ticket# {formatTicketNumber(ticket)}</div>
                    <div className="ticket-posted-time">{formatPostedTime(ticket.createdAt)}</div>
                  </div>
                  <div className="ticket-message">{getFirstMessage(ticket)}</div>
                  <div className="ticket-time">{getTimeElapsed(ticket.createdAt)}</div>
                  <div className="ticket-user">
                    <div className="user-avatar">
                      <div className="avatar-circle user-avatar-circle">{userInfo.name.charAt(0)}</div>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{userInfo.name}</div>
                      <div className="user-contact">{userInfo.phone}</div>
                      <div className="user-contact">{userInfo.email}</div>
                    </div>
                    <button className="open-ticket-button" onClick={() => handleTicketClick(ticket)}>
                      Open Ticket
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showTicketDetail && selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={handleTicketClose} />}
    </div>
  )
}

export default DashboardPage
