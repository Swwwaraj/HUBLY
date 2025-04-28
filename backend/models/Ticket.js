const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["unresolved", "in-progress", "resolved"],
    default: "unresolved",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [commentSchema],
  source: {
    type: String,
    enum: ["manual", "chat", "email", "phone"],
    default: "manual",
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "sourceModel",
    default: null,
  },
  sourceModel: {
    type: String,
    enum: ["Chat", null],
    default: null,
  },
  userInfo: {
    name: String,
    email: String,
    phone: String,
  },
  ticketNumber: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Generate ticket number before saving
ticketSchema.pre("save", async function (next) {
  this.updatedAt = Date.now()

  // Only generate ticket number for new tickets
  if (!this.ticketNumber) {
    const year = new Date().getFullYear()

    // Find the highest sequential number for this year
    const highestTicket = await this.constructor.findOne(
      { ticketNumber: { $regex: `^${year}-` } },
      { ticketNumber: 1 },
      { sort: { ticketNumber: -1 } },
    )

    let sequentialNumber = "00001"

    if (highestTicket && highestTicket.ticketNumber) {
      const parts = highestTicket.ticketNumber.split("-")
      if (parts.length === 2) {
        const currentNumber = Number.parseInt(parts[1], 10)
        sequentialNumber = (currentNumber + 1).toString().padStart(5, "0")
      }
    }

    this.ticketNumber = `${year}-${sequentialNumber}`
  }

  next()
})

// Populate references when finding tickets
ticketSchema.pre(/^find/, function (next) {
  this.populate("assignedTo", "firstName lastName email").populate("createdBy", "firstName lastName email").populate({
    path: "comments.author",
    select: "firstName lastName",
  })

  next()
})

module.exports = mongoose.model("Ticket", ticketSchema)
