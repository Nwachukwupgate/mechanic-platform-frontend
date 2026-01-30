/**
 * Reverse geocode: convert (lat, lng) to a human-readable address.
 * Calls our backend (which proxies to Nominatim) to avoid CORS.
 */

import { api } from './api'

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await api.get<{ address: string }>('/geocoding/reverse', {
    params: { lat, lng },
  })
  return res.data?.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}
