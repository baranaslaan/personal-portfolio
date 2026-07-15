import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const RAW = '/Users/baranaslan/portfolio/behance-export/raw'
const OUT = '/Users/baranaslan/portfolio/behance-export'
const AVATAR = '/Users/baranaslan/portfolio/public/avatar-baran.png'

// ---- palette (matches site tokens) ----
const C = {
  bg0: '#04070C', bg1: '#070C15', bg2: '#0A101C',
  card: '#0C1424', border: '#1A2538',
  t1: '#F0F4FF', t2: '#8899B4', t3: '#6B7C99',
  accent: '#22C55E', accent2: '#4ADE80',
}
const FONT = "'Helvetica Neue','Helvetica','Arial',sans-serif"
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

const W = 1600          // board width
const M = 110           // side margin
const CW = W - M * 2    // card inner width (browser)
const CHROME = 58       // browser chrome bar height
const RAD = 20          // card corner radius

// ---------- shared SVG snippets ----------
function bgLayer(w, h) {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.bg1}"/>
        <stop offset="0.55" stop-color="${C.bg0}"/>
        <stop offset="1" stop-color="${C.bg0}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0" r="0.75">
        <stop offset="0" stop-color="${C.accent}" stop-opacity="0.16"/>
        <stop offset="0.5" stop-color="${C.accent}" stop-opacity="0.04"/>
        <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M80 0 L0 0 0 80" fill="none" stroke="#FFFFFF" stroke-opacity="0.022" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#grid)"/>
    <rect width="${w}" height="${Math.min(h, 900)}" fill="url(#glow)"/>`
}

// caption block drawn at top of a board
function captionSVG(w, label, title, subtitle) {
  const lx = M
  return `
    <g>
      <circle cx="${lx + 5}" cy="66" r="5" fill="${C.accent}"/>
      <text x="${lx + 20}" y="72" font-family="${FONT}" font-size="15" font-weight="700"
            letter-spacing="2.5" fill="${C.accent2}">${esc(label.toUpperCase())}</text>
      <text x="${lx}" y="128" font-family="${FONT}" font-size="42" font-weight="800"
            fill="${C.t1}">${esc(title)}</text>
      ${subtitle ? `<text x="${lx}" y="166" font-family="${FONT}" font-size="19"
            font-weight="400" fill="${C.t2}">${esc(subtitle)}</text>` : ''}
    </g>`
}
const CAPTION_H = 210   // vertical space reserved for caption block

// rounded-rect mask buffer
async function roundMask(w, h, r) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// soft shadow png for a rounded rect
async function shadowBuf(w, h, r, blur = 34) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#000"/></svg>`
  return sharp(Buffer.from(svg)).blur(blur).png().toBuffer()
}

// ---------- browser frame ----------
async function browserCard(shotPath, url) {
  const shot = sharp(shotPath)
  const meta = await shot.metadata()
  const innerW = CW
  const shotH = Math.round(meta.height * (innerW / meta.width))
  const shotBuf = await sharp(shotPath).resize(innerW, shotH).png().toBuffer()

  const cardH = CHROME + shotH
  // chrome bar svg
  const dot = (cx, col) => `<circle cx="${cx}" cy="${CHROME/2}" r="7" fill="${col}"/>`
  const pillW = Math.min(560, innerW * 0.42)
  const pillX = (innerW - pillW) / 2
  const chromeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${innerW}" height="${CHROME}">
      <rect width="${innerW}" height="${CHROME}" fill="#0E1626"/>
      <line x1="0" y1="${CHROME-0.5}" x2="${innerW}" y2="${CHROME-0.5}" stroke="${C.border}" stroke-width="1"/>
      ${dot(30,'#FF5F57')}${dot(54,'#FEBC2E')}${dot(78,'#28C840')}
      <rect x="${pillX}" y="${(CHROME-30)/2}" width="${pillW}" height="30" rx="15" fill="#070C15" stroke="${C.border}" stroke-width="1"/>
      <circle cx="${pillX+22}" cy="${CHROME/2}" r="4.5" fill="none" stroke="${C.accent}" stroke-width="1.6"/>
      <text x="${pillX+pillW/2}" y="${CHROME/2+5}" text-anchor="middle" font-family="${FONT}" font-size="15" fill="${C.t2}">${esc(url)}</text>
    </svg>`

  // assemble flat card (card bg + chrome + shot), then round corners
  let card = sharp({ create: { width: innerW, height: cardH, channels: 4, background: C.card } })
    .composite([
      { input: Buffer.from(chromeSVG), top: 0, left: 0 },
      { input: shotBuf, top: CHROME, left: 0 },
    ])
  let cardBuf = await card.png().toBuffer()
  // round the whole card
  const mask = await roundMask(innerW, cardH, RAD)
  cardBuf = await sharp(cardBuf)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png().toBuffer()
  // hairline border
  const borderSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${innerW}" height="${cardH}">
     <rect x="0.5" y="0.5" width="${innerW-1}" height="${cardH-1}" rx="${RAD}" ry="${RAD}" fill="none" stroke="${C.border}" stroke-width="1"/></svg>`
  cardBuf = await sharp(cardBuf).composite([{ input: Buffer.from(borderSVG) }]).png().toBuffer()
  return { buf: cardBuf, w: innerW, h: cardH }
}

async function buildBoard({ out, shot, crop, label, title, subtitle, url = 'aslanbaran.com' }) {
  let shotPath = path.join(RAW, shot)
  if (crop) {
    const c = sharp(path.join(RAW, shot)).extract({ left: 0, top: crop[0], width: 2870, height: crop[1]-crop[0] })
    shotPath = path.join(RAW, `_crop_${out}.png`)
    await c.png().toFile(shotPath)
  }
  const card = await browserCard(shotPath, url)
  const boardH = CAPTION_H + card.h + 90
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${boardH}">
     ${bgLayer(W, boardH)} ${captionSVG(W, label, title, subtitle)} ${footerSVG(W, boardH, M)}</svg>`)
  const shadow = await shadowBuf(card.w, card.h, RAD, 40)
  await sharp(base)
    .composite([
      { input: shadow, top: CAPTION_H + 26, left: M, blend: 'over' },
      { input: card.buf, top: CAPTION_H, left: M },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, out))
  console.log('✓', out, `${W}x${boardH}`)
}

// ---------- phone frame ----------
async function phoneFrame(shotPath, screenW) {
  const meta = await sharp(shotPath).metadata()
  const screenH = Math.round(meta.height * (screenW / meta.width))
  const bezel = 14
  const bodyW = screenW + bezel * 2
  const bodyH = screenH + bezel * 2
  const rBody = 58, rScreen = 46
  const shotBuf = await sharp(shotPath).resize(screenW, screenH).png().toBuffer()
  // screen with rounded corners
  const sMask = await roundMask(screenW, screenH, rScreen)
  const screen = await sharp(shotBuf).composite([{ input: sMask, blend: 'dest-in' }]).png().toBuffer()
  // body
  const bodySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${bodyW}" height="${bodyH}">
     <rect width="${bodyW}" height="${bodyH}" rx="${rBody}" ry="${rBody}" fill="#05080E" stroke="#232F45" stroke-width="1.5"/></svg>`
  let body = await sharp(Buffer.from(bodySVG))
    .composite([{ input: screen, top: bezel, left: bezel }])
    .png().toBuffer()
  return { buf: body, w: bodyW, h: bodyH }
}

// Top strip carrying only the Dynamic Island (no fake time/signal/wifi/battery).
// The strip keeps the site header fully visible instead of clipping it.
function statusBarSVG(w, h, s, bg = '#080E1A') {
  const isW = 118 * s, isH = 33 * s
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <rect x="${(w - isW) / 2}" y="${(h - isH) / 2}" width="${isW}" height="${isH}" rx="${isH / 2}" fill="#000"/>
    <circle cx="${(w + isW) / 2 - isH * 0.55}" cy="${h / 2}" r="${isH * 0.19}" fill="#0B0E14"/>
  </svg>`
}

// ---------- realistic iPhone 17 frame (single) ----------
async function iphone17(shotPath, screenW) {
  const scale = screenW / 402
  const m = await sharp(shotPath).metadata()
  const shotH = Math.round(m.height * (screenW / m.width))   // undistorted
  const sbH = Math.round(50 * scale)                          // status bar
  const screenH = sbH + shotH
  const rScreen = Math.round(55 * scale)     // display corner radius
  const rim = Math.round(11 * scale)         // titanium rail thickness
  const bodyW = screenW + rim * 2
  const bodyH = screenH + rim * 2
  const rBody = rScreen + rim
  const btnPad = Math.round(5 * scale)       // room for side buttons

  // screen = status bar (with island) on top + full-visible screenshot below
  const shotBuf = await sharp(shotPath).resize(screenW, shotH).png().toBuffer()
  let screen = await sharp({ create: { width: screenW, height: screenH, channels: 4, background: '#080E1A' } })
    .composite([
      { input: Buffer.from(statusBarSVG(screenW, sbH, scale)), top: 0, left: 0 },
      { input: shotBuf, top: sbH, left: 0 },
    ]).png().toBuffer()
  const sMask = await roundMask(screenW, screenH, rScreen)
  screen = await sharp(screen).composite([{ input: sMask, blend: 'dest-in' }]).png().toBuffer()

  // body: titanium rail + brushed edge + side buttons
  const bw = bodyW + btnPad * 2
  const bg = Math.round(2 * scale)
  const bodySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bodyH}">
    <defs>
      <linearGradient id="rail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3A4354"/><stop offset="0.06" stop-color="#12161F"/>
        <stop offset="0.5" stop-color="#1C2230"/><stop offset="0.94" stop-color="#12161F"/>
        <stop offset="1" stop-color="#3A4354"/></linearGradient>
    </defs>
    <!-- side buttons -->
    <rect x="0" y="${bodyH*0.20}" width="${btnPad+2}" height="${34*scale}" rx="3" fill="#161B26"/>
    <rect x="0" y="${bodyH*0.28}" width="${btnPad+2}" height="${64*scale}" rx="3" fill="#161B26"/>
    <rect x="0" y="${bodyH*0.37}" width="${btnPad+2}" height="${64*scale}" rx="3" fill="#161B26"/>
    <rect x="${bw-btnPad-2}" y="${bodyH*0.30}" width="${btnPad+2}" height="${96*scale}" rx="3" fill="#161B26"/>
    <!-- rail -->
    <rect x="${btnPad}" y="0" width="${bodyW}" height="${bodyH}" rx="${rBody}" fill="url(#rail)"/>
    <rect x="${btnPad+bg}" y="${bg}" width="${bodyW-bg*2}" height="${bodyH-bg*2}" rx="${rBody-bg}" fill="#05070C"/>
  </svg>`
  const body = await sharp(Buffer.from(bodySVG))
    .composite([{ input: screen, top: rim, left: btnPad + rim }])
    .png().toBuffer()
  return { buf: body, w: bw, h: bodyH }
}

async function buildResponsive(outName = '08-mobile.png') {
  const phone = await iphone17(path.join(RAW, 'iphone-home.png'), 560)
  const left = Math.round((W - phone.w) / 2)
  const top = CAPTION_H + 24
  const boardH = top + phone.h + 130
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${boardH}">
     ${bgLayer(W, boardH)}
     ${captionSVG(W,'Responsive','Pixel-perfect on mobile','The full experience reflows to iPhone — try it live at aslanbaran.com')}
     ${footerSVG(W, boardH, M)}</svg>`)
  await sharp(base)
    .composite([{ input: phone.buf, top, left }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, outName))
  console.log('✓', outName, `${W}x${boardH}`)
}

// ---------- cover / thumbnail ----------
async function buildCover(w, h, outName) {
  const scale = w / 808
  const avatarH = Math.round(h * 0.86)
  const avatar = await sharp(AVATAR).resize({ height: avatarH }).png().toBuffer()
  const am = await sharp(avatar).metadata()
  const ax = Math.round(w * 0.60)
  const ay = h - am.height + Math.round(20*scale)
  // green disc behind avatar
  const disc = Math.round(am.height * 0.9)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    ${bgLayer(w, h)}
    <defs>
      <radialGradient id="disc" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="${C.accent}" stop-opacity="0.9"/>
        <stop offset="0.7" stop-color="${C.accent}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="${ax + am.width/2}" cy="${ay + am.height*0.5}" r="${disc/2}" fill="url(#disc)"/>
    <g font-family="${FONT}">
      <rect x="${60*scale}" y="${h*0.26}" width="${232*scale}" height="${34*scale}" rx="${17*scale}"
            fill="none" stroke="${C.accent}" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="${78*scale}" cy="${h*0.26 + 17*scale}" r="${4*scale}" fill="${C.accent}"/>
      <text x="${94*scale}" y="${h*0.26 + 22*scale}" font-size="${13*scale}" font-weight="700"
            letter-spacing="${2.5*scale}" fill="${C.accent2}">PRODUCT DESIGNER</text>
      <text x="${58*scale}" y="${h*0.50}" font-size="${70*scale}" font-weight="800" fill="${C.t1}">Baran Aslan</text>
      <text x="${60*scale}" y="${h*0.62}" font-size="${25*scale}" font-weight="500" fill="${C.t2}">Portfolio · UI/UX · Design + Build</text>
      <text x="${60*scale}" y="${h*0.90}" font-size="${17*scale}" font-weight="600" fill="${C.t3}">aslanbaran.com</text>
    </g>
  </svg>`
  await sharp(Buffer.from(svg))
    .composite([{ input: avatar, top: ay, left: ax }])
    .png().toFile(path.join(OUT, outName))
  console.log('✓', outName, `${w}x${h}`)
}

// ---------- text helpers ----------
function wrap(text, fs, maxW, cpf = 0.53) {
  const max = Math.max(6, Math.floor(maxW / (fs * cpf)))
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w }
    else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}
function multiline(x, y, text, { fs = 18, fill = C.t2, weight = 400, lh = 1.55, maxW = 600 } = {}) {
  const lines = wrap(text, fs, maxW)
  const step = fs * lh
  const spans = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : step}">${esc(l)}</tspan>`).join('')
  return { svg: `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${fs}" font-weight="${weight}" fill="${fill}">${spans}</text>`, h: lines.length * step }
}
function chip(x, y, label, { fill = 'none', stroke = C.border, text = C.t2, fs = 15, pad = 16, h = 34, dot = null } = {}) {
  const w = Math.round(label.length * fs * 0.56) + pad * 2 + (dot ? 16 : 0)
  const tx = x + pad + (dot ? 16 : 0)
  return {
    svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      ${dot ? `<circle cx="${x+pad+4}" cy="${y+h/2}" r="4" fill="${dot}"/>` : ''}
      <text x="${tx}" y="${y+h/2+fs*0.35}" font-family="${FONT}" font-size="${fs}" font-weight="600" fill="${text}">${esc(label)}</text></g>`,
    w,
  }
}
function button(x, y, label, kind = 'primary') {
  const fs = 17, h = 52, pad = 30
  const w = Math.round(label.length * fs * 0.55) + pad * 2
  if (kind === 'primary')
    return { svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${C.accent}"/>
      <text x="${x+w/2}" y="${y+h/2+fs*0.35}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" font-weight="700" fill="${C.accent2 && '#071010'}">${esc(label)}</text></g>`, w }
  return { svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="none" stroke="${C.border2 || '#2A3A52'}" stroke-width="1.4"/>
    <text x="${x+w/2}" y="${y+h/2+fs*0.35}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" font-weight="600" fill="${C.t1}">${esc(label)}</text></g>`, w }
}
function footerSVG(w, boardH, marginX) {
  const fy = boardH - 34
  return `<g>
    <line x1="${marginX}" y1="${fy-24}" x2="${w-marginX}" y2="${fy-24}" stroke="${C.border}" stroke-width="1" stroke-opacity="0.6"/>
    <text x="${marginX}" y="${fy}" font-family="${FONT}" font-size="15" font-weight="700" fill="${C.t3}">aslanbaran.com</text>
    <text x="${w-marginX}" y="${fy}" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="500" fill="${C.t3 && '#4A5A72'}">Baran Aslan · Product Designer · 2026</text>
  </g>`
}
function sectionLabel(x, y, txt) {
  return `<g><rect x="${x}" y="${y-11}" width="22" height="2" fill="${C.accent}"/>
    <text x="${x+34}" y="${y-4}" font-family="${FONT}" font-size="14" font-weight="700" letter-spacing="2.5" fill="${C.accent2}">${esc(txt.toUpperCase())}</text></g>`
}

// ---------- case study (narrative) ----------
async function buildCaseStudy() {
  const M2 = 130, cw = W - M2 * 2
  const frags = []
  let y = 210
  // meta chips
  const metas = ['Role · Design + Build (solo)', 'Year · 2026', 'Stack · React · Vite · Framer Motion', 'Live · aslanbaran.com']
  let mx = M2
  for (const m of metas) { const c = chip(mx, y, m, { fs: 15 }); frags.push(c.svg); mx += c.w + 12 }
  y += 34 + 60

  // The goal
  frags.push(sectionLabel(M2, y, 'The goal')); y += 22
  const goal = multiline(M2, y + 8, 'A portfolio that proves the claim on its own homepage: that I both design and build. Not a template filled with case studies — a product designed from tokens up and shipped to production, where the site itself is the first case study.', { fs: 26, fill: C.t1, weight: 500, lh: 1.5, maxW: cw })
  frags.push(goal.svg); y += goal.h + 70

  // Approach — 3 columns
  frags.push(sectionLabel(M2, y, 'Approach')); y += 40
  const cols = [
    ['01', 'A system, not pages', 'One token layer — colour, type, spacing, radius — drives every screen. Components compose from the same variables, so the whole site stays consistent and quick to extend.'],
    ['02', 'Motion with intent', 'Framer Motion handles page transitions, the intro gate, and scroll reveals. Everything respects prefers-reduced-motion, so the craft never costs accessibility.'],
    ['03', 'Bilingual & accessible', 'Full TR/EN via i18next, semantic markup, keyboard paths and WCAG-minded contrast. Routes are lazy-loaded and each ships its own SEO / OG metadata.'],
  ]
  const colW = (cw - 2 * 44) / 3
  let colMaxH = 0
  cols.forEach((c, i) => {
    const cx = M2 + i * (colW + 44)
    frags.push(`<text x="${cx}" y="${y+4}" font-family="${FONT}" font-size="22" font-weight="800" fill="${C.accent}">${c[0]}</text>`)
    frags.push(`<text x="${cx}" y="${y+44}" font-family="${FONT}" font-size="21" font-weight="700" fill="${C.t1}">${esc(c[1])}</text>`)
    const b = multiline(cx, y + 78, c[2], { fs: 17, fill: C.t2, lh: 1.6, maxW: colW })
    frags.push(b.svg)
    colMaxH = Math.max(colMaxH, 78 + b.h)
  })
  y += colMaxH + 70

  // The build
  frags.push(sectionLabel(M2, y, 'The build')); y += 22
  const build = multiline(M2, y + 8, 'Coded end-to-end in React 19 + Vite and deployed on Vercel. The /lab section holds six self-initiated, fully-coded interaction experiments — spring physics, scroll cinema, a live design-token forge — so the portfolio doubles as a playground and a proof of build capability.', { fs: 20, fill: C.t2, weight: 400, lh: 1.6, maxW: cw })
  frags.push(build.svg); y += build.h + 70

  // Outcome — stats
  frags.push(sectionLabel(M2, y, 'Outcome')); y += 40
  const stats = [['8', 'Case studies'], ['6', 'Coded lab experiments'], ['TR / EN', 'Fully bilingual'], ['0', 'Templates used']]
  const sW = (cw - 3 * 32) / 4
  stats.forEach((s, i) => {
    const sx = M2 + i * (sW + 32)
    frags.push(`<line x1="${sx}" y1="${y-4}" x2="${sx}" y2="${y+70}" stroke="${C.border}" stroke-width="2"/>`)
    frags.push(`<text x="${sx+22}" y="${y+34}" font-family="${FONT}" font-size="40" font-weight="800" fill="${C.t1}">${esc(s[0])}</text>`)
    frags.push(`<text x="${sx+22}" y="${y+62}" font-family="${FONT}" font-size="16" font-weight="500" fill="${C.t3}">${esc(s[1])}</text>`)
  })
  y += 90

  const boardH = Math.round(y + 100)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${boardH}">
    ${bgLayer(W, boardH)}
    ${captionSVG(W, 'Case Study', 'Designing & building my portfolio', 'aslanbaran.com — a product designed from tokens up and shipped')}
    ${frags.join('\n')}
    ${footerSVG(W, boardH, M2)}</svg>`
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, '03-case-study.png'))
  console.log('✓ 03-case-study.png', `${W}x${boardH}`)
}

// ---------- design system ----------
function swatch(x, y, w, name, hex) {
  const dark = parseInt(hex.slice(1), 16) < 0x333333
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="120" rx="14" fill="${hex}" stroke="${dark ? C.border : 'none'}" stroke-width="1"/>
    <text x="${x+4}" y="${y+150}" font-family="${FONT}" font-size="16" font-weight="700" fill="${C.t1}">${esc(name)}</text>
    <text x="${x+4}" y="${y+174}" font-family="${FONT}" font-size="14" font-weight="500" fill="${C.t3}">${esc(hex)}</text>
  </g>`
}
async function buildDesignSystem(outName = '04-design-system.png', compact = false) {
  const M2 = 130, cw = W - M2 * 2
  const frags = []
  let y = 230

  // COLOUR
  frags.push(sectionLabel(M2, y, 'Colour')); y += 34
  const rows = [
    ['Surfaces', [['bg', '#080E1A'], ['sunken', '#090F1C'], ['card', '#0C1424'], ['elevated', '#111827'], ['border', '#1A2538'], ['border-2', '#2A3A52']]],
    ['Text', [['text-1', '#F0F4FF'], ['text-2', '#8899B4'], ['text-3', '#6B7C99'], ['faint', '#4A5A72']]],
    ['Accent', [['accent', '#22C55E'], ['accent-2', '#4ADE80'], ['deep', '#16A34A'], ['on-accent', '#071010']]],
  ]
  for (const [rl, sw] of rows) {
    frags.push(`<text x="${M2}" y="${y+16}" font-family="${FONT}" font-size="18" font-weight="700" fill="${C.t1}">${esc(rl)}</text>`)
    const gap = 24, n = 6, w = (cw - gap * (n - 1)) / n
    sw.forEach((s, i) => frags.push(swatch(M2 + i * (w + gap), y + 34, w, s[0], s[1])))
    y += 34 + 120 + 66
  }
  y += 24

  // TYPE
  frags.push(sectionLabel(M2, y, 'Typography')); y += 34
  const cardW = (cw - 40) / 2, cardH = 260
  const typeCard = (x, fam, role, sample, scale) => `<g>
    <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="18" fill="${C.card}" stroke="${C.border}" stroke-width="1"/>
    <text x="${x+36}" y="${y+58}" font-family="${FONT}" font-size="20" font-weight="700" fill="${C.accent2}">${esc(fam)}</text>
    <text x="${x+36}" y="${y+84}" font-family="${FONT}" font-size="15" font-weight="500" fill="${C.t3}">${esc(role)}</text>
    <text x="${x+cardW-40}" y="${y+96}" text-anchor="end" font-family="${FONT}" font-size="96" font-weight="800" fill="${C.t1}">Aa</text>
    <text x="${x+36}" y="${y+160}" font-family="${FONT}" font-size="30" font-weight="700" fill="${C.t1}">${esc(sample)}</text>
    <text x="${x+36}" y="${y+212}" font-family="${FONT}" font-size="16" font-weight="500" fill="${C.t2}" letter-spacing="1">${esc(scale)}</text>
  </g>`
  frags.push(typeCard(M2, 'Archivo', 'Display & headings · 800 / 700', 'Digital Product Designer.', '110 · 64 · 54 · 46 · 28'))
  frags.push(typeCard(M2 + cardW + 40, 'Space Grotesk', 'Body & UI · 500 / 400', 'The quiet craft of interfaces', '22 · 18 · 16 · 15 · 14 · 12'))
  y += cardH + 66

  // COMPONENTS
  frags.push(sectionLabel(M2, y, 'Components')); y += 34
  const panelH = 300
  frags.push(`<rect x="${M2}" y="${y}" width="${cw}" height="${panelH}" rx="18" fill="${C.card}" stroke="${C.border}" stroke-width="1"/>`)
  const px = M2 + 44
  // buttons row
  let bx = px
  const b1 = button(bx, y + 44, 'View Work  →', 'primary'); frags.push(b1.svg); bx += b1.w + 20
  const b2 = button(bx, y + 44, 'Get in Touch', 'secondary'); frags.push(b2.svg); bx += b2.w + 20
  const hire = chip(bx, y + 53, 'Hire Me', { fs: 16, h: 34, stroke: C.accent, text: C.accent2, dot: C.accent }); frags.push(hire.svg)
  // badge row
  const badge = chip(px, y + 128, 'Open to new projects', { fs: 15, h: 34, fill: 'rgba(34,197,94,0.10)', stroke: 'rgba(34,197,94,0.4)', text: C.accent2, dot: C.accent })
  frags.push(badge.svg)
  // tag chips
  let tx = px, ty = y + 190
  for (const t of ['Web Design', 'Design System', 'React', 'Framer Motion', 'UI/UX']) { const c = chip(tx, ty, t, { fs: 14, h: 32, text: C.t2 }); frags.push(c.svg); tx += c.w + 12 }
  // radius chips (right side)
  const radii = [['6', 6], ['12', 12], ['20', 20], ['∞', 26]]
  let rx = M2 + cw - 44 - (radii.length * 76)
  frags.push(`<text x="${rx}" y="${y+34}" font-family="${FONT}" font-size="15" font-weight="600" fill="${C.t3}">Radius</text>`)
  radii.forEach((r, i) => {
    const cxr = rx + i * 76
    frags.push(`<rect x="${cxr}" y="${y+48}" width="60" height="60" rx="${r[1]}" fill="none" stroke="${C.border2 || '#2A3A52'}" stroke-width="1.5"/>
      <text x="${cxr+30}" y="${y+126}" text-anchor="middle" font-family="${FONT}" font-size="13" fill="${C.t3}">${esc(r[0])}</text>`)
  })
  y += panelH + (compact ? 10 : 60)

  if (!compact) {
  // SPACING
  frags.push(sectionLabel(M2, y, 'Spacing · 4px base')); y += 50
  { let sx = M2
    for (const s of [4, 8, 12, 16, 24, 32, 48, 64, 80]) {
      const bw = Math.max(s, 3)
      frags.push(`<rect x="${sx}" y="${y}" width="${bw}" height="54" rx="3" fill="rgba(34,197,94,0.20)" stroke="${C.accent}" stroke-opacity="0.55"/>`)
      frags.push(`<text x="${sx}" y="${y+78}" font-family="${FONT}" font-size="13" fill="${C.t3}">${s}</text>`)
      sx += bw + 36
    }
    y += 54 + 60
  }

  // ELEVATION
  frags.push(sectionLabel(M2, y, 'Elevation')); y += 50
  { const elevs = [['shadow-sm', '0 · 4 · 12'], ['shadow-md', '0 · 8 · 24'], ['shadow-lg', '0 · 20 · 40']]
    const ecW = (cw - 2 * 44) / 3
    elevs.forEach((e, i) => {
      const ex = M2 + i * (ecW + 44)
      frags.push(`<rect x="${ex}" y="${y}" width="${ecW}" height="126" rx="16" fill="${C.bg2}" stroke="${C.border}" filter="url(#sh${i})"/>`)
      frags.push(`<text x="${ex+26}" y="${y+56}" font-family="${FONT}" font-size="18" font-weight="700" fill="${C.t1}">${esc(e[0])}</text>`)
      frags.push(`<text x="${ex+26}" y="${y+84}" font-family="${FONT}" font-size="14" fill="${C.t3}">rgba(0,0,0) · ${esc(e[1])} px</text>`)
    })
    y += 126 + 60
  }

  // MOTION
  frags.push(sectionLabel(M2, y, 'Motion')); y += 50
  { const eas = [['ease-out', [0.22, 1, 0.36, 1]], ['ease-spring', [0.16, 1, 0.3, 1]]]
    const bs = 148
    eas.forEach((ea, i) => {
      const bx = M2 + i * (bs + 70)
      const [x1, y1, x2, y2] = ea[1]
      const px = t => bx + 14 + t * (bs - 28), py = v => y + (bs - 14) - v * (bs - 28)
      frags.push(`<rect x="${bx}" y="${y}" width="${bs}" height="${bs}" rx="14" fill="${C.card}" stroke="${C.border}"/>`)
      frags.push(`<circle cx="${px(0)}" cy="${py(0)}" r="4" fill="${C.t3}"/><circle cx="${px(1)}" cy="${py(1)}" r="4" fill="${C.accent}"/>`)
      frags.push(`<path d="M${px(0)},${py(0)} C ${px(x1)},${py(y1)} ${px(x2)},${py(y2)} ${px(1)},${py(1)}" fill="none" stroke="${C.accent2}" stroke-width="2.5"/>`)
      frags.push(`<text x="${bx}" y="${y+bs+28}" font-family="${FONT}" font-size="15" font-weight="600" fill="${C.t2}">${esc(ea[0])}</text>`)
    })
    let dx = M2 + 2 * (bs + 70) + 20
    frags.push(`<text x="${dx}" y="${y+18}" font-family="${FONT}" font-size="15" font-weight="600" fill="${C.t3}">Duration</text>`)
    ;['150ms · fast', '220ms · base', '320ms · slow'].forEach((d, i) => {
      const c = chip(dx, y + 40 + i * 46, d, { fs: 15, h: 34, text: C.t2 }); frags.push(c.svg)
    })
    y += bs + 40 + 60
  }
  } // end !compact

  const boardH = Math.round(y + 20)
  const shadowDefs = `<defs>
    <filter id="sh0" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.35"/></filter>
    <filter id="sh1" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.45"/></filter>
    <filter id="sh2" x="-40%" y="-40%" width="180%" height="220%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.55"/></filter>
  </defs>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${boardH}">
    ${bgLayer(W, boardH)} ${shadowDefs}
    ${captionSVG(W, 'Design System', 'The tokens behind the site', compact
      ? 'One variable layer — colour, type, components — drives every screen'
      : 'One variable layer — colour, type, spacing, elevation, motion — drives every screen')}
    ${frags.join('\n')}
    ${footerSVG(W, boardH, M2)}</svg>`
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, outName))
  console.log('✓', outName, `${W}x${boardH}`)
}

// ---------- concise single-image case study (one continuous background) ----------
async function buildConcise() {
  const MX = 110
  const frags = [], comps = []
  let y = 0

  // cover — "Baran Aslan" name layout, avatar right + green disc (matches thumbnail)
  const coverH = 1040
  const avatar = await sharp(AVATAR).resize({ height: Math.round(coverH * 0.84) }).png().toBuffer()
  const am = await sharp(avatar).metadata()
  const ax = Math.round(W * 0.55), ay = Math.max(coverH - am.height + 6, 40)
  const disc = Math.round(am.height * 0.92)
  frags.push(`<defs><radialGradient id="disc" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.85"/><stop offset="0.68" stop-color="${C.accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${ax+am.width/2}" cy="${ay+am.height*0.48}" r="${disc/2}" fill="url(#disc)"/>`)
  comps.push({ input: avatar, top: ay, left: ax })
  frags.push(`<g font-family="${FONT}">
    <rect x="${MX}" y="${coverH*0.27}" width="248" height="40" rx="20" fill="none" stroke="${C.accent}" stroke-opacity="0.5"/>
    <circle cx="${MX+22}" cy="${coverH*0.27+20}" r="5" fill="${C.accent}"/>
    <text x="${MX+40}" y="${coverH*0.27+26}" font-size="15" font-weight="700" letter-spacing="2.5" fill="${C.accent2}">PRODUCT DESIGNER</text>
    <text x="${MX}" y="${coverH*0.47}" font-size="82" font-weight="800" fill="${C.t1}">Baran Aslan</text>
    <text x="${MX+2}" y="${coverH*0.47+52}" font-size="28" font-weight="500" fill="${C.t2}">Portfolio · UI/UX · Designed &amp; built</text>
    <text x="${MX+2}" y="${coverH*0.47+96}" font-size="19" font-weight="400" fill="${C.t3}">React · Vite · Framer Motion — shipped to production at aslanbaran.com</text>
  </g>`)
  y = coverH + 30

  async function addScreen(label, title, shot, crop, url) {
    let sp = path.join(RAW, shot)
    if (crop) {
      sp = path.join(RAW, `_cc_${label.replace(/\W/g,'')}.png`)
      await sharp(path.join(RAW, shot)).extract({ left: 0, top: crop[0], width: 2870, height: crop[1]-crop[0] }).toFile(sp)
    }
    const card = await browserCard(sp, url)
    const capH = 110
    frags.push(sectionLabel(MX, y + 34, label))
    frags.push(`<text x="${MX}" y="${y+82}" font-family="${FONT}" font-size="30" font-weight="800" fill="${C.t1}">${esc(title)}</text>`)
    const sh = await shadowBuf(card.w, card.h, RAD, 40)
    comps.push({ input: sh, top: y + capH + 24, left: MX, blend: 'over' })
    comps.push({ input: card.buf, top: y + capH, left: MX })
    y += capH + card.h + 90
  }

  await addScreen('The landing', 'Hero — who I am, at a glance', 'home.png', [0, 2060], 'aslanbaran.com')
  await addScreen('Selected work', 'A grid of eight case studies', 'home.png', [2900, 6100], 'aslanbaran.com/#work')

  // ---- design tokens (colour · type · radius) ----
  {
    const cw2 = W - MX * 2, B2 = '#2A3A52'
    frags.push(sectionLabel(MX, y + 34, 'Design system'))
    frags.push(`<text x="${MX}" y="${y+84}" font-family="${FONT}" font-size="34" font-weight="800" fill="${C.t1}">The tokens behind it</text>`)
    frags.push(`<text x="${MX}" y="${y+122}" font-family="${FONT}" font-size="18" font-weight="400" fill="${C.t2}">Colour · type · radius — one variable layer drives every screen</text>`)
    let ty = y + 182
    // colour swatches
    const rows = [
      [['bg', '#080E1A'], ['sunken', '#090F1C'], ['card', '#0C1424'], ['elevated', '#111827'], ['border', '#1A2538'], ['border-2', '#2A3A52']],
      [['text-1', '#F0F4FF'], ['text-2', '#8899B4'], ['text-3', '#6B7C99'], ['accent', '#22C55E'], ['accent-2', '#4ADE80'], ['deep', '#16A34A']],
    ]
    const n = 6, gap = 24, sw = (cw2 - gap * (n - 1)) / n
    for (const row of rows) { row.forEach((sc, i) => frags.push(swatch(MX + i * (sw + gap), ty, sw, sc[0], sc[1]))); ty += 120 + 66 }
    ty += 16
    // typography
    const cardW = (cw2 - 40) / 2, cardH = 250
    const typeCard = (x, fam, role, sample, scale) => `<g>
      <rect x="${x}" y="${ty}" width="${cardW}" height="${cardH}" rx="18" fill="${C.card}" stroke="${C.border}"/>
      <text x="${x+36}" y="${ty+56}" font-family="${FONT}" font-size="20" font-weight="700" fill="${C.accent2}">${fam}</text>
      <text x="${x+36}" y="${ty+82}" font-family="${FONT}" font-size="15" font-weight="500" fill="${C.t3}">${role}</text>
      <text x="${x+cardW-40}" y="${ty+94}" text-anchor="end" font-family="${FONT}" font-size="90" font-weight="800" fill="${C.t1}">Aa</text>
      <text x="${x+36}" y="${ty+156}" font-family="${FONT}" font-size="28" font-weight="700" fill="${C.t1}">${sample}</text>
      <text x="${x+36}" y="${ty+206}" font-family="${FONT}" font-size="16" font-weight="500" fill="${C.t2}" letter-spacing="1">${scale}</text></g>`
    frags.push(typeCard(MX, 'Archivo', 'Display &amp; headings · 800 / 700', 'Digital Product Designer.', '110 · 64 · 54 · 46 · 28'))
    frags.push(typeCard(MX + cardW + 40, 'Space Grotesk', 'Body &amp; UI · 500 / 400', 'The quiet craft of interfaces', '22 · 18 · 16 · 15 · 14'))
    ty += cardH + 44
    // radius
    frags.push(`<text x="${MX}" y="${ty+40}" font-family="${FONT}" font-size="17" font-weight="700" fill="${C.t3}">Radius</text>`)
    ;[['6', 6], ['12', 12], ['20', 20], ['full', 32]].forEach((r, i) => {
      const cx = MX + 150 + i * 96
      frags.push(`<rect x="${cx}" y="${ty}" width="64" height="64" rx="${r[1]}" fill="none" stroke="${B2}" stroke-width="1.5"/>
        <text x="${cx+32}" y="${ty+88}" text-anchor="middle" font-family="${FONT}" font-size="13" fill="${C.t3}">${r[0]}</text>`)
    })
    ty += 64 + 40
    y = ty + 30
  }

  await addScreen('The Lab', 'Coded, interactive experiments', 'lab.png', null, 'aslanbaran.com/lab')

  // mobile (different screen: About) with status-bar frame
  const phone = await iphone17(path.join(RAW, 'iphone-about.png'), 540)
  const capH = 110
  frags.push(sectionLabel(MX, y + 34, 'Responsive'))
  frags.push(`<text x="${MX}" y="${y+82}" font-family="${FONT}" font-size="30" font-weight="800" fill="${C.t1}">Pixel-perfect on iPhone</text>`)
  const pleft = Math.round((W - phone.w) / 2)
  comps.push({ input: phone.buf, top: y + capH, left: pleft })
  y += capH + phone.h + 80

  // ---- role & tools (designed + built by me) ----
  {
    frags.push(sectionLabel(MX, y + 34, 'Role & tools'))
    frags.push(`<text x="${MX}" y="${y+84}" font-family="${FONT}" font-size="34" font-weight="800" fill="${C.t1}">Designed <tspan fill="${C.accent}">&amp;</tspan> built — every pixel, every line.</text>`)
    frags.push(`<text x="${MX}" y="${y+122}" font-family="${FONT}" font-size="18" font-weight="400" fill="${C.t2}">UX · UI · Frontend — a solo project by Baran Aslan. No template, no page builder.</text>`)
    let ty = y + 178
    const groups = [
      ['Design', ['Figma', 'Framer', 'FigJam']],
      ['Code', ['React', 'Vite', 'JavaScript', 'CSS', 'Framer Motion', 'i18next']],
      ['Ship', ['Git', 'Vercel']],
    ]
    for (const [g, items] of groups) {
      frags.push(`<text x="${MX}" y="${ty+22}" font-family="${FONT}" font-size="17" font-weight="700" fill="${C.t3}">${g}</text>`)
      let cx = MX + 140
      for (const it of items) {
        const c = chip(cx, ty, it, { fs: 16, h: 38, text: C.t1, stroke: C.border, dot: C.accent })
        frags.push(c.svg); cx += c.w + 12
      }
      ty += 56
    }
    y = ty + 20
  }

  const boardH = Math.round(y + 90)
  frags.push(footerSVG(W, boardH, MX))

  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${boardH}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#080E18"/><stop offset="0.5" stop-color="#05090F"/><stop offset="1" stop-color="#04070C"/></linearGradient>
      <radialGradient id="gl" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="${C.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${boardH}" fill="url(#g)"/>
    <ellipse cx="${W*0.72}" cy="440" rx="640" ry="540" fill="url(#gl)"/>
    <ellipse cx="${W*0.10}" cy="${Math.round(boardH*0.45)}" rx="560" ry="640" fill="url(#gl)" opacity="0.45"/>
    <ellipse cx="${W*0.52}" cy="${boardH-720}" rx="660" ry="560" fill="url(#gl)" opacity="0.6"/>
    ${frags.join('\n')}
  </svg>`

  await sharp({ create: { width: W, height: boardH, channels: 4, background: '#04070C' } })
    .composite([{ input: Buffer.from(bg), top: 0, left: 0 }, ...comps])
    .png({ compressionLevel: 9 }).toFile(path.join(OUT, 'case-study.png'))
  await sharp(path.join(OUT, 'case-study.png')).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(OUT, 'case-study.jpg'))
  console.log('✓ case-study.png / .jpg (concise)', `${W}x${boardH}`)
}

// ---------- run ----------
await buildCover(808, 632, 'cover-thumbnail.png')
await buildCover(1600, 1200, '00-cover.png')
await buildBoard({ out:'01-landing.png', shot:'home.png', crop:[0,2060],
  label:'Overview', title:'A portfolio I designed and built', subtitle:'React · Vite · Framer Motion — designed end-to-end and shipped to production' })
await buildBoard({ out:'02-work.png', shot:'home.png', crop:[1980,15216],
  label:'Selected Work', title:'Eight case studies', subtitle:'Every project opens into a full write-up — problem, process, decisions, outcome', url:'aslanbaran.com/#work' })
await buildCaseStudy()
await buildDesignSystem()
await buildBoard({ out:'05-project-detail.png', shot:'project-viola.png',
  label:'Case Study · Detail', title:'Depth on every project', subtitle:'Viola Resort Sapanca — dark-luxury web experience, design system to shipped build', url:'aslanbaran.com/project/8' })
await buildBoard({ out:'06-about.png', shot:'about.png',
  label:'About', title:'The story & the stack', subtitle:'Experience, skills and the tools behind the work', url:'aslanbaran.com/about' })
await buildBoard({ out:'07-lab.png', shot:'lab.png',
  label:'The Lab', title:'Interactive experiments, coded', subtitle:'Six self-initiated pieces exploring motion and interaction — built end-to-end', url:'aslanbaran.com/lab' })
await buildResponsive('08-mobile.png')
await buildConcise()
console.log('done')
