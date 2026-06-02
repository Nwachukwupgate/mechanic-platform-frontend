import { api } from './api'
import type { Paginated } from '../lib/adminFormat'

export type AdminStats = {
  usersCount: number
  mechanicsCount: number
  verifiedMechanics: number
  bookingsCount: number
  revenueMinor: number
  revenueNaira: number
  disputedCount: number
  openReportsCount: number
  pendingQuotesCount: number
  failedTransactionsCount: number
  quotesCount: number
  ratingsCount: number
  messagesCount: number
  notificationsCount: number
  bookingsLast24h: number
  transactionsLast24h: number
  auditLogsLast24h: number
  bookingsByStatus: Record<string, number>
}

export type ActivityItem = {
  id: string
  kind: string
  title: string
  detail: string
  entityType: string
  entityId: string
  at: string
}

function paginated<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const q = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v))
    })
  }
  const qs = q.toString()
  return api.get<Paginated<T>>(`${path}${qs ? `?${qs}` : ''}`)
}

export const adminAPI = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getActivity: (limit = 60) => api.get<{ items: ActivityItem[] }>(`/admin/activity?limit=${limit}`),

  listUsers: (p: { page?: number; limit?: number; search?: string; emailVerified?: boolean }) =>
    paginated('/admin/users', p),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  setUserEmailVerified: (id: string, emailVerified: boolean) =>
    api.patch(`/admin/users/${id}/email-verified`, { emailVerified }),

  listMechanics: (p: { page?: number; limit?: number; search?: string; isVerified?: boolean }) =>
    paginated('/admin/mechanics', p),
  getMechanic: (id: string) => api.get(`/admin/mechanics/${id}`),
  setMechanicVerified: (id: string, isVerified: boolean) =>
    api.patch(`/admin/mechanics/${id}/verify`, { isVerified }),
  setMechanicStatus: (id: string, body: { isVerified?: boolean; emailVerified?: boolean; availability?: boolean }) =>
    api.patch(`/admin/mechanics/${id}/status`, body),
  walletAdjustment: (mechanicId: string, body: { direction: 'credit' | 'debit'; amountMinor: number; note?: string }) =>
    api.post(`/admin/mechanics/${mechanicId}/wallet-adjustment`, body),

  listBookings: (p: Record<string, string | number | boolean | undefined>) => paginated('/admin/bookings', p),
  getBooking: (id: string) => api.get(`/admin/bookings/${id}`),
  setBookingStatus: (id: string, status: string) => api.patch(`/admin/bookings/${id}/status`, { status }),
  setBookingDispute: (id: string, body: { disputeReason?: string; resolve?: boolean }) =>
    api.patch(`/admin/bookings/${id}/dispute`, body),

  listQuotes: (p: Record<string, string | number | undefined>) => paginated('/admin/quotes', p),
  listTransactions: (p: Record<string, string | number | undefined>) => paginated('/admin/transactions', p),
  getTransaction: (id: string) => api.get(`/admin/transactions/${id}`),
  reconcileTransaction: (id: string) => api.post(`/admin/transactions/${id}/reconcile`),
  refundTransaction: (id: string, body?: { amountMinor?: number; note?: string }) =>
    api.post(`/admin/transactions/${id}/refund`, body ?? {}),

  listReports: (p: Record<string, string | number | boolean | undefined>) => paginated('/admin/reports', p),
  getReport: (id: string) => api.get(`/admin/reports/${id}`),
  resolveReport: (id: string) => api.post(`/admin/reports/${id}/resolve`),

  listRatings: (p: Record<string, string | number | undefined>) => paginated('/admin/ratings', p),
  listNotifications: (p: Record<string, string | number | boolean | undefined>) =>
    paginated('/admin/notifications', p),

  listAudit: (p: Record<string, string | number | undefined>) => paginated('/admin/audit', p),

  getPayoutMechanics: () => api.get('/admin/payouts/mechanics'),
  recordPayout: (body: { mechanicId: string; amountMinor: number; reference?: string }) =>
    api.post('/admin/payouts', body),

  listAdmins: (p?: { page?: number; limit?: number }) => paginated('/admin/admins', p),
  createAdmin: (body: { email: string; password: string; superadmin?: boolean; permissions?: string[] }) =>
    api.post('/admin/admins', body),
  updateAdminPermissions: (id: string, body: { superadmin?: boolean; permissions?: string[] }) =>
    api.patch(`/admin/admins/${id}/permissions`, body),

  setUserSuspended: (id: string, body: { suspend: boolean; reason?: string }) =>
    api.patch(`/admin/users/${id}/suspend`, body),
  setMechanicSuspended: (id: string, body: { suspend: boolean; reason?: string }) =>
    api.patch(`/admin/mechanics/${id}/suspend`, body),

  listPaystackWebhooks: (p: Record<string, string | number | undefined>) =>
    paginated('/admin/webhooks/paystack', p),
  getPaystackWebhook: (id: string) => api.get(`/admin/webhooks/paystack/${id}`),
}
