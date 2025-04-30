"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import "../styles/auth-pages.css"
import HublyLogo from "../components/HublyLogo"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/api"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [formError, setFormError] = useState(null)
  const [inviteInfo, setInviteInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [validToken, setValidToken] = useState(false)

  const { token } = useParams()
  const { register, error } = useAuth()
  const navigate = useNavigate()

  // Verify invite token on load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true)
        const response = await authAPI.verifyInvite(token)
        setInviteInfo(response.data)
        setFormData((prev) => ({ ...prev, email: response.data.email }))
        setValidToken(true)
      } catch (err) {
        console.error("Invalid invite token:", err)
        setFormError("This invite link is invalid or has expired.")
        setValidToken(false)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    // Validate terms agreement
    if (!formData.agreeTerms) {
      setFormError("You must agree to the terms and conditions")
      return
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        inviteToken: token,
      })
      navigate("/dashboard")
    } catch (err) {
      console.error("Registration error:", err)
      setFormError(err.response?.data?.message || "Registration failed. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="loading-indicator">Verifying invitation...</div>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-form-container">
            <div className="auth-logo">
              <Link to="/">
                <HublyLogo />
              </Link>
            </div>
            <h1 className="auth-title">Invalid Invitation</h1>
            <div className="auth-error">{formError}</div>
            <p>
              Please contact your administrator for a valid invitation or{" "}
              <Link to="/login" className="auth-link">
                login
              </Link>{" "}
              if you already have an account.
            </p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="auth-title">Complete Your Registration</h1>
          {inviteInfo && (
            <div className="invite-info">
              <p>
                You've been invited by <strong>{inviteInfo.inviterName}</strong> to join their team as a{" "}
                <strong>{inviteInfo.role}</strong>.
              </p>
            </div>
          )}

          {(error || formError) && <div className="auth-error">{error || formError}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
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
                readOnly
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
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeTerms" className="checkbox-label">
                By creating an account, I agree to our <a href="#">Terms of use</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>
            <button type="submit" className="auth-button">
              Complete Registration
            </button>
          </form>
        </div>
        <div className="auth-image-container">
          <img src="/placeholder.svg?height=600&width=500" alt="Person working on laptop" className="auth-image" />
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
