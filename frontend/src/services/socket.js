import io from "socket.io-client"

let socket = null

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect()
  }

  socket = io("https://hubly-backend-4cx3.onrender.com", {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  })


  socket.on("connect", () => {
    console.log("Socket connected")
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
  })

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Socket reconnection attempt ${attemptNumber}`)
  })

  socket.on("reconnect_failed", () => {
    console.error("Socket reconnection failed")
  })

  return socket
}

export const joinChatRoom = (chatId) => {
  if (socket && socket.connected) {
    socket.emit("join-chat", chatId)
  }
}

export const leaveChatRoom = (chatId) => {
  if (socket && socket.connected) {
    socket.emit("leave-chat", chatId)
  }
}

export const joinTicketRoom = (ticketId) => {
  if (socket && socket.connected) {
    socket.emit("join-ticket", ticketId)
  }
}

export const leaveTicketRoom = (ticketId) => {
  if (socket && socket.connected) {
    socket.emit("leave-ticket", ticketId)
  }
}

export const sendChatMessage = (chatId, message) => {
  if (socket && socket.connected) {
    socket.emit("chat:message", { chatId, message })
  }
}

export const createNewChat = (adminId, userInfo, initialMessage) => {
  if (socket && socket.connected) {
    socket.emit("chat:new", { adminId, userInfo, initialMessage })
  }
}

export const updateTicket = (ticketId, updates) => {
  if (socket && socket.connected) {
    socket.emit("ticket:update", { ticketId, updates })
  }
}

export const checkMissedChats = () => {
  if (socket && socket.connected) {
    socket.emit("check-missed-chats")
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket
