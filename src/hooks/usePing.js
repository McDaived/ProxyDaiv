import { useState, useEffect, useRef } from 'react'
import { measurePing, pingStatus } from '../utils/realPing'
import { getVisitorGeo, calcPing } from '../utils/simulatePing'

const MEASURE_INTERVAL = 6000  // re-measure every 6s
const DRIFT_INTERVAL   = 800   // visual drift between measurements

/**
 * Returns ping for a proxy:
 * - HTTP  → real TCP latency via fetch (accurate)
 * - HTTPS → WebRTC STUN if server replies to UDP, else geo-distance estimate
 * - Always falls back to geo estimate if real measurement fails
 */
export function usePing(server, port, countryCode) {
  const cancelRef = useRef(false)
  const baseRef   = useRef(null)
  const [ping, setPing] = useState({ ms: null, status: pingStatus(null) })

  useEffect(() => {
    if (!server || !port) return
    cancelRef.current = false

    async function measure() {
      const realMs = await measurePing(server, port)
      if (cancelRef.current) return

      if (realMs !== null) {
        baseRef.current = realMs
        setPing({ ms: realMs, status: pingStatus(realMs) })
      } else {
        // Real measurement failed → always fall back to geo estimate
        const visitor = await getVisitorGeo()
        if (cancelRef.current) return
        const ms = calcPing(countryCode ?? null, visitor)
        if (baseRef.current === null) {
          baseRef.current = ms
          setPing({ ms, status: pingStatus(ms) })
        }
      }
    }

    function tick() {
      const base = baseRef.current
      if (base === null) return
      const jitter = Math.round((Math.random() * 2 - 1) * 3)
      const ms     = Math.max(5, base + jitter)
      setPing({ ms, status: pingStatus(ms) })
    }

    measure()

    const measureTimer = setInterval(measure, MEASURE_INTERVAL)
    const driftTimer   = setInterval(tick,    DRIFT_INTERVAL)

    return () => {
      cancelRef.current = true
      clearInterval(measureTimer)
      clearInterval(driftTimer)
    }
  }, [server, port, countryCode])

  return ping
}
