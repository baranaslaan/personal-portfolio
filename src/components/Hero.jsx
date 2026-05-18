import { useEffect, useRef, useState } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform, useReducedMotion,
} from 'framer-motion'
import HeroVisual from './HeroVisual'
import { useCountUp } from '../hooks/useCountUp'
import { useTranslation } from 'react-i18next';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}



/* ---------- Letter-cascade rotating accent word ---------- */
function RotatingAccent() {
  const { t } = useTranslation();
  // JSON'daki diziyi (array) obje olarak çekmemizi sağlayan özel parametre: returnObjects
  const rotatingWords = t('hero.rotatingWords', { returnObjects: true });
  
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    // ROTATING_WORDS yerine artık kendi çektiğimiz rotatingWords'ü kullanıyoruz
    const id = setInterval(() => setI(x => (x + 1) % rotatingWords.length), 3600);
    return () => clearInterval(id);
  }, [reduced, rotatingWords.length]); // Bağımlılık dizisine length'i ekledik

  // Yine kendi değişkenimiz
  const word = rotatingWords[i];

  return (
    <span className="hero__heading-row">
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="hero__heading-accent"
          exit={{ y: '-105%', transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {word.split('').map((ch, j) => (
            <motion.span
              key={j}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.55,
                delay: j * 0.028,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ---------- Magnetic CTA wrapper ---------- */
function MagneticAnchor({ children, className, ...props }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const onMove = (e) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    const max = 100
    if (dist < max) {
      const k = (1 - dist / max) * 0.35
      x.set(dx * k)
      y.set(dy * k)
    } else {
      x.set(0); y.set(0)
    }
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.a
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduced ? undefined : { x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  )
}

/* ---------- Animated stat cell with count-up ---------- */
function StatCell({ num, label, inView }) {
  const value = useCountUp(num, inView)
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.9 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 18 } },
      }}
      className="hero__stat-cell"
    >
      <div className="hero__stat-cell-num">{value}</div>
      <div className="hero__stat-cell-label">{label}</div>
    </motion.div>
  )
}

/* ---------- Hero ---------- */
export default function Hero() {
  // 1. Çeviri fonksiyonunu ve istatistikleri içeri alıyoruz (HATA BURADA ÇÖZÜLDÜ)
  const { t } = useTranslation();
  const stats = t('hero.stats', { returnObjects: true });

  const reduced = useReducedMotion()
  const sectionRef = useRef(null)
  // Stats live above the fold; gating their count-up on an in-view observer
  // was unreliable on mobile (observer wouldn't always fire, leaving the
  // numbers stuck at 0). They start counting on mount instead.
  const statsRef = useRef(null)
  const statsInView = true

  // cursor-tracked atmosphere
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 80, damping: 22, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 80, damping: 22, mass: 0.6 })
  const spotlightX = useTransform(sx, v => `${v * 100}%`)
  const spotlightY = useTransform(sy, v => `${v * 100}%`)
  const blobShiftX = useTransform(mx, v => (v - 0.5) * 40)
  const blobShiftY = useTransform(my, v => (v - 0.5) * 40)
  const blobShiftXNeg = useTransform(blobShiftX, v => -v * 0.7)
  const blobShiftYNeg = useTransform(blobShiftY, v => -v * 0.7)

  const onMove = (e) => {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  const driftA = reduced ? undefined : { x: [0, 80, -40, 30, 0], y: [0, -60, 40, -30, 0] }
  const driftB = reduced ? undefined : { x: [0, -70, 50, -30, 0], y: [0, 50, -60, 30, 0] }
  const driftEase = 'easeInOut'

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={onMove}
      className="hero"
    >
      {/* ============ ATMOSPHERE LAYER ============ */}
      <div className="hero__atmosphere" aria-hidden="true">
        <div className="hero__grid" />

        <motion.div
          className="hero__blob hero__blob--a"
          style={reduced ? undefined : { x: blobShiftX, y: blobShiftY }}
        >
          <motion.div
            className="hero__blob-inner"
            animate={driftA}
            transition={{ duration: 38, repeat: Infinity, ease: driftEase, times: [0, 0.25, 0.5, 0.75, 1] }}
          />
        </motion.div>
        <motion.div
          className="hero__blob hero__blob--b"
          style={reduced ? undefined : { x: blobShiftXNeg, y: blobShiftYNeg }}
        >
          <motion.div
            className="hero__blob-inner"
            animate={driftB}
            transition={{ duration: 46, repeat: Infinity, ease: driftEase, times: [0, 0.25, 0.5, 0.75, 1], delay: 2 }}
          />
        </motion.div>

        {!reduced && (
          <motion.div
            className="hero__spotlight"
            style={{ left: spotlightX, top: spotlightY }}
          />
        )}
        <div className="hero__vignette" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="hero__inner hero__container">
        <div className="hero__split">
          {/* LEFT: copy */}
          <div className="hero__copy">
            <motion.div variants={item} className="hero__badge">
              <span className="hero__badge-dot" />
              <span className="hero__badge-label">{t('hero.badge')}</span>
            </motion.div>

            <h1 className="hero__heading">
              <span className="hero__heading-row">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'inline-block' }}
                >
                  {t('hero.headingStatic')}
                </motion.span>
              </span>
              <RotatingAccent />
            </h1>

            <motion.p variants={item} className="hero__desc">
              {t('hero.desc')}
            </motion.p>

            <motion.div variants={item} className="hero__ctas">
              <MagneticAnchor href="#work" className="btn btn-primary">
                {t('hero.viewWork')}
                <motion.svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  animate={reduced ? undefined : { x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
              </MagneticAnchor>
              <MagneticAnchor href="#contact" className="btn btn-secondary">
                {t('hero.getInTouch')}
              </MagneticAnchor>
            </motion.div>
          </div>

          {/* RIGHT: animated visual */}
          <motion.div variants={item} className="hero__visual-wrap">
            <HeroVisual />
          </motion.div>
        </div>

        {/* full-width stats strip */}
        <motion.div
          ref={statsRef}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
          className="hero__stats-strip"
        >
          {/* HATA ÇÖZÜMÜ: STATS yerine JSON'dan gelen stats değişkenini kullanıyoruz */}
          {stats && stats.map(([n, l]) => (
            <StatCell key={l} num={n} label={l} inView={statsInView} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
