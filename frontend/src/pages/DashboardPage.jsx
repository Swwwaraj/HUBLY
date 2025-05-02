"use client"

import { useState, useEffect, useRef } from "react"
import "../styles/dashboard.css"
import { Search, MessageSquare } from "react-feather"
import { useAuth } from "../context/AuthContext"
import { ticketsAPI } from "../services/api"
import { initSocket } from "../services/socket"
import TicketDetailModal from "../components/TicketDetailModal"
import CreateTicketModal from "../components/CreateTicketModal"
import Sidebar from "../components/Sidebar"

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const { user } = useAuth()
  const socketInitialized = useRef(false)

  // Initialize socket connection
  useEffect(() => {
    if (user && !socketInitialized.current) {
      const token = localStorage.getItem("token")
      if (token) {
        const socket = initSocket(token)
        socketInitialized.current = true

        // Listen for ticket updates
        socket.on("ticket:update", (data) => {
          setTickets((prevTickets) =>
            prevTickets.map((ticket) => (ticket._id === data.ticketId ? data.ticket : ticket)),
          )
        })

        // Listen for new tickets
        socket.on("ticket:new", ({ ticket }) => {
          setTickets((prevTickets) => [ticket, ...prevTickets])
        })

        return () => {
          socket.off("ticket:update")
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

        // Retry logic for network errors
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(retryCount + 1)
          }, 3000)
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTickets()
    }
  }, [user, retryCount])

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

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetail(true)
  }

  const handleTicketClose = () => {
    setShowTicketDetail(false)
    setSelectedTicket(null)
  }

  const handleCreateTicket = () => {
    setShowCreateTicket(true)
  }

  const handleCreateTicketClose = () => {
    setShowCreateTicket(false)
  }

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets])
    setShowCreateTicket(false)
  }

  // Format ticket number with year and sequential number
  const formatTicketNumber = (ticket) => {
    if (!ticket || !ticket.createdAt) return "N/A"

    const date = new Date(ticket.createdAt)
    const year = date.getFullYear()

    // Get last 5 digits of ticket ID and pad with zeros
    const ticketId = ticket._id.toString()
    const sequentialNumber = ticketId.slice(-5).padStart(5, "0")

    return `${year}-${sequentialNumber}`
  }

  // Format date to show time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Format posted time
  const formatPostedTime = (dateString) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return `Posted at ${date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })}`
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
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="dashboard-actions">
            <button className="create-ticket-button" onClick={handleCreateTicket}>
              Create Ticket
            </button>
          </div>
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

        {error && (
          <div className="error-message">
            {error}
            {retryCount < 3 && (
              <button className="retry-button" onClick={() => setRetryCount(retryCount + 1)}>
                Retry
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading-indicator">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found.</p>
            <button className="create-ticket-button" onClick={handleCreateTicket}>
              Create your first ticket
            </button>
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
                  <div className="ticket-time">10:00</div>
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
      {showCreateTicket && (
        <CreateTicketModal onClose={handleCreateTicketClose} onTicketCreated={handleTicketCreated} />
      )}
    </div>
  )
}

export default DashboardPage
