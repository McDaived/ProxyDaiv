const PROXY_URL =
  'https://raw.githubusercontent.com/SoliSpirit/mtproto/refs/heads/master/all_proxies.txt'

/**
 * Fetch and parse the proxy list.
 * Each line is: https://t.me/proxy?server=...&port=...&secret=...
 * Returns an array of { id, server, port, secret, tgLink }
 */
export async function fetchProxies() {
  const res = await fetch(PROXY_URL)
  if (!res.ok) throw new Error('Failed to fetch proxy list')
  const text = await res.text()

  const proxies = []

  text.split('\n').forEach((line, index) => {
    line = line.trim()
    if (!line) return

    try {
      const url = new URL(line)
      const server = url.searchParams.get('server')
      const port   = url.searchParams.get('port')
      const secret = url.searchParams.get('secret')

      if (!server || !port || !secret) return

      const tgLink = `tg://proxy?server=${server}&port=${port}&secret=${secret}`

      proxies.push({ id: index, server, port, secret, tgLink })
    } catch {
      // skip malformed lines
    }
  })

  return proxies
}
