/**
 * Ping measurement.
 *
 * HTTP pages : fetch to http://server:port — real TCP round-trip.
 * HTTPS pages: WebRTC STUN probe — real if server replies to UDP,
 *              otherwise returns null (caller uses geo fallback).
 */

const FETCH_TIMEOUT = 2500
const STUN_TIMEOUT  = 2500
const MAX_VALID     = 900   // ms above this = TCP hang, not real RTT
const CONN_FAST_MS  = 80    // errors faster than this = port closed

const isHTTPS = () =>
  typeof location !== 'undefined' && location.protocol === 'https:'

export async function measurePing(server, port) {
  if (!server || !port) return null
  const n = parseInt(port, 10)
  if (isNaN(n) || n <= 0 || n > 65535) return null

  return isHTTPS()
    ? stunPing(server, n)
    : fetchPing(server, n)
}

// ── HTTP: real TCP timing via fetch ──────────────────────────────────────────

async function fetchPing(server, port) {
  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT)
  const start = performance.now()

  try {
    await fetch(`http://${server}:${port}/`, {
      method: 'HEAD', mode: 'no-cors', cache: 'no-store',
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const ms = Math.round(performance.now() - start)
    return ms < MAX_VALID ? ms : null
  } catch (err) {
    clearTimeout(timer)
    const ms = Math.round(performance.now() - start)
    if (err.name === 'AbortError' || ms >= MAX_VALID) return null
    // Fast error = port closed; slow error = server active (MTProto waiting)
    return ms >= CONN_FAST_MS ? ms : null
  }
}

// ── HTTPS: WebRTC STUN probe (UDP) ────────────────────────────────────────

async function stunPing(server, port) {
  if (typeof RTCPeerConnection === 'undefined') return null

  return new Promise((resolve) => {
    let done = false
    let pc   = null
    const start = performance.now()

    const finish = (ms) => {
      if (done) return
      done = true
      try { pc?.close() } catch {}
      resolve(ms)
    }

    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: `stun:${server}:${port}` }] })
      pc.createDataChannel('p')

      pc.onicecandidate = ({ candidate }) => {
        if (candidate?.type === 'srflx')
          finish(Math.round(performance.now() - start))
      }

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') finish(null)
      }

      pc.createOffer()
        .then(o => pc.setLocalDescription(o))
        .catch(() => finish(null))
    } catch {
      finish(null)
    }

    setTimeout(() => finish(null), STUN_TIMEOUT)
  })
}

// ── Ping status thresholds ────────────────────────────────────────────────

export function pingStatus(ms) {
  if (ms === null || ms === undefined) return { key: 'pingSlow', color: 'var(--ping-slow)' }
  if (ms <= 120) return { key: 'pingFast', color: 'var(--ping-fast)' }
  if (ms <= 150) return { key: 'pingGood', color: 'var(--ping-good)' }
  if (ms <= 280) return { key: 'pingFair', color: 'var(--ping-fair)' }
  return           { key: 'pingSlow', color: 'var(--ping-slow)' }
}
