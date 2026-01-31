import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/**
 * Turn API error responses into a short, user-friendly message.
 * Handles NestJS-style { message: string | string[], error, statusCode } and generic axios errors.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error || typeof error !== 'object') return fallback
  const ax = error as AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>
  const data = ax.response?.data
  const status = ax.response?.status
  if (data && typeof data === 'object') {
    const msg = data.message
    if (Array.isArray(msg) && msg.length > 0) {
      const text = msg.map((m) => (typeof m === 'string' ? m : String(m))).join('. ')
      return text || fallback
    }
    if (typeof msg === 'string' && msg.trim()) return msg.trim()
    if (typeof data.error === 'string' && data.error.trim()) {
      return status === 400 ? `Bad request: ${data.error}` : data.error
    }
  }
  if (status === 401) return 'Please sign in again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return 'Not found. It may have been removed.'
  if (typeof status === 'number' && status >= 500) return 'Server error. Please try again later.'
  if (ax.message && typeof ax.message === 'string' && ax.message.trim()) return ax.message.trim()
  return fallback
}

/**
 * Check if the error is a "property X should not exist" validation error (e.g. backend DTO doesn't allow that field yet).
 */
export function isPropertyNotAllowedError(error: unknown, propertyName?: string): boolean {
  const msg = getApiErrorMessage(error, '')
  if (!msg) return false
  const lower = msg.toLowerCase()
  const hasPropertyReject = lower.includes('should not exist') || lower.includes('property')
  if (!propertyName) return hasPropertyReject
  return hasPropertyReject && lower.includes(propertyName.toLowerCase())
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token
  
  // If token not in store, try localStorage as fallback
  if (!token) {
    try {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.token) {
          token = parsed.state.token
        }
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e)
    }
  }
  
  // Backend JWT Strategy expects: Authorization: Bearer <token>
  // This is critical for JwtAuthGuard to work correctly
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Debug log for protected routes
    if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register') && !config.url?.includes('/auth/verify-email')) {
      console.log(`[API] Sending request to ${config.url} with Bearer token`)
    }
  } else {
    // Only warn for protected routes (not auth routes)
    if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register') && !config.url?.includes('/auth/verify-email')) {
      console.warn(`[API] No token found for protected route: ${config.url}`)
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // useAuthStore.getState().logout()
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  registerUser: (data: {
    firstName: string
    lastName: string
    email: string
    dateOfBirth: string
    password: string
  }) => api.post('/auth/register/user', data),

  registerMechanic: (data: {
    companyName: string
    ownerFullName: string
    email: string
    password: string
  }) => api.post('/auth/register/mechanic', data),

  loginUser: (email: string, password: string) =>
    api.post('/auth/login/user', { email, password }),

  loginMechanic: (email: string, password: string) =>
    api.post('/auth/login/mechanic', { email, password }),

  verifyEmail: (token: string, role: string) =>
    api.get(`/auth/verify-email?token=${token}&role=${role}`),

  getMe: () => api.get('/auth/me'),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me/profile', data),
}

// Mechanics API
export const mechanicsAPI = {
  getAll: () => api.get('/mechanics'),
  getById: (id: string) => api.get(`/mechanics/${id}`),
  getProfile: () => api.get('/mechanics/me/profile'),
  updateProfile: (data: any) => api.put('/mechanics/me/profile', data),
  updateAvailability: (availability: boolean) =>
    api.put('/mechanics/me/availability', { availability }),
  uploadCertificate: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ certificateUrl: string }>('/mechanics/me/upload-certificate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ avatarUrl: string }>('/mechanics/me/upload-avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Vehicles API
export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
}

// Faults API
export const faultsAPI = {
  getAll: (category?: string) =>
    api.get('/faults', { params: category ? { category } : {} }),
  getById: (id: string) => api.get(`/faults/${id}`),
}

// Bookings API
export const bookingsAPI = {
  create: (data: any) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  findNearbyMechanics: (
    lat: number,
    lng: number,
    faultCategory: string,
    radius?: number,
    vehicleId?: string
  ) =>
    api.get('/bookings/nearby-mechanics', {
      params: { lat, lng, faultCategory, radius, vehicleId },
    }),
  acceptBooking: (id: string) => api.put(`/bookings/${id}/accept`),
  updateStatus: (id: string, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
  updateCost: (id: string, cost: number) =>
    api.put(`/bookings/${id}/cost`, { cost }),
}

// Ratings API
export const ratingsAPI = {
  create: (data: any) => api.post('/ratings', data),
  getMechanicRatings: (mechanicId: string) =>
    api.get(`/ratings/mechanic/${mechanicId}`),
  getMechanicAverage: (mechanicId: string) =>
    api.get(`/ratings/mechanic/${mechanicId}/average`),
}
