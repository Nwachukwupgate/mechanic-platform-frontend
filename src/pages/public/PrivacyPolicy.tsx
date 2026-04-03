import { Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'

export default function PrivacyPolicy() {
  const updated = 'March 30, 2026'

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-6">
            <Shield className="h-8 w-8 text-white" aria-hidden />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Privacy policy</h1>
          <p className="text-primary-100 text-sm md:text-base">
            Last updated: {updated}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-headings:text-slate-800">
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            Denicksen Auto (“we”, “us”, “our”) operates the Mechanic Platform website and related services. This
            policy explains how we collect, use, and protect your personal information when you use our platform as a
            vehicle owner or a mechanic.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">1. Information we collect</h2>
          <ul className="list-disc pl-5 text-slate-600 space-y-2 text-[15px] md:text-base">
            <li>
              <strong className="text-slate-700">Account data:</strong> name, email address, phone number, date of birth
              (where applicable), and password (stored securely; we never store plain-text passwords).
            </li>
            <li>
              <strong className="text-slate-700">Profile &amp; vehicle data:</strong> address, vehicle details, workshop
              location, certifications, and other information you choose to add to your profile.
            </li>
            <li>
              <strong className="text-slate-700">Booking &amp; payment data:</strong> job descriptions, quotes, chat
              messages related to bookings, and payment references processed through our payment partners.
            </li>
            <li>
              <strong className="text-slate-700">Technical data:</strong> device type, browser, approximate location
              when you use location features, and logs needed to operate and secure the service.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">2. How we use your information</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            We use this information to create and manage your account, match users with mechanics, process payments,
            send service-related notifications, improve our platform, comply with legal obligations, and detect fraud or
            misuse.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">3. Sharing of information</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            We may share data with payment processors, cloud hosting providers, and other service providers who assist
            us in running the platform, subject to contracts that protect your information. We may disclose information
            if required by law or to protect the rights and safety of our users and the public.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">4. Data retention &amp; deletion</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            We retain information for as long as your account is active and as needed to provide services, meet legal
            requirements, and resolve disputes. You may request account deletion where available in the app; some
            records may be retained in anonymized or aggregated form for legitimate business or legal reasons.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">5. Security</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            We use industry-standard measures to protect your data. No method of transmission over the internet is
            completely secure; we encourage you to use a strong password and protect your login credentials.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">6. Your rights</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            Depending on where you live, you may have rights to access, correct, or delete your personal data, or to
            object to certain processing. Contact us using the details below to make a request.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">7. Changes to this policy</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            We may update this policy from time to time. We will post the revised version on this page and update the
            “Last updated” date. Continued use of the platform after changes constitutes acceptance of the updated
            policy.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">8. Contact</h2>
          <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
            For privacy-related questions, please contact us through the support options available in the app or on our
            website.
          </p>
        </div>
      </section>

      <section className="py-12 bg-primary-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-100 mb-4">Questions? See our FAQ or get in touch.</p>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            Visit FAQ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
