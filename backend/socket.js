const socketIo = require("socket.io")
const jwt = require("jsonwebtoken")
const Chat = require("./models/Chat")
const Ticket = require("./models/Ticket")
const User = require("./models/User")
const ChatbotSettings = require("./models/ChatbotSettings")

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "https://hubly--six.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error: Token not provided"))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded
      next()
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.userId}`)

    // Join admin-specific room
    if (socket.user.role === "admin") {
      socket.join(`admin:${socket.user.userId}`)
      console.log(`Admin joined room: admin:${socket.user.userId}`)
    } else if (socket.user.adminId) {
      // Team members join their admin's room
      socket.join(`admin:${socket.user.adminId}`)
      console.log(`Team member joined room: admin:${socket.user.adminId}`)
    }

    // Join user-specific room
    socket.join(`user:${socket.user.userId}`)

    // Handle joining a specific chat room
    socket.on("join-chat", (chatId) => {
      socket.join(`chat:${chatId}`)
    })

    // Handle leaving a specific chat room
    socket.on("leave-chat", (chatId) => {
      socket.leave(`chat:${chatId}`)
    })

    // Handle joining a specific ticket room
    socket.on("join-ticket", (ticketId) => {
      socket.join(`ticket:${ticketId}`)
    })

    // Handle leaving a specific ticket room
    socket.on("leave-ticket", (ticketId) => {
      socket.leave(`ticket:${ticketId}`)
    })

    // Handle chat message
    socket.on("chat:message", async (data) => {
      try {
        const { chatId, message } = data

        // Validate chat exists and user has access
        const chat = await Chat.findById(chatId)
        if (!chat) {
          socket.emit("error", { message: "Chat not found" })
          return
        }

        // Check if user has access to this chat
        const hasAccess =
          (socket.user.role === "admin" && chat.adminId.toString() === socket.user.userId) ||
          (socket.user.adminId && chat.adminId.toString() === socket.user.adminId) ||
          (chat.assignedTo && chat.assignedTo.toString() === socket.user.userId)

        if (!hasAccess) {
          socket.emit("error", { message: "Unauthorized access to chat" })
          return
        }

        // Add message to chat
        const newMessage = {
          sender: "agent",
          content: message,
          senderId: socket.user.userId,
          timestamp: Date.now(),
        }

        chat.messages.push(newMessage)

        // Update first agent response time if not set
        if (!chat.firstAgentResponseAt) {
          chat.firstAgentResponseAt = Date.now()
        }

        await chat.save()

        // If chat has an associated ticket, add comment to ticket
        if (chat.ticketId) {
          const ticket = await Ticket.findById(chat.ticketId)
          if (ticket) {
            ticket.comments.push({
              author: socket.user.userId,
              content: message,
              createdAt: Date.now(),
            })
            await ticket.save()

            // Emit ticket update
            io.to(`admin:${chat.adminId}`).emit("ticket:update", {
              ticketId: ticket._id,
              ticket: ticket,
            })
          }
        }

        // Emit message to all users in the admin room
        io.to(`admin:${chat.adminId}`).emit("chat:message", {
          chatId,
          message: {
            ...newMessage,
            _id: chat.messages[chat.messages.length - 1]._id,
          },
        })
      } catch (error) {
        console.error("Socket chat:message error:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Handle new chat from website
    socket.on("chat:new", async (data) => {
      try {
        const { adminId, userInfo, initialMessage } = data

        // Create new chat
        const chat = new Chat({
          adminId,
          userInfo: userInfo || { name: "Anonymous", email: "", phone: "" },
        })

        // Add initial message if provided
        if (initialMessage) {
          chat.messages.push({
            sender: "user",
            content: initialMessage,
            timestamp: Date.now(),
          })
          chat.firstUserMessageAt = Date.now()
        }

        await chat.save()

        // Emit new chat to admin room
        io.to(`admin:${adminId}`).emit("chat:new", { chat })

        // Create a ticket from this chat
        const ticket = new Ticket({
          title: `New chat from ${userInfo?.name || "Anonymous"}`,
          description: initialMessage || "New chat initiated",
          priority: "medium",
          createdBy: adminId,
          adminId: adminId,
          source: "chat",
          sourceId: chat._id,
          sourceModel: "Chat",
          userInfo: chat.userInfo, // Store user info directly in the ticket
          status: "unresolved",
        })

        await ticket.save()

        // Link the ticket to the chat
        chat.ticketId = ticket._id
        await chat.save()

        // Emit new ticket to admin room
        io.to(`admin:${adminId}`).emit("ticket:new", { ticket })

        socket.emit("chat:created", { chatId: chat._id })
      } catch (error) {
        console.error("Socket chat:new error:", error)
        socket.emit("error", { message: "Failed to create chat" })
      }
    })

    // Handle ticket updates
    socket.on("ticket:update", async (data) => {
      try {
        const { ticketId, updates } = data

        // Validate ticket exists
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
          socket.emit("error", { message: "Ticket not found" })
          return
        }

        // Check if user has access to this ticket
        const hasAccess =
          (socket.user.role === "admin" && ticket.adminId.toString() === socket.user.userId) ||
          (socket.user.adminId && ticket.adminId.toString() === socket.user.adminId) ||
          (ticket.assignedTo && ticket.assignedTo.toString() === socket.user.userId)

        if (!hasAccess) {
          socket.emit("error", { message: "Unauthorized access to ticket" })
          return
        }

        // Update ticket fields
        if (updates.status) ticket.status = updates.status
        if (updates.priority) ticket.priority = updates.priority
        if (updates.assignedTo !== undefined) ticket.assignedTo = updates.assignedTo
        if (updates.comment) {
          ticket.comments.push({
            author: socket.user.userId,
            content: updates.comment,
            createdAt: Date.now(),
          })
        }

        await ticket.save()

        // If ticket is from chat, update chat status if needed
        if (ticket.source === "chat" && ticket.sourceId) {
          const chat = await Chat.findById(ticket.sourceId)
          if (chat) {
            if (updates.status === "resolved" && chat.status !== "resolved") {
              chat.status = "resolved"
              chat.resolvedAt = Date.now()
              await chat.save()

              // Emit chat update
              io.to(`admin:${chat.adminId}`).emit("chat:update", {
                chatId: chat._id,
                chat: chat,
              })
            }
          }
        }

        // Emit ticket update to admin room
        io.to(`admin:${ticket.adminId}`).emit("ticket:update", {
          ticketId,
          ticket,
        })
      } catch (error) {
        console.error("Socket ticket:update error:", error)
        socket.emit("error", { message: "Failed to update ticket" })
      }
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.userId}`)
    })
  })

  return io
}

module.exports = setupSocket
