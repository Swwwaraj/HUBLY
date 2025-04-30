const socketIo = require("socket.io")
const jwt = require("jsonwebtoken")
const Chat = require("./models/Chat")
const Ticket = require("./models/Ticket")
const User = require("./models/User")
const ChatbotSettings = require("./models/ChatbotSettings")

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      // For public chat widget, allow connection without authentication
      if (socket.handshake.query && socket.handshake.query.public === "true") {
        socket.isPublic = true
        socket.join("public")
        return next()
      }
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
    if (socket.isPublic) {
      console.log("Public client connected")
    } else {
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
    }

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

        // Validate chat exists
        const chat = await Chat.findById(chatId)
        if (!chat) {
          socket.emit("error", { message: "Chat not found" })
          return
        }

        // Check if user has access to this chat (skip for public)
        if (!socket.isPublic) {
          const hasAccess =
            (socket.user.role === "admin" && chat.adminId.toString() === socket.user.userId) ||
            (socket.user.adminId && chat.adminId.toString() === socket.user.adminId) ||
            (chat.assignedTo && chat.assignedTo.toString() === socket.user.userId)

          if (!hasAccess) {
            socket.emit("error", { message: "Unauthorized access to chat" })
            return
          }
        }

        // Add message to chat
        const newMessage = {
          sender: socket.isPublic ? "user" : "agent",
          content: message,
          senderId: socket.isPublic ? null : socket.user.userId,
          timestamp: Date.now(),
        }

        chat.messages.push(newMessage)

        // Update response times
        if (newMessage.sender === "user" && !chat.firstUserMessageAt) {
          chat.firstUserMessageAt = Date.now()
        } else if (newMessage.sender === "agent" && !chat.firstAgentResponseAt) {
          chat.firstAgentResponseAt = Date.now()
        }

        await chat.save()

        // If chat has an associated ticket, add comment to ticket
        if (chat.ticketId) {
          const ticket = await Ticket.findById(chat.ticketId)
          if (ticket) {
            ticket.comments.push({
              author: socket.isPublic ? chat.adminId : socket.user.userId,
              content: `${socket.isPublic ? "Customer" : "Agent"}: ${message}`,
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

        // Emit message to the chat room
        io.to(`chat:${chatId}`).emit("chat:message", {
          chatId,
          message: {
            ...newMessage,
            _id: chat.messages[chat.messages.length - 1]._id,
          },
        })

        // Also emit to admin room
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
          userInfo: chat.userInfo,
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
        if (!socket.isPublic) {
          const hasAccess =
            (socket.user.role === "admin" && ticket.adminId.toString() === socket.user.userId) ||
            (socket.user.adminId && ticket.adminId.toString() === socket.user.adminId) ||
            (ticket.assignedTo && ticket.assignedTo.toString() === socket.user.userId)

          if (!hasAccess) {
            socket.emit("error", { message: "Unauthorized access to ticket" })
            return
          }
        }

        // Update ticket fields
        if (updates.status) ticket.status = updates.status
        if (updates.priority) ticket.priority = updates.priority
        if (updates.assignedTo !== undefined) ticket.assignedTo = updates.assignedTo
        if (updates.comment) {
          ticket.comments.push({
            author: socket.isPublic ? ticket.adminId : socket.user.userId,
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

    // Handle missed chat check
    socket.on("check-missed-chats", async () => {
      try {
        // Only admins can check for missed chats
        if (!socket.isPublic && socket.user.role !== "admin") {
          return
        }

        const adminId = socket.isPublic ? null : socket.user.userId

        if (!adminId) {
          return
        }

        // Find active chats with user messages but no agent response
        const chats = await Chat.find({
          adminId,
          status: "active",
          firstUserMessageAt: { $ne: null },
          firstAgentResponseAt: null,
        })

        // Check each chat against the missed chat timer
        for (const chat of chats) {
          // Get admin's chatbot settings
          const settings = await ChatbotSettings.findOne({ adminId })
          if (!settings) continue

          const { hours, minutes, seconds } = settings.missedChatTimer
          const missedTimeMs = (hours * 3600 + minutes * 60 + seconds) * 1000

          const now = Date.now()
          const messageTime = chat.firstUserMessageAt.getTime()

          // If time elapsed is greater than missed time threshold
          if (now - messageTime > missedTimeMs) {
            // Mark chat as missed
            chat.status = "missed"
            chat.missedAt = now
            await chat.save()

            // Create a ticket from the missed chat if not already created
            if (!chat.ticketId) {
              const ticket = new Ticket({
                title: `Missed Chat - ${chat.userInfo.name || "Anonymous"}`,
                description: `Missed chat from ${chat.userInfo.name || "Anonymous"} (${chat.userInfo.email || "No email"}).\nFirst message: ${chat.messages[0]?.content || "No message"}`,
                status: "unresolved",
                priority: "high",
                createdBy: adminId,
                adminId,
                source: "chat",
                sourceId: chat._id,
                userInfo: chat.userInfo,
              })

              await ticket.save()

              // Link the ticket to the chat
              chat.ticketId = ticket._id
              await chat.save()
            }

            // Notify admin
            io.to(`admin:${adminId}`).emit("chat-missed", {
              chatId: chat._id,
              missedAt: chat.missedAt,
              ticketId: chat.ticketId,
            })
          }
        }
      } catch (error) {
        console.error("Socket error:", error)
      }
    })

    // Set up interval to check for missed chats (every minute)
    let missedChatsInterval
    if (!socket.isPublic && socket.user?.role === "admin") {
      missedChatsInterval = setInterval(() => {
        socket.emit("check-missed-chats")
      }, 60000)
    }

    // Handle disconnect
    socket.on("disconnect", () => {
      if (missedChatsInterval) {
        clearInterval(missedChatsInterval)
      }

      if (socket.isPublic) {
        console.log("Public client disconnected")
      } else {
        console.log(`User disconnected: ${socket.user.userId}`)
      }
    })
  })

  return io
}

module.exports = setupSocket
