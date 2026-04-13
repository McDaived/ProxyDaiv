'use strict'

/**
 * MTProto Proxy Checker (CommonJS)
 * Uses TDLib to verify each proxy by actually connecting to Telegram.
 */

const tdl          = require('tdl')
const { getTdjson } = require('prebuilt-tdlib')
const fs           = require('fs')
const path         = require('path')
const https        = require('https')
const http         = require('http')

tdl.configure(getTdjson())

const PROXY_SOURCE = 'https://raw.githubusercontent.com/SoliSpirit/mtproto/refs/heads/master/all_proxies.txt'
const OUTPUT       = path.join(__dirname, '..', 'public', 'proxies.json')
const PING_TIMEOUT = 15000
const CONCURRENCY  = 15

const API_ID   = 94575
const API_HASH = 'a3406de8d171bb422bb6ddf3bbd800e2'

// ── Fetch URL as text ─────────────────────────────────────────────────────────

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib.get(url, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// ── Parse proxy URL ───────────────────────────────────────────────────────────

function parseProxyUrl(line) {
  try {
    const qs     = line.includes('?') ? line.split('?')[1] : ''
    const p      = new URLSearchParams(qs)
    const server = p.get('server')
    const port   = parseInt(p.get('port') || '', 10)
    const secret = p.get('secret')
    if (!server || !secret || isNaN(port) || port < 1 || port > 65535) return null
    return { server, port, secret }
  } catch {
    return null
  }
}

// ── Normalize secret to hex ───────────────────────────────────────────────────

function normalizeSecret(secret) {
  if (/^[0-9a-fA-F]+$/.test(secret)) return secret.toLowerCase()
  try {
    const b64    = secret.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
    const binary = Buffer.from(padded, 'base64')
    return binary.toString('hex')
  } catch {
    return secret.toLowerCase()
  }
}

// ── Check one proxy via TDLib ─────────────────────────────────────────────────

async function checkProxy(server, port, hexSecret, idx) {
  const dbDir = `/tmp/tdlib_${idx}_${process.pid}`

  const client = tdl.createClient({
    apiId:             API_ID,
    apiHash:           API_HASH,
    databaseDirectory: dbDir,
    filesDirectory:    dbDir,
    verbosityLevel:    0,
  })

  const timeout = ms => new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), ms))

  try {
    await Promise.race([client.connect(), timeout(PING_TIMEOUT)])

    const proxy = await Promise.race([
      client.invoke({
        _:      'addProxy',
        server,
        port,
        enable: true,
        type:   { _: 'proxyTypeMtproto', secret: hexSecret },
      }),
      timeout(PING_TIMEOUT),
    ])

    await Promise.race([
      client.invoke({ _: 'pingProxy', proxy_id: proxy.id }),
      timeout(PING_TIMEOUT),
    ])

    return true
  } catch {
    return false
  } finally {
    try { await client.close() } catch {}
  }
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function runPool(tasks, limit) {
  const results = new Array(tasks.length)
  let next = 0

  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }

  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching proxy list...')
  const text = await fetchText(PROXY_SOURCE)

  const proxies = text
    .split('\n')
    .map((line, i) => ({ raw: line.trim(), i }))
    .filter(({ raw }) => raw.length > 0)
    .map(({ raw, i }) => {
      const p = parseProxyUrl(raw)
      if (!p) return null
      return {
        id:     i,
        server: p.server,
        port:   p.port,
        secret: p.secret,
        tgLink: `tg://proxy?server=${p.server}&port=${p.port}&secret=${p.secret}`,
        hex:    normalizeSecret(p.secret),
      }
    })
    .filter(Boolean)

  console.log(`Parsed ${proxies.length} valid proxies. Checking with concurrency=${CONCURRENCY}...`)

  const working = []
  let done = 0

  const tasks = proxies.map((proxy, idx) => async () => {
    const alive = await checkProxy(proxy.server, proxy.port, proxy.hex, idx)
    done++
    process.stdout.write(`\r  ${done}/${proxies.length} checked — working: ${working.length}  `)
    if (alive) working.push(proxy)
  })

  await runPool(tasks, CONCURRENCY)
  console.log(`\n\nDone: ${working.length} / ${proxies.length} proxies are working.`)

  // Save output
  const publicDir = path.join(__dirname, '..', 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

  const output = working.map(p => ({
    id:     p.id,
    server: p.server,
    port:   p.port,
    secret: p.secret,
    tgLink: p.tgLink,
  }))

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8')
  console.log(`Saved ${output.length} working proxies → ${OUTPUT}`)
}

main().catch(err => { console.error(err); process.exit(1) })
