import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl sm:text-8xl font-extrabold text-slate-200 select-none" aria-hidden>
        404
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 -mt-4 mb-3">Page not found</h1>
      <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
        The page you’re looking for doesn’t exist or may have been moved. Check the URL or go back to the homepage.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-soft transition-colors"
        >
          <Home className="h-4 w-4 shrink-0" />
          Back to home
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Go back
        </button>
      </div>
    </div>
  )
}
