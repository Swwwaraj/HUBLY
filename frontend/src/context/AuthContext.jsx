"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await authAPI.getProfile()
          setUser(response.data)
        } catch (error) {
          console.error("Authentication error:", error)
          // Clear invalid token
          localStorage.removeItem("token")
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      setError(null)
      const response = await authAPI.login(credentials)
      const { token, user } = response.data

      // Store token in localStorage
      localStorage.setItem("token", token)

      // Set user in state
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Login failed. Please try again.")
      return { success: false, error: error.response?.data?.message || "Login failed" }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.register(userData)
      const { token, user } = response.data

      // Store token in localStorage
      localStorage.setItem("token", token)

      // Set user in state
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.response?.data?.message || "Registration failed. Please try again.")
      return { success: false, error: error.response?.data?.message || "Registration failed" }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.updateProfile(userData)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      console.error("Update profile error:", error)
      setError(error.response?.data?.message || "Update failed. Please try again.")
      return { success: false, error: error.response?.data?.message || "Update failed" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
