const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("../models/User")
const Ticket = require("../models/Ticket")
const Chat = require("../models/Chat")

// Authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: "Token has expired" })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." })
  }
}

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }
    next()
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

// Check if user is admin or assigned to the ticket/chat
const isAdminOrAssigned = async (req, res, next) => {
  try {
    const { id } = req.params
    const { userId, role, adminId } = req.user

    // Validate if the resource ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID" })
    }

    let resource
    if (req.path.includes("/tickets")) {
      resource = await Ticket.findById(id)
    } else if (req.path.includes("/chat")) {
      resource = await Chat.findById(id)
    }

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // If the user is an admin, check if the admin owns the resource
    if (role === "admin") {
      if (resource.adminId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied. Not your resource." })
      }
      return next()
    }

    // Non-admin users can only access resources assigned to them or those owned by their admin
    if (
      (resource.assignedTo && resource.assignedTo.toString() === userId) ||
      (!resource.assignedTo && resource.adminId.toString() === adminId)
    ) {
      return next()
    }

    return res.status(403).json({ message: "Access denied. Not assigned to this resource." })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  authenticateToken,
  isAdmin,
  isAdminOrAssigned,
}
