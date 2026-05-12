import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const CAPS = [
  {
    title: 'UI/UX Design',
    desc: 'From early wireframes to pixel-perfect interfaces — with a focus on usability, visual hierarchy, and interaction craft.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Design Systems',
    desc: 'Scalable token architectures, component libraries, and design-to-code documentation that keep teams aligned at speed.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="9" height="9" rx="1" /><rect x="13" y="2" width="9" height="9" rx="1" />
        <rect x="2" y="13" width="9" height="9" rx="1" /><rect x="13" y="13" width="9" height="9" rx="1" />
      </svg>
    ),
  },
  {
    title: 'User Research',
    desc: 'Interviews, usability tests, card sorts, and synthesis frameworks that ground design decisions in real user behaviour.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

function CapCard({ cap }) {
  return (
    <motion.div variants={cardVariants} whileHover="hover" className="cap-card">
      <motion.div
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="cap-card__bg"
      />
      <motion.div
        variants={{ hover: { rotate: -8, scale: 1.1, color: 'var(--accent)' } }}
        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        className="cap-card__icon"
      >
        {cap.icon}
      </motion.div>
      <h3 className="cap-card__title">{cap.title}</h3>
      <p className="cap-card__desc">{cap.desc}</p>
    </motion.div>
  )
}

export default function Capabilities() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section className="section section--flush-bottom">
      <motion.div
        ref={ref}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="caps-frame"
      >
        <div className="caps-grid">
          {CAPS.map(c => <CapCard key={c.title} cap={c} />)}
        </div>
      </motion.div>
    </section>
  )
}
