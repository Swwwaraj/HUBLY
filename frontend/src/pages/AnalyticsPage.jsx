"use client"
import { Link } from "react-router-dom"
import "../styles/analytics.css"
import HublyLogo from "../components/HublyLogo"
import { Home, MessageSquare, BarChart2, FileText, Users, Settings, MoreHorizontal } from "react-feather"

const AnalyticsPage = () => {
  return (
    <div className="analytics-page">
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
          <Link to="/analytics" className="sidebar-item active">
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

      <div className="analytics-content">
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">Missed Chats</h2>
            <button className="more-button">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="chart-container">
            <div className="chart-info">
              <div className="chart-label">Chats</div>
              <div className="chart-value">13</div>
            </div>
            <div className="line-chart">
              <svg viewBox="0 0 500 200" className="chart">
                <path
                  d="M0,150 C50,100 100,140 150,90 C200,40 250,70 300,120 C350,170 400,100 450,50"
                  className="chart-line"
                />
                <circle cx="0" cy="150" r="5" className="chart-point" />
                <circle cx="150" cy="90" r="5" className="chart-point" />
                <circle cx="300" cy="120" r="5" className="chart-point" />
                <circle cx="450" cy="50" r="5" className="chart-point" />
              </svg>
              <div className="chart-labels">
                <div className="chart-label">Week 1</div>
                <div className="chart-label">Week 2</div>
                <div className="chart-label">Week 3</div>
                <div className="chart-label">Week 4</div>
                <div className="chart-label">Week 5</div>
                <div className="chart-label">Week 6</div>
                <div className="chart-label">Week 7</div>
                <div className="chart-label">Week 8</div>
                <div className="chart-label">Week 9</div>
                <div className="chart-label">Week 10</div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">Average Reply time</h2>
          </div>
          <div className="reply-time-container">
            <div className="reply-time-info">
              <p className="reply-time-description">
                For highest customer satisfaction rates you should aim to reply to an incoming customer's message in 15
                seconds or less. Quick responses will get you more conversations, help you earn customers trust and make
                more sales.
              </p>
              <div className="reply-time-value">0 secs</div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">Resolved Tickets</h2>
          </div>
          <div className="resolved-tickets-container">
            <div className="resolved-tickets-info">
              <p className="resolved-tickets-description">
                A callback system on a website, as well as proactive invitations, help to attract even more customers. A
                separate round button for ordering a call with a small animation helps to motivate more customers to
                make calls.
              </p>
              <div className="progress-circle-container">
                <svg viewBox="0 0 36 36" className="progress-circle">
                  <path
                    className="progress-circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="progress-circle-fill"
                    strokeDasharray="80, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="progress-circle-text">
                    80%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">Total Chats</h2>
          </div>
          <div className="total-chats-container">
            <div className="total-chats-info">
              <p className="total-chats-description">
                This metric Shows the total number of chats for all Channels for the selected the selected period
              </p>
              <div className="total-chats-value">122 Chats</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
