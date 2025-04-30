import axios from "axios"

// Use default values for development
const API_URL = "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Improve the error handling in the interceptors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)

    // Handle token expiration or invalid token
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If token is invalid, clear it and redirect to login
      if (error.response.data.message === "Invalid token.") {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
  inviteTeamMember: (data) => api.post("/auth/invite", data),
  verifyInvite: (token) => api.get(`/auth/invite/${token}`),
}

// Tickets API
export const ticketsAPI = {
  getAll: async (params) => {
    try {
      return await api.get("/tickets", { params })
    } catch (error) {
      console.error("Error fetching tickets:", error)
      throw error
    }
  },
  getById: (id) => api.get(`/tickets/${id}`),
  create: (ticketData) => api.post("/tickets", ticketData),
  update: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, comment) => api.post(`/tickets/${id}/comments`, { content: comment }),
}

// Team API
export const teamAPI = {
  getAll: () => api.get("/team"),
  add: (memberData) => api.post("/team", memberData),
  update: (id, memberData) => api.put(`/team/${id}`, memberData),
  delete: (id) => api.delete(`/team/${id}`),
}

// Chat API
export const chatAPI = {
  getAll: (params) => api.get("/chat", { params }),
  getById: (id) => api.get(`/chat/${id}`),
  create: (chatData) => api.post("/chat", chatData),
  update: (id, chatData) => api.put(`/chat/${id}`, chatData),
  addMessage: (id, messageData) => api.post(`/chat/${id}/messages`, messageData),
  getChatbotSettings: (adminId) => api.get(`/chat/settings/${adminId}`),
  updateChatbotSettings: (adminId, settingsData) => api.put(`/chat/settings/${adminId}`, settingsData),
  getAdminId: () => api.get("/chat/admin"),
  createTicketFromChat: (chatId, ticketData) => api.post(`/chat/${chatId}/ticket`, ticketData),
  updateTicketFromChat: (chatId, updateData) => api.put(`/chat/${chatId}/ticket`, updateData),
}

// Analytics API
export const analyticsAPI = {
  getTicketAnalytics: (params) => api.get("/analytics/tickets", { params }),
  getChatAnalytics: (params) => api.get("/analytics/chats", { params }),
}

export default api
