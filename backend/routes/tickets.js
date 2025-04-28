const express = require("express")
const Ticket = require("../models/Ticket")
const User = require("../models/User")
const { authenticateToken, isAdminOrAssigned } = require("../middleware/auth")

const router = express.Router()

// Get all tickets (filtered by admin or team member)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query
    const query = {}

    // Filter by user role
    if (req.user.role === "admin") {
      query.adminId = req.user.userId
    } else {
      // For team members, show tickets assigned to them or unassigned tickets for their admin
      query.$or = [{ assignedTo: req.user.userId }, { adminId: req.user.adminId, assignedTo: null }]
    }

    // Filter by status if provided
    if (status && ["resolved", "unresolved", "in-progress"].includes(status)) {
      query.status = status
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketNumber: { $regex: search, $options: "i" } },
      ]
    }

    console.log("Tickets query:", query)

    const tickets = await Ticket.find(query)
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })

    console.log(`Found ${tickets.length} tickets`)
    res.json(tickets)
  } catch (error) {
    console.error("Get tickets error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get a single ticket
router.get("/:id", authenticateToken, isAdminOrAssigned, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    res.json(ticket)
  } catch (error) {
    console.error("Get ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new ticket
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, priority } = req.body

    // Determine admin ID
    let adminId = req.user.userId
    if (req.user.role === "member") {
      adminId = req.user.adminId
    }

    const ticket = new Ticket({
      title,
      description,
      priority: priority || "medium",
      createdBy: req.user.userId,
      adminId,
    })

    await ticket.save()

    res.status(201).json(ticket)
  } catch (error) {
    console.error("Create ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a ticket
router.put("/:id", authenticateToken, isAdminOrAssigned, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Update fields
    if (title) ticket.title = title
    if (description) ticket.description = description
    if (priority) ticket.priority = priority

    // Handle status change
    if (status && status !== ticket.status) {
      ticket.status = status
      if (status === "resolved") {
        ticket.resolvedAt = Date.now()
      } else {
        ticket.resolvedAt = null
      }
    }

    // Handle assignment
    if (assignedTo !== undefined) {
      // If assigning to someone
      if (assignedTo) {
        // Verify the user exists and belongs to the same admin
        const assignee = await User.findById(assignedTo)
        if (!assignee) {
          return res.status(404).json({ message: "Assignee not found" })
        }

        // Check if assignee belongs to the same admin
        if (
          assignee.adminId &&
          assignee.adminId.toString() !== ticket.adminId.toString() &&
          assignee._id.toString() !== ticket.adminId.toString()
        ) {
          return res.status(403).json({ message: "Cannot assign to user from different admin" })
        }

        ticket.assignedTo = assignedTo
      } else {
        // Unassigning
        ticket.assignedTo = null
      }
    }

    await ticket.save()

    // Populate the updated ticket
    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")

    res.json(updatedTicket)
  } catch (error) {
    console.error("Update ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a ticket
router.delete("/:id", authenticateToken, isAdminOrAssigned, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    await ticket.remove()

    res.json({ message: "Ticket deleted successfully" })
  } catch (error) {
    console.error("Delete ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
