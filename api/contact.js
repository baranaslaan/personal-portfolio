// Vercel Edge serverless function: proxies the hire-form to Web3Forms
// with the access key held server-side. Keeps the key out of the public
// bundle and rate-limits abuse to the function's IP.

export const config = { runtime: 'edge' }

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    return Response.json(
      { success: false, message: 'Form endpoint is not configured.' },
      { status: 500 }
    )
  }

  let incoming
  try {
    incoming = await request.formData()
  } catch {
    return Response.json(
      { success: false, message: 'Invalid form submission.' },
      { status: 400 }
    )
  }

  // Honeypot — if the hidden _botcheck field has any value, pretend success
  // so bots don't get feedback that we filtered them out.
  if (incoming.get('_botcheck')) {
    return Response.json({ success: true })
  }

  // Inject the server-held key. Drop any client-supplied access_key so it
  // can never be overridden from the outside.
  incoming.delete('access_key')
  incoming.append('access_key', accessKey)

  try {
    const upstream = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      body: incoming,
    })
    // Read as text first so a parse failure doesn't swallow a 2xx response;
    // some runtimes / response shapes don't decode reliably with .json().
    const raw = await upstream.text()
    let parsed = {}
    try { parsed = JSON.parse(raw) } catch { /* keep parsed = {} */ }

    if (upstream.ok) {
      return Response.json(
        { success: true, message: parsed.message || 'Submission received.' },
        { status: 200 }
      )
    }
    return Response.json(
      { success: false, message: parsed.message || raw || 'Form submission failed.' },
      { status: upstream.status }
    )
  } catch {
    return Response.json(
      { success: false, message: 'Network error reaching the form service.' },
      { status: 502 }
    )
  }
}
