import { ExternalLink, MapPin, User } from 'lucide-react'
import { AdminBadge } from './AdminUi'
import { fmtShortDate } from '../../lib/adminFormat'

function labelize(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function displayText(value: unknown): string {
  if (value == null) return ''
  const s = String(value).trim()
  return s
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  const text = displayText(value)
  if (!text) {
    return (
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm text-slate-400">Not provided</dd>
      </div>
    )
  }
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-violet-700 hover:underline inline-flex items-center gap-1">
            {text}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        ) : (
          text
        )}
      </dd>
    </div>
  )
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</p>
        <p className="text-sm text-slate-400">None listed</p>
      </div>
    )
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            {labelize(item)}
          </span>
        ))}
      </div>
    </div>
  )
}

type Profile = Record<string, unknown>

export function MechanicProfilePanel({
  profile,
  ownerName,
}: {
  profile: Profile | null | undefined
  ownerName?: string
}) {
  if (!profile) {
    return <p className="text-sm text-slate-500">No profile on file for this mechanic.</p>
  }

  const p = profile
  const avatar = displayText(p.avatar)
  const city = displayText(p.city)
  const state = displayText(p.state)
  const address = displayText(p.address)
  const workshop = displayText(p.workshopAddress)
  const lat = typeof p.latitude === 'number' ? p.latitude : null
  const lng = typeof p.longitude === 'number' ? p.longitude : null
  const locationLine = [address, city, state, displayText(p.zipCode)].filter(Boolean).join(', ')
  const mapHref =
    lat != null && lng != null ? `https://www.google.com/maps?q=${lat},${lng}` : undefined
  const expertise = Array.isArray(p.expertise) ? (p.expertise as string[]) : []
  const vehicleTypes = Array.isArray(p.vehicleTypes) ? (p.vehicleTypes as string[]) : []
  const brands = Array.isArray(p.brands) ? (p.brands as string[]) : []
  const initials = (ownerName || 'M')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4 pb-6 border-b border-slate-100">
        {avatar ? (
          <img src={avatar} alt="" className="h-20 w-20 rounded-2xl object-cover border border-slate-200" />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-violet-100 text-violet-800 flex items-center justify-center text-2xl font-bold border border-violet-200">
            {initials || <User className="h-8 w-8" />}
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge tone={p.availability ? 'green' : 'slate'}>
              {p.availability ? 'Available' : 'Unavailable'}
            </AdminBadge>
            {displayText(p.experience) ? (
              <AdminBadge tone="blue">{displayText(p.experience)} years experience</AdminBadge>
            ) : null}
          </div>
          {displayText(p.bio) ? (
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">{displayText(p.bio)}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400 italic">No bio provided</p>
          )}
          {displayText(p.nextAvailableNote) ? (
            <p className="mt-2 text-xs text-slate-600">
              <span className="font-medium">Availability note:</span> {displayText(p.nextAvailableNote)}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          Contact & location
        </h3>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Phone" value={displayText(p.phone)} />
          <Field label="City" value={city} />
          <Field label="State" value={state} />
          <Field label="Street address" value={address} />
          <Field label="ZIP / postal" value={displayText(p.zipCode)} />
          <Field label="Workshop address" value={workshop} />
          {locationLine ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full location</dt>
              <dd className="mt-1 text-sm text-slate-800">{locationLine}</dd>
              {mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-violet-700 hover:underline"
                >
                  View on map
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          ) : null}
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Skills & coverage</h3>
        <div className="space-y-4">
          <TagList label="Expertise" items={expertise} />
          <TagList label="Vehicle types" items={vehicleTypes} />
          <TagList label="Brands serviced" items={brands} />
        </div>
        <dl className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field
            label="Typical response time"
            value={
              p.typicalResponseHours != null ? `${p.typicalResponseHours} hours` : ''
            }
          />
          <Field
            label="Certificate"
            value={displayText(p.certificateUrl) ? 'View certificate' : ''}
            href={displayText(p.certificateUrl) || undefined}
          />
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Guarantor</h3>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Name" value={displayText(p.guarantorName)} />
          <Field label="Phone" value={displayText(p.guarantorPhone)} />
          <Field label="Address" value={displayText(p.guarantorAddress)} />
          <Field label="NIN" value={displayText(p.nin)} />
        </dl>
      </div>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap gap-x-6 gap-y-1">
        {p.createdAt ? <span>Profile created {fmtShortDate(String(p.createdAt))}</span> : null}
        {p.updatedAt ? <span>Last updated {fmtShortDate(String(p.updatedAt))}</span> : null}
      </div>
    </div>
  )
}
