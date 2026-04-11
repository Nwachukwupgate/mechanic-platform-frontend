import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../services/api'
import { SectionLabel } from '../../components/SectionLabel'

const fieldClass =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500'

const userRegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.literal('USER'),
})

const mechanicRegisterSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  ownerFullName: z.string().min(1, 'Owner full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.literal('MECHANIC'),
})

type UserRegisterFormData = z.infer<typeof userRegisterSchema>
type MechanicRegisterFormData = z.infer<typeof mechanicRegisterSchema>

export default function Register() {
  const [role, setRole] = useState<'USER' | 'MECHANIC'>('USER')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const userForm = useForm<UserRegisterFormData>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      role: 'USER',
    },
  })

  const mechanicForm = useForm<MechanicRegisterFormData>({
    resolver: zodResolver(mechanicRegisterSchema),
    defaultValues: {
      role: 'MECHANIC',
    },
  })

  const onSubmitUser = async (data: UserRegisterFormData) => {
    try {
      setError('')
      await authAPI.registerUser(data)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  const onSubmitMechanic = async (data: MechanicRegisterFormData) => {
    try {
      setError('')
      await authAPI.registerMechanic(data)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen bg-[#f2f7f4] flex items-center justify-center py-12 px-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(59,130,246,0.06),transparent_50%)]"
        />
        <div className="relative z-10 w-full max-w-md">
          <div className="card overflow-hidden text-center p-8 sm:p-10 bg-gradient-to-br from-primary-50/90 via-white to-slate-50/80 border-primary-100/60">
            <div className="flex justify-center mb-4">
              <SectionLabel>Success</SectionLabel>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">You&apos;re almost there</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Check your email to verify your account, then sign in.
            </p>
            <p className="mt-4 text-xs text-slate-500">Redirecting to login…</p>
          </div>
        </div>
      </div>
    )
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
              <SectionLabel>Create account</SectionLabel>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sign up</h1>
            <p className="mt-1 text-sm text-slate-500">Join as a car owner or a mechanic workshop.</p>
          </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            I am a
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'USER' | 'MECHANIC')}
            className={fieldClass}
          >
            <option value="USER">User</option>
            <option value="MECHANIC">Mechanic</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {role === 'USER' ? (
          <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...userForm.register('firstName')}
                className={fieldClass}
              />
              {userForm.formState.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...userForm.register('lastName')}
                className={fieldClass}
              />
              {userForm.formState.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...userForm.register('email')}
                className={fieldClass}
              />
              {userForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...userForm.register('dateOfBirth')}
                className={fieldClass}
              />
              {userForm.formState.errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...userForm.register('password')}
                  className={`${fieldClass} pr-10`}
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
              {userForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={userForm.formState.isSubmitting}
              className="btn-gradient w-full justify-center py-3.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {userForm.formState.isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering…
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={mechanicForm.handleSubmit(onSubmitMechanic)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                {...mechanicForm.register('companyName')}
                className={fieldClass}
              />
              {mechanicForm.formState.errors.companyName && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                {...mechanicForm.register('ownerFullName')}
                className={fieldClass}
              />
              {mechanicForm.formState.errors.ownerFullName && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.ownerFullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...mechanicForm.register('email')}
                className={fieldClass}
              />
              {mechanicForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...mechanicForm.register('password')}
                  className={`${fieldClass} pr-10`}
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
              {mechanicForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mechanicForm.formState.isSubmitting}
              className="btn-gradient w-full justify-center py-3.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {mechanicForm.formState.isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering…
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Login
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
