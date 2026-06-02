import { useState, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mechanicsAPI, getApiErrorMessage, isPropertyNotAllowedError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { reverseGeocode } from '../../services/geocoding'
import { MECHANIC_VEHICLE_TYPES, EXPERTISE_OPTIONS, CAR_BRANDS } from '../../constants/vehicles'
import {
  Upload,
  FileText,
  X,
  MapPin,
  User,
  Trash2,
  ImagePlus,
  Sun,
  Moon,
  ShieldCheck,
  Wrench,
  UserCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { ProfileFold } from '../../components/ProfileFold'

const MAX_AVATAR_BYTES = 10 * 1024 * 1024

type ProfileForm = {
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  bio: string
  typicalResponseHours: string
  nextAvailableNote: string
  experience: string
  workshopAddress: string
  nin: string
  guarantorName: string
  guarantorPhone: string
  guarantorAddress: string
  vehicleTypes: string[]
  expertise: string[]
  brands: string[]
}

export default function MechanicProfile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState(true)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [certificateUploading, setCertificateUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [workshopLocation, setWorkshopLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [workshopLocationAddress, setWorkshopLocationAddress] = useState<string | null>(null)
  const [workshopAddressLoading, setWorkshopAddressLoading] = useState(false)
  const [workshopLocationLoading, setWorkshopLocationLoading] = useState(false)
  const [workshopLocationError, setWorkshopLocationError] = useState<string | null>(null)
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const workshopLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, setValue, watch, reset } = useForm<ProfileForm>({
    defaultValues: {
      vehicleTypes: [],
      expertise: [],
      brands: [],
      typicalResponseHours: '',
      nextAvailableNote: '',
    },
  })

  const watchedVehicleTypes = watch('vehicleTypes') || []
  const watchedExpertise = watch('expertise') || []
  const watchedBrands = watch('brands') || []
  const watchedBio = watch('bio') || ''
  const watchedReply = watch('typicalResponseHours') || ''

  const stats = profile?.stats as
    | { averageRating: number | null; ratingCount: number; jobsCompleted: number; quoteWinRate: number | null }
    | undefined

  const [sectionOpen, setSectionOpen] = useState({
    account: true,
    workshop: true,
    visibility: true,
    documents: true,
  })
  const [sectionsSeeded, setSectionsSeeded] = useState(false)

  const profileStrength = useMemo(() => {
    const hasPhoto = !!avatarUrl
    const hasCert = !!certificateUrl
    const hasWorkshop = !!(workshopLocation || (profile?.profile?.latitude != null && profile?.profile?.longitude != null))
    const hasReply = !!String(watchedReply).trim()
    const hasBio = watchedBio.trim().length >= 20
    const items = [
      { id: 'photo', label: 'Workshop photo', done: hasPhoto },
      { id: 'cert', label: 'Certificate', done: hasCert },
      { id: 'loc', label: 'Workshop location', done: hasWorkshop },
      { id: 'reply', label: 'Reply time', done: hasReply },
      { id: 'bio', label: 'Bio (20+ chars)', done: hasBio },
    ]
    return { items, done: items.filter((i) => i.done).length, total: items.length }
  }, [avatarUrl, certificateUrl, workshopLocation, profile, watchedReply, watchedBio])

  const toggleSection = (key: keyof typeof sectionOpen) => {
    setSectionOpen((s) => ({ ...s, [key]: !s[key] }))
  }

  const openStrengthSection = (id: string) => {
    if (id === 'photo' || id === 'cert') {
      setSectionOpen((s) => ({ ...s, documents: true, account: id === 'photo' ? true : s.account }))
    } else if (id === 'loc') {
      setSectionOpen((s) => ({ ...s, workshop: true }))
    } else {
      setSectionOpen((s) => ({ ...s, visibility: true }))
    }
  }

  const reloadProfile = () => {
    setLoading(true)
    mechanicsAPI
      .getProfile()
      .then((res) => {
        const data = res.data
        setProfile(data)
        const profileData = data?.profile
        if (profileData) {
          setValue('phone', profileData.phone || '')
          setValue('address', profileData.address || '')
          setValue('city', profileData.city || '')
          setValue('state', profileData.state || '')
          setValue('zipCode', profileData.zipCode || '')
          setValue('bio', profileData.bio || '')
          setValue(
            'typicalResponseHours',
            profileData.typicalResponseHours != null ? String(profileData.typicalResponseHours) : ''
          )
          setValue('nextAvailableNote', profileData.nextAvailableNote || '')
          setValue('experience', profileData.experience || '')
          setValue('workshopAddress', profileData.workshopAddress || '')
          setValue('nin', profileData.nin || '')
          setValue('guarantorName', profileData.guarantorName || '')
          setValue('guarantorPhone', profileData.guarantorPhone || '')
          setValue('guarantorAddress', profileData.guarantorAddress || '')
          setValue('vehicleTypes', Array.isArray(profileData.vehicleTypes) ? profileData.vehicleTypes : [])
          setValue('expertise', Array.isArray(profileData.expertise) ? profileData.expertise : [])
          setValue('brands', Array.isArray(profileData.brands) ? profileData.brands : [])
          setCertificateUrl(profileData.certificateUrl || null)
          setAvatarUrl(profileData.avatar ?? profileData.avatarUrl ?? null)
          setAvailability(profileData.availability ?? true)
          if (profileData.latitude != null && profileData.longitude != null) {
            const loc = { lat: profileData.latitude, lng: profileData.longitude }
            setWorkshopLocation(loc)
            workshopLocationRef.current = loc
            setWorkshopAddressLoading(true)
            reverseGeocode(loc.lat, loc.lng)
              .then(setWorkshopLocationAddress)
              .catch(() => setWorkshopLocationAddress(null))
              .finally(() => setWorkshopAddressLoading(false))
          } else {
            setWorkshopLocation(null)
            setWorkshopLocationAddress(null)
            workshopLocationRef.current = null
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    mechanicsAPI
      .getProfile()
      .then((res) => {
        const data = res.data
        setProfile(data)
        const profileData = data?.profile
        if (profileData) {
          setValue('phone', profileData.phone || '')
          setValue('address', profileData.address || '')
          setValue('city', profileData.city || '')
          setValue('state', profileData.state || '')
          setValue('zipCode', profileData.zipCode || '')
          setValue('bio', profileData.bio || '')
          setValue(
            'typicalResponseHours',
            profileData.typicalResponseHours != null ? String(profileData.typicalResponseHours) : ''
          )
          setValue('nextAvailableNote', profileData.nextAvailableNote || '')
          setValue('experience', profileData.experience || '')
          setValue('workshopAddress', profileData.workshopAddress || '')
          setValue('nin', profileData.nin || '')
          setValue('guarantorName', profileData.guarantorName || '')
          setValue('guarantorPhone', profileData.guarantorPhone || '')
          setValue('guarantorAddress', profileData.guarantorAddress || '')
          setValue('vehicleTypes', Array.isArray(profileData.vehicleTypes) ? profileData.vehicleTypes : [])
          setValue('expertise', Array.isArray(profileData.expertise) ? profileData.expertise : [])
          setValue('brands', Array.isArray(profileData.brands) ? profileData.brands : [])
          setCertificateUrl(profileData.certificateUrl || null)
          setAvatarUrl(profileData.avatar ?? profileData.avatarUrl ?? null)
          setAvailability(profileData.availability ?? true)
          if (profileData.latitude != null && profileData.longitude != null) {
            const loc = { lat: profileData.latitude, lng: profileData.longitude }
            setWorkshopLocation(loc)
            workshopLocationRef.current = loc
            setWorkshopAddressLoading(true)
            reverseGeocode(loc.lat, loc.lng)
              .then(setWorkshopLocationAddress)
              .catch(() => setWorkshopLocationAddress(null))
              .finally(() => setWorkshopAddressLoading(false))
          } else {
            setWorkshopLocation(null)
            setWorkshopLocationAddress(null)
            workshopLocationRef.current = null
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [setValue])

  useEffect(() => {
    if (!profile || sectionsSeeded) return
    const pd = profile.profile
    const hasWorkshop =
      (pd?.latitude != null && pd?.longitude != null) ||
      !!(pd?.workshopAddress && String(pd.workshopAddress).trim())
    const hasServices =
      Array.isArray(pd?.vehicleTypes) &&
      pd.vehicleTypes.length > 0 &&
      Array.isArray(pd?.expertise) &&
      pd.expertise.length > 0
    const customersOk =
      String(pd?.bio || '').trim().length >= 20 &&
      pd?.typicalResponseHours != null &&
      String(pd.typicalResponseHours).trim() !== ''
    const docsOk = !!(pd?.avatar || pd?.avatarUrl) && !!pd?.certificateUrl
    setSectionOpen({
      account: true,
      visibility: !customersOk,
      workshop: !(hasWorkshop && hasServices),
      documents: !docsOk,
    })
    setSectionsSeeded(true)
  }, [profile, sectionsSeeded])

  const toggleArrayValue = (field: 'vehicleTypes' | 'expertise' | 'brands', value: string) => {
    const current =
      field === 'vehicleTypes'
        ? watchedVehicleTypes
        : field === 'expertise'
          ? watchedExpertise
          : watchedBrands
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value]
    setValue(field, next)
  }

  const uploadCertificateFile = async (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF and images (JPEG, PNG) are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setCertificateUploading(true)
    try {
      const res = await mechanicsAPI.uploadCertificate(file)
      setCertificateUrl(res.data.certificateUrl)
      toast.success('Certificate uploaded')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload certificate'))
    } finally {
      setCertificateUploading(false)
    }
  }

  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadCertificateFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeCertificate = () => {
    setCertificateUrl(null)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error('Please use JPEG, PNG or WebP images')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Photo must be under 10MB')
      return
    }
    setAvatarUploading(true)
    try {
      const res = await mechanicsAPI.uploadAvatar(file)
      setAvatarUrl(res.data.avatarUrl)
      toast.success('Photo updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload photo'))
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const removeAvatar = () => {
    setAvatarUrl(null)
  }

  const getWorkshopLocation = (isRetry = false) => {
    if (!navigator.geolocation) {
      setWorkshopLocationError('Location is not supported by your browser.')
      return
    }
    if (!isRetry) {
      setWorkshopLocationError(null)
      setWorkshopLocationLoading(true)
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        workshopLocationRef.current = loc
        setWorkshopLocation(loc)
        setWorkshopLocationLoading(false)
        setWorkshopLocationError(null)
        setWorkshopAddressLoading(true)
        reverseGeocode(loc.lat, loc.lng)
          .then((addr) => {
            setWorkshopLocationAddress(addr)
            setWorkshopAddressLoading(false)
          })
          .catch(() => {
            setWorkshopLocationAddress(null)
            setWorkshopAddressLoading(false)
          })
        toast.success('Workshop location set. You’ll appear in nearby search')
      },
      (error: GeolocationPositionError) => {
        const canRetry = error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT
        if (!isRetry && canRetry) {
          setTimeout(() => getWorkshopLocation(true), 1500)
          return
        }
        setWorkshopLocationLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          setWorkshopLocationError('Location denied. Allow location and try again.')
        } else {
          setWorkshopLocationError('Could not get location. Try again.')
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 }
    )
  }

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      await mechanicsAPI.deleteAccount()
      setDeleteConfirmOpen(false)
      toast.success('Your workshop account has been removed')
      logout()
      navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete account'))
    } finally {
      setDeletingAccount(false)
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    try {
      setProfileUpdating(true)
      const latestLoc = workshopLocationRef.current ?? workshopLocation
      const payload = {
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bio: data.bio,
        typicalResponseHours:
          data.typicalResponseHours.trim() === ''
            ? null
            : (() => {
                const n = Number(data.typicalResponseHours)
                return Number.isFinite(n) && n > 0 ? n : null
              })(),
        nextAvailableNote: data.nextAvailableNote.trim() || null,
        experience: data.experience,
        workshopAddress: data.workshopAddress,
        latitude: latestLoc?.lat ?? null,
        longitude: latestLoc?.lng ?? null,
        nin: data.nin,
        guarantorName: data.guarantorName,
        guarantorPhone: data.guarantorPhone,
        guarantorAddress: data.guarantorAddress,
        vehicleTypes: data.vehicleTypes.length ? data.vehicleTypes : watchedVehicleTypes,
        expertise: data.expertise.length ? data.expertise : watchedExpertise,
        brands: data.brands?.length ? data.brands : watchedBrands,
        certificateUrl: certificateUrl ?? null,
        avatar: avatarUrl ?? null,
      }
      try {
        await mechanicsAPI.updateProfile(payload)
        toast.success('Profile updated successfully')
      } catch (firstError) {
        if (isPropertyNotAllowedError(firstError, 'brands')) {
          const { brands: _b, ...payloadWithoutBrands } = payload as typeof payload & { brands?: unknown }
          await mechanicsAPI.updateProfile(payloadWithoutBrands)
          toast.success('Profile updated. Car brands could not be saved (server does not support this yet).')
        } else if (
          isPropertyNotAllowedError(firstError, 'typicalResponseHours') ||
          isPropertyNotAllowedError(firstError, 'nextAvailableNote')
        ) {
          const {
            typicalResponseHours: _h,
            nextAvailableNote: _n,
            ...payloadWithoutAvailabilityFields
          } = payload
          await mechanicsAPI.updateProfile(payloadWithoutAvailabilityFields)
          toast.success(
            'Profile updated. Reply-time fields could not be saved. Update the API or redeploy the latest backend.'
          )
        } else {
          throw firstError
        }
      }
      reset({
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bio: data.bio,
        typicalResponseHours: data.typicalResponseHours,
        nextAvailableNote: data.nextAvailableNote,
        experience: data.experience,
        workshopAddress: data.workshopAddress,
        nin: data.nin,
        guarantorName: data.guarantorName,
        guarantorPhone: data.guarantorPhone,
        guarantorAddress: data.guarantorAddress,
        vehicleTypes: payload.vehicleTypes,
        expertise: payload.expertise,
        brands: payload.brands ?? [],
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update profile'))
    } finally {
      setProfileUpdating(false)
    }
  }

  const toggleAvailability = async () => {
    setAvailabilityUpdating(true)
    try {
      await mechanicsAPI.updateAvailability(!availability)
      setAvailability(!availability)
      toast.success(availability ? 'Marked unavailable' : 'Marked available')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update availability'))
    } finally {
      setAvailabilityUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-40 rounded-2xl bg-gradient-to-br from-primary-100/80 to-slate-100" />
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-64 rounded-xl bg-slate-50 border border-slate-100" />
      </div>
    )
  }

  const ratingLabel =
    stats && stats.ratingCount > 0 && stats.averageRating != null ? `${stats.averageRating} \u2605` : ''
  const jobsLabel = stats != null ? String(stats.jobsCompleted) : ''
  const winLabel = stats?.quoteWinRate != null ? `${stats.quoteWinRate}%` : ''

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm mb-6 bg-gradient-to-br from-primary-50 via-white to-slate-50">
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 h-24 w-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{profile?.companyName || 'Your workshop'}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {[profile?.ownerFullName, profile?.email].filter(Boolean).join(' · ') || ''}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
              <Wrench className="h-3.5 w-3.5" />
              Mechanic
            </span>
            {profile?.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-900">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Verification pending
              </span>
            )}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-white/90 border border-slate-100 p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{ratingLabel}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Rating</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-lg font-bold text-slate-900">{jobsLabel}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Jobs done</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{winLabel}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Quote wins</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => reloadProfile()}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh stats
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900">Profile strength</h2>
          <span className="ml-auto text-sm font-bold text-primary-700">
            {profileStrength.done}/{profileStrength.total}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${(profileStrength.done / profileStrength.total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {profileStrength.items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => openStrengthSection(it.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                it.done
                  ? 'border-primary-200 bg-primary-50 text-primary-900'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-200'
              }`}
            >
              {it.done ? '\u2713' : '\u25cb'} {it.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            {availability ? (
              <Sun className="h-6 w-6 text-primary-600 shrink-0 mt-0.5" />
            ) : (
              <Moon className="h-6 w-6 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Taking new jobs</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {availability
                  ? 'You appear in search and can receive direct requests.'
                  : 'You are hidden from search until you mark yourself available again.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAvailability}
            disabled={availabilityUpdating}
            className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-[0.98] ${
              availability ? 'bg-primary-100 text-primary-900' : 'bg-slate-100 text-slate-800'
            } disabled:opacity-60`}
          >
            {availabilityUpdating ? 'Updating…' : availability ? 'Available' : 'Unavailable'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ProfileFold
            title="Account & contact"
            icon={UserCircle}
            open={sectionOpen.account}
            onToggle={() => toggleSection('account')}
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={profile?.companyName || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              value={profile?.ownerFullName || ''}
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
              Your photo
            </label>
            <p className="text-xs text-gray-500 mb-2">Shown to users when they search for mechanics. JPEG, PNG or WebP, max 10MB.</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {avatarUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Your photo"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="text-sm text-primary-600 hover:underline disabled:opacity-50"
                  >
                    {avatarUploading ? 'Uploading…' : 'Change photo'}
                  </button>
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <User className="h-5 w-5 text-gray-500" />
                {avatarUploading ? 'Uploading…' : 'Upload photo'}
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 5 years, 10+ years"
              {...register('experience')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          </ProfileFold>

          <ProfileFold
            title="Workshop & services"
            icon={MapPin}
            open={sectionOpen.workshop}
            onToggle={() => toggleSection('workshop')}
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of vehicle(s) you work on <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MECHANIC_VEHICLE_TYPES.map((v) => (
                <label key={v} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedVehicleTypes.includes(v)}
                    onChange={() => toggleArrayValue('vehicleTypes', v)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Car brands you work on <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Select the brands you can service (e.g. Toyota, Honda). Helps match you to the right requests.</p>
            <div className="flex flex-wrap gap-2">
              {CAR_BRANDS.map((b) => (
                <label key={b} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedBrands.includes(b)}
                    onChange={() => toggleArrayValue('brands', b)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{b}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location of workshop <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Full workshop address"
              {...register('workshopAddress')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1 mb-2">
              Set your workshop coordinates so you appear in “Find Mechanics” when users search nearby.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => getWorkshopLocation()}
                disabled={workshopLocationLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-60 text-sm"
              >
                <MapPin className="h-4 w-4 text-gray-600" />
                {workshopLocationLoading ? 'Getting location…' : 'Use my location (at workshop)'}
              </button>
              {workshopLocation && !workshopLocationLoading && (
                <span className="text-sm text-primary-700">
                  ✓ {workshopAddressLoading
                    ? 'Getting address…'
                    : workshopLocationAddress || 'Location set'}
                </span>
              )}
            </div>
            {workshopLocationError && (
              <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                {workshopLocationError}
              </p>
            )}
          </div>
          </ProfileFold>

          <ProfileFold
            title="Documents & compliance"
            icon={FileText}
            open={sectionOpen.documents}
            onToggle={() => toggleSection('documents')}
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">PDF or clear photo of your certificate. Max 5MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={handleCertificateChange}
              className="sr-only"
            />
            {certificateUrl ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-100">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 font-medium hover:underline truncate flex-1 min-w-0"
                >
                  View uploaded certificate
                </a>
                <button
                  type="button"
                  onClick={removeCertificate}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                  title="Remove"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => !certificateUploading && fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const f = e.dataTransfer.files?.[0]
                  if (f) void uploadCertificateFile(f)
                }}
                className={`relative rounded-2xl border-2 border-dashed border-primary-200/90 bg-gradient-to-br from-primary-50/50 via-white to-slate-50/40 px-4 py-8 text-center transition-colors hover:border-primary-300 ${
                  certificateUploading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-primary-100">
                    <ImagePlus className="h-7 w-7 text-primary-600" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {certificateUploading ? 'Uploading…' : 'Drop certificate here or tap to browse'}
                  </p>
                  <p className="text-xs text-slate-500">PDF, JPEG, or PNG · up to 5MB</p>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary-700">
                    <Upload className="h-3.5 w-3.5" />
                    Choose file
                  </span>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIN (National ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('nin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Guarantor</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('guarantorName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('guarantorPhone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('guarantorAddress')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          </ProfileFold>

          <ProfileFold
            title="Expertise & visibility"
            icon={Sparkles}
            badge="Trust"
            open={sectionOpen.visibility}
            onToggle={() => toggleSection('visibility')}
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expertise (AC, Electrical, Mechanical, etc.) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Mechanical covers engine, brakes and transmission.</p>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((e) => (
                <label key={e} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedExpertise.includes(e)}
                    onChange={() => toggleArrayValue('expertise', e)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{e}</span>
                </label>
              ))}
            </div>
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                {...register('state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              {...register('zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">How customers see you</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usually replies within (hours, optional)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  step={1}
                  placeholder="e.g. 4"
                  {...register('typicalResponseHours')}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Shown on direct requests so customers know what to expect.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next availability note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Earliest slot: tomorrow afternoon"
                  {...register('nextAvailableNote')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              {...register('bio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          </div>
          </ProfileFold>

          <button
            type="submit"
            disabled={profileUpdating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {profileUpdating ? (
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

      <div className="mt-8 rounded-lg border border-red-100 bg-red-50/90 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Account</h2>
        <p className="text-sm text-slate-600 mb-4">
          Need to leave the platform? Your profile and bank details will be removed. Past bookings and ratings may
          be kept for records. You will be signed out. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={deletingAccount}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          {deletingAccount ? 'Deleting…' : 'Delete account'}
        </button>
      </div>

      {deleteConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete your account?</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Your profile and bank details will be removed. Past bookings and ratings may be kept for records. You
              will be signed out. This cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deletingAccount}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteAccount()}
                disabled={deletingAccount}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {deletingAccount ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete account'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
