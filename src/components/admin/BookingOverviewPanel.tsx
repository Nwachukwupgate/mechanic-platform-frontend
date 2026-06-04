import { Calendar, Car, MapPin, Wrench } from 'lucide-react'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminBadge, AdminLink } from './AdminUi'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

function statusTone(status: string): string {
  if (status === 'DELIVERED' || status === 'PAID') return 'green'
  if (status === 'EXPIRED') return 'red'
  if (status === 'IN_PROGRESS' || status === 'DONE') return 'violet'
  if (status === 'ACCEPTED') return 'blue'
  return 'amber'
}

export type BookingAdminPaths = {
  user: (id: string) => string
  mechanic: (id: string) => string
}

export function BookingOverviewPanel({
  booking,
  paths,
}: {
  booking: any
  paths: BookingAdminPaths
}) {
  const vehicle = booking.vehicle
  const fault = booking.fault
  const user = booking.user
  const mechanic = booking.mechanic
  const location = [booking.address, booking.city, booking.state].filter((s) => s && String(s).trim()).join(', ')
  const mapHref =
    booking.latitude != null && booking.longitude != null
      ? `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`
      : undefined

  const milestones: { label: string; at?: string | null }[] = [
    { label: 'Created', at: booking.createdAt },
    { label: 'Accepted', at: booking.acceptedAt },
    { label: 'Started', at: booking.startedAt },
    { label: 'Completed', at: booking.completedAt },
    { label: 'Paid', at: booking.paidAt },
    { label: 'Delivered', at: booking.deliveredAt },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <AdminBadge tone={statusTone(booking.status)}>{booking.status.replace(/_/g, ' ')}</AdminBadge>
        {booking.paymentPhaseLabel ? (
          <AdminBadge tone="blue">{booking.paymentPhaseLabel}</AdminBadge>
        ) : null}
        {booking.disputeReason && !booking.disputeResolvedAt ? (
          <AdminBadge tone="red">Dispute open</AdminBadge>
        ) : null}
        {booking.disputeResolvedAt ? <AdminBadge tone="green">Dispute resolved</AdminBadge> : null}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Repair type">
          <span className="inline-flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-slate-400" />
            {fault?.name ?? 'Unknown fault'}
          </span>
        </Field>
        <Field label="Vehicle">
          <span className="inline-flex items-center gap-1.5">
            <Car className="h-4 w-4 text-slate-400" />
            {vehicle
              ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}${vehicle.year ? ` (${vehicle.year})` : ''}`.trim()
              : 'No vehicle'}
            {vehicle?.plateNumber ? ` · ${vehicle.plateNumber}` : ''}
          </span>
        </Field>
        {booking.jobType ? (
          <Field label="Job type">
            {String(booking.jobType).replace(/_/g, ' ')}
          </Field>
        ) : null}
      </div>

      {booking.description ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Customer description</p>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            {booking.description}
          </p>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Customer">
          {user?.id ? (
            <AdminLink to={paths.user(user.id)}>
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
            </AdminLink>
          ) : (
            '—'
          )}
          {user?.email ? <p className="text-xs text-slate-500 mt-0.5">{user.email}</p> : null}
        </Field>
        <Field label="Mechanic">
          {mechanic?.id ? (
            <AdminLink to={paths.mechanic(mechanic.id)}>{mechanic.companyName ?? mechanic.ownerFullName}</AdminLink>
          ) : (
            <span className="text-slate-500">Not assigned</span>
          )}
          {mechanic?.email ? <p className="text-xs text-slate-500 mt-0.5">{mechanic.email}</p> : null}
        </Field>
      </div>

      {location || mapHref ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Service location
          </p>
          {location ? <p className="text-sm text-slate-800">{location}</p> : null}
          {mapHref ? (
            <a href={mapHref} target="_blank" rel="noreferrer" className="text-sm text-violet-700 hover:underline mt-1 inline-block">
              View on map
            </a>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Timeline
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {milestones.map((m) => (
            <li key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
              <span className="text-xs text-slate-500">{m.label}</span>
              <p className="font-medium text-slate-800 mt-0.5">
                {m.at ? fmtShortDate(m.at) : <span className="text-slate-400 font-normal">—</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-slate-400 font-mono pt-2 border-t border-slate-100">Booking ID: {booking.id}</p>
    </div>
  )
}
