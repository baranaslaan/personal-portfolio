import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/**
 * Full-viewport intro/loading overlay shown on initial app mount.
 *
 * Click-to-enter pattern: stays open until the user clicks anywhere
 * (or the Enter button). Letters cascade in, then an Enter pill with
 * pulse ring becomes the focal CTA.
 *
 * Accessibility:
 *   - prefers-reduced-motion → bypass entirely on mount
 *   - whole panel is a button (role + onClick), Enter key also dismisses
 */
const NAME = 'Baran Aslan'
const EXIT_MS = 800

export default function IntroOverlay() {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(true)

  // Disable browser scroll restoration so refresh always starts at the top.
  // The .intro overlay is position:fixed and covers everything, so we don't
  // need to lock body scroll — Navbar already manages overflow for its own panel.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  // skip immediately under reduced motion
  useEffect(() => {
    if (reduced) setOpen(false)
  }, [reduced])

  // Enter key as alt skip mechanism
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const enter = () => {
    window.scrollTo(0, 0)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro"
          className="intro"
          role="button"
          tabIndex={0}
          aria-label="Click to enter site"
          onClick={enter}
          exit={{
            y: '-100%',
            transition: { duration: EXIT_MS / 1000, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* atmosphere wash */}
          <div className="intro__atmos" aria-hidden="true" />
          <div className="intro__grid"  aria-hidden="true" />

          <motion.div
            className="intro__center"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.4, ease: 'easeOut' } }}
          >
            <motion.div
              className="intro__badge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="intro__badge-dot" />
              <span>Product Designer</span>
            </motion.div>

            <h1 className="intro__name" aria-label={NAME}>
              {NAME.split('').map((ch, i) => (
                <span key={i} className="intro__name-row">
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.18 + i * 0.035,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ display: 'inline-block', whiteSpace: 'pre' }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Enter CTA — appears after letter cascade settles */}
            <motion.button
              type="button"
              className="intro__enter"
              onClick={(e) => { e.stopPropagation(); enter() }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="intro__enter-ring" aria-hidden="true" />
              <span className="intro__enter-label">Enter</span>
              <motion.svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                animate={reduced ? undefined : { x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </motion.button>

            <motion.div
              className="intro__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              click anywhere · press <kbd>↵</kbd> to enter
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
