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

/** Real-time quote event names (must match backend ChatGateway emits) */
export const QUOTE_EVENTS = {
  created: 'quote:created',
  updated: 'quote:updated',
  rejected: 'quote:rejected',
  accepted: 'quote:accepted',
} as const

export type QuoteCreatedPayload = { userId: string; bookingId: string; quote: any }
export type QuoteUpdatedPayload = { userId: string; bookingId: string; quote: any }
export type QuoteRejectedPayload = { mechanicId: string; bookingId: string; quoteId: string }
export type QuoteAcceptedPayload = {
  userId: string
  mechanicId: string
  bookingId: string
  quoteId: string
  booking: any
}

/**
 * Subscribe to real-time quote events. Call the returned function to unsubscribe.
 * Ensures socket is connected.
 */
export function onQuoteEvents(handlers: {
  onQuoteCreated?: (payload: QuoteCreatedPayload) => void
  onQuoteUpdated?: (payload: QuoteUpdatedPayload) => void
  onQuoteRejected?: (payload: QuoteRejectedPayload) => void
  onQuoteAccepted?: (payload: QuoteAcceptedPayload) => void
}): () => void {
  const s = connectSocket()
  if (handlers.onQuoteCreated) s.on(QUOTE_EVENTS.created, handlers.onQuoteCreated)
  if (handlers.onQuoteUpdated) s.on(QUOTE_EVENTS.updated, handlers.onQuoteUpdated)
  if (handlers.onQuoteRejected) s.on(QUOTE_EVENTS.rejected, handlers.onQuoteRejected)
  if (handlers.onQuoteAccepted) s.on(QUOTE_EVENTS.accepted, handlers.onQuoteAccepted)
  return () => {
    if (handlers.onQuoteCreated) s.off(QUOTE_EVENTS.created, handlers.onQuoteCreated)
    if (handlers.onQuoteUpdated) s.off(QUOTE_EVENTS.updated, handlers.onQuoteUpdated)
    if (handlers.onQuoteRejected) s.off(QUOTE_EVENTS.rejected, handlers.onQuoteRejected)
    if (handlers.onQuoteAccepted) s.off(QUOTE_EVENTS.accepted, handlers.onQuoteAccepted)
  }
}
