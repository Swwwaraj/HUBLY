const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let adminId = null;
    let isInvited = false;

    const admins = await User.find({ role: "admin", "invitedEmails.email": email });
    if (admins.length > 0) {
      adminId = admins[0]._id;
      isInvited = true;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: isInvited
        ? admins[0].invitedEmails.find((invite) => invite.email === email).role
        : role || "member",
      adminId: isInvited ? adminId : null,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        adminId: user.adminId,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        adminId: user.adminId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify token route (used by frontend to check if user is still logged in)
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user }) // return user details to frontend
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(500).json({ message: "Server error" })
  }
})



// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Invite team member (admin only)
router.post("/invite", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;

    const admin = await User.findById(req.user.userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const alreadyInvited = admin.invitedEmails.some((invite) => invite.email === email);
    if (alreadyInvited) {
      return res.status(400).json({ message: "Email already invited" });
    }

    admin.invitedEmails.push({
      email,
      role: role || "member",
      dateInvited: Date.now(),
    });

    await admin.save();

    res.status(201).json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
