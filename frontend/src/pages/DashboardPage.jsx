"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../styles/dashboard.css"
import HublyLogo from "../components/HublyLogo"
import { Home, MessageSquare, BarChart2, FileText, Users, Settings, LogOut, Plus, Filter, Search } from "react-feather"
import { useAuth } from "../context/AuthContext"
import { ticketsAPI } from "../services/api"
import { getSocket, initSocket } from "../services/socket"
import CreateTicketModal from "../components/CreateTicketModal"
import TicketDetailModal from "../components/TicketDetailModal"

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0,
    inProgress: 0,
  })

  const { user, logout } = useAuth()

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token")
      if (token) {
        const socket = initSocket(token)

        // Listen for ticket updates
        socket.on("ticket-updated", (updatedTicket) => {
          setTickets((prevTickets) =>
            prevTickets.map((ticket) => (ticket._id === updatedTicket._id ? updatedTicket : ticket)),
          )
        })

        // Listen for new tickets
        socket.on("ticket-created", (newTicket) => {
          setTickets((prevTickets) => [newTicket, ...prevTickets])
        })

        return () => {
          socket.off("ticket-updated")
          socket.off("ticket-created")
        }
      }
    }
  }, [user])

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await ticketsAPI.getAll()
        setTickets(response.data)

        // Calculate stats
        const total = response.data.length
        const resolved = response.data.filter((ticket) => ticket.status === "resolved").length
        const inProgress = response.data.filter((ticket) => ticket.status === "in-progress").length
        const unresolved = response.data.filter((ticket) => ticket.status === "unresolved").length

        setStats({
          total,
          resolved,
          unresolved,
          inProgress,
        })
      } catch (error) {
        console.error("Error fetching tickets:", error)
        setError("Failed to load tickets. Please try again.")
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
    } else if (activeTab === "in-progress") {
      result = result.filter((ticket) => ticket.status === "in-progress")
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (ticket) => ticket.title.toLowerCase().includes(query) || ticket.description.toLowerCase().includes(query),
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

  const handleCreateTicket = () => {
    setShowCreateModal(true)
  }

  const handleTicketCreated = (newTicket) => {
    setTickets((prevTickets) => [newTicket, ...prevTickets])
    setShowCreateModal(false)
  }

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetail(true)

    // Join ticket room for real-time updates
    const socket = getSocket()
    if (socket) {
      socket.emit("join-ticket", ticket._id)
    }
  }

  const handleTicketClose = () => {
    // Leave ticket room
    const socket = getSocket()
    if (socket && selectedTicket) {
      socket.emit("leave-ticket", selectedTicket._id)
    }

    setShowTicketDetail(false)
    setSelectedTicket(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">
          <HublyLogo />
        </div>
        <div className="sidebar-menu">
          <Link to="/dashboard" className="sidebar-item active">
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
          <Link to="/settings" className="sidebar-item">
            <Settings size={20} />
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
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon unresolved">
              <MessageSquare size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.unresolved}</div>
              <div className="stat-label">Unresolved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon in-progress">
              <BarChart2 size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
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

          <button className="filter-button">
            <Filter size={16} />
            <span>Filter</span>
          </button>

          <button className="create-ticket-button" onClick={handleCreateTicket}>
            <Plus size={16} />
            <span>Create Ticket</span>
          </button>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            <span className="tab-icon">📋</span> All Tickets
          </button>
          <button
            className={`tab-button ${activeTab === "unresolved" ? "active" : ""}`}
            onClick={() => handleTabChange("unresolved")}
          >
            Unresolved
          </button>
          <button
            className={`tab-button ${activeTab === "in-progress" ? "active" : ""}`}
            onClick={() => handleTabChange("in-progress")}
          >
            In Progress
          </button>
          <button
            className={`tab-button ${activeTab === "resolved" ? "active" : ""}`}
            onClick={() => handleTabChange("resolved")}
          >
            Resolved
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading tickets...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found. Create a new ticket to get started.</p>
            <button className="create-ticket-button" onClick={handleCreateTicket}>
              <Plus size={16} />
              <span>Create Ticket</span>
            </button>
          </div>
        ) : (
          <div className="ticket-list">
            {filteredTickets.map((ticket) => (
              <div className="ticket-item" key={ticket._id} onClick={() => handleTicketClick(ticket)}>
                <div className="ticket-avatar">
                  <div className={`avatar-circle priority-${ticket.priority}`}></div>
                </div>
                <div className="ticket-content">
                  <div className="ticket-header">
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <span className="ticket-time">Created: {formatDate(ticket.createdAt)}</span>
                  </div>
                  <p className="ticket-message">{ticket.description.substring(0, 100)}...</p>
                  <div className="ticket-footer">
                    <span className={`status-badge ${ticket.status}`}>{ticket.status}</span>
                    {ticket.assignedTo && (
                      <span className="assigned-to">
                        Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTicketModal onClose={() => setShowCreateModal(false)} onTicketCreated={handleTicketCreated} />
      )}

      {showTicketDetail && selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={handleTicketClose} />}
    </div>
  )
}

export default DashboardPage
