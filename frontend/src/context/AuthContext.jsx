"use client"

import { createContext, useState, useContext, useEffect } from "react"
import api from "../services/api"

// Create the AuthContext
const AuthContext = createContext(null)

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing token and validate on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await api.get("/auth/me")
          setUser(response.data)
        } catch (err) {
          console.error("Token validation failed:", err)
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Real login function that calls the API
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/auth/login", credentials)

      // Store token in localStorage
      localStorage.setItem("token", response.data.token)

      // Store user in state
      setUser(response.data.user)

      return response.data.user
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Login failed. Please check your credentials.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Real register function that calls the API
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/auth/register", userData)

      // Store token in localStorage
      localStorage.setItem("token", response.data.token)

      // Store user in state
      setUser(response.data.user)

      return response.data.user
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Registration failed. Please try again.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Value to be provided by the context
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
