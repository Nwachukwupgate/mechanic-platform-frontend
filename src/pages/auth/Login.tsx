import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'MECHANIC']),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const [error, setError] = useState('')
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
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User</option>
              <option value="MECHANIC">Mechanic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
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

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
