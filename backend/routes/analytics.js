const express = require("express")
const Ticket = require("../models/Ticket")
const Chat = require("../models/Chat")
const { authenticateToken, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Get ticket analytics
router.get("/tickets", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const query = {}

    // Filter by user role
    if (req.user.role === "admin") {
      query.adminId = req.user.userId
    } else {
      query.adminId = req.user.adminId
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Get total tickets
    const totalTickets = await Ticket.countDocuments(query)

    // Get resolved tickets
    const resolvedTickets = await Ticket.countDocuments({
      ...query,
      status: "resolved",
    })

    // Get unresolved tickets
    const unresolvedTickets = await Ticket.countDocuments({
      ...query,
      status: "unresolved",
    })

    // Get average resolution time
    const resolvedTicketsData = await Ticket.find({
      ...query,
      status: "resolved",
      resolvedAt: { $ne: null },
    })

    let avgResolutionTime = 0
    if (resolvedTicketsData.length > 0) {
      const totalResolutionTime = resolvedTicketsData.reduce((acc, ticket) => {
        return acc + (ticket.resolvedAt - ticket.createdAt)
      }, 0)
      avgResolutionTime = totalResolutionTime / resolvedTicketsData.length
    }

    // Get tickets by priority
    const highPriorityTickets = await Ticket.countDocuments({
      ...query,
      priority: "high",
    })

    const mediumPriorityTickets = await Ticket.countDocuments({
      ...query,
      priority: "medium",
    })

    const lowPriorityTickets = await Ticket.countDocuments({
      ...query,
      priority: "low",
    })

    res.json({
      totalTickets,
      resolvedTickets,
      unresolvedTickets,
      avgResolutionTime,
      ticketsByPriority: {
        high: highPriorityTickets,
        medium: mediumPriorityTickets,
        low: lowPriorityTickets,
      },
    })
  } catch (error) {
    console.error("Ticket analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get chat analytics
router.get("/chats", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const query = {}

    // Filter by user role
    if (req.user.role === "admin") {
      query.adminId = req.user.userId
    } else {
      query.adminId = req.user.adminId
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Get total chats
    const totalChats = await Chat.countDocuments(query)

    // Get active chats
    const activeChats = await Chat.countDocuments({
      ...query,
      status: "active",
    })

    // Get resolved chats
    const resolvedChats = await Chat.countDocuments({
      ...query,
      status: "resolved",
    })

    // Get missed chats
    const missedChats = await Chat.countDocuments({
      ...query,
      status: "missed",
    })

    // Get average response time
    const respondedChats = await Chat.find({
      ...query,
      firstUserMessageAt: { $ne: null },
      firstAgentResponseAt: { $ne: null },
    })

    let avgResponseTime = 0
    if (respondedChats.length > 0) {
      const totalResponseTime = respondedChats.reduce((acc, chat) => {
        return acc + (chat.firstAgentResponseAt - chat.firstUserMessageAt)
      }, 0)
      avgResponseTime = totalResponseTime / respondedChats.length
    }

    res.json({
      totalChats,
      activeChats,
      resolvedChats,
      missedChats,
      avgResponseTime,
    })
  } catch (error) {
    console.error("Chat analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
