import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'

/**
 * Drift Physics — drag-and-throw cards with momentum and constraints.
 *
 * Each card is a `motion.div` with `drag` enabled, dragElastic for bouncy
 * boundaries, and dragTransition tuned for natural inertia. Cards rotate
 * subtly during drag based on their horizontal velocity (via useMotionValue
 * on x mapped through useTransform).
 */

const PALETTE = [
  { bg: 'linear-gradient(135deg, #22C55E, #4ade80)', label: 'Spring' },
  { bg: 'linear-gradient(135deg, #A78BFA, #c4b5fd)', label: 'Lavender' },
  { bg: 'linear-gradient(135deg, #F59E0B, #fbbf24)', label: 'Amber' },
  { bg: 'linear-gradient(135deg, #06B6D4, #67e8f9)', label: 'Cyan' },
  { bg: 'linear-gradient(135deg, #EC4899, #f9a8d4)', label: 'Pink' },
  { bg: 'linear-gradient(135deg, #6366F1, #a5b4fc)', label: 'Indigo' },
]

const seedCards = () =>
  Array.from({ length: 4 }, (_, i) => ({
    id: crypto.randomUUID(),
    palette: PALETTE[i % PALETTE.length],
    startX: (i - 1.5) * 40,
    startY: (i - 1.5) * 12,
  }))

export default function DriftPhysics() {
  const { t } = useTranslation()
  const stageRef = useRef(null)
  const [cards, setCards] = useState(seedCards)
  const [throwCount, setThrowCount] = useState(0)

  const addCard = () => {
    setCards(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        palette: PALETTE[prev.length % PALETTE.length],
        startX: (Math.random() - 0.5) * 200,
        startY: (Math.random() - 0.5) * 80,
      },
    ])
  }

  const resetCards = () => setCards(seedCards())
  const removeCard = (id) => setCards(prev => prev.filter(c => c.id !== id))

  return (
    <main className="lab-page">
      <div className="lab-page__inner">
        <BackLink />
        <header className="lab-page__header">
          <p className="kicker"><span className="kicker__line" />{t('lab.driftPhysics.experimentNum')}</p>
          <h1 className="lab-page__title">{t('lab.experiments.driftPhysics.title')}</h1>
          <p className="lab-page__lede">{t('lab.driftPhysics.lede')}</p>
        </header>

        <div className="drift">
          <div className="drift__toolbar">
            <button type="button" onClick={addCard} className="drift__btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              {t('lab.driftPhysics.addCard')}
            </button>
            <button type="button" onClick={resetCards} className="drift__btn drift__btn--ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              {t('lab.driftPhysics.reset')}
            </button>
            <span className="drift__counter">
              <span className="drift__counter-num">{cards.length}</span>
              <span>{t('lab.driftPhysics.cards')}</span>
              {throwCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="drift__counter-num">{throwCount}</span>
                  <span>{t('lab.driftPhysics.throws')}</span>
                </>
              )}
            </span>
          </div>

          <div ref={stageRef} className="drift__stage" aria-label={t('lab.driftPhysics.stageAria')}>
            {cards.map(card => (
              <DragCard
                key={card.id}
                card={card}
                constraintRef={stageRef}
                onDismiss={() => removeCard(card.id)}
                onThrow={() => setThrowCount(c => c + 1)}
              />
            ))}
            <div className="drift__hint">{t('lab.driftPhysics.hint')}</div>
          </div>
        </div>

        <FooterNote
          i18nKey="lab.driftPhysics.footerNote"
          nextSlug="scroll-cinema"
          nextTitleKey="lab.experiments.scrollCinema.title"
        />
      </div>
    </main>
  )
}

function DragCard({ card, constraintRef, onDismiss, onThrow }) {
  const { t } = useTranslation()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Cards tilt while dragging based on horizontal velocity / position
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12])
  const scale  = useTransform(
    [x, y],
    ([vx, vy]) => 1 + Math.min(Math.hypot(vx, vy) / 1600, 0.04)
  )

  return (
    <motion.div
      drag
      dragConstraints={constraintRef}
      dragElastic={0.18}
      dragTransition={{ bounceStiffness: 240, bounceDamping: 18, power: 0.5, timeConstant: 200 }}
      onDragEnd={(_, info) => {
        // Count throws when there's a real velocity
        if (Math.hypot(info.velocity.x, info.velocity.y) > 200) onThrow?.()
      }}
      onDoubleClick={onDismiss}
      style={{
        x, y, rotate, scale,
        background: card.palette.bg,
        translateX: card.startX,
        translateY: card.startY,
      }}
      whileHover={{ y: -4 }}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="drift__card"
    >
      <div className="drift__card-inner">
        <span className="drift__card-label">{card.palette.label}</span>
        <span className="drift__card-hint">{t('lab.driftPhysics.cardHint')}</span>
      </div>
    </motion.div>
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
