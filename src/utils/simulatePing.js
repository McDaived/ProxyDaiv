import { getCoords, distanceKm } from './countryCoords'

// Visitor's geo — fetched once and cached
let visitorGeo = null

/** fetch with a hard timeout */
function fetchTimeout(url, options, ms) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t))
}

export async function getVisitorGeo() {
  if (visitorGeo) return visitorGeo

  // Primary: ipapi.co (HTTPS)
  try {
    const res  = await fetchTimeout('https://ipapi.co/json/', {}, 5000)
    const data = await res.json()
    if (data.latitude && data.longitude) {
      visitorGeo = { countryCode: data.country_code ?? null, coords: [data.latitude, data.longitude] }
      return visitorGeo
    }
  } catch { /* fall through */ }

  // Fallback: ip-api.com (HTTP)
  try {
    const res  = await fetchTimeout('http://ip-api.com/json/?fields=status,countryCode,lat,lon', {}, 5000)
    const data = await res.json()
    if (data.lat && data.lon) {
      visitorGeo = { countryCode: data.countryCode ?? null, coords: [data.lat, data.lon] }
      return visitorGeo
    }
  } catch { /* fall through */ }

  // All failed — default to no coords
  visitorGeo = { countryCode: null, coords: null }
  return visitorGeo
}

/**
 * Deterministic base ping (no jitter) — used for sorting proxies.
 */
export function basePing(proxyCountryCode, visitor) {
  if (!visitor?.coords || !proxyCountryCode) return 999
  const proxyCoords = getCoords(proxyCountryCode)
  if (!proxyCoords) return 999
  const km = distanceKm(visitor.coords, proxyCoords)
  return Math.min(Math.max(Math.round(15 + km * 0.022), 15), 400)
}

/**
 * Simulated ping with ±12% jitter.
 */
export function calcPing(proxyCountryCode, visitor) {
  let base = 200

  if (visitor?.coords && proxyCountryCode) {
    const proxyCoords = getCoords(proxyCountryCode)
    if (proxyCoords) {
      const km = distanceKm(visitor.coords, proxyCoords)
      base = Math.round(15 + km * 0.022)
    }
  }

  base = Math.min(Math.max(base, 15), 400)
  const jitter = (Math.random() * 2 - 1) * base * 0.12
  return Math.round(base + jitter)
}

/**
 * Ping status thresholds:
 *  ≤120ms  → سريع  🟢
 *  121-150 → جيد   🟡
 *  151-280 → بطيء  🟠
 *  >280    → متوقف 🔴
 */
export function pingStatus(ms) {
  if (ms === null || ms === undefined) return { key: 'pingSlow', color: 'var(--ping-slow)' }
  if (ms <= 120) return { key: 'pingFast', color: 'var(--ping-fast)' }
  if (ms <= 150) return { key: 'pingGood', color: 'var(--ping-good)' }
  if (ms <= 280) return { key: 'pingFair', color: 'var(--ping-fair)' }
  return           { key: 'pingSlow', color: 'var(--ping-slow)' }
}
