import { Link } from 'react-router-dom'
import { Wrench, MapPin, Clock, MessageCircle, Star, ArrowRight, CheckCircle2 } from 'lucide-react'

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
}

const FEATURES = [
  { title: 'Flexible booking', desc: 'Choose a time that works for you. No rigid schedules, Correlate directly with your mechanic.', Icon: Clock },
  { title: 'See mechanics near you', desc: 'View verified mechanics on a map or list. Compare location and expertise before you book.', Icon: MapPin },
  { title: 'Real time chat', desc: 'Message your mechanic, get updates, and clarify details in one place. No back and forth calls.', Icon: MessageCircle },
  { title: 'Verified & rated', desc: 'Every mechanic is verified. Read real reviews from other customers before you decide.', Icon: Wrench },
]

const STEPS = [
  { num: 1, title: 'Add your vehicle', desc: 'Register your car and describe the issue. We match you with mechanics who specialise in your vehicle and problem.' },
  { num: 2, title: 'Find and compare', desc: 'See verified mechanics nearby on a map or list. Compare quotes in naira and choose who to book.' },
  { num: 3, title: 'Book and chat', desc: 'Confirm your booking and correlate via in app chat. Track status in real time.' },
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

const TRUST_PILLS = ['Verified workshops', 'Quotes in naira', 'Secure chat']

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/90 via-white to-[#f2f7f4] pointer-events-none" aria-hidden />
        <div className="absolute top-0 right-0 w-[min(100%,42rem)] h-[min(100%,42rem)] translate-x-1/4 -translate-y-1/4 rounded-full bg-primary-200/25 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 w-80 h-80 -translate-x-1/3 translate-y-1/4 rounded-full bg-accent-200/20 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="flex flex-wrap gap-2 mb-6">
                {TRUST_PILLS.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-primary-800 bg-white/90 border border-primary-100 shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 shrink-0" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Find trusted mechanics{' '}
                <span className="text-primary-600">near you</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl leading-relaxed">
                Connect with verified mechanics, compare quotes in naira, and get your vehicle fixed without the guesswork, book, chat, and pay in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-gradient px-7 py-4 text-base">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/for-mechanics"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-primary-600/25 text-primary-800 rounded-xl font-semibold bg-white/80 hover:bg-primary-50/90 hover:border-primary-500/40 transition-all shadow-sm"
                >
                  For mechanics
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-up animate-delay-200 opacity-0 [animation-fill-mode:forwards]">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-200/40 via-transparent to-accent-200/30 rounded-[2rem] blur-2xl pointer-events-none" aria-hidden />
              <div className="relative rounded-3xl p-1.5 bg-gradient-to-br from-primary-100 via-white to-accent-50 shadow-lift">
                <img
                  src={HERO_IMAGE}
                  alt="Mechanic working on a car"
                  className="rounded-[1.35rem] w-full object-cover aspect-[4/3] shadow-inner ring-1 ring-slate-900/5"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored to you */}
      <section className="py-16 md:py-24 bg-white/80" aria-labelledby="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 md:mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">Why drivers choose us</p>
            <h2 id="features" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              Tailored to your situation
            </h2>
            <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
              Every driver and every vehicle is different. We help you find the right mechanic and a process that fits.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {FEATURES.map(({ title, desc, Icon }, i) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-6 shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                <span className="absolute top-4 right-4 text-5xl font-bold text-slate-100 select-none pointer-events-none" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the process works */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#f2f7f4] to-white" aria-labelledby="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 md:mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">Simple flow</p>
            <h2 id="how-it-works" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              How the process works
            </h2>
            <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
              Add your vehicle, find mechanics, book and chat, then pay and rate. Each step builds on the last.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map((item) => (
              <div key={item.num} className="relative flex flex-col gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white font-bold text-lg shadow-glow">
                  {item.num}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-white" aria-labelledby="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 md:mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">For everyone</p>
            <h2 id="benefits" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              What you get from the platform
            </h2>
            <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
              Whether you’re a vehicle owner or a mechanic, here’s how the platform helps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group rounded-3xl border border-slate-200/80 overflow-hidden bg-white shadow-card hover:shadow-lift transition-all duration-300">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={BENEFIT_IMAGES.owner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-7 md:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">For vehicle owners</h3>
                <p className="text-slate-600 leading-relaxed">
                  Find verified mechanics near you, compare quotes in naira, book and chat in one place, and pay when the job is done. No more guessing who to trust.
                </p>
              </div>
            </div>
            <div className="group rounded-3xl border border-slate-200/80 overflow-hidden bg-white shadow-card hover:shadow-lift transition-all duration-300">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={BENEFIT_IMAGES.mechanic} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-7 md:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">For mechanics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get serious repair requests in your area, submit quotes, and get paid through the platform. Build your reputation with real reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why we do this */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-primary-900 text-white relative overflow-hidden" aria-labelledby="why">
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-400/40 via-transparent to-transparent" aria-hidden />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 id="why" className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Why we do this
          </h2>
          <p className="text-primary-50/95 leading-relaxed mb-6 text-lg">
            Finding a reliable mechanic shouldn’t depend on who you know or where you live. We believe everyone should be able to get transparent, fair car repairs, so we built a place where you can see who’s nearby, compare prices in naira, and book with confidence.
          </p>
          <p className="text-primary-100/90 leading-relaxed">
            We don’t promise miracles. We focus on clear processes, verified mechanics, and real feedback, so you can make a decision and get back on the road.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 md:py-24 bg-white" aria-labelledby="stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center px-6 py-8 rounded-3xl bg-gradient-to-b from-accent-50 to-white border border-accent-100 shadow-soft">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent tabular-nums tracking-tight">
                89%
              </p>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xs mx-auto">
                of users find a mechanic and complete a booking
              </p>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-8 rounded-3xl bg-gradient-to-b from-primary-50 to-white border border-primary-100 shadow-soft">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent tabular-nums tracking-tight">
                1,200+
              </p>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xs mx-auto">
                people from different regions already use the platform
              </p>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-8 rounded-3xl bg-gradient-to-b from-accent-50 to-white border border-accent-100 shadow-soft">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums tracking-tight">
                <span className="bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent">4.6</span>
                <span className="text-slate-400 font-semibold text-2xl sm:text-3xl md:text-4xl mx-1">/</span>
                <span className="text-slate-700">5</span>
              </p>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xs mx-auto flex flex-wrap items-center justify-center gap-1.5">
                <Star className="h-4 w-4 fill-accent-500 text-accent-500 shrink-0" aria-hidden />
                <span>average rating from real feedback</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-16 md:py-24 bg-[#f2f7f4]" aria-labelledby="outcomes">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 id="outcomes" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              What you can expect
            </h2>
            <p className="text-slate-600 text-lg">Real outcomes from using the platform. Measurable, practical results.</p>
          </div>
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-soft space-y-6">
            {OUTCOMES.map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-800">{label}</span>
                  <span className="text-primary-700 font-bold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-700"
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
          <div className="mb-12 md:mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">Social proof</p>
            <h2 id="testimonials" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              What people say
            </h2>
            <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">Real stories from customers and mechanics on the platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200/80 p-6 md:p-7 bg-gradient-to-b from-white to-slate-50/80 shadow-card hover:shadow-lift transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent-500 text-accent-500" />
                  ))}
                </div>
                <blockquote className="text-slate-700 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary-100 shadow-sm" />
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 md:py-24 overflow-hidden" aria-labelledby="cta">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900" aria-hidden />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,_rgba(230,131,36,0.35),_transparent)]" aria-hidden />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta" className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-primary-100/95 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
            Join drivers and mechanics who use one clear flow, from quote to paid job.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg shadow-primary-950/20"
          >
            Sign up now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
