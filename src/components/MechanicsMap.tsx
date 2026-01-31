import { useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Wrench } from 'lucide-react'

const defaultCenter = { lat: 9.0765, lng: 7.3986 } // Nigeria default
const mapContainerStyle = { width: '100%', height: '100%', minHeight: '400px', borderRadius: '8px' }

export type MechanicMapItem = {
  mechanic: { id: string; companyName: string; ownerFullName?: string }
  latitude?: number | null
  longitude?: number | null
  workshopAddress?: string | null
  avatar?: string | null
}

type MechanicsMapProps = {
  userLocation: { lat: number; lng: number } | null
  mechanics: MechanicMapItem[]
  onSelectMechanic?: (mechanicId: string) => void
  onCloseInfoWindow?: () => void
  onRequestService?: (mechanicId: string) => void
  selectedMechanicId?: string | null
}

export function MechanicsMap({
  userLocation,
  mechanics,
  onSelectMechanic,
  onCloseInfoWindow,
  onRequestService,
  selectedMechanicId,
}: MechanicsMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-mechanics',
    googleMapsApiKey: apiKey || '',
  })

  const mechanicMarkers = useMemo(
    () =>
      mechanics.filter(
        (m) =>
          m.latitude != null &&
          m.longitude != null &&
          Number.isFinite(m.latitude) &&
          Number.isFinite(m.longitude)
      ),
    [mechanics]
  )

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation
    if (mechanicMarkers.length > 0) {
      const first = mechanicMarkers[0]
      return { lat: first.latitude!, lng: first.longitude! }
    }
    return defaultCenter
  }, [userLocation, mechanicMarkers])

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      const bounds = new google.maps.LatLngBounds()
      if (userLocation) {
        bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng))
      }
      mechanicMarkers.forEach((m) => {
        if (m.latitude != null && m.longitude != null) {
          bounds.extend(new google.maps.LatLng(m.latitude, m.longitude))
        }
      })
      if (userLocation || mechanicMarkers.length > 0) {
        map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 })
        const listener = google.maps.event.addListener(map, 'idle', () => {
          const z = map.getZoom()
          if (z != null && z > 14) map.setZoom(14)
          google.maps.event.removeListener(listener)
        })
      }
    },
    [userLocation, mechanicMarkers]
  )

  const onUnmount = useCallback(() => {}, [])

  if (loadError) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        Map could not be loaded. Check your Google Maps API key.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        Loading map…
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        Add VITE_GOOGLE_MAPS_KEY to .env to show the map.
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title="Your location"
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#1d4ed8',
              strokeWeight: 2,
            }}
          />
        )}
        {mechanicMarkers.map((m) => (
          <Marker
            key={m.mechanic.id}
            position={{ lat: m.latitude!, lng: m.longitude! }}
            title={m.mechanic.companyName}
            onClick={() => onSelectMechanic?.(m.mechanic.id)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#15803d',
              strokeWeight: 2,
            }}
          >
            {selectedMechanicId === m.mechanic.id && (
              <InfoWindow onCloseClick={onCloseInfoWindow}>
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{m.mechanic.companyName}</p>
                      {m.mechanic.ownerFullName && (
                        <p className="text-xs text-gray-500">{m.mechanic.ownerFullName}</p>
                      )}
                    </div>
                  </div>
                  {m.workshopAddress && (
                    <p className="text-xs text-gray-600 mb-2 flex items-start gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      {m.workshopAddress}
                    </p>
                  )}
                  {onRequestService && (
                    <button
                      type="button"
                      onClick={() => onRequestService(m.mechanic.id)}
                      className="w-full mt-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Request Service
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  )
}
