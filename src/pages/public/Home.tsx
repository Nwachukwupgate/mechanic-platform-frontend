import { Link } from 'react-router-dom'
import { Wrench, MapPin, Clock, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Find trusted mechanics near you
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10">
              Connect with verified mechanics for repairs, servicing, and diagnostics. Book, chat, and get your vehicle fixed—all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 shadow-soft transition-colors"
              >
                Get started
              </Link>
              <Link
                to="/for-mechanics"
                className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-white/80 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                For mechanics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">
            How it works
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
            Three simple steps to get your vehicle fixed by a verified mechanic.
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Add your vehicle</h3>
              <p className="text-slate-600 text-sm">
                Register your car and describe the issue. We match you with mechanics who specialise in your vehicle and problem.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Find nearby mechanics</h3>
              <p className="text-slate-600 text-sm">
                See verified mechanics on a map or list. Compare expertise, location, and choose who to book.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Chat and get it fixed</h3>
              <p className="text-slate-600 text-sm">
                Message your mechanic, track status, and pay when the job is done. Rate and review for the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">
            Why choose us
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
            Built for trust, convenience, and quality service.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 hover:shadow-soft transition-shadow">
              <MapPin className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Location-based</h3>
              <p className="text-slate-600 text-sm">Find mechanics near you and see them on a map.</p>
            </div>
            <div className="card p-6 hover:shadow-soft transition-shadow">
              <Shield className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Verified mechanics</h3>
              <p className="text-slate-600 text-sm">Every mechanic is verified and rated by customers.</p>
            </div>
            <div className="card p-6 hover:shadow-soft transition-shadow">
              <Clock className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Real-time updates</h3>
              <p className="text-slate-600 text-sm">Track booking status and chat in real time.</p>
            </div>
            <div className="card p-6 hover:shadow-soft transition-shadow">
              <Wrench className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Expert service</h3>
              <p className="text-slate-600 text-sm">Skilled mechanics for all vehicle types and brands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of satisfied customers and mechanics.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 shadow-soft transition-colors"
          >
            Sign up now
          </Link>
        </div>
      </section>
    </div>
  )
}
