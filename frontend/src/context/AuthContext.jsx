"use client"

import { createContext, useState, useContext } from "react"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mock login function
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      // In a real app, this would make an API call
      console.log("Login with:", credentials)

      // Mock successful login
      const mockUser = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: credentials.email,
        role: "admin",
      }

      // Store user in state
      setUser(mockUser)

      // Store token in localStorage
      localStorage.setItem("token", "mock-token")

      return mockUser
    } catch (err) {
      setError("Login failed. Please check your credentials.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Mock register function
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      // In a real app, this would make an API call
      console.log("Register with:", userData)

      // Mock successful registration
      const mockUser = {
        id: "1",
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role || "admin",
      }

      // Store user in state
      setUser(mockUser)

      // Store token in localStorage
      localStorage.setItem("token", "mock-token")

      return mockUser
    } catch (err) {
      setError("Registration failed. Please try again.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
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
