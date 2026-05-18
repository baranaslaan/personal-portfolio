import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'

/**
 * Scroll Cinema — a single-scroll cinematic sequence.
 *
 * The full page maps scroll progress to a series of choreographed transforms:
 * a hero title that breaks apart and reassembles, parallax depth layers,
 * a color theme that shifts across the journey, and a final stamp.
 *
 * All values derive from `useScroll` against a tall container; springs smooth
 * the inputs so the motion feels weighted, not snappy.
 */

export default function ScrollCinema() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Smooth scroll progress before mapping anywhere
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.6 })

  // Background hue shifts from green → violet → amber across scroll
  const hue = useTransform(sp, [0, 0.5, 1], [152, 270, 38])
  const bg = useTransform(hue, h => `radial-gradient(70% 70% at 50% 30%, hsla(${h}, 60%, 28%, 0.6), hsla(${h}, 80%, 8%, 0.95))`)

  // Hero title transforms
  const titleY = useTransform(sp, [0, 0.18], [0, -120])
  const titleScale = useTransform(sp, [0, 0.18], [1, 0.7])
  const titleOpacity = useTransform(sp, [0, 0.16, 0.22], [1, 0.6, 0])

  // Three "stage" cards rise in sequence and parallax independently
  const stage1Y = useTransform(sp, [0.10, 0.32], [120, -40])
  const stage1Op = useTransform(sp, [0.10, 0.16, 0.32, 0.40], [0, 1, 1, 0])
  const stage2Y = useTransform(sp, [0.30, 0.52], [120, -40])
  const stage2Op = useTransform(sp, [0.30, 0.36, 0.52, 0.60], [0, 1, 1, 0])
  const stage3Y = useTransform(sp, [0.50, 0.72], [120, -40])
  const stage3Op = useTransform(sp, [0.50, 0.56, 0.72, 0.80], [0, 1, 1, 0])

  // Final "stamp" appears at the end
  const stampScale = useTransform(sp, [0.78, 0.92], [0.5, 1])
  const stampRotate = useTransform(sp, [0.78, 0.92], [-30, -8])
  const stampOpacity = useTransform(sp, [0.78, 0.85, 0.95, 1], [0, 1, 1, 0.95])

  // Floating orbs parallax in the background
  const orb1Y = useTransform(sp, [0, 1], [0, -400])
  const orb2Y = useTransform(sp, [0, 1], [0, -800])
  const orb3Y = useTransform(sp, [0, 1], [0, -200])

  // Progress bar at the top of the sticky viewport
  const barScaleX = sp

  if (reduced) {
    return (
      <main className="lab-page">
        <div className="lab-page__inner">
          <header className="lab-page__header">
            <p className="kicker"><span className="kicker__line" />{t('lab.scrollCinema.experimentNum')}</p>
            <h1 className="lab-page__title">{t('lab.experiments.scrollCinema.title')}</h1>
            <p className="lab-page__lede">{t('lab.scrollCinema.reducedLede')}</p>
          </header>
          <FooterNote />
        </div>
      </main>
    )
  }

  return (
    <main className="cinema" ref={containerRef}>
      {/* No in-page back link — the cinematic is full-bleed by design.
          Escape is handled by the navbar's "Lab" link, which stays fixed
          and visible throughout the experience. */}

      {/* STICKY VIEWPORT — the entire show plays inside this single frame */}
      <div className="cinema__sticky">
        <motion.div className="cinema__bg" style={{ background: bg }} />

        {/* Parallax orbs in the deep background */}
        <motion.div className="cinema__orb cinema__orb--a" style={{ y: orb1Y }} />
        <motion.div className="cinema__orb cinema__orb--b" style={{ y: orb2Y }} />
        <motion.div className="cinema__orb cinema__orb--c" style={{ y: orb3Y }} />

        {/* Scroll progress indicator */}
        <motion.div className="cinema__progress" style={{ scaleX: barScaleX }} />

        {/* ACT 1 — title */}
        <motion.div
          className="cinema__title-wrap"
          style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
        >
          <p className="cinema__kicker">{t('lab.scrollCinema.kicker')}</p>
          <h1 className="cinema__title">{t('lab.scrollCinema.heroTitle1')}<br/>{t('lab.scrollCinema.heroTitle2')}</h1>
          <p className="cinema__sub">{t('lab.scrollCinema.heroSub')}</p>
          <motion.span
            className="cinema__hint"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            ↓
          </motion.span>
        </motion.div>

        {/* ACTS 2-4 — stage cards */}
        <motion.div className="cinema__stage" style={{ y: stage1Y, opacity: stage1Op }}>
          <span className="cinema__act">{t('lab.scrollCinema.act1Tag')}</span>
          <h2 className="cinema__heading">{t('lab.scrollCinema.act1Heading')}</h2>
          <p className="cinema__body">{t('lab.scrollCinema.act1Body')}</p>
        </motion.div>

        <motion.div className="cinema__stage" style={{ y: stage2Y, opacity: stage2Op }}>
          <span className="cinema__act">{t('lab.scrollCinema.act2Tag')}</span>
          <h2 className="cinema__heading">{t('lab.scrollCinema.act2Heading')}</h2>
          <p className="cinema__body">{t('lab.scrollCinema.act2Body')}</p>
        </motion.div>

        <motion.div className="cinema__stage" style={{ y: stage3Y, opacity: stage3Op }}>
          <span className="cinema__act">{t('lab.scrollCinema.act3Tag')}</span>
          <h2 className="cinema__heading">{t('lab.scrollCinema.act3Heading')}</h2>
          <p className="cinema__body">{t('lab.scrollCinema.act3Body')}</p>
        </motion.div>

        {/* ACT 5 — stamp. SVG textPath flows the legend around the ring like
            a real postage stamp; the year sits centered as a focal stamp core. */}
        <motion.div
          className="cinema__stamp"
          style={{
            scale: stampScale,
            rotate: stampRotate,
            opacity: stampOpacity,
          }}
        >
          <svg
            className="cinema__stamp-svg"
            viewBox="0 0 240 240"
            aria-hidden="true"
          >
            <defs>
              {/* Path runs clockwise around the inner radius so text reads naturally */}
              <path
                id="cinema-stamp-curve"
                d="M 120,120 m -90,0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0"
              />
            </defs>
            {/* Dashed ring */}
            <circle
              cx="120" cy="120" r="100"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            {/* Curved legend — repeated to fill the full circumference */}
            <text className="cinema__stamp-curve-text">
              <textPath href="#cinema-stamp-curve" startOffset="0">
                {`${t('lab.scrollCinema.stampMade')} ${t('lab.scrollCinema.stampMotion')} · ${t('lab.scrollCinema.stampMade')} ${t('lab.scrollCinema.stampMotion')} · `}
              </textPath>
            </text>
          </svg>
          <div className="cinema__stamp-core">2026</div>
        </motion.div>
      </div>

      {/* Spacer that creates the scroll distance */}
      <div className="cinema__spacer" aria-hidden="true" />

      {/* Static footer after the cinematic */}
      <div className="cinema__after">
        <FooterNote />
      </div>
    </main>
  )
}

function FooterNote() {
  const { t } = useTranslation()
  return (
    <footer className="lab-page__foot">
      <div className="lab-page__foot-text">
        <span className="lab-page__foot-label">{t('lab.whatThis')}</span>
        <p>
          <Trans i18nKey="lab.scrollCinema.footerNote" components={[<code key="c" />]} />
        </p>
      </div>
      <Link to="/lab" className="lab-page__next">
        {t('lab.backToLab')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </footer>
  )
}
