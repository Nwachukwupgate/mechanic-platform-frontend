import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'How do I find a mechanic?',
    a: 'Add your vehicle and describe the issue in the app. We’ll show you verified mechanics near you on a map or list. You can compare profiles, ratings, and request quotes before choosing who to book.',
  },
  {
    q: 'How does payment work?',
    a: 'All prices are in naira (₦). You pay through the platform when the job is done (or as agreed with the mechanic). This keeps payments secure and gives you a record of the transaction.',
  },
  {
    q: 'Are the mechanics verified?',
    a: 'Yes. Mechanics on the platform go through verification. You can also see ratings and reviews from other customers before booking.',
  },
  {
    q: 'Can I chat with my mechanic?',
    a: 'Yes. Each booking has a chat so you can coordinate location, timing, and ask questions. You’ll get updates when the mechanic responds.',
  },
  {
    q: 'What if I’m not happy with the work?',
    a: 'You can rate and review after the job. If there’s a serious issue, contact our support and we’ll help resolve it.',
  },
  {
    q: 'I’m a mechanic. How do I join?',
    a: 'Sign up as a mechanic, complete your profile and verification, and set your service area. You’ll then see open repair requests and can submit quotes. When a customer accepts, you get the job and get paid through the platform.',
  },
]

function FaqItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-800 pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {isOpen && (
        <p className="pb-5 text-slate-600 text-sm leading-relaxed">{answer}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="h-14 w-14 text-primary-200 mx-auto mb-4" aria-hidden />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h1>
          <p className="text-xl text-primary-100">
            Quick answers about finding mechanics, payments, and how the platform works.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="py-16 md:py-20 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="sr-only">
            FAQ
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-6 shadow-sm">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                question={item.q}
                answer={item.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-600 mb-6">
            Still have questions? Sign up and reach out through the app.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
