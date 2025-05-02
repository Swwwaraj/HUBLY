"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"
import ContactCenterPage from "./pages/ContactCenterPage"
import TeamPage from "./pages/TeamPage"
import ChatBotPage from "./pages/ChatBotPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import SettingsPage from "./pages/SettingsPage"
import "./styles/global.css"
import ErrorBoundary from "./components/ErrorBoundary"
import { useEffect } from "react"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  // Add loading styles
  useEffect(() => {
    if (loading) {
      document.body.classList.add("app-loading")
    } else {
      document.body.classList.remove("app-loading")
    }

    return () => {
      document.body.classList.remove("app-loading")
    }
  }, [loading])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact-center"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ContactCenterPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <TeamPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-bot"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ChatBotPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <AnalyticsPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
