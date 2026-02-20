import { Link } from 'react-router-dom'
import { Wrench, MapPin, Clock, Shield, Star, ArrowRight, CheckCircle2 } from 'lucide-react'

// Hero: Black mechanic in repair workshop (Unsplash, free). Same as BENEFIT_IMAGES.mechanic for consistency.
const HERO_IMAGE = 'https://img.freepik.com/premium-photo/african-young-female-car-mechanic-checking-changes-car-air-filter-engine-service-car-garage-black-woman-mechanic-working-car-service-maintenance-workshop_38052-3989.jpg?w=900&q=80'
// Local testimonial photos: add testimony.jpeg and IMG_0091.HEIC to public/ (HEIC may need converting to JPG for some browsers)
const AVATARS = {
  livinus: '/testimony.jpeg',
  nwachukwu: '/user.jpeg',
  user3: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=96&h=96&fit=crop&crop=face',
}
const BENEFIT_IMAGES = {
  owner: 'https://i.pinimg.com/736x/39/d6/ae/39d6aea163fa7b095ec16b35e615d481.jpg?w=500&q=80',
  mechanic: 'https://st2.depositphotos.com/1911991/6914/i/450/depositphotos_69143705-stock-photo-auto-mechanic-smiling-and-giving.jpg?w=500&q=80',
  location: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=80',
  support: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80',
}

const FEATURES = [
  { title: 'Flexible booking', desc: 'Choose a time that works for you. No rigid schedules, Correlate directly with your mechanic.', Icon: Clock },
  { title: 'See mechanics near you', desc: 'View verified mechanics on a map or list. Compare location and expertise before you book.', Icon: MapPin },
  { title: 'Real time chat', desc: 'Message your mechanic, get updates, and clarify details in one place. No back and forth calls.', Icon: Shield },
  { title: 'Verified & rated', desc: 'Every mechanic is verified. Read real reviews from other customers before you decide.', Icon: Wrench },
]

const STEPS = [
  { num: 1, title: 'Add your vehicle', desc: 'Register your car and describe the issue. We match you with mechanics who specialise in your vehicle and problem.' },
  { num: 2, title: 'Find and compare', desc: 'See verified mechanics nearby on a map or list. Compare quotes in naira and choose who to book.' },
  { num: 3, title: 'Book and chat', desc: 'Confirm your booking and coordinate via in app chat. Track status in real time.' },
  { num: 4, title: 'Pay and rate', desc: 'Pay in naira when the job is done. Rate and review to help the community.' },
]

const TESTIMONIALS = [
  { quote: 'Found a mechanic the same day. He came to my place, fixed the brake issue, and the price was fair. No more garage runaround.', name: 'Livinus Deenor', role: 'Port Harcourt, car owner', avatar: AVATARS.livinus, rating: 5 },
  { quote: 'As a mechanic, I get serious jobs and get paid on time. The platform handles the trust side so I can focus on the work.', name: 'Nwachukwu Promise', role: 'Port Harcourt, mechanic', avatar: AVATARS.nwachukwu, rating: 5 },
  { quote: 'I can compare quotes from different mechanics and choose who fits my budget. The chat feature made coordination so easy.', name: 'Amara N.', role: 'Abuja', avatar: AVATARS.user3, rating: 5 },
]

const OUTCOMES = [
  { label: 'Find a mechanic quickly', pct: 94 },
  { label: 'Get transparent quotes in naira', pct: 91 },
  { label: 'Complete booking with satisfaction', pct: 89 },
  { label: 'Would recommend to others', pct: 96 },
]

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative bg-slate-50 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800 mb-6">
                Find trusted mechanics near you
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                Learn how to connect with verified mechanics, compare quotes in naira, and get your vehicle fixed without the guesswork. No empty promises, just a clear process.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 shadow-sm transition-colors"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/for-mechanics"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                >
                  For mechanics
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src={HERO_IMAGE}
                alt="Mechanic working on a car"
                className="rounded-2xl w-full object-cover aspect-[4/3] shadow-lg ring-1 ring-slate-200/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tailored to you (like “Individuell angepasstes Lernen”) */}
      <section className="py-16 md:py-24 bg-white" aria-labelledby="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 id="features" className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Tailored to your situation
            </h2>
            <p className="text-slate-600 max-w-2xl">
              Every driver and every vehicle is different. We help you find the right mechanic and a process that fits.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ title, desc, Icon }) => (
              <div key={title} className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Icon className="h-8 w-8 text-primary-600 mb-4" aria-hidden />
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the process works */}
      <section className="py-16 md:py-24 bg-slate-50" aria-labelledby="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 id="how-it-works" className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              How the process works
            </h2>
            <p className="text-slate-600 max-w-2xl">
              The flow is simple. You add your vehicle, find mechanics, book and chat, then pay and rate. Each step builds on the last.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((item) => (
              <div key={item.num} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-lg">
                  {item.num}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get from the platform (like “Welche Perspektiven”) */}
      <section className="py-16 md:py-24 bg-white" aria-labelledby="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 id="benefits" className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              What you get from the platform
            </h2>
            <p className="text-slate-600 max-w-2xl">
              Whether you’re a vehicle owner or a mechanic, here’s how the platform helps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={BENEFIT_IMAGES.owner} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">For vehicle owners</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Find verified mechanics near you, compare quotes in naira, book and chat in one place, and pay when the job is done. No more guessing who to trust.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={BENEFIT_IMAGES.mechanic} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">For mechanics</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Get serious repair requests in your area, submit quotes, and get paid through the platform. Build your reputation with real reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why we do this */}
      <section className="py-16 md:py-24 bg-slate-50" aria-labelledby="why">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="why" className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
            Why we do this
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Finding a reliable mechanic shouldn’t depend on who you know or where you live. We believe everyone should be able to get transparent, fair car repairs, so we built a place where you can see who’s nearby, compare prices in naira, and book with confidence.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We don’t promise miracles. We focus on clear processes, verified mechanics, and real feedback, so you can make a decision and get back on the road.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 bg-white" aria-labelledby="stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary-600 tabular-nums">89%</p>
              <p className="mt-2 text-sm text-slate-600">of users find a mechanic and complete a booking</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary-600 tabular-nums">1,200+</p>
              <p className="mt-2 text-sm text-slate-600">people from different regions already use the platform</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary-600 tabular-nums">4.6 out of 5</p>
              <p className="mt-2 text-sm text-slate-600 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> average rating from real feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you can expect */}
      <section className="py-16 md:py-24 bg-slate-50" aria-labelledby="outcomes">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 id="outcomes" className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              What you can expect
            </h2>
            <p className="text-slate-600">
              Real outcomes from using the platform. Measurable, practical results.
            </p>
          </div>
          <div className="space-y-6">
            {OUTCOMES.map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-800">{label}</span>
                  <span className="text-slate-600 tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-white" aria-labelledby="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 id="testimonials" className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              What people say
            </h2>
            <p className="text-slate-600 max-w-2xl">
              Real stories from customers and mechanics on the platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-6 bg-slate-50/30">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-slate-700 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-800">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary-600" aria-labelledby="cta">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta" className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-100 mb-8">
            Join thousands of customers and mechanics. Sign up in minutes.
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
