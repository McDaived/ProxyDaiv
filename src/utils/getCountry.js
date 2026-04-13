// Session-level cache: server → { countryCode }
const cache = new Map()

const FALLBACK = { countryCode: null }

const isHTTPS = () =>
  typeof location !== 'undefined' && location.protocol === 'https:'

function fetchWithTimeout(url, options, ms = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t))
}

const isIPv4 = s => /^\d{1,3}(\.\d{1,3}){3}$/.test(s)

// ── HTTP path: ip-api.com batch (fast, up to 100 at once) ─────────────────

async function batchGeoHTTP(servers) {
  const chunks = []
  for (let i = 0; i < servers.length; i += 100)
    chunks.push(servers.slice(i, i + 100))

  await Promise.all(chunks.map(async chunk => {
    try {
      const res  = await fetchWithTimeout(
        'http://ip-api.com/batch?fields=status,countryCode,query',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(chunk.map(s => ({ query: s }))),
        },
        8000
      )
      const data = await res.json()
      data.forEach(item => {
        cache.set(item.query, item.status === 'success' && item.countryCode
          ? { countryCode: item.countryCode }
          : FALLBACK)
      })
    } catch {
      chunk.forEach(s => cache.set(s, FALLBACK))
    }
  }))
}

// ── HTTPS path: Cloudflare DoH → ipwho.is individual (CORS-safe) ──────────

async function resolveIPviaDoH(domain) {
  try {
    const res  = await fetchWithTimeout(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { Accept: 'application/dns-json' } },
      5000
    )
    const data = await res.json()
    return data.Answer?.find(r => r.type === 1)?.data ?? null
  } catch {
    return null
  }
}

async function geoLookupHTTPS(servers) {
  // Resolve domains to IPs first
  const resolved = await Promise.all(
    servers.map(async s => {
      if (isIPv4(s)) return { server: s, ip: s }
      const ip = await resolveIPviaDoH(s)
      return ip ? { server: s, ip } : { server: s, ip: null }
    })
  )

  // Lookup IPs via ipwho.is (HTTPS, free, CORS enabled)
  await Promise.all(
    resolved.map(async ({ server, ip }) => {
      if (!ip) { cache.set(server, FALLBACK); return }
      try {
        const res  = await fetchWithTimeout(`https://ipwho.is/${ip}`, {}, 5000)
        const data = await res.json()
        cache.set(server, data.success && data.country_code
          ? { countryCode: data.country_code.toLowerCase() }
          : FALLBACK)
      } catch {
        cache.set(server, FALLBACK)
      }
    })
  )
}

// ── DNS fallback for HTTP path ─────────────────────────────────────────────

async function resolveAndLookupHTTP(domains) {
  const resolved = await Promise.all(
    domains.map(async domain => {
      try {
        const res  = await fetchWithTimeout(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
          { headers: { Accept: 'application/dns-json' } },
          5000
        )
        const data = await res.json()
        const ip   = data.Answer?.find(r => r.type === 1)?.data ?? null
        return ip ? { domain, ip } : null
      } catch {
        return null
      }
    })
  )

  const pairs = resolved.filter(Boolean)
  if (!pairs.length) return

  const newIPs = [...new Set(pairs.map(p => p.ip))].filter(ip => !cache.has(ip))
  if (newIPs.length) await batchGeoHTTP(newIPs)

  pairs.forEach(({ domain, ip }) => {
    const geo = cache.get(ip)
    if (geo?.countryCode) cache.set(domain, geo)
  })
}

// ── Public API ────────────────────────────────────────────────────────────

export async function fetchGeoBatch(servers) {
  const uncached = servers.filter(s => !cache.has(s))
  if (!uncached.length) return

  if (isHTTPS()) {
    // GitHub Pages / HTTPS: use Cloudflare DoH + ipwho.is
    await geoLookupHTTPS(uncached)
  } else {
    // Local dev / HTTP: use fast ip-api.com batch
    await batchGeoHTTP(uncached)

    // DNS fallback for domains still unresolved
    const unknown = uncached.filter(s => {
      const e = cache.get(s)
      return !isIPv4(s) && (!e || !e.countryCode)
    })
    if (unknown.length) resolveAndLookupHTTP(unknown).catch(() => {})
  }
}

export function getCountryCached(server) {
  return cache.get(server) ?? FALLBACK
}
