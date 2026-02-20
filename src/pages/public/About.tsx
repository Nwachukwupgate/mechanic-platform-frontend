import { Link } from 'react-router-dom'
import { Wrench, Shield, Target, Heart, ArrowRight } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            About Mechanic Platform
          </h1>
          <p className="text-xl text-primary-100">
            We connect vehicle owners with verified mechanics for transparent, convenient car repairs and servicing.
          </p>
        </div>
      </section>

      {/* Mission & story */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Our mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Mechanic Platform was built to fix a simple problem: finding a trustworthy mechanic is hard. 
              We bring transparency to car repairs by letting you compare mechanics, see real ratings, get quotes in naira, 
              and chat directly, so you know exactly what you’re paying for and who’s doing the work.
            </p>
            <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">What we do</h2>
            <p className="text-slate-600 leading-relaxed">
              For vehicle owners, we offer a single place to add your car, describe the issue, find nearby verified mechanics on a map or list, 
              request and compare quotes, and pay in naira when the job is done. For mechanics, we provide a stream of serious jobs, 
              secure payments, and a simple way to manage bookings and chat with customers.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-slate-50" aria-labelledby="our-values">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="our-values" className="text-3xl font-bold text-slate-800 text-center mb-12">
            Our values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: Shield, title: 'Trust', desc: 'Every mechanic is verified. Every job can be reviewed.' },
              { Icon: Target, title: 'Transparency', desc: 'Clear quotes in naira and real time updates.' },
              { Icon: Wrench, title: 'Quality', desc: 'We focus on skilled mechanics and good outcomes.' },
              { Icon: Heart, title: 'Simplicity', desc: 'Book, chat, and pay in one place.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
                <Icon className="h-10 w-10 text-primary-600 mx-auto mb-3" aria-hidden />
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to try us?</h2>
          <p className="text-primary-100 mb-6">
            Join thousands of customers and mechanics already on the platform.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            Sign up now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
