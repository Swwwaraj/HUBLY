const express = require("express")
const Chat = require("../models/Chat")
const User = require("../models/User")
const Ticket = require("../models/Ticket")
const ChatbotSettings = require("../models/ChatbotSettings")
const { authenticateToken, isAdminOrAssigned } = require("../middleware/auth")
const { isAdmin } = require("../middleware/auth") // Import isAdmin

const router = express.Router()

// Get all chats (filtered by admin or team member)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status } = req.query
    const query = {}

    // Filter by user role
    if (req.user.role === "admin") {
      query.adminId = req.user.userId
    } else {
      // For team members, show chats assigned to them or unassigned chats for their admin
      query.$or = [{ assignedTo: req.user.userId }, { adminId: req.user.adminId, assignedTo: null }]
    }

    // Filter by status if provided
    if (status && ["active", "resolved", "missed"].includes(status)) {
      query.status = status
    }

    const chats = await Chat.find(query).populate("assignedTo", "firstName lastName email").sort({ updatedAt: -1 })

    res.json(chats)
  } catch (error) {
    console.error("Get chats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a single chat
router.get("/:id", authenticateToken, isAdminOrAssigned, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate("assignedTo", "firstName lastName email")

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    res.json(chat)
  } catch (error) {
    console.error("Get chat error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get first admin ID (for public chat widget)
router.get("/admin", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" })
    if (!admin) {
      return res.status(404).json({ message: "No admin found" })
    }

    res.json({ adminId: admin._id })
  } catch (error) {
    console.error("Get admin ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new chat (public route for website visitors)
router.post("/", async (req, res) => {
  try {
    const { adminId, userInfo } = req.body

    // Verify admin exists
    const admin = await User.findById(adminId)
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" })
    }

    const chat = new Chat({
      adminId,
      userInfo: userInfo || { name: "Anonymous", email: "", phone: "" },
    })

    await chat.save()

    res.status(201).json(chat)
  } catch (error) {
    console.error("Create chat error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add message to chat
router.post("/:id/messages", async (req, res) => {
  try {
    const { sender, content, senderId } = req.body

    const chat = await Chat.findById(req.params.id)
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    // Create new message
    const message = {
      sender,
      content,
      senderId: senderId || null,
      timestamp: Date.now(),
    }

    // Add message to chat
    chat.messages.push(message)

    // Update chat metadata based on message
    if (sender === "user" && !chat.firstUserMessageAt) {
      chat.firstUserMessageAt = Date.now()
    } else if (sender === "agent" && !chat.firstAgentResponseAt) {
      chat.firstAgentResponseAt = Date.now()
    }

    await chat.save()

    res.status(201).json(message)
  } catch (error) {
    console.error("Add message error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a ticket from a chat
router.post("/:id/ticket", async (req, res) => {
  try {
    const { title, description, priority } = req.body
    const chatId = req.params.id

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    // Create a new ticket
    const ticket = new Ticket({
      title,
      description,
      priority: priority || "medium",
      createdBy: chat.adminId, // Admin is the creator
      adminId: chat.adminId,
      source: "chat",
      sourceId: chatId,
      sourceModel: "Chat",
      userInfo: chat.userInfo, // Store user info directly in the ticket
      status: "unresolved",
    })

    await ticket.save()

    // Link the ticket to the chat
    chat.ticketId = ticket._id
    await chat.save()

    res.status(201).json(ticket)
  } catch (error) {
    console.error("Create ticket from chat error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a ticket from a chat
router.put("/:id/ticket", async (req, res) => {
  try {
    const { comment } = req.body
    const chatId = req.params.id

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    if (!chat.ticketId) {
      return res.status(404).json({ message: "No ticket associated with this chat" })
    }

    const ticket = await Ticket.findById(chat.ticketId)
    if (!ticket) {
      return res.status(404).json({ message: "Associated ticket not found" })
    }

    // Add comment to ticket
    if (comment) {
      ticket.comments.push({
        author: chat.adminId, // Using admin as proxy for customer
        content: `Customer message: ${comment}`,
        createdAt: Date.now(),
      })
    }

    await ticket.save()

    res.json(ticket)
  } catch (error) {
    console.error("Update ticket from chat error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update chat status (resolve, assign, etc.)
router.put("/:id", authenticateToken, isAdminOrAssigned, async (req, res) => {
  try {
    const { status, assignedTo, userInfo } = req.body

    const chat = await Chat.findById(req.params.id)
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    // Update status
    if (status && ["active", "resolved", "missed"].includes(status)) {
      chat.status = status

      if (status === "resolved") {
        chat.resolvedAt = Date.now()
      } else if (status === "missed") {
        chat.missedAt = Date.now()
      }
    }

    // Update assignment
    if (assignedTo !== undefined) {
      if (assignedTo) {
        // Verify the user exists and belongs to the same admin
        const assignee = await User.findById(assignedTo)
        if (!assignee) {
          return res.status(404).json({ message: "Assignee not found" })
        }

        // Check if assignee belongs to the same admin
        if (
          assignee.adminId &&
          assignee.adminId.toString() !== chat.adminId.toString() &&
          assignee._id.toString() !== chat.adminId.toString()
        ) {
          return res.status(403).json({ message: "Cannot assign to user from different admin" })
        }

        chat.assignedTo = assignedTo
      } else {
        // Unassigning
        chat.assignedTo = null
      }
    }

    // Update user info
    if (userInfo) {
      chat.userInfo = {
        ...chat.userInfo,
        ...userInfo,
      }
    }

    await chat.save()

    // Populate the updated chat
    const updatedChat = await Chat.findById(chat._id).populate("assignedTo", "firstName lastName email")

    res.json(updatedChat)
  } catch (error) {
    console.error("Update chat error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get chatbot settings
router.get("/settings/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params

    // Find settings or create default
    let settings = await ChatbotSettings.findOne({ adminId })

    if (!settings) {
      settings = new ChatbotSettings({ adminId })
      await settings.save()
    }

    res.json(settings)
  } catch (error) {
    console.error("Get chatbot settings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update chatbot settings
router.put("/settings/:adminId", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminId } = req.params
    const {
      headerColor,
      backgroundColor,
      welcomeMessage,
      initialMessage,
      secondMessage,
      formName,
      formPhone,
      formEmail,
      missedChatTimer,
    } = req.body

    // Verify admin
    if (req.user.userId !== adminId) {
      return res.status(403).json({ message: "Not authorized to update these settings" })
    }

    // Find settings or create default
    let settings = await ChatbotSettings.findOne({ adminId })

    if (!settings) {
      settings = new ChatbotSettings({ adminId })
    }

    // Update fields
    if (headerColor) settings.headerColor = headerColor
    if (backgroundColor) settings.backgroundColor = backgroundColor
    if (welcomeMessage) settings.welcomeMessage = welcomeMessage
    if (initialMessage) settings.initialMessage = initialMessage
    if (secondMessage) settings.secondMessage = secondMessage
    if (formName) settings.formName = formName
    if (formPhone) settings.formPhone = formPhone
    if (formEmail) settings.formEmail = formEmail

    if (missedChatTimer) {
      settings.missedChatTimer = {
        ...settings.missedChatTimer,
        ...missedChatTimer,
      }
    }

    await settings.save()

    res.json(settings)
  } catch (error) {
    console.error("Update chatbot settings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
