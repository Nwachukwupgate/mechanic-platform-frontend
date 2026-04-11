import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, getApiErrorMessage } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'

const NGN = '\u20A6'

export default function BookingReceipt() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    bookingsAPI
      .getReceipt(id)
      .then((res) => setData(res.data))
      .catch((e) => toast.error(getApiErrorMessage(e, 'Could not load receipt')))
  }, [id])

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        to={`/user/bookings/${id}`}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to booking
      </Link>
      <div className="card p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Payment summary</h1>
        <p className="text-sm text-slate-500">Booking ref: {data.bookingId}</p>
        {data.reference && (
          <p className="text-sm text-slate-600">
            Paystack ref: <span className="font-mono">{data.reference}</span>
          </p>
        )}
        <div className="border-t border-slate-100 pt-4 text-sm space-y-2">
          <p>
            <span className="text-slate-500">Vehicle:</span>{' '}
            {data.vehicle?.brand} {data.vehicle?.model}
          </p>
          <p>
            <span className="text-slate-500">Issue:</span> {data.fault?.name}
          </p>
          {data.mechanic && (
            <p>
              <span className="text-slate-500">Mechanic:</span> {data.mechanic.companyName}
            </p>
          )}
          <p>
            <span className="text-slate-500">Status:</span> {data.status}
          </p>
          {data.paidAt && (
            <p>
              <span className="text-slate-500">Paid at:</span>{' '}
              {new Date(data.paidAt).toLocaleString()}
            </p>
          )}
          {data.paidAmount != null && (
            <p className="font-semibold text-slate-800">
              {NGN}
              {Number(data.paidAmount).toLocaleString()}
            </p>
          )}
          {data.estimatedCost != null && data.paidAmount == null && (
            <p className="font-semibold text-slate-800">
              Agreed: {NGN}
              {Number(data.estimatedCost).toLocaleString()}
            </p>
          )}
        </div>
        {Array.isArray(data.transactions) && data.transactions.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Transactions</p>
            <ul className="text-sm space-y-2">
              {data.transactions.map((t: any) => (
                <li key={t.id} className="flex justify-between gap-2">
                  <span className="text-slate-600">{t.type}</span>
                  <span className={t.status === 'SUCCESS' ? 'text-emerald-700' : 'text-slate-500'}>
                    {t.status} · {NGN}
                    {(t.amountMinor / 100).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
