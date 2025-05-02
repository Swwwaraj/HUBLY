"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"
import ContactCenterPage from "./pages/ContactCenterPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import TeamPage from "./pages/TeamPage"
import SettingsPage from "./pages/SettingsPage"
import ChatBotPage from "./pages/ChatBotPage"
import LandingPage from "./pages/LandingPage"
import ErrorBoundary from "./components/ErrorBoundary"
import "./styles/global.css"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public route component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppContent() {
  const { verifyAuth } = useAuth()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      await verifyAuth()
      setInitializing(false)
    }

    initializeAuth()
  }, [verifyAuth])

  if (initializing) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Initializing...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact-center"
        element={
          <ProtectedRoute>
            <ContactCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-bot"
        element={
          <ProtectedRoute>
            <ChatBotPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
