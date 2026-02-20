import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, ChevronDown, ChevronUp } from 'lucide-react'

const SUPPORT_ITEMS = [
  {
    q: 'How do I find and book a mechanic?',
    a: 'Sign up or log in, add your vehicle, then search for mechanics on the map or list. Send a request, compare quotes in naira, and book when you are ready. You can chat with the mechanic in the app.',
  },
  {
    q: 'How do I pay?',
    a: 'Payment is in naira when the job is done. You pay through the platform so both you and the mechanic are protected. You can see the quote before you book.',
  },
  {
    q: "I'm a mechanic. How do I join?",
    a: 'Go to For Mechanics and sign up. Once registered, you can receive requests, send quotes, and manage your bookings and wallet from your dashboard.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We verify mechanics and keep your booking and payment details secure. You can read reviews from other customers before you choose a mechanic.',
  },
]

export default function ChatSupport() {
  const [open, setOpen] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Open chat support"
      >
        <MessageCircle className="h-7 w-7" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20"
          aria-modal="true"
          role="dialog"
          aria-label="Chat support"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white shadow-xl flex flex-col max-h-[85vh]"
            style={{ animation: 'slideIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-primary-600 text-white">
              <h3 className="font-semibold">Chat support</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-sm text-slate-600 mb-4">
                Hi! Choose a question below or browse our <Link to="/faq" className="text-primary-600 underline hover:no-underline" onClick={() => setOpen(false)}>FAQ</Link>.
              </p>
              {SUPPORT_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    <span>{item.q}</span>
                    {expandedIndex === index ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                    )}
                  </button>
                  {expandedIndex === index && (
                    <div className="px-4 pb-3 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
              <p className="text-sm text-slate-600 pt-2">
                Need more help? Call{' '}
                <a
                  href="tel:+2347033554731"
                  className="text-primary-600 underline hover:no-underline"
                >
                  +234 703 355 4731
                </a>
                {' '}or{' '}
                <a
                  href="mailto:support@denicksenauto.com"
                  className="text-primary-600 underline hover:no-underline"
                >
                  email us
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
