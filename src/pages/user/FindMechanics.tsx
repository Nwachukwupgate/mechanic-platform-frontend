import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { vehiclesAPI, faultsAPI, bookingsAPI, getApiErrorMessage } from '../../services/api'
import { reverseGeocode, searchAddress, type GeocodeSearchResult } from '../../services/geocoding'
import { MechanicsMap } from '../../components/MechanicsMap'
import {
  validateJobPostingInput,
  MIN_OPEN_JOB_DESCRIPTION_LENGTH,
  RECOMMENDED_JOB_PHOTOS,
} from '../../lib/jobPostingValidation'
import { MapPin, Star, CheckCircle2, User, List, Map, ImagePlus, X, Search, Navigation } from 'lucide-react'

const LOCATION_STORAGE_KEY = 'findMechanics:lastLocation'
const LOCATION_MAX_AGE_MS = 24 * 60 * 60 * 1000

function loadStoredLocation(): { lat: number; lng: number } | null {
  try {
    const raw = sessionStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as { lat: number; lng: number; t: number }
    if (
      !p ||
      typeof p.lat !== 'number' ||
      typeof p.lng !== 'number' ||
      typeof p.t !== 'number' ||
      !Number.isFinite(p.lat) ||
      !Number.isFinite(p.lng)
    ) {
      return null
    }
    if (Date.now() - p.t > LOCATION_MAX_AGE_MS) return null
    return { lat: p.lat, lng: p.lng }
  } catch {
    return null
  }
}

function saveStoredLocation(lat: number, lng: number) {
  try {
    sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ lat, lng, t: Date.now() }))
  } catch {
    /* private mode / quota */
  }
}

function getCurrentPositionAsync(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

export default function FindMechanics() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [faults, setFaults] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedFault, setSelectedFault] = useState('')
  const [mechanics, setMechanics] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userLocationAddress, setUserLocationAddress] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedMechanicIdOnMap, setSelectedMechanicIdOnMap] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [requestingMechanicId, setRequestingMechanicId] = useState<string | null>(null)
  const [diagnosticNotes, setDiagnosticNotes] = useState('')
  const [minRating, setMinRating] = useState<number | ''>('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [jobPhotos, setJobPhotos] = useState<File[]>([])
  const [addressQuery, setAddressQuery] = useState('')
  const [addressLookupLoading, setAddressLookupLoading] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodeSearchResult[]>([])
  const jobPhotoInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const photoPreviewUrls = useMemo(() => jobPhotos.map((f) => URL.createObjectURL(f)), [jobPhotos])
  useEffect(() => {
    return () => photoPreviewUrls.forEach((u) => URL.revokeObjectURL(u))
  }, [photoPreviewUrls])

  const applyLocationCoords = useCallback(async (lat: number, lng: number, labelOverride?: string | null) => {
    setUserLocation({ lat, lng })
    saveStoredLocation(lat, lng)
    setLocationError(null)
    if (labelOverride) {
      setUserLocationAddress(labelOverride)
    } else {
      try {
        const address = await reverseGeocode(lat, lng)
        setUserLocationAddress(address)
      } catch {
        setUserLocationAddress(null)
      }
    }
  }, [])

  const getCurrentLocation = useCallback(async (userClicked: boolean) => {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by your browser. Use the address search below instead.')
      setLocationLoading(false)
      return
    }
    setLocationError(null)
    setLocationLoading(true)
    setAddressSuggestions([])

    const attempts: PositionOptions[] = [
      { enableHighAccuracy: false, timeout: 22000, maximumAge: 5 * 60 * 1000 },
      { enableHighAccuracy: true, timeout: 28000, maximumAge: 0 },
    ]

    let lastCode: number | null = null
    for (const opts of attempts) {
      try {
        const position = await getCurrentPositionAsync(opts)
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLocationLoading(false)
        await applyLocationCoords(lat, lng)
        if (userClicked) toast.success('Location set from your device')
        return
      } catch (err) {
        const geoErr = err as GeolocationPositionError
        if (geoErr && typeof geoErr.code === 'number') lastCode = geoErr.code
      }
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        let watchId = 0
        const timer = window.setTimeout(() => {
          navigator.geolocation.clearWatch(watchId)
          reject(new Error('watch-timeout'))
        }, 14000)
        watchId = navigator.geolocation.watchPosition(
          (p) => {
            window.clearTimeout(timer)
            navigator.geolocation.clearWatch(watchId)
            resolve(p)
          },
          (err) => {
            window.clearTimeout(timer)
            navigator.geolocation.clearWatch(watchId)
            reject(err)
          },
          { enableHighAccuracy: true, maximumAge: 0 }
        )
      })
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setLocationLoading(false)
      await applyLocationCoords(lat, lng)
      if (userClicked) toast.success('Location set from your device')
      return
    } catch {
      /* continue to error message */
    }

    setLocationLoading(false)
    switch (lastCode) {
      case 1: // PERMISSION_DENIED
        setLocationError(
          'Location access was denied. Allow location in your browser settings, or set your location with the address search below.'
        )
        break
      case 2: // POSITION_UNAVAILABLE
      case 3: // TIMEOUT
        setLocationError(
          'GPS could not fix your position (common on desktop or indoors). Try "Use my location" again, or search for an address below.'
        )
        break
      default:
        setLocationError('Could not detect your location automatically. Use the address search below or try again.')
    }
  }, [applyLocationCoords])

  useEffect(() => {
    vehiclesAPI
      .getAll()
      .then((res) => {
        setVehicles(res.data || [])
      })
      .catch(() => {
        setVehicles([])
      })

    faultsAPI
      .getAll()
      .then((res) => {
        setFaults(res.data || [])
      })
      .catch(() => {
        setFaults([])
      })

    const cached = loadStoredLocation()
    if (cached) {
      setUserLocation(cached)
      reverseGeocode(cached.lat, cached.lng)
        .then(setUserLocationAddress)
        .catch(() => setUserLocationAddress(null))
    }

    void getCurrentLocation(false)
    // Intentionally once on mount; getCurrentLocation is stable via useCallback
  }, [])

  const lookupAddress = async () => {
    const q = addressQuery.trim()
    if (q.length < 3) {
      toast.error('Enter at least 3 characters (e.g. city or street)')
      return
    }
    setAddressLookupLoading(true)
    setAddressSuggestions([])
    setLocationError(null)
    try {
      const results = await searchAddress(q)
      if (results.length === 0) {
        toast.error('No results — try a nearby city or landmark')
        return
      }
      setAddressSuggestions(results)
      if (results.length === 1) {
        const r = results[0]
        await applyLocationCoords(r.lat, r.lng, r.label)
        setAddressSuggestions([])
        toast.success('Location set from address')
      }
    } catch {
      toast.error('Address lookup failed. Check your connection and try again.')
    } finally {
      setAddressLookupLoading(false)
    }
  }

  const selectSuggestion = async (r: GeocodeSearchResult) => {
    setAddressSuggestions([])
    setAddressQuery(r.label)
    await applyLocationCoords(r.lat, r.lng, r.label)
    toast.success('Location set')
  }

  const addJobPhotoFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
    if (list.length === 0) {
      toast.error('Use JPEG, PNG, or WebP images')
      return
    }
    const maxBytes = 5 * 1024 * 1024
    for (const f of list) {
      if (f.size > maxBytes) {
        toast.error('Each photo must be under 5MB')
        return
      }
    }
    setJobPhotos((prev) => [...prev, ...list].slice(0, 3))
  }

  const removeJobPhotoAt = (index: number) => {
    setJobPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const searchMechanics = async () => {
    if (!selectedVehicle || !selectedFault || !userLocation) {
      toast.error('Please select a vehicle, fault, and allow location access')
      return
    }

    const fault = faults.find((f) => f.id === selectedFault)
    if (!fault) return

    setSearching(true)
    try {
      const res = await bookingsAPI.findNearbyMechanics(
        userLocation.lat,
        userLocation.lng,
        fault.category,
        10,
        selectedVehicle,
        {
          ...(minRating !== '' && minRating > 0 ? { minRating } : {}),
          ...(availableOnly ? { availableOnly: true } : {}),
        }
      )
      const list = Array.isArray(res.data) ? [...res.data] : []
      list.sort((a: any, b: any) => {
        const da = typeof a.distanceKm === 'number' ? a.distanceKm : Infinity
        const db = typeof b.distanceKm === 'number' ? b.distanceKm : Infinity
        return da - db
      })
      setMechanics(list)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to find mechanics'))
    } finally {
      setSearching(false)
    }
  }

  const createBooking = async (mechanicId?: string) => {
    if (!selectedVehicle || !selectedFault) {
      toast.error('Please select a vehicle and fault')
      return
    }

    const isOpenBoard = !mechanicId
    const fault = faults.find((f) => f.id === selectedFault)
    const validationMessage = validateJobPostingInput({
      description: diagnosticNotes,
      photoCount: jobPhotos.length,
      faultName: fault?.name,
      isOpenBoard,
    })
    if (validationMessage) {
      if (validationMessage.startsWith('We recommend')) {
        if (!window.confirm(`${validationMessage}\n\nContinue anyway?`)) return
      } else {
        toast.error(validationMessage)
        return
      }
    }

    setRequestingMechanicId(mechanicId ?? 'new')
    try {
      const res = await bookingsAPI.create({
        vehicleId: selectedVehicle,
        faultId: selectedFault,
        ...(mechanicId && { mechanicId }),
        description: diagnosticNotes.trim() || undefined,
        locationLat: userLocation?.lat,
        locationLng: userLocation?.lng,
      })
      const bookingId = res.data.id as string
      if (jobPhotos.length > 0) {
        try {
          await bookingsAPI.uploadBookingPhotos(bookingId, jobPhotos.slice(0, 3))
        } catch (uploadErr) {
          toast.error(getApiErrorMessage(uploadErr, 'Booking created but photos failed to upload — add them from the booking page.'))
        }
      }
      toast.success(
        mechanicId
          ? 'Request sent. The mechanic can send you a quote on this job — open the booking to accept it and chat.'
          : 'Job posted. Mechanics can send you quotes.'
      )
      setJobPhotos([])
      navigate(`/user/bookings/${bookingId}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create booking'))
    } finally {
      setRequestingMechanicId(null)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Mechanics</h1>
      <p className="text-slate-600 mb-6">Select your vehicle and issue, then search for nearby verified mechanics.</p>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Vehicle & Issue</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Vehicle
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Issue
            </label>
            <select
              value={selectedFault}
              onChange={(e) => setSelectedFault(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose an issue</option>
              {faults.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 space-y-3">
          <label className="block text-sm font-medium text-slate-800">Your location</label>
          <p className="text-xs text-slate-500 -mt-1">
            Needed to sort mechanics by distance. GPS works best on phones; on desktop, search for your area below.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void getCurrentLocation(true)}
              disabled={locationLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-primary-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
            >
              <Navigation className={`h-4 w-4 text-primary-600 ${locationLoading ? 'animate-pulse' : ''}`} />
              {locationLoading ? 'Getting location…' : 'Use my location'}
            </button>
            {userLocation && !locationLoading && (
              <span className="text-sm text-primary-800 font-medium inline-flex items-center gap-1 max-w-[min(100%,28rem)]">
                <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                <span className="truncate">
                  {userLocationAddress || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                </span>
              </span>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
              Or search an address / area
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void lookupAddress())}
                placeholder="e.g. Ikeja Lagos, Port Harcourt, Wuse Abuja"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => void lookupAddress()}
                disabled={addressLookupLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 shrink-0"
              >
                <Search className="h-4 w-4" />
                {addressLookupLoading ? 'Searching…' : 'Look up'}
              </button>
            </div>
            {addressSuggestions.length > 0 && (
              <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
                {addressSuggestions.map((r, i) => (
                  <li key={`${r.lat}-${r.lng}-${i}`}>
                    <button
                      type="button"
                      onClick={() => void selectSuggestion(r)}
                      className="w-full text-left px-3 py-2.5 text-sm text-slate-800 hover:bg-primary-50 transition-colors"
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {locationError && (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              {locationError}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe the issue {` (min ${MIN_OPEN_JOB_DESCRIPTION_LENGTH} characters for open jobs)`}
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Include when it started, symptoms, warning lights, and sounds. Mechanics quote from your notes and photos —
            they cannot call you on open jobs.
          </p>
          <textarea
            value={diagnosticNotes}
            onChange={(e) => setDiagnosticNotes(e.target.value)}
            placeholder="e.g. Grinding noise when braking from 60km/h, started last week, no warning lights..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum rating (optional)</label>
            <select
              value={minRating === '' ? '' : String(minRating)}
              onChange={(e) => {
                const v = e.target.value
                setMinRating(v === '' ? '' : Number(v))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Any rating</option>
              <option value="3">3+ stars</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600"
              />
              Available now only
            </label>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-800 mb-1">Photos of the issue (optional)</label>
          <p className="text-xs text-slate-500 mb-3">Up to 3 images · JPEG, PNG or WebP · max 5MB each · added after you create the job</p>
          <input
            ref={jobPhotoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) addJobPhotoFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => jobPhotoInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && jobPhotoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (e.dataTransfer.files?.length) addJobPhotoFiles(e.dataTransfer.files)
            }}
            className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 ${
              jobPhotos.length >= 3
                ? 'border-slate-200 bg-slate-50 opacity-70 pointer-events-none'
                : 'border-primary-200/80 bg-gradient-to-br from-primary-50/40 via-white to-slate-50/50 hover:border-primary-300 hover:from-primary-50/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8 px-4 text-center sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-primary-100">
                <ImagePlus className="h-7 w-7 text-primary-600" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {jobPhotos.length >= 3 ? 'Maximum 3 photos' : 'Drop photos here or tap to browse'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {jobPhotos.length}/3 selected — add at least {RECOMMENDED_JOB_PHOTOS} when you can
                </p>
              </div>
            </div>
          </div>
          {jobPhotos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3 list-none p-0">
              {jobPhotos.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`} className="relative group">
                  <img
                    src={photoPreviewUrls[index]}
                    alt=""
                    className="h-24 w-24 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeJobPhotoAt(index)}
                    className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md opacity-90 hover:opacity-100"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-1 max-w-[6rem] truncate text-[10px] text-slate-500">{file.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={searchMechanics}
            disabled={searching}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {searching ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching…
              </>
            ) : (
              'Search Mechanics'
            )}
          </button>
          <button
            type="button"
            onClick={() => createBooking()}
            disabled={searching || !selectedVehicle || !selectedFault || !userLocation || requestingMechanicId != null}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {requestingMechanicId === 'new' ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting…
              </>
            ) : (
              'Post job & get quotes'
            )}
          </button>
        </div>
      </div>

      {mechanics.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">View:</span>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white ring-2 ring-primary-200 ring-offset-2'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-primary-600 text-white ring-2 ring-primary-200 ring-offset-2'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
      )}

      {viewMode === 'map' && mechanics.length > 0 && (
        <div className="mb-8">
          <MechanicsMap
            userLocation={userLocation}
            mechanics={mechanics}
            selectedMechanicId={selectedMechanicIdOnMap}
            onSelectMechanic={setSelectedMechanicIdOnMap}
            onCloseInfoWindow={() => setSelectedMechanicIdOnMap(null)}
            onRequestService={createBooking}
            requestingMechanicId={requestingMechanicId}
          />
        </div>
      )}

      {viewMode === 'list' && (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No mechanics found. Try adjusting your search criteria.
          </div>
        ) : (
        mechanics.map((mechanic) => (
          <div key={mechanic.mechanic.id} className="card p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                {mechanic.avatar ? (
                  <img
                    src={mechanic.avatar}
                    alt={mechanic.mechanic.ownerFullName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">{mechanic.mechanic.companyName}</h3>
                  {(mechanic.mechanic?.isVerified ?? true) && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                      title="Verified by admin"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{mechanic.mechanic.ownerFullName}</p>
              </div>
            </div>
            {mechanic.bio && <p className="text-sm text-gray-600 mb-3">{mechanic.bio}</p>}
            <div className="flex items-center space-x-1 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {typeof mechanic.averageRating === 'number'
                  ? mechanic.averageRating.toFixed(1)
                  : '—'}
                {typeof mechanic.distanceKm === 'number' && (
                  <span className="text-gray-500 ml-2">
                    · {mechanic.distanceKm < 1
                      ? `${Math.round(mechanic.distanceKm * 1000)} m away`
                      : `${mechanic.distanceKm.toFixed(1)} km away`}
                  </span>
                )}
              </span>
            </div>
            {(mechanic.nextAvailableNote || mechanic.profile?.nextAvailableNote) && (
              <p className="text-xs text-primary-700 mb-2 font-medium">
                Next availability: {mechanic.nextAvailableNote || mechanic.profile?.nextAvailableNote}
              </p>
            )}
            <div className="flex items-center space-x-1 mb-4">
              <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">
                {mechanic.workshopAddress ||
                  [mechanic.address, mechanic.city].filter(Boolean).join(', ') ||
                  (mechanic.latitude != null && mechanic.longitude != null
                    ? `${mechanic.latitude.toFixed(4)}, ${mechanic.longitude.toFixed(4)}`
                    : 'Address not set')}
              </span>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Expertise:</p>
              <div className="flex flex-wrap gap-1">
                {mechanic.expertise.map((exp: string) => (
                  <span
                    key={exp}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => createBooking(mechanic.mechanic.id)}
              disabled={requestingMechanicId === mechanic.mechanic.id}
              className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {requestingMechanicId === mechanic.mechanic.id ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Requesting…
                </>
              ) : (
                'Request Service'
              )}
            </button>
          </div>
        )))}
      </div>
      )}
    </div>
  )
}
