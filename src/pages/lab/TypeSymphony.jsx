import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, AnimatePresence } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'

/**
 * Type Symphony — a variable-font playground.
 *
 * Five sliders drive the active axes of Roboto Flex (weight, width, slant,
 * optical size, grade). The text reflows in real time. A "play symphony"
 * button drives all five axes through a choreographed 8-second animation
 * — the letters dance through the full design space, then settle.
 */

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght,GRAD@8..144,-10..0,25..151,100..1000,-200..150&display=swap'

const AXES = {
  wght: { min: 100, max: 1000, default: 700, label: 'Weight',        suffix: '' },
  wdth: { min: 25,  max: 151,  default: 100, label: 'Width',         suffix: '' },
  slnt: { min: -10, max: 0,    default: 0,   label: 'Slant',         suffix: '°' },
  opsz: { min: 8,   max: 144,  default: 72,  label: 'Optical size',  suffix: '' },
  GRAD: { min: -200,max: 150,  default: 0,   label: 'Grade',         suffix: '' },
}

const PRESETS = [
  { key: 'refined',  vals: { wght: 400, wdth: 100, slnt: 0,   opsz: 72,  GRAD: 0 } },
  { key: 'bold',     vals: { wght: 900, wdth: 115, slnt: 0,   opsz: 144, GRAD: 100 } },
  { key: 'loose',    vals: { wght: 350, wdth: 130, slnt: -3,  opsz: 56,  GRAD: -50 } },
  { key: 'tight',    vals: { wght: 600, wdth: 60,  slnt: 0,   opsz: 14,  GRAD: 0 } },
  { key: 'italic',   vals: { wght: 500, wdth: 100, slnt: -10, opsz: 72,  GRAD: 0 } },
]

/* The 8-second symphony is split into 4 phases. At each timestep t∈[0,1] the
 * function returns a snapshot of all five axes. Each phase has a distinct
 * character so the audience reads it as a story, not noise. */
function symphonyAt(t) {
  if (t < 0.25) {
    // 0.00 → 0.25: delicate emerging
    const p = t / 0.25
    return {
      wght: Math.round(200 + p * 200),
      wdth: Math.round(80 + p * 20),
      slnt: 0,
      opsz: Math.round(144 - p * 50),
      GRAD: Math.round(-150 + p * 100),
    }
  }
  if (t < 0.5) {
    // 0.25 → 0.50: swelling to bold + wide
    const p = (t - 0.25) / 0.25
    return {
      wght: Math.round(400 + p * 500),
      wdth: Math.round(100 + p * 30),
      slnt: 0,
      opsz: Math.round(94 + p * 30),
      GRAD: Math.round(-50 + p * 200),
    }
  }
  if (t < 0.75) {
    // 0.50 → 0.75: lean and tighten with italic slant
    const p = (t - 0.5) / 0.25
    return {
      wght: Math.round(900 - p * 350),
      wdth: Math.round(130 - p * 40),
      slnt: Math.round(-p * 10),
      opsz: Math.round(124 - p * 40),
      GRAD: Math.round(150 - p * 100),
    }
  }
  // 0.75 → 1.00: settle to a refined balanced rest
  const p = (t - 0.75) / 0.25
  return {
    wght: Math.round(550 - p * 50),
    wdth: Math.round(90 + p * 10),
    slnt: Math.round(-10 + p * 10),
    opsz: Math.round(84 - p * 12),
    GRAD: Math.round(50 - p * 50),
  }
}

export default function TypeSymphony() {
  const { t } = useTranslation()

  const [text, setText] = useState('Design with intent.')
  const [axes, setAxes] = useState({
    wght: AXES.wght.default,
    wdth: AXES.wdth.default,
    slnt: AXES.slnt.default,
    opsz: AXES.opsz.default,
    GRAD: AXES.GRAD.default,
  })
  const [playing, setPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const playControlsRef = useRef(null)

  // Load Roboto Flex on mount
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
      // Stop any in-flight symphony if the user navigates away
      if (playControlsRef.current) playControlsRef.current.stop()
    }
  }, [])

  const updateAxis = (key, value) => setAxes(a => ({ ...a, [key]: value }))
  const applyPreset = (vals) => setAxes(vals)

  const playSymphony = () => {
    if (playing) {
      playControlsRef.current?.stop()
      setPlaying(false)
      return
    }
    setPlaying(true)
    playControlsRef.current = animate(0, 1, {
      duration: 8,
      ease: [0.42, 0, 0.58, 1],
      onUpdate: t => setAxes(symphonyAt(t)),
      onComplete: () => setPlaying(false),
    })
  }

  const fontVariation = `'wght' ${axes.wght}, 'wdth' ${axes.wdth}, 'slnt' ${axes.slnt}, 'opsz' ${axes.opsz}, 'GRAD' ${axes.GRAD}`
  const cssSnippet = `font-family: 'Roboto Flex', sans-serif;\nfont-variation-settings:\n  'wght' ${axes.wght},\n  'wdth' ${axes.wdth},\n  'slnt' ${axes.slnt},\n  'opsz' ${axes.opsz},\n  'GRAD' ${axes.GRAD};`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <main className="lab-page">
      <div className="lab-page__inner">
        <BackLink />
        <header className="lab-page__header">
          <p className="kicker">
            <span className="kicker__line" />
            {t('lab.typeSymphony.experimentNum')}
          </p>
          <h1 className="lab-page__title">{t('lab.experiments.typeSymphony.title')}</h1>
          <p className="lab-page__lede">{t('lab.typeSymphony.lede')}</p>
        </header>

        <section className="symphony">
          {/* STAGE — the variable-font canvas */}
          <div className="symphony__stage" aria-label={t('lab.typeSymphony.stageAria')}>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              className="symphony__text"
              style={{
                fontFamily: "'Roboto Flex', sans-serif",
                fontVariationSettings: fontVariation,
              }}
              aria-label={t('lab.typeSymphony.editAria')}
            />
            <span className="symphony__edit-hint" aria-hidden="true">
              {t('lab.typeSymphony.editHint')}
            </span>
          </div>

          {/* TRANSPORT — play button + copy */}
          <div className="symphony__transport">
            <button
              type="button"
              onClick={playSymphony}
              className={`symphony__play ${playing ? 'is-playing' : ''}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {playing ? (
                  <motion.span key="stop" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className="symphony__play-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  </motion.span>
                ) : (
                  <motion.span key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className="symphony__play-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l16 9-16 9z" /></svg>
                  </motion.span>
                )}
              </AnimatePresence>
              <span>{playing ? t('lab.typeSymphony.stop') : t('lab.typeSymphony.play')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`symphony__copy ${copied ? 'is-copied' : ''}`}
            >
              {copied ? t('lab.typeSymphony.copied') : t('lab.typeSymphony.copyCss')}
            </button>
          </div>

          {/* AXES — the sliders */}
          <div className="symphony__axes">
            {Object.entries(AXES).map(([key, spec]) => (
              <AxisSlider
                key={key}
                axisKey={key}
                label={t(`lab.typeSymphony.axes.${key}`, { defaultValue: spec.label })}
                value={axes[key]}
                spec={spec}
                onChange={v => updateAxis(key, v)}
                disabled={playing}
              />
            ))}
          </div>

          {/* PRESETS */}
          <div className="symphony__presets">
            <span className="symphony__presets-label">
              {t('lab.typeSymphony.presetsLabel')}
            </span>
            <div className="symphony__presets-row">
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.vals)}
                  className="symphony__preset"
                  style={{
                    fontFamily: "'Roboto Flex', sans-serif",
                    fontVariationSettings: `'wght' ${p.vals.wght}, 'wdth' ${p.vals.wdth}, 'slnt' ${p.vals.slnt}, 'opsz' ${p.vals.opsz}, 'GRAD' ${p.vals.GRAD}`,
                  }}
                  disabled={playing}
                >
                  {t(`lab.typeSymphony.presets.${p.key}`)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <FooterNote
          i18nKey="lab.typeSymphony.footerNote"
          nextSlug="cursor-symphony"
          nextTitleKey="lab.experiments.cursorSymphony.title"
        />
      </div>
    </main>
  )
}

function AxisSlider({ axisKey, label, value, spec, onChange, disabled }) {
  // Display percentage along the slider for the visual progress fill
  const pct = ((value - spec.min) / (spec.max - spec.min)) * 100
  return (
    <label className={`symphony__axis ${disabled ? 'is-disabled' : ''}`}>
      <div className="symphony__axis-head">
        <span className="symphony__axis-label">
          <span className="symphony__axis-name">{label}</span>
          <span className="symphony__axis-key">{axisKey}</span>
        </span>
        <span className="symphony__axis-value">{value}{spec.suffix}</span>
      </div>
      <div className="symphony__axis-track">
        <div className="symphony__axis-fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={spec.min}
          max={spec.max}
          step={axisKey === 'slnt' || axisKey === 'opsz' || axisKey === 'wght' ? 1 : 1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          aria-label={label}
        />
      </div>
      <div className="symphony__axis-range">
        <span>{spec.min}</span>
        <span>{spec.max}</span>
      </div>
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
