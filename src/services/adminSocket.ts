import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let adminSocket: Socket | null = null

export type AdminLiveEvent = {
  kind: string
  title: string
  detail?: string
  entityType?: string
  entityId?: string
  at: string
}

export function connectAdminSocket(): Socket {
  const token = useAuthStore.getState().token
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  if (adminSocket?.connected) return adminSocket

  adminSocket = io(`${API_URL}/admin`, {
    auth: { token },
    transports: ['websocket'],
  })

  return adminSocket
}

export function disconnectAdminSocket() {
  adminSocket?.disconnect()
  adminSocket = null
}

export function onAdminLive(cb: (event: AdminLiveEvent) => void): () => void {
  const s = connectAdminSocket()
  s.on('admin:live', cb)
  return () => {
    s.off('admin:live', cb)
  }
}
