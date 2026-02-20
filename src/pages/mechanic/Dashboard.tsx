import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { connectSocket, onQuoteEvents } from '../../services/socket'
import {
  Briefcase,
  Clock,
  CheckCircle,
  ClipboardList,
  Car,
  User,
  MapPin,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

const STATUS_BADGE: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-primary-100 text-primary-800',
  IN_PROGRESS: 'bg-violet-100 text-violet-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-slate-100 text-slate-700',
  DELIVERED: 'bg-slate-100 text-slate-700',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

export default function MechanicDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [openRequests, setOpenRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openRequestsLoading, setOpenRequestsLoading] = useState(true)

  const loadBookings = () => {
    bookingsAPI
      .getAll()
      .then((res) => {
        setBookings(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const loadOpenRequests = () => {
    setOpenRequestsLoading(true)
    bookingsAPI
      .getOpenRequests()
      .then((res) => {
        setOpenRequests(res.data || [])
        setOpenRequestsLoading(false)
      })
      .catch(() => setOpenRequestsLoading(false))
  }

  useEffect(() => {
    loadBookings()
    loadOpenRequests()
    connectSocket()
    const unsub = onQuoteEvents({
      onQuoteAccepted: () => {
        loadBookings()
        loadOpenRequests()
      },
      onQuoteRejected: () => {
        loadOpenRequests()
      },
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  const pendingBookings = bookings.filter((b) => b.status === 'REQUESTED')
  const activeBookings = bookings.filter((b) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)
  )
  const completedBookings = bookings.filter((b) =>
    ['DONE', 'PAID', 'DELIVERED'].includes(b.status)
  )

  return (
    <div className="space-y-10">
      {/* Page title — background for legibility on map */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your requests and bookings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-slate-800">
                {pendingBookings.length}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Pending</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500/80" aria-hidden />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-slate-800">
                {activeBookings.length}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Active</p>
            </div>
            <Briefcase className="h-8 w-8 text-primary-500/80" aria-hidden />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-slate-800">
                {completedBookings.length}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Completed</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500/80" aria-hidden />
          </div>
        </div>
      </div>

      {/* Open requests */}
      <section aria-labelledby="open-requests-heading">
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
            <div>
              <h2
                id="open-requests-heading"
                className="text-base font-semibold text-slate-800"
              >
                Open requests
              </h2>
              <p className="text-sm text-slate-500">
                Submit your price (₦) to get picked. Updates in real time.
              </p>
            </div>
          </div>
          {!openRequestsLoading && openRequests.length > 0 && (
            <span className="text-sm text-slate-500 tabular-nums">
              {openRequests.length}{' '}
              {openRequests.length === 1 ? 'request' : 'requests'}
            </span>
          )}
        </div>

        {openRequestsLoading ? (
          <div className="flex justify-center rounded-xl border border-slate-200 bg-white py-16">
            <LoadingSpinner variant="logo" />
          </div>
        ) : openRequests.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-600">
              No open requests in your area
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Check back later or adjust your service area in profile.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0">
            {openRequests.map((req: any) => (
              <li key={req.id}>
                <Link
                  to={`/mechanic/bookings/${req.id}`}
                  className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {req.vehicle?.brand} {req.vehicle?.model}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm text-slate-600">{req.fault?.name}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0 text-sm text-slate-500">
                      <span>
                        {req.user?.firstName} {req.user?.lastName}
                      </span>
                      {req.distanceKm != null && (
                        <span>{req.distanceKm.toFixed(1)} km away</span>
                      )}
                    </div>
                    {req.myQuote && (
                      <p className="mt-2 text-sm font-medium text-emerald-700">
                        Your quote: ₦{Number(req.myQuote.proposedPrice).toLocaleString()}
                        {req.myQuote.status === 'PENDING' && ' (pending)'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:text-primary-700 sm:shrink-0">
                    {req.myQuote ? 'Update quote' : 'Submit quote'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending (assigned to you) */}
      <section aria-labelledby="pending-heading">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
            <div>
              <h2 id="pending-heading" className="text-base font-semibold text-slate-800">
                Pending
              </h2>
              <p className="text-sm text-slate-500">Assigned to you, awaiting your action</p>
            </div>
          </div>
          {pendingBookings.length > 0 && (
            <span className="text-sm text-slate-500 tabular-nums">
              {pendingBookings.length}
            </span>
          )}
        </div>

        {pendingBookings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
            <p className="text-sm text-slate-500">No pending requests.</p>
          </div>
        ) : (
          <>
            <ul className="space-y-2 list-none p-0 m-0">
              {pendingBookings.slice(0, 5).map((booking) => (
                <li key={booking.id}>
                  <Link
                    to={`/mechanic/bookings/${booking.id}`}
                    className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {booking.vehicle?.brand} {booking.vehicle?.model}
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.fault?.name} · {booking.user?.firstName}{' '}
                        {booking.user?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <StatusBadge status={booking.status} />
                      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {pendingBookings.length > 5 && (
              <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Link
                  to="/mechanic/bookings"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View all pending →
                </Link>
              </p>
            )}
          </>
        )}
      </section>

      {/* Recent bookings */}
      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
            <div>
              <h2 id="recent-heading" className="text-base font-semibold text-slate-800">
                Recent bookings
              </h2>
              <p className="text-sm text-slate-500">Your latest jobs</p>
            </div>
          </div>
          {bookings.length > 0 && (
            <Link
              to="/mechanic/bookings"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
            <p className="text-sm text-slate-500">No bookings yet.</p>
          </div>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0">
            {bookings.slice(0, 10).map((booking) => (
              <li key={booking.id}>
                <Link
                  to={`/mechanic/bookings/${booking.id}`}
                  className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </p>
                    <p className="text-sm text-slate-500">{booking.fault?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <StatusBadge status={booking.status} />
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
