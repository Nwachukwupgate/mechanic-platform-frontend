import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, getApiErrorMessage } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.loginAdmin(email.trim(), password)
      const user = res.data.user
      const token = res.data.access_token
      if (!user || !token || user.role !== 'ADMIN') {
        setError('Not an admin account.')
        return
      }
      setAuth(user, token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Sign in failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Operations</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Admin sign in</h1>
        <p className="text-sm text-slate-600 mt-2">Full visibility into bookings, payments, and platform activity.</p>
        {error ? <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p> : null}
        <label className="block mt-6 text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
        />
        <label className="block mt-4 text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
