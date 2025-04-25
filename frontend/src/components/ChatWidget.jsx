"use client"

import { useState, useEffect, useRef } from "react"
import { Send } from "react-feather"
import { chatAPI } from "../services/api"
import { getSocket } from "../services/socket"

const ChatWidget = ({ onClose, adminId }) => {
  const [showIntroForm, setShowIntroForm] = useState(true)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [messages, setMessages] = useState([{ id: 1, sender: "bot", text: "Hey!" }])
  const [inputMessage, setInputMessage] = useState("")
  const [chatId, setChatId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Show intro form after a short delay
    const timer = setTimeout(() => {
      setShowIntroForm(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Listen for socket events
  useEffect(() => {
    if (chatId) {
      const socket = getSocket()

      if (!socket) {
        // For public chat widget, we don't need authentication
        // We'll handle messages through REST API
        return
      }

      // Listen for new messages
      const handleNewMessage = (data) => {
        if (data.chatId === chatId) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              sender: data.message.sender === "agent" ? "bot" : "user",
              text: data.message.content,
            },
          ])
        }
      }

      socket.on("chat:message", handleNewMessage)

      return () => {
        socket.off("chat:message", handleNewMessage)
      }
    }
  }, [chatId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserInfo({
      ...userInfo,
      [name]: value,
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      // Create a new chat in the backend
      const response = await chatAPI.create({
        adminId,
        userInfo,
      })

      setChatId(response.data._id)

      // Add message to the chat
      await chatAPI.addMessage(response.data._id, {
        sender: "user",
        content: `Hello, my name is ${userInfo.name}. I'd like to learn more about Hubly.`,
      })

      setFormSubmitted(true)
      setShowIntroForm(false)

      // Add thank you message
      setMessages([
        ...messages,
        { id: messages.length + 1, sender: "bot", text: "Thank you for providing your information!" },
      ])

      // Create a ticket from this chat
      await chatAPI.createTicketFromChat(response.data._id, {
        title: `New inquiry from ${userInfo.name}`,
        description: `Customer information:\nName: ${userInfo.name}\nEmail: ${userInfo.email}\nPhone: ${userInfo.phone}\n\nInitial message: Hello, I'd like to learn more about Hubly.`,
        priority: "medium",
      })
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Add user message to UI
    const newMessage = { id: messages.length + 1, sender: "user", text: inputMessage }
    setMessages([...messages, newMessage])

    // Clear input
    const sentMessage = inputMessage
    setInputMessage("")

    try {
      if (chatId) {
        // Add message to existing chat
        await chatAPI.addMessage(chatId, {
          sender: "user",
          content: sentMessage,
        })

        // Update the ticket with this message
        await chatAPI.updateTicketFromChat(chatId, {
          comment: sentMessage,
        })
      } else if (formSubmitted) {
        // Create a new chat if form was submitted but chatId is not set
        const response = await chatAPI.create({
          adminId,
          userInfo,
        })

        setChatId(response.data._id)

        // Add message to the chat
        await chatAPI.addMessage(response.data._id, {
          sender: "user",
          content: sentMessage,
        })

        // Create a ticket from this chat
        await chatAPI.createTicketFromChat(response.data._id, {
          title: `New inquiry from ${userInfo.name || "Anonymous"}`,
          description: `Customer message: ${sentMessage}`,
          priority: "medium",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: "bot", text: "Thanks for your message! How else can I help you today?" },
      ])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="chat-widget-container">
      <div className="chat-widget">
        <div className="chat-widget-header">
          <div className="chat-widget-avatar">
            <div className="avatar-circle orange"></div>
          </div>
          <div className="chat-widget-title">Hubly</div>
          <button className="chat-widget-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="chat-widget-messages">
          {messages.map((message) => (
            <div key={message.id} className={`chat-widget-message ${message.sender}`}>
              {message.sender === "bot" && (
                <div className="chat-widget-message-avatar">
                  <div className="avatar-circle orange"></div>
                </div>
              )}
              <div className="chat-widget-message-bubble">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showIntroForm && !formSubmitted && (
          <div className="chat-widget-form">
            <div className="chat-widget-form-header">Introduction Yourself</div>
            <form onSubmit={handleFormSubmit}>
              <div className="chat-widget-form-group">
                <label>Your name</label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="chat-widget-form-group">
                <label>Your Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (000) 000-0000"
                  required
                />
              </div>
              <div className="chat-widget-form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
              <button type="submit" className="chat-widget-form-submit">
                Thank You!
              </button>
            </form>
          </div>
        )}

        <div className="chat-widget-input">
          <input
            type="text"
            placeholder="Write a message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="chat-widget-send" onClick={handleSendMessage}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWidget
