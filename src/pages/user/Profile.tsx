import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { usersAPI, getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import Avatar from '../../components/Avatar'
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet'

export default function UserProfile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const { register, handleSubmit, setValue, reset } = useForm()

  useEffect(() => {
    usersAPI
      .getProfile()
      .then((res) => {
        setProfile(res.data)
        setValue('phone', res.data.profile?.phone || '')
        setValue('address', res.data.profile?.address || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [setValue])

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true)
      await usersAPI.updateProfile(data)
      toast.success('Profile updated successfully')
      reset(data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update profile'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAccount = async (payload: { reasons: string[]; otherReason?: string }) => {
    setDeletingAccount(true)
    try {
      await usersAPI.deleteAccount(payload)
      setDeleteSheetOpen(false)
      toast.success('Your account has been deleted')
      logout()
      navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete account'))
    } finally {
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Profile'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <Avatar name={fullName} size="lg" ring className="shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">{profile?.email}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profile?.firstName || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profile?.lastName || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              {...register('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating…
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl border border-red-100 bg-red-50/80 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Account</h2>
        <p className="text-sm text-slate-600 mb-4">
          Permanently delete your account and data. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteSheetOpen(true)}
          disabled={deletingAccount}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          {deletingAccount ? 'Deleting…' : 'Delete account'}
        </button>
      </div>

      <DeleteAccountSheet
        open={deleteSheetOpen}
        onClose={() => setDeleteSheetOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deletingAccount}
      />
    </div>
  )
}
