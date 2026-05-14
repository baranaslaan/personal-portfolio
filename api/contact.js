// Vercel Edge serverless function: proxies the hire-form to Web3Forms with
// the access key held server-side. Hardened against the most common abuse
// vectors for a public, anonymous contact form.

export const config = { runtime: 'edge' }

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

// Only these origins may POST to this endpoint. Vercel preview deployments
// (*.vercel.app) are also allowed so the user can test from preview URLs.
const ALLOWED_ORIGINS = [
  'https://aslanbaran.com',
  'https://www.aslanbaran.com',
]
const ALLOWED_ORIGIN_SUFFIXES = ['.vercel.app']

// Rate limiting — per-IP sliding window. Lives in module scope so it's shared
// across requests in the same Edge instance. Vercel may spin up multiple
// instances, so this is a best-effort soft cap (per instance), not a hard
// global limit. A real production system would use Vercel KV / Upstash; this
// is enough to break the common case of single-IP bot floods.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const rateLimits = new Map()

// Field sanity caps — anything larger is almost certainly a payload abuse
// attempt. These are well above realistic legitimate values.
const MAX_FIELD_LEN = {
  name: 200,
  email: 200,
  company: 200,
  project_type: 60,
  budget: 60,
  timeline: 60,
  message: 5000,
  subject: 200,
  from_name: 200,
  replyto: 200,
}

// File caps (must stay <= what HireModal allows client-side; both layers
// enforce so a direct API caller can't bypass the browser limit).
const MAX_FILE_BYTES = 3 * 1024 * 1024
const MAX_TOTAL_FILE_BYTES = 6 * 1024 * 1024
const MAX_FILES = 2

// Whitelist of fields the proxy will forward. Anything else the client adds
// is dropped — prevents an attacker from sneaking through Web3Forms control
// fields like `redirect` or `webhook` to change behavior.
const ALLOWED_TEXT_FIELDS = new Set([
  'subject', 'from_name', 'replyto',
  'name', 'email', 'company',
  'project_type', 'budget', 'timeline', 'message',
])

function clientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin)) return true
  try {
    const host = new URL(origin).hostname
    return ALLOWED_ORIGIN_SUFFIXES.some(suffix => host.endsWith(suffix))
  } catch {
    return false
  }
}

function checkRateLimit(ip) {
  const now = Date.now()
  const timestamps = (rateLimits.get(ip) || []).filter(
    t => now - t < RATE_LIMIT_WINDOW_MS
  )
  if (timestamps.length >= RATE_LIMIT_MAX) return false
  timestamps.push(now)
  rateLimits.set(ip, timestamps)

  // Opportunistic cleanup so the map doesn't grow unbounded over time.
  if (rateLimits.size > 1000) {
    for (const [key, vals] of rateLimits.entries()) {
      const fresh = vals.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
      if (fresh.length === 0) rateLimits.delete(key)
      else rateLimits.set(key, fresh)
    }
  }
  return true
}

// CR/LF in an email or name field is the classic email-header-injection
// vector. Even though Web3Forms likely sanitizes, defense-in-depth.
function hasControlChars(s) {
  return /[\r\n\0]/.test(s)
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && !hasControlChars(s)
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  // 1) Origin allowlist — blocks CSRF from arbitrary sites. Browsers always
  // attach Origin on cross-site fetch POSTs.
  const origin = request.headers.get('origin')
  if (!isAllowedOrigin(origin)) {
    return jsonResponse(
      { success: false, message: 'Origin not allowed.' },
      403
    )
  }

  // 2) Rate limit by IP
  const ip = clientIp(request)
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Too many requests. Please wait a minute and try again.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    )
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    return jsonResponse(
      { success: false, message: 'Form endpoint is not configured.' },
      500
    )
  }

  let incoming
  try {
    incoming = await request.formData()
  } catch {
    return jsonResponse(
      { success: false, message: 'Invalid form submission.' },
      400
    )
  }

  // 3) Honeypot — silently absorb dumb bots that fill the hidden field.
  if (incoming.get('_botcheck')) {
    return jsonResponse({ success: true })
  }

  // 4) Build a clean FormData with only whitelisted fields, validating each.
  const clean = new FormData()
  let fileCount = 0
  let totalFileBytes = 0

  for (const [key, value] of incoming.entries()) {
    // Files: attachment_1, attachment_2, ...
    if (key.startsWith('attachment_')) {
      // In Edge runtime, file entries are File/Blob-like with .size and .name
      if (typeof value === 'string') continue
      const size = value.size ?? 0
      if (size > MAX_FILE_BYTES) {
        return jsonResponse(
          { success: false, message: 'A file exceeds the 3 MB limit.' },
          413
        )
      }
      fileCount += 1
      totalFileBytes += size
      if (fileCount > MAX_FILES) {
        return jsonResponse(
          { success: false, message: 'Too many attachments.' },
          413
        )
      }
      if (totalFileBytes > MAX_TOTAL_FILE_BYTES) {
        return jsonResponse(
          { success: false, message: 'Attachments exceed the total size limit.' },
          413
        )
      }
      clean.append(key, value, value.name)
      continue
    }

    // Text fields
    if (!ALLOWED_TEXT_FIELDS.has(key)) continue
    if (typeof value !== 'string') continue

    const max = MAX_FIELD_LEN[key] ?? 1000
    if (value.length > max) {
      return jsonResponse(
        { success: false, message: `Field "${key}" is too long.` },
        400
      )
    }

    if (key === 'email' || key === 'replyto') {
      if (value && !isValidEmail(value)) {
        return jsonResponse(
          { success: false, message: 'Invalid email address.' },
          400
        )
      }
    } else if (hasControlChars(value)) {
      return jsonResponse(
        { success: false, message: `Field "${key}" contains invalid characters.` },
        400
      )
    }

    clean.append(key, value)
  }

  // 5) Inject server-held access_key (any client-supplied value is dropped
  // implicitly because access_key isn't in ALLOWED_TEXT_FIELDS).
  clean.append('access_key', accessKey)

  try {
    const upstream = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      body: clean,
    })
    // Read as text first so a parse failure doesn't swallow a 2xx response;
    // some runtimes / response shapes don't decode reliably with .json().
    const raw = await upstream.text()
    let parsed = {}
    try { parsed = JSON.parse(raw) } catch { /* keep parsed = {} */ }

    if (upstream.ok) {
      return jsonResponse(
        { success: true, message: parsed.message || 'Submission received.' },
        200
      )
    }
    return jsonResponse(
      { success: false, message: parsed.message || 'Form submission failed.' },
      upstream.status
    )
  } catch {
    return jsonResponse(
      { success: false, message: 'Network error reaching the form service.' },
      502
    )
  }
}
