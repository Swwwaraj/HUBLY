require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const authRoutes = require("./routes/auth")
const ticketRoutes = require("./routes/tickets")
const teamRoutes = require("./routes/team")
const chatRoutes = require("./routes/chat")
const analyticsRoutes = require("./routes/analytics")
const setupSocket = require("./socket")

const app = express()
const server = http.createServer(app)

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/team", teamRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/analytics", analyticsRoutes)

// Socket.io setup for real-time communication
const io = setupSocket(server)

// MongoDB Connection with retry logic
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hubly", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB connected successfully")
      // Initialize database with default data if needed
      require("./utils/initializeDb")()
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err)
      console.log("Retrying connection in 5 seconds...")
      setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!", error: err.message })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("HTTP server closed")
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed")
      process.exit(0)
    })
  })
})
