import sharp from 'sharp'
import path from 'node:path'

const RAW = '/Users/baranaslan/portfolio/behance-export/raw'
const OUT = '/Users/baranaslan/portfolio/behance-export'
const AVATAR = '/Users/baranaslan/portfolio/public/avatar-baran.webp'
const C = {
  t1: '#F0F4FF', t2: '#8899B4', t3: '#6B7C99',
  accent: '#22C55E', accent2: '#4ADE80', card: '#0C1424', border: '#1A2538',
}
const FONT = "'Helvetica Neue','Helvetica','Arial',sans-serif"
const W = 808, H = 632

const roundMask = (w, h, r) =>
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`)).png().toBuffer()
const shadow = (w, h, r, b) =>
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#000"/></svg>`)).blur(b).png().toBuffer()

function bg(glowCx = W * 0.5, glowCy = 120, extra = '') {
  return `<defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0A1018"/><stop offset="0.6" stop-color="#060A11"/><stop offset="1" stop-color="#04070C"/></linearGradient>
    <radialGradient id="gl" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.30"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M46 0 L0 0 0 46" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <ellipse cx="${glowCx}" cy="${glowCy}" rx="520" ry="440" fill="url(#gl)"/>${extra}`
}

async function miniBrowser(shotPath, w, url = 'aslanbaran.com') {
  const m = await sharp(shotPath).metadata()
  const ch = 34, r = 14
  const sh = Math.round(m.height * (w / m.width))
  const shot = await sharp(shotPath).resize(w, sh).png().toBuffer()
  const chrome = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${ch}">
    <rect width="${w}" height="${ch}" fill="#0E1626"/>
    <circle cx="18" cy="17" r="4.5" fill="#FF5F57"/><circle cx="33" cy="17" r="4.5" fill="#FEBC2E"/><circle cx="48" cy="17" r="4.5" fill="#28C840"/>
    <rect x="${w*0.32}" y="8" width="${w*0.36}" height="18" rx="9" fill="#070C15"/>
    <text x="${w*0.5}" y="20" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${C.t2}">${url}</text></svg>`
  let card = await sharp({ create: { width: w, height: ch + sh, channels: 4, background: C.card } })
    .composite([{ input: Buffer.from(chrome), top: 0, left: 0 }, { input: shot, top: ch, left: 0 }]).png().toBuffer()
  card = await sharp(card).composite([{ input: await roundMask(w, ch + sh, r), blend: 'dest-in' }]).png().toBuffer()
  card = await sharp(card).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${ch+sh}"><rect x="0.5" y="0.5" width="${w-1}" height="${ch+sh-1}" rx="${r}" fill="none" stroke="${C.border}"/></svg>`) }]).png().toBuffer()
  return { buf: card, w, h: ch + sh }
}

// A — product shot: browser bleeding off the right, bold statement left
async function thumbA() {
  await sharp(path.join(RAW, 'home.png')).extract({ left: 0, top: 0, width: 2870, height: 2260 }).toFile(path.join(RAW, '_t_hero.png'))
  const b = await miniBrowser(path.join(RAW, '_t_hero.png'), 560)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bg(W*0.78, 180)}
    <g font-family="${FONT}">
      <text x="52" y="150" font-size="13" font-weight="700" letter-spacing="3" fill="${C.accent2}">PORTFOLIO · 2026</text>
      <text x="48" y="250" font-size="82" font-weight="800" fill="${C.t1}">Design</text>
      <text x="48" y="336" font-size="82" font-weight="800" fill="${C.accent}">&amp; Build.</text>
      <text x="52" y="410" font-size="19" font-weight="500" fill="${C.t2}">Baran Aslan — Product Designer</text>
      <text x="52" y="440" font-size="16" font-weight="400" fill="${C.t3}">aslanbaran.com</text>
    </g></svg>`
  const sh = await shadow(b.w, b.h, 14, 34)
  await sharp(Buffer.from(svg)).composite([
    { input: sh, top: 250, left: 372 }, { input: b.buf, top: 236, left: 360 },
  ]).png().toFile(path.join(OUT, 'thumb-a.png'))
  console.log('✓ thumb-a')
}

// B — editorial type: minimal, huge name, accent line
async function thumbB() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bg(W*0.5, H*0.5)}
    <g font-family="${FONT}" text-anchor="middle">
      <rect x="${W/2-118}" y="120" width="236" height="36" rx="18" fill="none" stroke="${C.accent}" stroke-opacity="0.5"/>
      <circle cx="${W/2-96}" cy="138" r="4" fill="${C.accent}"/>
      <text x="${W/2+8}" y="143" font-size="13" font-weight="700" letter-spacing="2.5" fill="${C.accent2}">PRODUCT DESIGNER</text>
      <text x="${W/2}" y="300" font-size="96" font-weight="800" fill="${C.t1}">Baran</text>
      <text x="${W/2}" y="392" font-size="96" font-weight="800" fill="${C.accent}">Aslan.</text>
      <line x1="${W/2-40}" y1="432" x2="${W/2+40}" y2="432" stroke="${C.border}" stroke-width="2"/>
      <text x="${W/2}" y="486" font-size="18" font-weight="500" fill="${C.t2}">Portfolio · UI/UX · Design + Build</text>
      <text x="${W/2}" y="514" font-size="15" font-weight="400" fill="${C.t3}">aslanbaran.com</text>
    </g></svg>`
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, 'thumb-b.png'))
  console.log('✓ thumb-b')
}

// Chosen thumbnail — "Baran Aslan" name layout, avatar right + green disc. Size-parametric.
async function coverC(w, h, out) {
  const s = w / 808
  const avH = Math.round(h * 0.84)
  const avatar = await sharp(AVATAR).resize({ height: avH }).png().toBuffer()
  const am = await sharp(avatar).metadata()
  const ax = Math.round(w * 0.55), ay = h - am.height + Math.round(6 * s)
  const disc = Math.round(am.height * 0.92)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${bgS(w, h, w*0.62, 150*s)}
    <defs><radialGradient id="disc" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.85"/><stop offset="0.68" stop-color="${C.accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${ax+am.width/2}" cy="${ay+am.height*0.48}" r="${disc/2}" fill="url(#disc)"/>
    <g font-family="${FONT}">
      <rect x="${52*s}" y="${170*s}" width="${196*s}" height="${34*s}" rx="${17*s}" fill="none" stroke="${C.accent}" stroke-opacity="0.5"/>
      <circle cx="${70*s}" cy="${187*s}" r="${4*s}" fill="${C.accent}"/>
      <text x="${86*s}" y="${192*s}" font-size="${12*s}" font-weight="700" letter-spacing="${2*s}" fill="${C.accent2}">PRODUCT DESIGNER</text>
      <text x="${50*s}" y="${288*s}" font-size="${64*s}" font-weight="800" fill="${C.t1}">Baran Aslan</text>
      <text x="${52*s}" y="${330*s}" font-size="${22*s}" font-weight="500" fill="${C.t2}">Portfolio · UI/UX · Designed &amp; built</text>
      <text x="${52*s}" y="${366*s}" font-size="${15*s}" font-weight="400" fill="${C.t3}">React · Vite · Framer Motion · aslanbaran.com</text>
    </g></svg>`
  await sharp(Buffer.from(svg)).composite([{ input: avatar, top: Math.max(ay, 30), left: ax }]).png().toFile(path.join(OUT, out))
  console.log('✓', out, `${w}x${h}`)
}

// size-parametric background
function bgS(w, h, glowCx, glowCy) {
  return `<defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0A1018"/><stop offset="0.6" stop-color="#060A11"/><stop offset="1" stop-color="#04070C"/></linearGradient>
    <radialGradient id="gl" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.30"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M46 0 L0 0 0 46" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/></pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <ellipse cx="${glowCx}" cy="${glowCy}" rx="${w*0.65}" ry="${h*0.7}" fill="url(#gl)"/>`
}

// chosen direction (C): render both the thumbnail and the large cover
await coverC(808, 632, 'cover-thumbnail.png')
await coverC(1600, 1200, '00-cover.png')
console.log('done')
