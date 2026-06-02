import { useState, useCallback, useEffect } from 'react'
import { X, AlertTriangle, Check } from 'lucide-react'
import { USER_DELETE_REASON_OPTIONS } from '../constants/deleteAccountReasons'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (payload: { reasons: string[]; otherReason?: string }) => Promise<void>
  loading?: boolean
}

export function DeleteAccountSheet({ open, onClose, onConfirm, loading }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [otherText, setOtherText] = useState('')
  const [step, setStep] = useState<'reasons' | 'confirm'>('reasons')

  const reset = useCallback(() => {
    setSelected(new Set())
    setOtherText('')
    setStep('reasons')
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const toggle = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const reasonsPayload = () => {
    const reasons = USER_DELETE_REASON_OPTIONS.filter(
      (o) => selected.has(o.value) && o.value !== 'other'
    ).map((o) => o.label)
    const otherReason = selected.has('other') ? otherText.trim() : undefined
    return { reasons, otherReason }
  }

  const canProceed = () => {
    const { reasons, otherReason } = reasonsPayload()
    if (reasons.length === 0 && !otherReason) return false
    if (selected.has('other') && !otherText.trim()) return false
    return true
  }

  const submit = async () => {
    const { reasons, otherReason } = reasonsPayload()
    await onConfirm({ reasons, otherReason })
    reset()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45"
        aria-label="Close"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="relative w-full max-w-lg max-h-[88vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col"
      >
        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mt-3 sm:hidden shrink-0" />
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2 border-b border-slate-100 shrink-0">
          <h2 id="delete-account-title" className="text-lg font-bold text-slate-800">
            {step === 'reasons' ? 'Delete account' : 'Confirm deletion'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'reasons' ? (
          <div className="px-5 py-4 flex flex-col min-h-0 flex-1 overflow-hidden">
            <p className="text-sm text-slate-600 mb-4">
              We’re sorry to see you go. Tell us why you’re leaving. It helps us improve.
            </p>
            <div className="overflow-y-auto max-h-[min(320px,50vh)] space-y-2.5 pr-1 mb-3">
              {USER_DELETE_REASON_OPTIONS.map((opt) => {
                const isOn = selected.has(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={`w-full flex items-start gap-3 text-left rounded-xl border px-3 py-3 transition-colors ${
                      isOn
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 ${
                        isOn ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                      }`}
                    >
                      {isOn ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
                    </span>
                    <span className="text-[15px] text-slate-800 leading-snug">{opt.label}</span>
                  </button>
                )
              })}
              {selected.has('other') ? (
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[15px] text-slate-800 min-h-[88px] resize-y placeholder:text-slate-400"
                  placeholder="Please tell us more…"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  maxLength={500}
                />
              ) : null}
            </div>
            <p className="text-[13px] text-red-700 leading-relaxed mb-4">
              This permanently deletes your profile, vehicles, and booking history. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => canProceed() && setStep('confirm')}
              disabled={!canProceed()}
              className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 py-3 text-center text-slate-600 font-semibold text-[15px] hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="px-5 py-6 flex flex-col items-center">
            <div className="w-[72px] h-[72px] rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-lg font-bold text-slate-800 text-center mb-2">Delete your account?</p>
            <p className="text-[15px] text-slate-600 text-center leading-relaxed mb-6">
              Your account and personal data will be removed from our systems. Active bookings may be cancelled.
            </p>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Deleting…' : 'Yes, delete my account'}
            </button>
            <button
              type="button"
              onClick={() => setStep('reasons')}
              disabled={loading}
              className="mt-3 py-2 text-primary-600 font-semibold text-[15px] hover:underline disabled:opacity-50"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
