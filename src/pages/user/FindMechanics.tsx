import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { vehiclesAPI, faultsAPI, bookingsAPI } from '../../services/api'
import { reverseGeocode } from '../../services/geocoding'
import { MapPin, Star, CheckCircle2, User } from 'lucide-react'

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
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch vehicles (requires authentication)
    vehiclesAPI
      .getAll()
      .then((res) => {
        console.log('Vehicles response:', res.data)
        setVehicles(res.data || [])
      })
      .catch((error) => {
        console.error('Error fetching vehicles:', error)
        console.error('Error details:', error.response?.data)
        setVehicles([])
      })

    // Fetch faults (public endpoint)
    faultsAPI
      .getAll()
      .then((res) => {
        console.log('Faults response:', res.data)
        setFaults(res.data || [])
      })
      .catch((error) => {
        console.error('Error fetching faults:', error)
        console.error('Error details:', error.response?.data)
        setFaults([])
      })

    // Try to get location on load (no alert on failure – user can click "Use my location" to confirm)
    getCurrentLocation()
  }, [])

  const getCurrentLocation = (isRetry = false) => {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by your browser.')
      return
    }
    if (!isRetry) {
      setLocationError(null)
      setLocationLoading(true)
    }
    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 20000, // 20s – kCLErrorLocationUnknown often needs a bit longer
      maximumAge: 10 * 60 * 1000, // Accept cached position up to 10 minutes
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation({ lat, lng })
        setLocationLoading(false)
        setLocationError(null)
        try {
          const address = await reverseGeocode(lat, lng)
          setUserLocationAddress(address)
        } catch {
          setUserLocationAddress(null)
        }
      },
      (error: GeolocationPositionError) => {
        // kCLErrorLocationUnknown → POSITION_UNAVAILABLE; often temporary – retry once
        const canRetry = error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT
        if (!isRetry && canRetry) {
          setTimeout(() => getCurrentLocation(true), 1500)
          return
        }
        setLocationLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access was denied. Allow location in your browser (or click the lock/address bar icon) and try "Use my location" again.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location could not be determined (e.g. still acquiring or no GPS). Click "Use my location" to try again.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out. Click "Use my location" to try again.')
            break
          default:
            setLocationError('Unable to get your location. Click "Use my location" to try again.')
        }
      },
      options
    )
  }

  const searchMechanics = async () => {
    if (!selectedVehicle || !selectedFault || !userLocation) {
      toast.error('Please select a vehicle, fault, and allow location access')
      return
    }

    const fault = faults.find((f) => f.id === selectedFault)
    if (!fault) return

    try {
      const res = await bookingsAPI.findNearbyMechanics(
        userLocation.lat,
        userLocation.lng,
        fault.category,
        10
      )
      setMechanics(res.data)
    } catch (error) {
      toast.error('Failed to find mechanics')
    }
  }

  const createBooking = async (mechanicId: string) => {
    if (!selectedVehicle || !selectedFault) {
      toast.error('Please select a vehicle and fault')
      return
    }

    try {
      const res = await bookingsAPI.create({
        vehicleId: selectedVehicle,
        faultId: selectedFault,
        mechanicId,
        locationLat: userLocation?.lat,
        locationLng: userLocation?.lng,
      })
      toast.success('Booking requested successfully')
      navigate(`/user/bookings/${res.data.id}`)
    } catch (error) {
      toast.error('Failed to create booking')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Find Mechanics</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your location
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => getCurrentLocation()}
              disabled={locationLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <MapPin className="h-4 w-4 text-gray-600" />
              {locationLoading ? 'Getting location…' : 'Use my location'}
            </button>
            {userLocation && !locationLoading && (
              <span className="text-sm text-green-700">
                ✓ {userLocationAddress || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
              </span>
            )}
          </div>
          {locationError && (
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              {locationError}
            </p>
          )}
        </div>
        <button
          onClick={searchMechanics}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search Mechanics
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((mechanic) => (
          <div key={mechanic.mechanic.id} className="bg-white rounded-lg shadow p-6">
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
              <span className="text-sm">4.5</span>
            </div>
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
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => createBooking(mechanic.mechanic.id)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Request Service
            </button>
          </div>
        ))}
        {mechanics.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No mechanics found. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  )
}
