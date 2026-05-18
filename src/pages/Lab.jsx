import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/**
 * Lab — a playground of self-initiated, coded experiments.
 *
 * Each card links to a standalone demo showcasing a different Framer Motion
 * technique. The header is honest about what this section is: speculative
 * explorations, not client work.
 */

// Slug + visual + technical tag list per experiment. User-facing copy (title,
// blurb) is pulled from i18n at render time so this list stays
// language-agnostic. Tags are technical API names — never localized.
const EXPERIMENTS = [
  { slug: 'cursor-symphony', accent: '#22C55E', tags: ['useMotionValue', 'useSpring', 'state machines'] },
  { slug: 'scroll-cinema',   accent: '#A78BFA', tags: ['useScroll', 'useTransform', 'sticky narrative'] },
  { slug: 'token-forge',     accent: '#F59E0B', tags: ['layout animation', 'reactive tokens', 'live theming'] },
  { slug: 'drift-physics',   accent: '#06B6D4', tags: ['drag', 'dragConstraints', 'inertia'] },
  { slug: 'system-creator',  accent: '#EC4899', tags: ['design tokens', 'live theming', 'typography'] },
  { slug: 'type-symphony',   accent: '#6366F1', tags: ['variable fonts', 'animate()', 'font-variation-settings'] },
]

// Map slug → i18n key under lab.experiments
const SLUG_TO_KEY = {
  'cursor-symphony': 'cursorSymphony',
  'scroll-cinema':   'scrollCinema',
  'token-forge':     'tokenForge',
  'drift-physics':   'driftPhysics',
  'system-creator':  'systemCreator',
  'type-symphony':   'typeSymphony',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Lab() {
  const { t } = useTranslation()
  return (
    <main className="lab">
      <div className="lab__ambient" aria-hidden="true" />

      <div className="lab__container">
        <motion.header
          variants={container}
          initial="hidden"
          animate="show"
          className="lab__header"
        >
          <motion.div variants={item} className="lab__kicker">
            <span className="lab__kicker-pulse" />
            <span>{t('lab.kicker')}</span>
          </motion.div>

          <motion.h1 variants={item} className="lab__title">
            {t('lab.titleBefore')}<span className="lab__title-accent">{t('lab.titleAccent')}</span>{t('lab.titleAfter')}
          </motion.h1>

          <motion.p variants={item} className="lab__lede">
            {t('lab.lede')}
          </motion.p>

          <motion.div variants={item} className="lab__meta">
            <span>{t('lab.metaExperiments', { count: EXPERIMENTS.length })}</span>
            <span aria-hidden="true">·</span>
            <span>{t('lab.metaStack')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('lab.metaOss')}</span>
          </motion.div>
        </motion.header>

        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="lab__grid"
        >
          {EXPERIMENTS.map((exp, i) => (
            <motion.div key={exp.slug} variants={item}>
              <LabCard experiment={exp} index={i} />
            </motion.div>
          ))}
        </motion.section>
      </div>
    </main>
  )
}

function LabCard({ experiment, index }) {
  const { t } = useTranslation()
  const num = String(index + 1).padStart(2, '0')
  const key = SLUG_TO_KEY[experiment.slug]
  const title = t(`lab.experiments.${key}.title`)
  const blurb = t(`lab.experiments.${key}.blurb`)
  return (
    <Link
      to={`/lab/${experiment.slug}`}
      className="lab-card"
      style={{ '--lab-accent': experiment.accent }}
      aria-label={title}
    >
      <motion.div
        className="lab-card__inner"
        whileHover="hover"
        whileTap={{ scale: 0.985 }}
      >
        <motion.div
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lab-card__glow"
        />

        <div className="lab-card__top">
          <span className="lab-card__num">{num}</span>
          <motion.div
            variants={{ hover: { x: 6, opacity: 1 } }}
            initial={{ x: 0, opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="lab-card__arrow"
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>

        <h3 className="lab-card__title">{title}</h3>
        <p className="lab-card__blurb">{blurb}</p>

        <div className="lab-card__tags">
          {experiment.tags.map(tag => (
            <span key={tag} className="lab-card__tag">{tag}</span>
          ))}
        </div>
      </motion.div>
    </Link>
  )
}
