// One-off script to generate the default og-image.png (1200x630)
// Usage: node scripts/generate-og-image.mjs
//
// Output: public/og-image.png
// Design intent: dark, restrained, type-driven — matches portfolio voice.
// User (designer) can replace this with a custom design later.

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, '..', 'public', 'og-image.png')

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#080E1A"/>
      <stop offset="100%" stop-color="#0F1729"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.2" r="0.6">
      <stop offset="0%" stop-color="#22C55E" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#22C55E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- top-left mark -->
  <g transform="translate(80, 80)">
    <circle cx="20" cy="20" r="20" fill="#22C55E"/>
    <text x="60" y="28" font-family="Archivo, system-ui, sans-serif" font-weight="600" font-size="22" fill="#E5E7EB" letter-spacing="-0.01em">Baran Aslan</text>
  </g>

  <!-- center heading -->
  <g transform="translate(80, 280)">
    <text font-family="Archivo, system-ui, sans-serif" font-weight="700" font-size="88" fill="#FAFAFA" letter-spacing="-0.03em">
      <tspan x="0" dy="0">Product Designer.</tspan>
      <tspan x="0" dy="100" fill="#9CA3AF" font-weight="400">Digital Product Designer</tspan>
    </text>
  </g>

  <!-- bottom row: tags + url -->
  <g transform="translate(80, 530)">
    <text font-family="Archivo, system-ui, sans-serif" font-size="22" fill="#6B7280" letter-spacing="0.02em">UI/UX  ·  Design Systems  ·  Research</text>
  </g>
  <g transform="translate(1120, 530)" text-anchor="end">
    <text font-family="Archivo, system-ui, sans-serif" font-size="22" fill="#22C55E" letter-spacing="0.02em">aslanbaran.com</text>
  </g>
</svg>`

await sharp(Buffer.from(svg))
  .png({ quality: 92, compressionLevel: 9 })
  .toFile(out)

console.log('Generated:', out)
