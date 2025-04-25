const User = require("../models/User")
const ChatbotSettings = require("../models/ChatbotSettings")
const bcrypt = require("bcryptjs")

module.exports = async function initializeDb() {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ role: "admin" })

    if (!adminExists) {
      console.log("Creating default admin user...")

      // Create default admin
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      const admin = new User({
        firstName: "Admin",
        lastName: "User",
        email: "admin@hubly.com",
        password: hashedPassword,
        role: "admin",
      })

      await admin.save()

      // Create default chatbot settings for admin
      const chatbotSettings = new ChatbotSettings({
        adminId: admin._id,
        // Default settings are defined in the model
      })

      await chatbotSettings.save()

      console.log("Default admin user and settings created")
    }
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}
