import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'

/* ───────────── Color-format utilities ─────────────
 * The sliders drive an HSL color (sat=70, lightness=55 fixed) so all conversions
 * start there. HSL → RGB → HEX uses the standard algorithm; HSL → HSB uses the
 * relationship   v = l + s·min(l, 1−l),  s_hsb = v ? 2·(1 − l/v) : 0.
 */
function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
}
function hslToHsb(h, s, l) {
  s /= 100; l /= 100
  const v = l + s * Math.min(l, 1 - l)
  const sHsb = v === 0 ? 0 : 2 * (1 - l / v)
  return [Math.round(h), Math.round(sHsb * 100), Math.round(v * 100)]
}
function formatHsl(h, s, l) { return `hsl(${Math.round(h)}, ${s}%, ${l}%)` }
function formatRgb([r, g, b]) { return `rgb(${r}, ${g}, ${b})` }
function formatHsb([h, s, b]) { return `hsb(${h}, ${s}%, ${b}%)` }

/**
 * Token Forge — a live design system playground.
 *
 * The visitor manipulates four core tokens (accent hue, radius, density,
 * weight) via sliders. Every preview component re-tokens in real time,
 * with framer-motion `layout` softening size changes.
 */

const PRESETS = [
  { name: 'Sunset',    hue: 18,  rad: 8,  dens: 1.0, weight: 600, accent2Hue: 340 },
  { name: 'Mint',      hue: 152, rad: 14, dens: 1.0, weight: 600, accent2Hue: 200 },
  { name: 'Royal',     hue: 248, rad: 6,  dens: 0.85, weight: 700, accent2Hue: 290 },
  { name: 'Bauhaus',   hue: 0,   rad: 0,  dens: 1.0, weight: 800, accent2Hue: 200 },
  { name: 'Pillow',    hue: 220, rad: 28, dens: 1.15, weight: 500, accent2Hue: 280 },
]

export default function TokenForge() {
  const { t } = useTranslation()
  const [hue, setHue] = useState(152)
  const [rad, setRad] = useState(14)
  const [dens, setDens] = useState(1.0)
  const [weight, setWeight] = useState(600)
  const [accent2Hue, setAccent2Hue] = useState(200)

  const applyPreset = (p) => {
    setHue(p.hue); setRad(p.rad); setDens(p.dens); setWeight(p.weight); setAccent2Hue(p.accent2Hue)
  }

  // Resolve tokens
  const tok = {
    accent:  `hsl(${hue}, 70%, 55%)`,
    accentSoft: `hsla(${hue}, 70%, 55%, 0.12)`,
    accentBorder: `hsla(${hue}, 70%, 55%, 0.28)`,
    accent2: `hsl(${accent2Hue}, 70%, 60%)`,
    radSm: rad * 0.5,
    radMd: rad,
    radLg: rad * 1.6,
    padSm: 8 * dens,
    padMd: 14 * dens,
    padLg: 22 * dens,
    weight,
  }

  return (
    <main className="lab-page">
      <div className="lab-page__inner">
        <BackLink />
        <header className="lab-page__header">
          <p className="kicker"><span className="kicker__line" />{t('lab.tokenForge.experimentNum')}</p>
          <h1 className="lab-page__title">{t('lab.experiments.tokenForge.title')}</h1>
          <p className="lab-page__lede">{t('lab.tokenForge.lede')}</p>
        </header>

        <section className="forge">
          {/* CONTROL PANEL */}
          <div className="forge__panel">
            <h2 className="forge__panel-title">{t('lab.tokenForge.panelTitle')}</h2>

            <Knob
              label={t('lab.tokenForge.accentHue')}
              value={hue} min={0} max={360} step={1}
              onChange={setHue}
              swatch={tok.accent}
              suffix="°"
              variant="hue"
            />
            <ColorReadout hue={hue} sat={70} light={55} />

            <Knob
              label={t('lab.tokenForge.secondaryHue')}
              value={accent2Hue} min={0} max={360} step={1}
              onChange={setAccent2Hue}
              swatch={tok.accent2}
              suffix="°"
              variant="hue"
            />
            <ColorReadout hue={accent2Hue} sat={70} light={60} />
            <Knob
              label={t('lab.tokenForge.radius')}
              value={rad} min={0} max={32} step={1}
              onChange={setRad}
              suffix="px"
            />
            <Knob
              label={t('lab.tokenForge.density')}
              value={dens} min={0.7} max={1.4} step={0.05}
              onChange={setDens}
              suffix="×"
              labels={[
                t('lab.tokenForge.densityCompact'),
                t('lab.tokenForge.densityCozy'),
                t('lab.tokenForge.densitySpacious'),
              ]}
            />
            <Knob
              label={t('lab.tokenForge.weight')}
              value={weight} min={400} max={900} step={100}
              onChange={setWeight}
            />

            <div className="forge__presets">
              <span className="forge__presets-label">{t('lab.tokenForge.presets')}</span>
              <div className="forge__presets-row">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="forge__preset"
                    style={{
                      background: `linear-gradient(135deg, hsl(${p.hue}, 70%, 55%), hsl(${p.accent2Hue}, 70%, 60%))`
                    }}
                    aria-label={`Apply ${p.name} preset`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <ExportPanel hue={hue} accent2Hue={accent2Hue} rad={rad} dens={dens} weight={weight} />
          </div>

          {/* LIVE PREVIEW */}
          <LayoutGroup>
            <motion.div
              layout
              className="forge__preview"
              style={{ borderRadius: tok.radLg, padding: tok.padLg * 1.6 }}
            >
              {/* Header sample */}
              <motion.div layout className="forge__sample-row">
                <motion.span
                  layout
                  className="forge__pill"
                  style={{
                    background: tok.accentSoft,
                    color: tok.accent,
                    borderColor: tok.accentBorder,
                    borderRadius: 999,
                    padding: `${tok.padSm * 0.6}px ${tok.padMd}px`,
                    fontWeight: tok.weight,
                  }}
                >
                  <span
                    className="forge__pill-dot"
                    style={{ background: tok.accent }}
                  />
                  {t('lab.tokenForge.pillLabel')}
                </motion.span>
              </motion.div>

              {/* Hero typography sample */}
              <motion.div
                layout
                className="forge__hero"
                style={{
                  background: `linear-gradient(135deg, ${tok.accent}, ${tok.accent2})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: tok.weight + 200,
                }}
              >
                {t('lab.tokenForge.hero')}
              </motion.div>
              <motion.p layout className="forge__body" style={{ fontWeight: tok.weight - 100 }}>
                {t('lab.tokenForge.body')}
              </motion.p>

              {/* Button row */}
              <motion.div layout className="forge__sample-row">
                <motion.button
                  layout
                  type="button"
                  className="forge__btn forge__btn--primary"
                  style={{
                    background: tok.accent,
                    color: hue > 40 && hue < 200 ? '#06170c' : '#fff',
                    borderRadius: tok.radMd,
                    padding: `${tok.padMd}px ${tok.padLg}px`,
                    fontWeight: tok.weight + 100,
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {t('lab.tokenForge.primaryBtn')}
                </motion.button>
                <motion.button
                  layout
                  type="button"
                  className="forge__btn forge__btn--ghost"
                  style={{
                    color: tok.accent,
                    background: tok.accentSoft,
                    borderColor: tok.accentBorder,
                    borderRadius: tok.radMd,
                    padding: `${tok.padMd}px ${tok.padLg}px`,
                    fontWeight: tok.weight + 100,
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {t('lab.tokenForge.secondaryBtn')}
                </motion.button>
              </motion.div>

              {/* Card row */}
              <motion.div layout className="forge__cards">
                {[
                  { num: '01', title: t('lab.tokenForge.card1Title'), body: t('lab.tokenForge.card1Body') },
                  { num: '02', title: t('lab.tokenForge.card2Title'), body: t('lab.tokenForge.card2Body') },
                  { num: '03', title: t('lab.tokenForge.card3Title'), body: t('lab.tokenForge.card3Body') },
                ].map(c => (
                  <motion.div
                    key={c.num}
                    layout
                    className="forge__card"
                    style={{
                      borderRadius: tok.radMd,
                      padding: tok.padLg,
                      borderColor: tok.accentBorder,
                    }}
                    whileHover={{ y: -3, borderColor: tok.accent }}
                    transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  >
                    <span className="forge__card-num" style={{ color: tok.accent }}>{c.num}</span>
                    <h3 className="forge__card-title" style={{ fontWeight: tok.weight + 100 }}>{c.title}</h3>
                    <p className="forge__card-body">{c.body}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Color scale strip */}
              <motion.div layout className="forge__scale">
                {[20, 35, 50, 65, 80].map(l => (
                  <motion.div
                    layout
                    key={l}
                    className="forge__scale-cell"
                    style={{
                      background: `hsl(${hue}, 70%, ${l}%)`,
                      borderRadius: tok.radSm,
                    }}
                  >
                    <span className="forge__scale-label">{l}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </LayoutGroup>
        </section>

        <FooterNote
          i18nKey="lab.tokenForge.footerNote"
          nextSlug="drift-physics"
          nextTitleKey="lab.experiments.driftPhysics.title"
        />
      </div>
    </main>
  )
}

/* ───────────── Token export builders ─────────────
 * Snapshot the current state as something a developer can paste into a real
 * project: either a `:root { --... }` CSS block or a JSON object.
 */
function buildCssExport({ hue, accent2Hue, rad, dens, weight }) {
  return `:root {
  --color-accent: hsl(${hue}, 70%, 55%);
  --color-accent-soft: hsla(${hue}, 70%, 55%, 0.12);
  --color-accent-border: hsla(${hue}, 70%, 55%, 0.28);
  --color-accent-2: hsl(${accent2Hue}, 70%, 60%);
  --radius-sm: ${Math.round(rad * 0.5)}px;
  --radius-md: ${rad}px;
  --radius-lg: ${Math.round(rad * 1.6)}px;
  --space-sm: ${Math.round(8 * dens)}px;
  --space-md: ${Math.round(14 * dens)}px;
  --space-lg: ${Math.round(22 * dens)}px;
  --font-weight: ${weight};
}`
}
function buildJsonExport({ hue, accent2Hue, rad, dens, weight }) {
  return JSON.stringify({
    color: {
      accent: `hsl(${hue}, 70%, 55%)`,
      accentSoft: `hsla(${hue}, 70%, 55%, 0.12)`,
      accentBorder: `hsla(${hue}, 70%, 55%, 0.28)`,
      accent2: `hsl(${accent2Hue}, 70%, 60%)`,
    },
    radius: {
      sm: Math.round(rad * 0.5),
      md: rad,
      lg: Math.round(rad * 1.6),
    },
    spacing: {
      sm: Math.round(8 * dens),
      md: Math.round(14 * dens),
      lg: Math.round(22 * dens),
    },
    fontWeight: weight,
  }, null, 2)
}

/**
 * ExportPanel — two buttons that copy the current token state to the
 * clipboard, formatted as CSS variables or JSON. The "copied" state pulses
 * briefly so the user gets clear feedback the action landed.
 */
function ExportPanel({ hue, accent2Hue, rad, dens, weight }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(null)

  const handleCopy = async (kind) => {
    const text = kind === 'css'
      ? buildCssExport({ hue, accent2Hue, rad, dens, weight })
      : buildJsonExport({ hue, accent2Hue, rad, dens, weight })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(c => (c === kind ? null : c)), 1600)
    } catch { /* clipboard blocked — ignore */ }
  }

  return (
    <div className="forge__export">
      <span className="forge__export-label">{t('lab.tokenForge.exportLabel', { defaultValue: 'Export' })}</span>
      <div className="forge__export-row">
        <button
          type="button"
          onClick={() => handleCopy('css')}
          className={`forge__export-btn ${copied === 'css' ? 'is-copied' : ''}`}
        >
          {copied === 'css'
            ? t('lab.tokenForge.exportCopied', { defaultValue: 'Copied!' })
            : t('lab.tokenForge.exportCss', { defaultValue: 'Copy as CSS' })}
        </button>
        <button
          type="button"
          onClick={() => handleCopy('json')}
          className={`forge__export-btn ${copied === 'json' ? 'is-copied' : ''}`}
        >
          {copied === 'json'
            ? t('lab.tokenForge.exportCopied', { defaultValue: 'Copied!' })
            : t('lab.tokenForge.exportJson', { defaultValue: 'Copy as JSON' })}
        </button>
      </div>
    </div>
  )
}

/**
 * ColorReadout — shows the live HSL value in four formats (HEX, RGB, HSL, HSB),
 * each click-to-copy. Sits beneath the corresponding color knob in the panel.
 */
function ColorReadout({ hue, sat, light }) {
  const [copied, setCopied] = useState(null)
  const rgb = hslToRgb(hue, sat, light)
  const hex = rgbToHex(...rgb)
  const hsb = hslToHsb(hue, sat, light)

  const formats = [
    { key: 'HEX', value: hex },
    { key: 'RGB', value: formatRgb(rgb) },
    { key: 'HSL', value: formatHsl(hue, sat, light) },
    { key: 'HSB', value: formatHsb(hsb) },
  ]

  const copy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      setTimeout(() => setCopied(c => (c === key ? null : c)), 1400)
    } catch {
      /* clipboard blocked — ignore silently */
    }
  }

  return (
    <div className="forge__readout" role="group" aria-label="Color values">
      {formats.map(({ key, value }) => (
        <button
          key={key}
          type="button"
          className={`forge__readout-row ${copied === key ? 'is-copied' : ''}`}
          onClick={() => copy(key, value)}
          title={`Copy ${key}`}
        >
          <span className="forge__readout-key">{key}</span>
          <span className="forge__readout-value">{value}</span>
          <span className="forge__readout-icon" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              {copied === key ? (
                <motion.svg
                  key="check"
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="copy"
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
        </button>
      ))}
    </div>
  )
}

function Knob({ label, value, min, max, step, onChange, swatch, suffix = '', variant, labels }) {
  return (
    <label className="forge__knob">
      <div className="forge__knob-head">
        <span className="forge__knob-label">{label}</span>
        <span className="forge__knob-value">
          {swatch && <span className="forge__knob-swatch" style={{ background: swatch }} />}
          {typeof value === 'number' && step < 1 ? value.toFixed(2) : value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`forge__knob-input ${variant ? `forge__knob-input--${variant}` : ''}`}
      />
      {/* Optional zone labels rendered under the track at start / middle / end
          so a numeric range like 0.7-1.4 reads as compact / cozy / spacious. */}
      {labels && labels.length > 0 && (
        <div className="forge__knob-labels" aria-hidden="true">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </label>
  )
}

function BackLink() {
  const { t } = useTranslation()
  return (
    <Link to="/lab" className="lab-page__back">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      {t('lab.back')}
    </Link>
  )
}

function FooterNote({ i18nKey, nextSlug, nextTitleKey }) {
  const { t } = useTranslation()
  return (
    <footer className="lab-page__foot">
      <div className="lab-page__foot-text">
        <span className="lab-page__foot-label">{t('lab.whatThis')}</span>
        <p>
          <Trans i18nKey={i18nKey} components={[<code key="c" />]} />
        </p>
      </div>
      <Link to={`/lab/${nextSlug}`} className="lab-page__next">
        {t('lab.next')} · {t(nextTitleKey)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </footer>
  )
}
