import axios from "axios"

// Create axios instance with base URL
const api = axios.create({
  baseURL: "https://hubly-backend-4cx3.onrender.com",
  timeout: 30000,
})

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  signup: (userData) => api.post("/api/auth/signup", userData),
  verifyToken: () => api.get("/api/auth/verify"),
}

// Team API
export const teamAPI = {
  getMembers: () => api.get("/api/team"),
  addMember: (memberData) => api.post("/api/team", memberData),
  updateMember: (id, memberData) => api.put(`/api/team/${id}`, memberData),
  deleteMember: (id) => api.delete(`/api/team/${id}`),
}

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get("/api/analytics/overview"),
  getTicketStats: () => api.get("/api/analytics/tickets"),
  getResponseTimes: () => api.get("/api/analytics/response-times"),
}

// Tickets API
export const ticketsAPI = {
  getAll: () => api.get("/api/tickets"),
  getById: (id) => api.get(`/api/tickets/${id}`),
  create: (ticketData) => api.post("/api/tickets", ticketData),
  update: (id, ticketData) => api.put(`/api/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/api/tickets/${id}`),
  addComment: (id, comment) => api.post(`/api/tickets/${id}/comments`, { content: comment }),
}

// Chat API
export const chatAPI = {
  getAll: () => api.get("/api/chats"),
  getById: (id) => api.get(`/api/chats/${id}`),
  create: (chatData) => api.post("/api/chats", chatData),
  addMessage: (id, message) => api.post(`/api/chats/${id}/messages`, message),
  updateStatus: (id, status) => api.put(`/api/chats/${id}/status`, { status }),
  createTicketFromChat: (id, ticketData) => api.post(`/api/chats/${id}/ticket`, ticketData),
  updateTicketFromChat: (id, ticketData) => api.put(`/api/chats/${id}/ticket`, ticketData),
  
  // New method to fetch admin ID
  getAdminId: () => api.get("/api/chat/admin-id"), // Assuming you have a route for this
}

// Chatbot Settings API
export const chatbotAPI = {
  getSettings: () => api.get("/api/chatbot/settings"),
  updateSettings: (settings) => api.put("/api/chatbot/settings", settings),
}

export default api
