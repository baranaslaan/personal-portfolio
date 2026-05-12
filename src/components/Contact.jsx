import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SOCIALS } from '../data/projects'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const socialItem = {
  hidden: { opacity: 0, x: 10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
}

function SocialRow({ s }) {
  return (
    <motion.a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={s.name}
      variants={socialItem}
      whileHover={{ x: 4 }}
      className="social-row"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
      <span>{s.name}</span>
    </motion.a>
  )
}

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="contact" className="section section--flush-top">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="contact-card"
      >
        <motion.div
          initial={{ backgroundPosition: '-200% 0' }}
          animate={inView ? { backgroundPosition: '200% 0' } : {}}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="contact-card__sweep"
        />
        <div className="contact-card__bg-glow" />

        <div className="contact-card__inner">
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="contact-card__main"
          >
            <motion.p variants={fadeUp} className="kicker">
              <span className="kicker__line" />
              Get in Touch
            </motion.p>
            <motion.h2 variants={fadeUp} className="h-display contact-card__title">
              Let's work<br />together
            </motion.h2>
            <motion.p variants={fadeUp} className="contact-card__body">
              Have a product challenge or design role in mind? I'm always open to discussing new opportunities and ideas.
            </motion.p>
            <motion.a
              variants={fadeUp}
              href="mailto:baranaslan010@gmail.com"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="btn btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Send an Email
            </motion.a>
          </motion.div>

          <div className="contact-card__side">
            <div>
              <div className="contact-card__side-label">Find me on</div>
              <motion.div
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
                initial="hidden"
                animate={inView ? 'show' : 'hidden'}
                className="contact-card__socials"
              >
                {SOCIALS.map(s => <SocialRow key={s.name} s={s} />)}
              </motion.div>
            </div>
            <div>
              <div className="contact-card__side-label">Response time</div>
              <div className="contact-card__response">
                Usually within <span>6 hours</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
