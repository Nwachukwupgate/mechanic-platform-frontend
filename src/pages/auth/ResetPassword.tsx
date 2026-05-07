import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authAPI, getApiErrorMessage } from '../../services/api'
import { SectionLabel } from '../../components/SectionLabel'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.enum(['USER', 'MECHANIC']),
  code: z.string().min(4, 'Enter reset code'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

const fieldClass =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      await authAPI.resetPassword(data)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not reset password'))
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f2f7f4] flex items-center justify-center py-12 px-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="card px-6 sm:px-8 pt-8 pb-8">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center gap-3 no-underline text-inherit">
              <img src="/logo.png" alt="" className="h-12 w-12 rounded-xl object-cover shadow-md ring-2 ring-white" />
            </Link>
            <div className="mt-5 flex justify-center">
              <SectionLabel>Set new password</SectionLabel>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              Password reset successful. Redirecting to login…
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">I am a</label>
              <select {...register('role')} className={fieldClass}>
                <option value="USER">User</option>
                <option value="MECHANIC">Mechanic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" {...register('email')} className={fieldClass} autoComplete="email" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reset code</label>
              <input type="text" {...register('code')} className={fieldClass} />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
              <input type="password" {...register('newPassword')} className={fieldClass} autoComplete="new-password" />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient w-full justify-center py-3.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
