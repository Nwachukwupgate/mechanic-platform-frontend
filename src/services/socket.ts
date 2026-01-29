import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socket: Socket | null = null

export const connectSocket = () => {
  const token = useAuthStore.getState().token
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  if (socket?.connected) {
    return socket
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket
