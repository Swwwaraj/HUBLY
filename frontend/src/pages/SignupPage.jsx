"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth-pages.css"
import HublyLogo from "../components/HublyLogo"
import { useAuth } from "../context/AuthContext"

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [formError, setFormError] = useState(null)

  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

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
        role: "admin", // Default to admin for signup
      })
      navigate("/dashboard")
    } catch (err) {
      console.error("Registration error:", err)
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
          <h1 className="auth-title">Create an account</h1>
          <div className="auth-switch">
            <Link to="/login" className="auth-switch-link">
              Sign in instead
            </Link>
          </div>

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
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating account..." : "Create an account"}
            </button>
          </form>
          <div className="auth-footer">
            <p className="auth-footer-text">
              This site is protected by reCAPTCHA and the <a href="#">Google Privacy Policy</a> and{" "}
              <a href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>
        <div className="auth-image-container">
          <img src="/placeholder.svg?height=600&width=500" alt="Person working on laptop" className="auth-image" />
        </div>
      </div>
    </div>
  )
}

export default SignupPage
