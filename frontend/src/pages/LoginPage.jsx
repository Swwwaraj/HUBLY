"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth-pages.css"
import HublyLogo from "../components/HublyLogo"
import { useAuth } from "../context/AuthContext"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formError, setFormError] = useState(null)

  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError("Please fill in all fields")
      return
    }

    try {
      await login(formData)
      navigate("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
      // Error is already set in the AuthContext
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-logo">
            <Link to="/">
              <HublyLogo />
            </Link>
          </div>
          <h1 className="auth-title">Sign in to your Hubly</h1>

          {(error || formError) && <div className="auth-error">{error || formError}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className="auth-links">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
            <p className="signup-prompt">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
          <div className="auth-footer">
            <p className="auth-footer-text">
              This site is protected by reCAPTCHA and the <a href="#">Google Privacy Policy</a> and{" "}
              <a href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>
        <div className="auth-image-container">
          <img src="https://i.postimg.cc/GmgSRfnC/backgroud.png" alt="Person working on laptop" className="auth-image" />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
