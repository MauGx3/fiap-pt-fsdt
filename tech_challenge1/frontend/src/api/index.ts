import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            // Optionally redirect to login
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    register: async (data: { name: string; email: string; password: string; role?: string }) => {
        const response = await api.post('/auth/register', data)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
        }
        return response.data
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
        }
        return response.data
    },

    logout: async () => {
        const response = await api.post('/auth/logout')
        localStorage.removeItem('token')
        return response.data
    },

    verify: async () => {
        const response = await api.get('/auth/verify')
        return response.data
    },

    refresh: async () => {
        const response = await api.post('/auth/refresh')
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
        }
        return response.data
    },
}

// Posts API
export const postsAPI = {
    getAll: async () => {
        const response = await api.get('/posts')
        return response.data
    },

    getById: async (id: string) => {
        const response = await api.get(`/posts/${id}`)
        return response.data
    },

    search: async (query: string) => {
        const response = await api.get('/posts/search', { params: { q: query } })
        return response.data
    },

    create: async (data: { title: string; content: string; tags?: string[] }) => {
        const response = await api.post('/posts', data)
        return response.data
    },

    update: async (id: string, data: Partial<{ title: string; content: string; tags?: string[] }>) => {
        const response = await api.put(`/posts/${id}`, data)
        return response.data
    },

    delete: async (id: string) => {
        const response = await api.delete(`/posts/${id}`)
        return response.data
    },
}

// Users API
export const usersAPI = {
    getAll: async () => {
        const response = await api.get('/users')
        return response.data
    },

    getById: async (uuid: string) => {
        const response = await api.get(`/users/${uuid}`)
        return response.data
    },

    getMe: async () => {
        const response = await api.get('/users/me')
        return response.data
    },

    updateMe: async (data: Partial<{ name: string; email: string }>) => {
        const response = await api.put('/users/me', data)
        return response.data
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await api.put('/users/me/password', data)
        return response.data
    },

    create: async (data: { name: string; email: string; password: string; role?: string }) => {
        const response = await api.post('/users', data)
        return response.data
    },
}

// Utility functions
export const isAuthenticated = () => !!localStorage.getItem('token')

export const getToken = () => localStorage.getItem('token')

export const setToken = (token: string) => localStorage.setItem('token', token)

export const removeToken = () => localStorage.removeItem('token')
