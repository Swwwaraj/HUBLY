"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import "../styles/chatbot.css"
import HublyLogo from "../components/HublyLogo"
import { Home, MessageSquare, BarChart2, FileText, Users, Settings, Edit, Send } from "react-feather"
import { useAuth } from "../context/AuthContext"
import { chatAPI } from "../services/api"

const ChatBotPage = () => {
  // Chat bot configuration state
  const [headerColor, setHeaderColor] = useState("#34475B")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [welcomeMessage, setWelcomeMessage] = useState(
    "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
  )
  const [initialMessage, setInitialMessage] = useState("How can I help you?")
  const [secondMessage, setSecondMessage] = useState("Ask me anything!")
  const [formName, setFormName] = useState("Your name")
  const [formPhone, setFormPhone] = useState("+1 (000) 000-0000")
  const [formEmail, setFormEmail] = useState("example@gmail.com")
  const [missedChatHours, setMissedChatHours] = useState("12")
  const [missedChatMinutes, setMissedChatMinutes] = useState("00")
  const [missedChatSeconds, setMissedChatSeconds] = useState("00")

  // Chat preview state
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", text: "How can I help you?" },
    { id: 2, sender: "user", text: "Ask me anything!" },
  ])
  const [showForm, setShowForm] = useState(true)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Refs for color inputs
  const headerColorInputRef = useRef(null)
  const backgroundColorInputRef = useRef(null)

  const { user } = useAuth()

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    // Load chatbot settings from API
    const loadChatbotSettings = async () => {
      try {
        if (user && user.id) {
          const response = await chatAPI.getChatbotSettings(user.id)
          const settings = response.data

          if (settings) {
            setHeaderColor(settings.headerColor || "#34475B")
            setBackgroundColor(settings.backgroundColor || "#FFFFFF")
            setWelcomeMessage(
              settings.welcomeMessage || "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
            )
            setInitialMessage(settings.initialMessage || "How can I help you?")
            setSecondMessage(settings.secondMessage || "Ask me anything!")
            setFormName(settings.formName || "Your name")
            setFormPhone(settings.formPhone || "+1 (000) 000-0000")
            setFormEmail(settings.formEmail || "example@gmail.com")

            const timer = settings.missedChatTimer || { hours: 12, minutes: 0, seconds: 0 }
            setMissedChatHours(String(timer.hours).padStart(2, "0"))
            setMissedChatMinutes(String(timer.minutes).padStart(2, "0"))
            setMissedChatSeconds(String(timer.seconds).padStart(2, "0"))

            // Update chat messages with loaded messages
            setChatMessages([
              { id: 1, sender: "bot", text: settings.initialMessage || "How can I help you?" },
              { id: 2, sender: "user", text: settings.secondMessage || "Ask me anything!" },
            ])
          }
        }
      } catch (error) {
        console.error("Error loading chatbot settings:", error)
      }
    }

    loadChatbotSettings()

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [user])

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const settings = {
        headerColor,
        backgroundColor,
        welcomeMessage,
        initialMessage,
        secondMessage,
        formName,
        formPhone,
        formEmail,
        missedChatTimer: {
          hours: Number.parseInt(missedChatHours) || 0,
          minutes: Number.parseInt(missedChatMinutes) || 0,
          seconds: Number.parseInt(missedChatSeconds) || 0,
        },
      }

      if (user && user.id) {
        await chatAPI.updateChatbotSettings(user.id, settings)
        setSaveSuccess(true)

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error saving chatbot settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputFocus = () => {
    if (isMobile) {
      setShowKeyboard(true)
    }
  }

  const handleInputBlur = () => {
    setShowKeyboard(false)
  }

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: "user",
        text: inputMessage,
      }
      setChatMessages([...chatMessages, newMessage])
      setInputMessage("")

      // Show form after user sends a message
      if (!formSubmitted && !showForm) {
        setTimeout(() => {
          setShowForm(true)
        }, 1000)
      }
    }
  }

  const handleFormSubmit = () => {
    setFormSubmitted(true)
    setShowForm(false)

    // Add a thank you message
    const thankYouMessage = {
      id: chatMessages.length + 1,
      sender: "bot",
      text: "Thank you for providing your information!",
    }
    setChatMessages([...chatMessages, thankYouMessage])
  }

  const handleKeyPress = (key) => {
    if (key === "return") {
      handleSendMessage()
    } else if (key === "space") {
      setInputMessage(inputMessage + " ")
    } else {
      setInputMessage(inputMessage + key)
    }
  }

  const handleColorChange = (type, color) => {
    if (type === "header") {
      setHeaderColor(color)
      if (headerColorInputRef.current) {
        headerColorInputRef.current.value = color
      }
    } else if (type === "background") {
      setBackgroundColor(color)
      if (backgroundColorInputRef.current) {
        backgroundColorInputRef.current.value = color
      }
    }
  }

  const handleTimerChange = (field, value) => {
    // Ensure value is a number and within valid range
    let numValue = Number.parseInt(value) || 0

    if (field === "hours") {
      numValue = Math.min(Math.max(numValue, 0), 23)
      setMissedChatHours(String(numValue).padStart(2, "0"))
    } else if (field === "minutes") {
      numValue = Math.min(Math.max(numValue, 0), 59)
      setMissedChatMinutes(String(numValue).padStart(2, "0"))
    } else if (field === "seconds") {
      numValue = Math.min(Math.max(numValue, 0), 59)
      setMissedChatSeconds(String(numValue).padStart(2, "0"))
    }
  }

  return (
    <div className="chatbot-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">
          <HublyLogo />
        </div>
        <div className="sidebar-menu">
          <Link to="/dashboard" className="sidebar-item">
            <Home size={20} />
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link to="/contact-center" className="sidebar-item">
            <MessageSquare size={20} />
            <span className="sidebar-text">Contact Center</span>
          </Link>
          <Link to="/analytics" className="sidebar-item">
            <BarChart2 size={20} />
            <span className="sidebar-text">Analytics</span>
          </Link>
          <Link to="/documents" className="sidebar-item">
            <FileText size={20} />
            <span className="sidebar-text">Documents</span>
          </Link>
          <Link to="/team" className="sidebar-item">
            <Users size={20} />
            <span className="sidebar-text">Team</span>
          </Link>
          <Link to="/settings" className="sidebar-item">
            <Settings size={20} />
            <span className="sidebar-text">Settings</span>
          </Link>
        </div>
        <div className="sidebar-footer">
          <button className="help-button">
            <span className="help-icon">?</span>
          </button>
        </div>
      </div>

      <div className="chatbot-content">
        <div className="chatbot-header">
          <h1 className="chatbot-title">Chat Bot</h1>
        </div>

        <div className="chatbot-container">
          <div className="chatbot-preview">
            <div className="chatbot-preview-container">
              <div className="chatbot-preview-header" style={{ backgroundColor: headerColor }}>
                <div className="chatbot-preview-logo">
                  <div className="avatar-circle orange"></div>
                </div>
                <div className="chatbot-preview-title">Hubly</div>
              </div>
              <div className="chatbot-preview-body" style={{ backgroundColor: backgroundColor }}>
                {chatMessages.map((message) => (
                  <div key={message.id} className={`chatbot-preview-message ${message.sender}`}>
                    {message.sender === "bot" && <div className="avatar-circle orange"></div>}
                    <div className="message-bubble">{message.text}</div>
                  </div>
                ))}

                {showForm && !formSubmitted && (
                  <div className="chatbot-preview-form">
                    <div className="form-header">Introduction Yourself</div>
                    <div className="form-group">
                      <label>Your name</label>
                      <input type="text" value={formName} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Your Phone</label>
                      <input type="text" value={formPhone} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Your Email</label>
                      <input type="text" value={formEmail} readOnly />
                    </div>
                    <button className="form-submit" onClick={handleFormSubmit}>
                      Thank You!
                    </button>
                  </div>
                )}
              </div>
              <div className="chatbot-preview-input">
                <input
                  type="text"
                  placeholder="Write a message"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <button className="send-button" onClick={handleSendMessage}>
                  <Send size={16} />
                </button>
              </div>

              {showKeyboard && isMobile && (
                <div className="mobile-keyboard">
                  <div className="keyboard-row">
                    {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((key) => (
                      <button key={key} className="keyboard-key" onClick={() => handleKeyPress(key)}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <div className="keyboard-row">
                    {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((key) => (
                      <button key={key} className="keyboard-key" onClick={() => handleKeyPress(key)}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <div className="keyboard-row">
                    {["z", "x", "c", "v", "b", "n", "m"].map((key) => (
                      <button key={key} className="keyboard-key" onClick={() => handleKeyPress(key)}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <div className="keyboard-row">
                    <button className="keyboard-key keyboard-key-wide" onClick={() => handleKeyPress("space")}>
                      space
                    </button>
                    <button className="keyboard-key keyboard-key-wide" onClick={() => handleKeyPress("return")}>
                      return
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="chatbot-preview-bubble">
              <div className="avatar-circle orange"></div>
              <div className="bubble-close">×</div>
              <div className="bubble-message">{welcomeMessage}</div>
            </div>
          </div>

          <div className="chatbot-settings">
            {/* Header Color */}
            <div className="settings-section">
              <h3 className="settings-title">Header Color</h3>
              <div className="color-options">
                <div
                  className={`color-option ${headerColor === "#FFFFFF" ? "active" : ""}`}
                  onClick={() => handleColorChange("header", "#FFFFFF")}
                >
                  <div className="color-circle white"></div>
                </div>
                <div
                  className={`color-option ${headerColor === "#000000" ? "active" : ""}`}
                  onClick={() => handleColorChange("header", "#000000")}
                >
                  <div className="color-circle black"></div>
                </div>
                <div
                  className={`color-option ${headerColor === "#34475B" ? "active" : ""}`}
                  onClick={() => handleColorChange("header", "#34475B")}
                >
                  <div className="color-circle navy"></div>
                </div>
                <div className="color-input-container">
                  <input
                    type="text"
                    className="color-input"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    ref={headerColorInputRef}
                  />
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="settings-section">
              <h3 className="settings-title">Custom Background Color</h3>
              <div className="color-options">
                <div
                  className={`color-option ${backgroundColor === "#FFFFFF" ? "active" : ""}`}
                  onClick={() => handleColorChange("background", "#FFFFFF")}
                >
                  <div className="color-circle white"></div>
                </div>
                <div
                  className={`color-option ${backgroundColor === "#000000" ? "active" : ""}`}
                  onClick={() => handleColorChange("background", "#000000")}
                >
                  <div className="color-circle black"></div>
                </div>
                <div
                  className={`color-option ${backgroundColor === "#F5F5F5" ? "active" : ""}`}
                  onClick={() => handleColorChange("background", "#F5F5F5")}
                >
                  <div className="color-circle light-gray"></div>
                </div>
                <div className="color-input-container">
                  <input
                    type="text"
                    className="color-input"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    ref={backgroundColorInputRef}
                  />
                </div>
              </div>
            </div>

            {/* Customize Message */}
            <div className="settings-section">
              <h3 className="settings-title">Customize Message</h3>
              <div className="message-customize">
                <div className="message-item">
                  <input type="text" value={initialMessage} onChange={(e) => setInitialMessage(e.target.value)} />
                  <button className="edit-button">
                    <Edit size={16} />
                  </button>
                </div>
                <div className="message-item">
                  <input type="text" value={secondMessage} onChange={(e) => setSecondMessage(e.target.value)} />
                  <button className="edit-button">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Introduction Form */}
            <div className="settings-section">
              <h3 className="settings-title">Introduction Form</h3>
              <div className="form-customize">
                <div className="form-field">
                  <label>Your name:</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Your Phone:</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Your Email:</label>
                  <input type="text" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
                <button className="form-button">Thank You!</button>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="settings-section">
              <h3 className="settings-title">Welcome Message</h3>
              <div className="welcome-message">
                <div className="message-item">
                  <div className="message-content">
                    <span className="hide-button">hide</span>
                    <input type="text" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
                  </div>
                  <button className="edit-button">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Missed chat timer */}
            <div className="settings-section">
              <h3 className="settings-title">Missed chat timer</h3>
              <div className="timer-settings">
                <div className="timer-inputs">
                  <input
                    type="text"
                    className="timer-input"
                    value={missedChatHours}
                    onChange={(e) => handleTimerChange("hours", e.target.value)}
                  />
                  <span className="timer-separator">:</span>
                  <input
                    type="text"
                    className="timer-input"
                    value={missedChatMinutes}
                    onChange={(e) => handleTimerChange("minutes", e.target.value)}
                  />
                  <span className="timer-separator">:</span>
                  <input
                    type="text"
                    className="timer-input"
                    value={missedChatSeconds}
                    onChange={(e) => handleTimerChange("seconds", e.target.value)}
                  />
                </div>
                <div className="timer-options">
                  <div className="timer-option">
                    <input type="text" className="timer-option-input" value="01" readOnly />
                  </div>
                  <div className="timer-option">
                    <input type="text" className="timer-option-input" value="11" readOnly />
                  </div>
                  <div className="timer-option">
                    <input type="text" className="timer-option-input" value="01" readOnly />
                  </div>
                </div>
                <button
                  className={`save-button ${isSaving ? "saving" : ""} ${saveSuccess ? "success" : ""}`}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBotPage
