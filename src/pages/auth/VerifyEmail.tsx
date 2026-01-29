import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const role = searchParams.get('role')

    if (!token || !role) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    authAPI
      .verifyEmail(token, role)
      .then(() => {
        setStatus('success')
        setMessage('Email verified successfully! You can now login.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      })
      .catch(() => {
        setStatus('error')
        setMessage('Verification failed. The link may be invalid or expired.')
      })
  }, [searchParams, navigate])

  return (
    <div className="max-w-md mx-auto py-12">
      <div
        className={`rounded-lg p-6 text-center ${
          status === 'success'
            ? 'bg-green-50 border border-green-200'
            : status === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}
      >
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Email Verified!</h2>
            <p className="text-green-700">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-4xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-red-700">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
