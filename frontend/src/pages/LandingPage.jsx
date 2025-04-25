"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../styles/landing-page.css"
import HublyLogo from "../components/HublyLogo"
import ChatWidget from "../components/ChatWidget"
import { chatAPI } from "../services/api"

const LandingPage = () => {
  const [showChatBubble, setShowChatBubble] = useState(true)
  const [showChatWidget, setShowChatWidget] = useState(false)
  const [adminId, setAdminId] = useState(null)

  // Fetch the first admin user to associate chat messages with
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const response = await chatAPI.getAdminId()
        setAdminId(response.data.adminId)
      } catch (error) {
        console.error("Error fetching admin ID:", error)
      }
    }

    fetchAdminId()
  }, [])

  const handleCloseBubble = () => {
    setShowChatBubble(false)
  }

  const handleOpenChat = () => {
    setShowChatWidget(true)
    setShowChatBubble(false)
  }

  const handleCloseChat = () => {
    setShowChatWidget(false)
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <HublyLogo />
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/signup" className="signup-button">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Grow Your Business Faster with Hubly CRM</h1>
            <p className="hero-description">
              Manage leads, automate workflows, and close deals effortlessly—all in one powerful platform.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="get-started-btn">
                Get started <span className="arrow">→</span>
              </Link>
              <button className="watch-video-btn">
                <span className="video-icon">▶</span> Watch Video
              </button>
            </div>
          </div>
          <div className="hero-image-container">
            <div className="notification-bubble">
              <div className="notification-avatar">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213301-nyWInhLcQHqBH1BycEvCuAbQE4nMvl.png"
                  alt="Jerry Calzoni"
                  className="avatar-img"
                />
              </div>
              <div className="notification-content">
                <p className="notification-text">Jerry Calzoni joined Swimming</p>
                <p className="notification-time">Class • 9:22 AM</p>
              </div>
            </div>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213301-nyWInhLcQHqBH1BycEvCuAbQE4nMvl.png"
              alt="Business meeting"
              className="hero-image"
            />
            <div className="calendar-widget">
              <div className="calendar-header">
                <p>
                  June 2021 <span className="calendar-arrow">›</span>
                </p>
                <div className="calendar-nav">
                  <span className="nav-arrow">‹</span>
                  <span className="nav-arrow">›</span>
                </div>
              </div>
              <div className="calendar-days">
                <div className="calendar-weekdays">
                  <span>SUN</span>
                  <span>MON</span>
                  <span>TUE</span>
                  <span>WED</span>
                  <span>THU</span>
                  <span>FRI</span>
                  <span>SAT</span>
                </div>
                <div className="calendar-dates">
                  {Array.from({ length: 30 }, (_, i) => (
                    <span key={i} className={i === 6 ? "active-date" : ""}>
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>
              <div className="calendar-time">
                <span>Time</span>
                <div className="time-display">
                  <span>09 : 41</span>
                  <div className="time-ampm">
                    <span className="time-am active">AM</span>
                    <span className="time-pm">PM</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="stats-widget">
              <div className="stats-header">
                <p>Net Sales</p>
                <p className="stats-value">$19,765.50</p>
              </div>
              <div className="stats-chart">
                <div className="chart-bar" style={{ height: "20%" }}></div>
                <div className="chart-bar" style={{ height: "30%" }}></div>
                <div className="chart-bar" style={{ height: "40%" }}></div>
                <div className="chart-bar" style={{ height: "50%" }}></div>
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
                <div className="chart-bar" style={{ height: "90%" }}></div>
              </div>
              <div className="stats-growth">32% ↑</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container partners-container">
          <div className="partner-logo">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
              alt="Adobe"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
              alt="Elastic"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
              alt="Opendoor"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
              alt="Airtable"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
              alt="Elastic"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
              alt="Framer"
            />
          </div>
        </div>
      </section>

      {/* Core Feature Section */}
      <section className="core-feature-section">
        <div className="container core-feature-container">
          <h2 className="section-title text-center">At its core, Hubly is a robust CRM solution.</h2>
          <p className="section-description text-center">
            Hubly helps businesses streamline customer interactions, track leads, and automate tasks— saving you time
            and maximizing revenue. Whether you're a startup or an enterprise, Hubly adapts to your needs, giving you
            the tools to scale efficiently.
          </p>
        </div>
      </section>

      {/* Funnel Section */}
      <section className="funnel-section">
        <div className="container funnel-container">
          <h3 className="funnel-title">MULTIPLE PLATFORMS TOGETHER!</h3>
          <div className="funnel-diagram">
            <div className="funnel-content">
              <p className="funnel-description">
                Email communication is a breeze with our fully integrated, drag & drop email builder.
              </p>
              <div className="funnel-stages">
                <div className="funnel-stage">
                  <h4>CAPTURE</h4>
                  <p>Capture leads using our landing pages, surveys, forms, calendars, inbound phone system & more!</p>
                </div>
                <div className="funnel-stage">
                  <h4>NURTURE</h4>
                  <p>Capture leads using our landing pages, surveys, forms, calendars, inbound phone system & more!</p>
                </div>
                <div className="funnel-stage">
                  <h4>CLOSE</h4>
                  <p>Capture leads using our landing pages, surveys, forms, calendars, inbound phone system & more!</p>
                </div>
              </div>
            </div>
            <div className="funnel-image">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-21%20213322-Cv7K2UZ2Xh70ZNFjKdGHOfcqaqkJW1.png"
                alt="Funnel diagram"
                className="funnel-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container pricing-container">
          <h2 className="section-title text-center">We have plans for everyone!</h2>
          <p className="section-description text-center">
            We started with a strong foundation, then simply built all of the sales and marketing tools ALL businesses
            need under one platform.
          </p>
          <div className="pricing-plans">
            <div className="pricing-plan">
              <h3 className="plan-title">STARTER</h3>
              <p className="plan-description">Best for local businesses needing to improve their online reputation.</p>
              <div className="plan-price">
                <span className="price-amount">$199</span>
                <span className="price-period">/monthly</span>
              </div>
              <div className="plan-features">
                <h4>What's included</h4>
                <ul>
                  <li>Unlimited Users</li>
                  <li>GMB Messaging</li>
                  <li>Reputation Management</li>
                  <li>GMB Call Tracking</li>
                  <li>24/7 Award Winning Support</li>
                </ul>
              </div>
              <button className="plan-button">SIGN UP FOR STARTER</button>
            </div>
            <div className="pricing-plan featured-plan">
              <h3 className="plan-title">GROW</h3>
              <p className="plan-description">
                Best for all businesses that want to take full control of their marketing automation and track their
                leads, click to close.
              </p>
              <div className="plan-price">
                <span className="price-amount">$399</span>
                <span className="price-period">/monthly</span>
              </div>
              <div className="plan-features">
                <h4>What's included</h4>
                <ul>
                  <li>Pipeline Management</li>
                  <li>Marketing Automation Campaigns</li>
                  <li>Live Call Transfer</li>
                  <li>GMB Messaging</li>
                  <li>Embed-able Form Builder</li>
                  <li>Reputation Management</li>
                  <li>24/7 Award Winning Support</li>
                </ul>
              </div>
              <button className="plan-button">SIGN UP FOR GROW</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-logo">
            <HublyLogo />
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#">Universal checkout</a>
                </li>
                <li>
                  <a href="#">Payment workflows</a>
                </li>
                <li>
                  <a href="#">Observability</a>
                </li>
                <li>
                  <a href="#">UpliftAI</a>
                </li>
                <li>
                  <a href="#">Apps & integrations</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Why Primer</h4>
              <ul>
                <li>
                  <a href="#">Expand to new markets</a>
                </li>
                <li>
                  <a href="#">Boost payment success</a>
                </li>
                <li>
                  <a href="#">Improve conversion rates</a>
                </li>
                <li>
                  <a href="#">Reduce payments fraud</a>
                </li>
                <li>
                  <a href="#">Recover revenue</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Developers</h4>
              <ul>
                <li>
                  <a href="#">Primer Docs</a>
                </li>
                <li>
                  <a href="#">API Reference</a>
                </li>
                <li>
                  <a href="#">Payment methods guide</a>
                </li>
                <li>
                  <a href="#">Service status</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Success stories</a>
                </li>
                <li>
                  <a href="#">News room</a>
                </li>
                <li>
                  <a href="#">Terms</a>
                </li>
                <li>
                  <a href="#">Privacy</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">Careers</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-social">
            <a href="#" className="social-icon">
              <i className="email-icon"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="linkedin-icon"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="twitter-icon"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="youtube-icon"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="instagram-icon"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="facebook-icon"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="github-icon"></i>
            </a>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      {showChatBubble && (
        <div className="chat-bubble-container">
          <div className="chat-bubble">
            <div className="chat-avatar">
              <span>👋</span>
            </div>
            <div className="chat-message">Want to chat about Hubly? I'm a chatbot here to help you find your way.</div>
            <button className="chat-close" onClick={handleCloseBubble}>
              ×
            </button>
          </div>
        </div>
      )}

      <button className="chat-button" onClick={handleOpenChat}>
        <span className="chat-icon">💬</span>
      </button>

      {showChatWidget && <ChatWidget onClose={handleCloseChat} adminId={adminId} />}
    </div>
  )
}

export default LandingPage
