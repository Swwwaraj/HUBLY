"use client"

import { useState, useEffect, useRef } from "react"
import { Send } from "react-feather"
import { chatAPI } from "../services/api"
import "../styles/chat-widget.css"

const ChatWidget = ({ onClose, adminId }) => {
  const [showIntroForm, setShowIntroForm] = useState(true)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [messages, setMessages] = useState([{ id: 1, sender: "bot", text: "How can I help you?" }])
  const [inputMessage, setInputMessage] = useState("")
  const [chatId, setChatId] = useState(null)
  const [chatbotSettings, setChatbotSettings] = useState(null)
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load chatbot settings
  useEffect(() => {
    const loadChatbotSettings = async () => {
      try {
        if (adminId) {
          const response = await chatAPI.getChatbotSettings(adminId)
          setChatbotSettings(response.data)

          // Update welcome message and appearance
          setMessages([
            {
              id: 1,
              sender: "bot",
              text: response.data.initialMessage || "How can I help you?",
            },
          ])
        }
      } catch (error) {
        console.error("Error loading chatbot settings:", error)
      }
    }

    loadChatbotSettings()
  }, [adminId])

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

      // Add user introduction and thank you message to the chat UI
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "user",
          text: `Hello, my name is ${userInfo.name}. I'd like to learn more about Hubly.`,
        },
        {
          id: prev.length + 2,
          sender: "bot",
          text: "Thank you for providing your information! How can I help you today?",
        },
      ])

      // Create a ticket from this chat
      await chatAPI.createTicketFromChat(response.data._id, {
        title: `New inquiry from ${userInfo.name}`,
        description: `Customer information:
Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone}

Initial message: Hello, I'd like to learn more about Hubly.`,
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

  // Get styles from chatbot settings
  const getHeaderStyle = () => {
    if (chatbotSettings?.headerColor) {
      return { backgroundColor: chatbotSettings.headerColor }
    }
    return { backgroundColor: "#34475B" }
  }

  const getBodyStyle = () => {
    if (chatbotSettings?.backgroundColor) {
      return { backgroundColor: chatbotSettings.backgroundColor }
    }
    return { backgroundColor: "#FFFFFF" }
  }

  const getPlaceholders = () => {
    if (chatbotSettings) {
      return {
        name: chatbotSettings.formName || "Your name",
        phone: chatbotSettings.formPhone || "+1 (000) 000-0000",
        email: chatbotSettings.formEmail || "example@gmail.com",
      }
    }
    return {
      name: "Your name",
      phone: "+1 (000) 000-0000",
      email: "example@gmail.com",
    }
  }

  const placeholders = getPlaceholders()

  return (
    <div className="chat-widget-container">
      <div className="chat-widget">
        <div className="chat-widget-header" style={getHeaderStyle()}>
          <div className="chat-widget-avatar">
            <div className="avatar-circle orange"></div>
          </div>
          <div className="chat-widget-title">Hubly</div>
          <button className="chat-widget-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="chat-widget-messages" style={getBodyStyle()}>
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

        {/* Form is now outside the chat messages area */}
        {showIntroForm && !formSubmitted && (
          <div className="chat-widget-form-container">
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
                    placeholder={placeholders.name}
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
                    placeholder={placeholders.phone}
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
                    placeholder={placeholders.email}
                    required
                  />
                </div>
                <button type="submit" className="chat-widget-form-submit">
                  Thank You!
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="chat-widget-input">
          <input
            type="text"
            placeholder="Write a message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={showIntroForm && !formSubmitted}
          />
          <button className="chat-widget-send" onClick={handleSendMessage} disabled={showIntroForm && !formSubmitted}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWidget
