"use client"

import { useState, useEffect } from "react"
import { chatAPI } from "../services/api"
import ChatWidget from "../components/ChatWidget"
import "../styles/dummy-website.css"

const DummyWebsitePage = () => {
  const [showChat, setShowChat] = useState(false)
  const [adminId, setAdminId] = useState(null)
  const [chatbotSettings, setChatbotSettings] = useState(null)

  useEffect(() => {
    // Get the first admin ID for the chat widget
    const getAdminId = async () => {
      try {
        const response = await chatAPI.getAdminId()
        setAdminId(response.data.adminId)

        // Get chatbot settings
        if (response.data.adminId) {
          const settingsResponse = await chatAPI.getChatbotSettings(response.data.adminId)
          setChatbotSettings(settingsResponse.data)
        }
      } catch (error) {
        console.error("Error getting admin ID:", error)
      }
    }

    getAdminId()
  }, [])

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  return (
    <div className="dummy-website">
      <header className="dummy-header">
        <div className="dummy-logo">Hubly Demo Website</div>
        <nav className="dummy-nav">
          <a href="#" className="dummy-nav-item">
            Home
          </a>
          <a href="#" className="dummy-nav-item">
            About
          </a>
          <a href="#" className="dummy-nav-item">
            Services
          </a>
          <a href="#" className="dummy-nav-item">
            Contact
          </a>
        </nav>
      </header>

      <main className="dummy-main">
        <section className="dummy-hero">
          <h1>Welcome to Our Demo Website</h1>
          <p>This is a demonstration of the Hubly chat widget integration.</p>
          <button className="dummy-button">Learn More</button>
        </section>

        <section className="dummy-features">
          <div className="dummy-feature">
            <div className="dummy-feature-icon">📊</div>
            <h2>Analytics</h2>
            <p>Track your customer interactions and gain valuable insights.</p>
          </div>
          <div className="dummy-feature">
            <div className="dummy-feature-icon">💬</div>
            <h2>Live Chat</h2>
            <p>Connect with your customers in real-time through our chat widget.</p>
          </div>
          <div className="dummy-feature">
            <div className="dummy-feature-icon">🎯</div>
            <h2>Targeting</h2>
            <p>Reach the right audience with our targeting features.</p>
          </div>
        </section>
      </main>

      <footer className="dummy-footer">
        <p>&copy; 2023 Hubly Demo. All rights reserved.</p>
      </footer>

      {/* Chat bubble */}
      {!showChat && chatbotSettings && (
        <div className="chat-bubble" onClick={toggleChat}>
          <div className="avatar-circle orange"></div>
          <div className="bubble-message">
            {chatbotSettings.welcomeMessage ||
              "👋 Want to chat about Hubly? I'm a chatbot here to help you find your way."}
          </div>
        </div>
      )}

      {/* Chat widget */}
      {showChat && adminId && <ChatWidget onClose={toggleChat} adminId={adminId} />}
    </div>
  )
}

export default DummyWebsitePage
