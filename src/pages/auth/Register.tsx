import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authAPI } from '../../services/api'

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
      <div className="max-w-md mx-auto py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Registration Successful!</h2>
          <p className="text-green-700">
            Please check your email to verify your account before logging in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'USER' | 'MECHANIC')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USER">User</option>
            <option value="MECHANIC">Mechanic</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {role === 'USER' ? (
          <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...userForm.register('firstName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userForm.formState.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...userForm.register('lastName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userForm.formState.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...userForm.register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...userForm.register('dateOfBirth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userForm.formState.errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...userForm.register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {userForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={userForm.formState.isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                {...mechanicForm.register('companyName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mechanicForm.formState.errors.companyName && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                {...mechanicForm.register('ownerFullName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mechanicForm.formState.errors.ownerFullName && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.ownerFullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...mechanicForm.register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mechanicForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...mechanicForm.register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mechanicForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {mechanicForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mechanicForm.formState.isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
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

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
