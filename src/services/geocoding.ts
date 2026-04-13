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

export type GeocodeSearchResult = { lat: number; lng: number; label: string }

/** Forward geocode via API (Nominatim). Use when GPS is unavailable. */
export async function searchAddress(query: string): Promise<GeocodeSearchResult[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const res = await api.get<{ results: GeocodeSearchResult[] }>('/geocoding/search', {
    params: { q },
  })
  return Array.isArray(res.data?.results) ? res.data.results : []
}
