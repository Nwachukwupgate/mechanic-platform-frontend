import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { mechanicsAPI, getApiErrorMessage, isPropertyNotAllowedError } from '../../services/api'
import { reverseGeocode } from '../../services/geocoding'
import LoadingSpinner from '../../components/LoadingSpinner'
import { MECHANIC_VEHICLE_TYPES, EXPERTISE_OPTIONS, CAR_BRANDS } from '../../constants/vehicles'
import { Upload, FileText, X, MapPin, User } from 'lucide-react'

type ProfileForm = {
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  bio: string
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
  const workshopLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, setValue, watch, reset } = useForm<ProfileForm>({
    defaultValues: {
      vehicleTypes: [],
      expertise: [],
      brands: [],
    },
  })

  const watchedVehicleTypes = watch('vehicleTypes') || []
  const watchedExpertise = watch('expertise') || []
  const watchedBrands = watch('brands') || []

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

  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
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
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload certificate'))
    } finally {
      setCertificateUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB')
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
        toast.success('Workshop location set — you’ll appear in nearby search')
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

  const onSubmit = async (data: ProfileForm) => {
    try {
      const latestLoc = workshopLocationRef.current ?? workshopLocation
      const payload = {
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bio: data.bio,
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
        // Production backend may not support "brands" yet — retry without it so the rest of the profile saves
        if (isPropertyNotAllowedError(firstError, 'brands')) {
          const { brands: _b, ...payloadWithoutBrands } = payload
          await mechanicsAPI.updateProfile(payloadWithoutBrands)
          toast.success('Profile updated. Car brands could not be saved (server does not support this yet).')
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
    }
  }

  const toggleAvailability = async () => {
    try {
      await mechanicsAPI.updateAvailability(!availability)
      setAvailability(!availability)
      toast.success(availability ? 'Marked unavailable' : 'Marked available')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update availability'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Availability</h2>
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-md ${
              availability
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {availability ? 'Available' : 'Unavailable'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <p className="text-xs text-gray-500 mb-2">Shown to users when they search for mechanics. JPEG, PNG or WebP, max 2MB.</p>
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
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <span className="text-sm text-green-700">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={handleCertificateChange}
              className="hidden"
            />
            {certificateUrl ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                <FileText className="h-5 w-5 text-gray-600" />
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline truncate flex-1"
                >
                  View certificate
                </a>
                <button
                  type="button"
                  onClick={removeCertificate}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={certificateUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {certificateUploading ? 'Uploading…' : 'Upload certificate (PDF or image)'}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-1">PDF or image, max 5MB</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIN (National ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('nin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('guarantorPhone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('guarantorAddress')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                {...register('state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              {...register('bio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  )
}
