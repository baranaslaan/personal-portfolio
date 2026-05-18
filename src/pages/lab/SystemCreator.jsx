import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'

/**
 * System Creator — a comprehensive design-system builder.
 *
 * Token Forge's bigger sibling: in addition to color and radius, this demo
 * exposes typography (heading + body family pair), a stroke-width control,
 * and three type-scale presets. The preview surfaces a brand block, a
 * 10-step color palette, a four-step type scale, sample components, and an
 * icon row — everything a real design system has to demonstrate.
 */

/* ───────────── Font catalogue ─────────────
 * Loaded on-demand at mount via a single Google Fonts link so the rest of
 * the site doesn't pay for them. Archivo and Space Grotesk are already
 * loaded site-wide; the three below are new for this page.
 */
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap'

const FONTS = {
  archivo: { name: 'Archivo',         stack: "'Archivo', sans-serif", group: 'sans' },
  inter:   { name: 'Inter',           stack: "'Inter', sans-serif",   group: 'sans' },
  playfair:{ name: 'Playfair Display',stack: "'Playfair Display', serif", group: 'serif' },
  mono:    { name: 'JetBrains Mono',  stack: "'JetBrains Mono', ui-monospace, monospace", group: 'mono' },
}

const RADIUS_PRESETS = {
  sharp:  { sm: 0,  md: 0,  lg: 0,  pill: 999, name: 'Sharp' },
  soft:   { sm: 4,  md: 8,  lg: 16, pill: 999, name: 'Soft' },
  pillow: { sm: 10, md: 18, lg: 28, pill: 999, name: 'Pillow' },
}

const TYPE_SCALES = {
  compact:   { display: 44, h1: 28, body: 14, caption: 11, lhTight: 1.05, lhLoose: 1.5, name: 'Compact' },
  classic:   { display: 56, h1: 32, body: 15, caption: 12, lhTight: 1.05, lhLoose: 1.55, name: 'Classic' },
  editorial: { display: 80, h1: 40, body: 17, caption: 13, lhTight: 1.0,  lhLoose: 1.65, name: 'Editorial' },
}

const STROKE_WIDTHS = [1, 1.5, 2, 2.5]

/* ───────────── Color scale generator ─────────────
 * A 10-step Tailwind-style palette derived from a single primary hue. The
 * lightness / saturation curve is hand-tuned so a fresh hue immediately
 * produces a usable scale across surface, text, and accent roles.
 */
const PALETTE_STOPS = [
  { step: 50,  l: 96, s: 30 },
  { step: 100, l: 92, s: 40 },
  { step: 200, l: 84, s: 55 },
  { step: 300, l: 72, s: 65 },
  { step: 400, l: 60, s: 72 },
  { step: 500, l: 50, s: 75 },
  { step: 600, l: 42, s: 75 },
  { step: 700, l: 32, s: 70 },
  { step: 800, l: 22, s: 60 },
  { step: 900, l: 14, s: 50 },
]
function paletteFromHue(hue) {
  return PALETTE_STOPS.map(s => ({
    ...s,
    color: `hsl(${hue}, ${s.s}%, ${s.l}%)`,
  }))
}

const PRESETS = [
  { name: 'Ocean',    primary: 210, neutral: 220, heading: 'archivo',  body: 'inter',    radius: 'soft',   stroke: 1.5, scale: 'classic' },
  { name: 'Forest',   primary: 152, neutral: 160, heading: 'archivo',  body: 'archivo',  radius: 'soft',   stroke: 1.5, scale: 'classic' },
  { name: 'Magazine', primary: 340, neutral: 30,  heading: 'playfair', body: 'inter',    radius: 'sharp',  stroke: 1,   scale: 'editorial' },
  { name: 'Sunset',   primary: 24,  neutral: 18,  heading: 'archivo',  body: 'inter',    radius: 'pillow', stroke: 2,   scale: 'classic' },
  { name: 'Terminal', primary: 130, neutral: 200, heading: 'mono',     body: 'mono',     radius: 'sharp',  stroke: 1,   scale: 'compact' },
]

export default function SystemCreator() {
  const { t } = useTranslation()

  const [primaryHue, setPrimaryHue]   = useState(210)
  const [neutralHue, setNeutralHue]   = useState(220)
  const [heading, setHeading]         = useState('archivo')
  const [body, setBody]               = useState('inter')
  const [radius, setRadius]           = useState('soft')
  const [stroke, setStroke]           = useState(1.5)
  const [scale, setScale]             = useState('classic')

  // Load extra Google Fonts on mount only (scoped to this demo)
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const applyPreset = (p) => {
    setPrimaryHue(p.primary); setNeutralHue(p.neutral)
    setHeading(p.heading); setBody(p.body)
    setRadius(p.radius); setStroke(p.stroke); setScale(p.scale)
  }

  // Resolve tokens for the preview surface
  const palette = paletteFromHue(primaryHue)
  const neutralScale = paletteFromHue(neutralHue).map(s => ({
    ...s,
    color: `hsl(${neutralHue}, ${Math.round(s.s * 0.25)}%, ${s.l}%)`,
  }))
  const rad = RADIUS_PRESETS[radius]
  const ts = TYPE_SCALES[scale]
  const primary500 = palette[5].color
  const primary600 = palette[6].color
  const primary100 = palette[1].color
  const ink   = neutralScale[9].color
  const muted = neutralScale[6].color
  const surface = neutralScale[1].color

  return (
    <main className="lab-page">
      <div className="lab-page__inner">
        <BackLink />
        <header className="lab-page__header">
          <p className="kicker">
            <span className="kicker__line" />{t('lab.systemCreator.experimentNum')}
          </p>
          <h1 className="lab-page__title">{t('lab.experiments.systemCreator.title')}</h1>
          <p className="lab-page__lede">{t('lab.systemCreator.lede')}</p>
        </header>

        <section className="syskit">
          {/* CONTROL PANEL */}
          <div className="syskit__panel">
            <h2 className="syskit__panel-title">{t('lab.systemCreator.panelTitle')}</h2>

            {/* COLOR */}
            <SectionHead>{t('lab.systemCreator.colorSection')}</SectionHead>
            <Knob
              label={t('lab.systemCreator.primaryHue')}
              value={primaryHue} min={0} max={360} step={1}
              onChange={setPrimaryHue}
              swatch={primary500}
              suffix="°"
              variant="hue"
            />
            <Knob
              label={t('lab.systemCreator.neutralHue')}
              value={neutralHue} min={0} max={360} step={1}
              onChange={setNeutralHue}
              swatch={muted}
              suffix="°"
              variant="hue"
            />

            {/* TYPOGRAPHY */}
            <SectionHead>{t('lab.systemCreator.typeSection')}</SectionHead>
            <Picker
              label={t('lab.systemCreator.fontHeading')}
              value={heading}
              onChange={setHeading}
              options={Object.entries(FONTS).map(([k, v]) => ({
                value: k,
                label: v.name,
                style: { fontFamily: v.stack },
              }))}
            />
            <Picker
              label={t('lab.systemCreator.fontBody')}
              value={body}
              onChange={setBody}
              options={Object.entries(FONTS).map(([k, v]) => ({
                value: k,
                label: v.name,
                style: { fontFamily: v.stack },
              }))}
            />
            <Picker
              label={t('lab.systemCreator.typeScale')}
              value={scale}
              onChange={setScale}
              options={Object.entries(TYPE_SCALES).map(([k, v]) => ({ value: k, label: v.name }))}
            />

            {/* SHAPE */}
            <SectionHead>{t('lab.systemCreator.shapeSection')}</SectionHead>
            <Picker
              label={t('lab.systemCreator.radiusScale')}
              value={radius}
              onChange={setRadius}
              options={Object.entries(RADIUS_PRESETS).map(([k, v]) => ({
                value: k,
                label: v.name,
                preview: <span className="syskit__radius-preview" style={{ borderRadius: v.md }} />,
              }))}
            />
            <Picker
              label={t('lab.systemCreator.strokeWidth')}
              value={stroke}
              onChange={setStroke}
              options={STROKE_WIDTHS.map(w => ({
                value: w,
                label: `${w}px`,
                preview: <span className="syskit__stroke-preview" style={{ borderTopWidth: w + 'px' }} />,
              }))}
            />

            {/* PRESETS */}
            <SectionHead>{t('lab.tokenForge.presets')}</SectionHead>
            <div className="syskit__presets">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="syskit__preset"
                  style={{
                    background: `linear-gradient(135deg, hsl(${p.primary}, 70%, 55%), hsl(${p.primary + 40}, 70%, 60%))`,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <ExportPanel state={{ primaryHue, neutralHue, heading, body, radius, stroke, scale }} palette={palette} rad={rad} ts={ts} />
          </div>

          {/* PREVIEW */}
          <LayoutGroup>
            <motion.div
              layout
              className="syskit__preview"
              style={{
                background: surface,
                color: ink,
                fontFamily: FONTS[body].stack,
                borderRadius: rad.lg,
              }}
            >
              {/* Brand block */}
              <motion.div layout className="syskit__brand">
                <div
                  className="syskit__brand-mark"
                  style={{
                    background: `linear-gradient(135deg, ${primary500}, ${palette[7].color})`,
                    borderRadius: rad.md,
                  }}
                />
                <div>
                  <div
                    className="syskit__brand-name"
                    style={{ fontFamily: FONTS[heading].stack, fontSize: ts.h1, lineHeight: ts.lhTight }}
                  >
                    {t('lab.systemCreator.brandName')}
                  </div>
                  <div
                    className="syskit__brand-tag"
                    style={{ fontSize: ts.caption, color: muted }}
                  >
                    {t('lab.systemCreator.brandTag')}
                  </div>
                </div>
              </motion.div>

              {/* Color palette */}
              <Block label={t('lab.systemCreator.paletteLabel')} muted={muted} ts={ts}>
                <div className="syskit__palette">
                  {palette.map(p => (
                    <div key={p.step} className="syskit__palette-cell" style={{ background: p.color, borderRadius: rad.sm }}>
                      <span style={{ color: p.l > 55 ? '#0a0f1c' : '#fff' }}>{p.step}</span>
                    </div>
                  ))}
                </div>
              </Block>

              {/* Type scale */}
              <Block label={t('lab.systemCreator.typeLabel')} muted={muted} ts={ts}>
                <motion.div
                  layout
                  className="syskit__type"
                  style={{ fontFamily: FONTS[heading].stack }}
                >
                  <div style={{ fontSize: ts.display, lineHeight: ts.lhTight, letterSpacing: '-0.03em', fontWeight: 800 }}>
                    {t('lab.systemCreator.typeDisplay')}
                  </div>
                  <div style={{ fontSize: ts.h1, lineHeight: ts.lhTight, letterSpacing: '-0.02em', fontWeight: 700 }}>
                    {t('lab.systemCreator.typeHeading')}
                  </div>
                  <div style={{ fontFamily: FONTS[body].stack, fontSize: ts.body, lineHeight: ts.lhLoose, color: muted }}>
                    {t('lab.systemCreator.typeBody')}
                  </div>
                  <div style={{ fontFamily: FONTS[body].stack, fontSize: ts.caption, color: muted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {t('lab.systemCreator.typeCaption')}
                  </div>
                </motion.div>
              </Block>

              {/* Components */}
              <Block label={t('lab.systemCreator.componentsLabel')} muted={muted} ts={ts}>
                <motion.div layout className="syskit__components">
                  <motion.button
                    layout
                    type="button"
                    className="syskit__btn"
                    style={{
                      background: primary500,
                      color: '#fff',
                      borderRadius: rad.md,
                      fontFamily: FONTS[body].stack,
                      fontSize: ts.body - 1,
                    }}
                    whileHover={{ y: -2, background: primary600 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {t('lab.systemCreator.btnPrimary')}
                  </motion.button>
                  <motion.button
                    layout
                    type="button"
                    className="syskit__btn syskit__btn--ghost"
                    style={{
                      background: 'transparent',
                      color: ink,
                      border: `${stroke}px solid ${neutralScale[3].color}`,
                      borderRadius: rad.md,
                      fontFamily: FONTS[body].stack,
                      fontSize: ts.body - 1,
                    }}
                    whileHover={{ y: -2, borderColor: primary500 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {t('lab.systemCreator.btnSecondary')}
                  </motion.button>
                  <input
                    type="text"
                    placeholder={t('lab.systemCreator.inputPlaceholder')}
                    className="syskit__input"
                    style={{
                      background: neutralScale[0].color,
                      color: ink,
                      border: `${stroke}px solid ${neutralScale[2].color}`,
                      borderRadius: rad.md,
                      fontFamily: FONTS[body].stack,
                      fontSize: ts.body - 1,
                    }}
                  />
                  <motion.div
                    layout
                    className="syskit__card"
                    style={{
                      background: '#fff',
                      borderRadius: rad.md,
                      border: `${stroke}px solid ${neutralScale[2].color}`,
                    }}
                  >
                    <div className="syskit__card-thumb" style={{ background: `linear-gradient(135deg, ${primary100}, ${palette[3].color})`, borderRadius: rad.sm }} />
                    <div className="syskit__card-body">
                      <div style={{ fontFamily: FONTS[heading].stack, fontSize: ts.body + 2, fontWeight: 700, marginBottom: 4 }}>
                        {t('lab.systemCreator.cardTitle')}
                      </div>
                      <div style={{ fontSize: ts.caption, color: muted, lineHeight: ts.lhLoose }}>
                        {t('lab.systemCreator.cardBody')}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </Block>

              {/* Icon row showing stroke */}
              <Block label={t('lab.systemCreator.iconsLabel')} muted={muted} ts={ts}>
                <div className="syskit__icons" style={{ color: ink }}>
                  {ICONS.map((d, i) => (
                    <svg
                      key={i}
                      width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor"
                      strokeWidth={stroke}
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      {d}
                    </svg>
                  ))}
                </div>
              </Block>
            </motion.div>
          </LayoutGroup>
        </section>

        <FooterNote
          i18nKey="lab.systemCreator.footerNote"
          nextSlug="cursor-symphony"
          nextTitleKey="lab.experiments.cursorSymphony.title"
        />
      </div>
    </main>
  )
}

// Small set of inline SVG paths for the icon row — they all use the
// current stroke width so changes are visible at a glance.
const ICONS = [
  <path key="a" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  <><circle key="cc" cx="12" cy="12" r="4" /><path key="cp" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
  <><rect key="r" x="3" y="11" width="18" height="11" rx="2" /><path key="rp" d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  <><path key="hh" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline key="hp" points="9 22 9 12 15 12 15 22" /></>,
  <path key="m" d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />,
  <><polyline key="g" points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
]

function SectionHead({ children }) {
  return <div className="syskit__section-head">{children}</div>
}

function Knob({ label, value, min, max, step, onChange, swatch, suffix = '', variant }) {
  return (
    <label className="syskit__knob">
      <div className="syskit__knob-head">
        <span className="syskit__knob-label">{label}</span>
        <span className="syskit__knob-value">
          {swatch && <span className="syskit__knob-swatch" style={{ background: swatch }} />}
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={`syskit__knob-input ${variant ? `syskit__knob-input--${variant}` : ''}`}
      />
    </label>
  )
}

/**
 * Picker — radio-like segmented control for discrete options
 * (fonts, radius scales, stroke widths, type scales).
 */
function Picker({ label, value, onChange, options }) {
  return (
    <div className="syskit__picker">
      <span className="syskit__knob-label">{label}</span>
      <div className="syskit__picker-row" role="radiogroup" aria-label={label}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`syskit__picker-opt ${value === opt.value ? 'is-active' : ''}`}
            style={opt.style}
          >
            {opt.preview && <span className="syskit__picker-preview">{opt.preview}</span>}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Block({ label, muted, ts, children }) {
  return (
    <motion.div layout className="syskit__block">
      <div className="syskit__block-label" style={{ color: muted, fontSize: ts.caption }}>
        {label}
      </div>
      {children}
    </motion.div>
  )
}

function ExportPanel({ state, palette, rad, ts }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(null)

  const buildCss = () => {
    const lines = [
      ':root {',
      ...palette.map(p => `  --primary-${p.step}: ${p.color};`),
      `  --radius-sm: ${rad.sm}px;`,
      `  --radius-md: ${rad.md}px;`,
      `  --radius-lg: ${rad.lg}px;`,
      `  --stroke-width: ${state.stroke}px;`,
      `  --font-heading: ${FONTS[state.heading].stack};`,
      `  --font-body: ${FONTS[state.body].stack};`,
      `  --text-display: ${ts.display}px;`,
      `  --text-h1: ${ts.h1}px;`,
      `  --text-body: ${ts.body}px;`,
      `  --text-caption: ${ts.caption}px;`,
      '}',
    ]
    return lines.join('\n')
  }
  const buildJson = () => JSON.stringify({
    color: { primary: Object.fromEntries(palette.map(p => [p.step, p.color])) },
    radius: { sm: rad.sm, md: rad.md, lg: rad.lg },
    stroke: state.stroke,
    typography: {
      headingFamily: FONTS[state.heading].name,
      bodyFamily: FONTS[state.body].name,
      scale: { display: ts.display, h1: ts.h1, body: ts.body, caption: ts.caption },
    },
  }, null, 2)

  const handleCopy = async (kind) => {
    const text = kind === 'css' ? buildCss() : buildJson()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(c => (c === kind ? null : c)), 1600)
    } catch {}
  }

  return (
    <div className="syskit__export">
      <SectionHead>{t('lab.tokenForge.exportLabel')}</SectionHead>
      <div className="syskit__export-row">
        <button type="button" onClick={() => handleCopy('css')} className={`syskit__export-btn ${copied === 'css' ? 'is-copied' : ''}`}>
          {copied === 'css' ? t('lab.tokenForge.exportCopied') : t('lab.tokenForge.exportCss')}
        </button>
        <button type="button" onClick={() => handleCopy('json')} className={`syskit__export-btn ${copied === 'json' ? 'is-copied' : ''}`}>
          {copied === 'json' ? t('lab.tokenForge.exportCopied') : t('lab.tokenForge.exportJson')}
        </button>
      </div>
    </div>
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
