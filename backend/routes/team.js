const express = require("express")
const User = require("../models/User")
const { authenticateToken, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Get team members (for admin)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = {}

    if (req.user.role === "admin") {
      // Admin sees their team members
      query.$or = [
        { adminId: req.user.userId },
        { _id: req.user.userId }, // Include the admin themselves
      ]
    } else {
      // Team members see only their teammates under the same admin
      query.adminId = req.user.adminId
    }

    const teamMembers = await User.find(query).select("-password")

    res.json(teamMembers)
  } catch (error) {
    console.error("Get team error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add team member (admin only)
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Add to invited emails
    const admin = await User.findById(req.user.userId)
    admin.invitedEmails.push({
      email,
      role: role || "member",
      dateInvited: Date.now(),
    })

    await admin.save()

    res.status(201).json({
      message: "Team member invited successfully",
      invitedEmail: {
        email,
        role: role || "member",
        dateInvited: new Date(),
      },
    })
  } catch (error) {
    console.error("Add team member error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update team member (admin only)
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role, phone } = req.body

    // Find team member
    const teamMember = await User.findById(req.params.id)
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" })
    }

    // Verify this team member belongs to the admin
    if (teamMember.adminId && teamMember.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this team member" })
    }

    // Update fields
    if (firstName) teamMember.firstName = firstName
    if (lastName) teamMember.lastName = lastName
    if (email) teamMember.email = email
    if (role) teamMember.role = role
    if (phone) teamMember.phone = phone

    await teamMember.save()

    res.json({
      user: {
        id: teamMember._id,
        firstName: teamMember.firstName,
        lastName: teamMember.lastName,
        email: teamMember.email,
        phone: teamMember.phone,
        role: teamMember.role,
      },
    })
  } catch (error) {
    console.error("Update team member error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete team member (admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Find team member
    const teamMember = await User.findById(req.params.id)
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" })
    }

    // Verify this team member belongs to the admin
    if (teamMember.adminId && teamMember.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this team member" })
    }

    await teamMember.remove()

    res.json({ message: "Team member deleted successfully" })
  } catch (error) {
    console.error("Delete team member error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
