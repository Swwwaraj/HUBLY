const mongoose = require("mongoose")

const chatbotSettingsSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  headerColor: {
    type: String,
    default: "#34475B",
  },
  backgroundColor: {
    type: String,
    default: "#FFFFFF",
  },
  welcomeMessage: {
    type: String,
    default: "👋 Want to chat about Hubly? I'm a chatbot here to help you find your way.",
  },
  initialMessage: {
    type: String,
    default: "How can I help you?",
  },
  secondMessage: {
    type: String,
    default: "Ask me anything!",
  },
  formName: {
    type: String,
    default: "Your name",
  },
  formPhone: {
    type: String,
    default: "+1 (000) 000-0000",
  },
  formEmail: {
    type: String,
    default: "example@gmail.com",
  },
  missedChatTimer: {
    hours: {
      type: Number,
      default: 12,
    },
    minutes: {
      type: Number,
      default: 0,
    },
    seconds: {
      type: Number,
      default: 0,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
chatbotSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("ChatbotSettings", chatbotSettingsSchema)
