import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'

/**
 * Cursor Symphony — a state-aware cursor that morphs based on what it hovers.
 *
 * The core trick: two motion values track raw pointer position; springs
 * smooth them; a single `mode` state drives both the visual shape and the
 * accompanying label. Magnetic anchors pull the cursor toward themselves
 * within a radius, then release.
 *
 * Modes:
 *   - default   → 8px dot
 *   - text      → 2px tall vertical caret
 *   - link      → 56px hollow ring with directional label
 *   - media     → 88px filled disk with "view" label and outer ring
 *   - magnetic  → snaps to element center, scales up
 */

const MAGNETIC_RADIUS = 100   // px around magnetic targets where snap engages
const MAGNETIC_PULL   = 0.4   // fraction of the offset to apply

export default function CursorSymphony() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [mode, setMode] = useState('default')
  const [label, setLabel] = useState('')

  // Raw pointer coordinates
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  // Spring-smoothed coordinates for the cursor visual
  const sx = useSpring(x, { stiffness: 380, damping: 30, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 380, damping: 30, mass: 0.4 })

  // Outer ring trails behind, slower
  const tx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.6 })
  const ty = useSpring(y, { stiffness: 160, damping: 22, mass: 0.6 })

  // Background hue follows pointer X across the page for ambient feedback.
  // The window width is read once at mount; ambient hue still updates live
  // because the motion value drives it.
  const widthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 1440)
  useEffect(() => {
    const onResize = () => { widthRef.current = window.innerWidth }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const hue = useTransform(x, [0, widthRef.current], [120, 280])
  const ambientBg = useTransform(
    hue,
    h => `radial-gradient(60% 60% at 50% 30%, hsla(${h}, 70%, 50%, .18), transparent 70%)`
  )

  // Container ref for magnetic snap calculations
  const stageRef = useRef(null)

  useEffect(() => {
    if (reduced) return

    const onMove = (e) => {
      // Default: track pointer
      let nx = e.clientX
      let ny = e.clientY

      // Magnetic pull
      const targets = stageRef.current?.querySelectorAll('[data-magnetic]') || []
      let pulled = false
      for (const el of targets) {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = nx - cx
        const dy = ny - cy
        const dist = Math.hypot(dx, dy)
        if (dist < MAGNETIC_RADIUS) {
          nx = nx - dx * MAGNETIC_PULL
          ny = ny - dy * MAGNETIC_PULL
          pulled = true
          break
        }
      }
      x.set(nx)
      y.set(ny)
      if (pulled && mode === 'default') setMode('magnetic')
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced, x, y, mode])

  // Helpers for hover targets
  const enter = (m, l = '') => () => { setMode(m); setLabel(l) }
  const leave = () => { setMode('default'); setLabel('') }

  // Visual sizes per mode
  const size = mode === 'default'  ? 10
             : mode === 'text'     ? 6
             : mode === 'link'     ? 64
             : mode === 'media'    ? 96
             : mode === 'magnetic' ? 24
             : 10
  const isOpen = mode === 'link' || mode === 'media'

  return (
    <main className="lab-page" ref={stageRef}>
      {/* Hide system cursor only inside the lab so the rest of the site is unaffected */}
      <style>{`
        .lab-page, .lab-page * { cursor: ${reduced ? 'auto' : 'none'} !important; }
      `}</style>

      {/* Ambient hue layer driven by pointer */}
      <motion.div
        aria-hidden="true"
        className="lab-page__ambient"
        style={reduced ? undefined : { background: ambientBg }}
      />

      <div className="lab-page__inner">
        <BackLink />
        <header className="lab-page__header">
          <p className="kicker">
            <span className="kicker__line" />
            {t('lab.cursorSymphony.experimentNum')}
          </p>
          <h1 className="lab-page__title">{t('lab.experiments.cursorSymphony.title')}</h1>
          <p className="lab-page__lede">{t('lab.cursorSymphony.lede')}</p>
        </header>

        {/* Demo grid */}
        <section className="cursorlab">
          <article
            className="cursorlab__panel cursorlab__panel--text"
            onMouseEnter={enter('text')}
            onMouseLeave={leave}
          >
            <span className="cursorlab__panel-tag">{t('lab.cursorSymphony.textTag')}</span>
            <p>{t('lab.cursorSymphony.textBody')}</p>
          </article>

          <a
            href="#"
            className="cursorlab__panel cursorlab__panel--link"
            onClick={(e) => e.preventDefault()}
            onMouseEnter={enter('link', t('lab.cursorSymphony.linkLabel'))}
            onMouseLeave={leave}
          >
            <span className="cursorlab__panel-tag">{t('lab.cursorSymphony.linkTag')}</span>
            <h3>{t('lab.cursorSymphony.linkHeading')}</h3>
            <p>{t('lab.cursorSymphony.linkBody')}</p>
          </a>

          <div
            className="cursorlab__panel cursorlab__panel--media"
            onMouseEnter={enter('media', t('lab.cursorSymphony.mediaLabel'))}
            onMouseLeave={leave}
          >
            <span className="cursorlab__panel-tag">{t('lab.cursorSymphony.mediaTag')}</span>
            <div className="cursorlab__media-art" aria-hidden="true">
              <div className="cursorlab__media-shape cursorlab__media-shape--a" />
              <div className="cursorlab__media-shape cursorlab__media-shape--b" />
              <div className="cursorlab__media-shape cursorlab__media-shape--c" />
            </div>
          </div>

          <div className="cursorlab__panel cursorlab__panel--magnets">
            <span className="cursorlab__panel-tag">{t('lab.cursorSymphony.magnetsTag')}</span>
            <p>{t('lab.cursorSymphony.magnetsBody')}</p>
            <div className="cursorlab__magnets">
              {Array.from({ length: 6 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  data-magnetic
                  className="cursorlab__magnet"
                  onMouseEnter={enter('magnetic')}
                  onMouseLeave={leave}
                  aria-label={`Magnetic pellet ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <FooterNote
          i18nKey="lab.cursorSymphony.footerNote"
          nextSlug="scroll-cinema"
          nextTitleKey="lab.experiments.scrollCinema.title"
        />
      </div>

      {/* The cursor itself — trailing ring + leading head */}
      {!reduced && (
        <>
          <motion.div
            aria-hidden="true"
            className="cursor-ring"
            style={{ x: tx, y: ty }}
            animate={{
              width:  size + 24,
              height: size + 24,
              opacity: isOpen ? 0.45 : 0.15,
              borderWidth: isOpen ? 1.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          />
          <motion.div
            aria-hidden="true"
            className="cursor-head"
            style={{ x: sx, y: sy }}
            animate={{
              width:  mode === 'text' ? 2 : size,
              height: mode === 'text' ? 22 : size,
              borderRadius: mode === 'text' ? 1 : 999,
              backgroundColor:
                mode === 'media'    ? 'rgba(34,197,94,.95)' :
                mode === 'link'     ? 'transparent' :
                mode === 'magnetic' ? 'rgba(34,197,94,.95)' :
                                      'rgba(240,244,255,.95)',
              border: mode === 'link' ? '1.5px solid rgba(240,244,255,.95)' : 'none',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <AnimatePresence>
              {isOpen && label && (
                <motion.span
                  className="cursor-label"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </main>
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
