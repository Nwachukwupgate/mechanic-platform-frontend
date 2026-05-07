import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { SectionLabel } from '../../components/SectionLabel'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'MECHANIC']),
})

type LoginFormData = z.infer<typeof loginSchema>

const fieldClass =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500'

export default function Login() {
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'USER',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      const response = data.role === 'USER'
        ? await authAPI.loginUser(data.email, data.password)
        : await authAPI.loginMechanic(data.email, data.password)
      
      // Ensure we have the correct response structure
      const user = response.data.user
      const token = response.data.access_token

      console.log("user", user, token)
      
      if (!user || !token) {
        setError('Invalid response from server. Please try again.')
        return
      }
      
      // Ensure user has role set correctly
      if (!user.role) {
        user.role = data.role
      }
      
      // Use the setAuth function from the store - this uses the internal set() function
      // which properly triggers the persist middleware
      const setAuth = useAuthStore.getState().setAuth
      setAuth(user, token)
      
      // Verify state is set immediately (Zustand updates are synchronous)
      const currentUser = useAuthStore.getState().user
      const currentToken = useAuthStore.getState().token
      
      console.log('After setAuth - user:', currentUser, 'token:', currentToken)
      
      // Also check localStorage directly after a brief delay
      setTimeout(() => {
        const stored = localStorage.getItem('auth-storage')
        console.log('localStorage after setAuth:', stored)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            console.log('Parsed localStorage:', parsed)
            if (parsed?.state?.user && parsed?.state?.token) {
              console.log('✅ State successfully persisted to localStorage')
            } else {
              console.error('❌ State not persisted correctly:', parsed)
            }
          } catch (e) {
            console.error('Error parsing localStorage:', e)
          }
        } else {
          console.error('❌ Nothing found in localStorage')
        }
      }, 100)
      
      if (currentUser && currentToken) {
        // Small delay to ensure persist middleware writes to localStorage
        setTimeout(() => {
          navigate(data.role === 'USER' ? '/user' : '/mechanic', { replace: true })
        }, 150)
      } else {
        console.error('State not set correctly after setAuth')
        setError('Failed to save authentication. Please try again.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f2f7f4] flex items-center justify-center py-12 px-4 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(59,130,246,0.06),transparent_50%)]"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="card px-6 sm:px-8 pt-8 pb-8">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center gap-3 no-underline text-inherit">
              <img
                src="/logo.png"
                alt=""
                className="h-12 w-12 rounded-xl object-cover shadow-md ring-2 ring-white"
              />
            </Link>
            <div className="mt-5 flex justify-center">
              <SectionLabel>Sign in</SectionLabel>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to book mechanics and manage your account.</p>
          </div>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              I am a
            </label>
            <select {...register('role')} className={fieldClass}>
              <option value="USER">User</option>
              <option value="MECHANIC">Mechanic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input type="email" {...register('email')} className={fieldClass} autoComplete="email" />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`${fieldClass} pr-10`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded-lg"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gradient w-full justify-center py-3.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in…
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
