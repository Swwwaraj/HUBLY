const jwt = require("jsonwebtoken")
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
    const { userId, role } = req.user

    // If admin, allow access
    if (role === "admin") {
      // Verify the resource belongs to this admin
      let resource

      if (req.path.includes("/tickets")) {
        resource = await Ticket.findById(id)
      } else if (req.path.includes("/chat")) {
        resource = await Chat.findById(id)
      }

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" })
      }

      if (resource.adminId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied. Not your resource." })
      }

      return next()
    }

    // If team member, check if assigned
    let resource

    if (req.path.includes("/tickets")) {
      resource = await Ticket.findById(id)
    } else if (req.path.includes("/chat")) {
      resource = await Chat.findById(id)
    }

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Allow if assigned to this user or if unassigned and belongs to user's admin
    if (
      (resource.assignedTo && resource.assignedTo.toString() === userId) ||
      (!resource.assignedTo && resource.adminId.toString() === req.user.adminId)
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
