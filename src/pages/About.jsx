import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { SKILLS } from '../data/projects'

/* CV-derived data */
const EXPERIENCE = [
  {
    period: 'Jan 2025 — Present',
    role: 'Product Designer',
    company: 'Beat Software Solutions',
    location: 'Istanbul',
    points: [
      'UI/UX flows for the Ticaret Bakanlığı Serbest Bölgeler Platformu',
      'Intuitive dashboards for the TUSAŞ Hub Project',
      'Interface accessibility on the ASELSAN Hub Project',
      'Mobile-first UI for the EntekBir Mobile Project',
    ],
  },
  {
    period: 'Mar 2024 — Present',
    role: 'UI Designer',
    company: 'RouteWise',
    location: 'Istanbul',
    points: [
      'Independent UI/UX design across the full RouteWise app',
      'Detail-focused execution across complex states and flows',
      'Effective async collaboration across timezones',
    ],
  },
  {
    period: 'Jan 2021 — Dec 2025',
    role: 'Digital Product Designer',
    company: 'Akaunting',
    location: 'Kingston',
    points: [
      'Brainstormed enhancements and new product features with the design team',
      'Documented design steps for internal product manuals',
      'Built rapid prototypes and collaborated closely with engineering',
      'Created visuals and renderings communicating product concepts',
    ],
  },
  {
    period: 'Sep 2018 — Aug 2019',
    role: 'Graphic Designer',
    company: 'ETS Tur',
    location: 'Istanbul',
    points: [
      'Print materials — brochures, banners, signage',
      'Digital displays for online advertising campaigns',
      '3D models and animation for interactive projects',
      'Logos, illustrations and typography across organizations',
    ],
  },
]

const SHIPPED = [
  { name: 'RouteWise App',                          note: 'Vehicle tracking · iOS / Web' },
  { name: 'Akaunting',                              note: 'Open-source accounting · Web' },
  { name: 'Ticaret Bakanlığı Free Zones Platform',  note: 'Government services · Web' },
  { name: 'TUSAŞ Hub',                              note: 'Aerospace · Dashboards' },
  { name: 'ASELSAN Hub',                            note: 'Defense · Internal platform' },
  { name: 'EntekBir Mobile',                        note: 'Enterprise · Mobile' },
]

const EDUCATION = [
  {
    period: '2019',
    school: 'Istanbul Medeniyet Üniversitesi',
    field:  'Design and Visual Communications',
  },
  {
    period: '2023',
    school: 'Istanbul Üniversitesi',
    field:  'Web Design and Coding',
  },
  {
    period: '2016 — 2019',
    school: 'Sabri Çalışkan Lisesi',
    field:  'Graphic Design and Photography',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function About({ onHireClick }) {
  return (
    <main className="aboutp">
      {/* ambient wash */}
      <div className="aboutp__ambient" aria-hidden="true" />

      <div className="aboutp__container">
        {/* back link */}
        <Link to="/" className="pdetail__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back home
        </Link>

        <motion.div variants={container} initial="hidden" animate="show">

          {/* ============ HERO ============ */}
          <motion.section variants={item} className="aboutp__hero">
            <p className="kicker"><span className="kicker__line" />About</p>
            <h1 className="h-display aboutp__title">
              Designing useful<br />digital products<br />since 2018.
            </h1>
            <p className="aboutp__lede">
              I am a Product Designer creating user-centered digital products since 2018.
              I independently designed the UI/UX of the RouteWise App, contributed to the
              design team of Akaunting, and delivered design solutions for the Ticaret
              Bakanlığı Free Zones Platform, TUSAŞ Hub, ASELSAN Hub, and EntekBir Mobile
              projects. All are live and in active use — built around usability,
              accessibility, and craft. Beyond UI/UX, I work in motion, branding, and
              graphic design.
            </p>

            <div className="aboutp__meta">
              <span><strong>Istanbul, Türkiye</strong></span>
              <span aria-hidden="true">·</span>
              <span>7+ years in design</span>
              <span aria-hidden="true">·</span>
              <span>4 companies</span>
            </div>

            <div className="aboutp__actions">
              <a
                href="/baran-aslan-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CV
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHireClick}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Get in touch
              </button>
            </div>
          </motion.section>

          {/* ============ CURRENTLY ============ */}
          <motion.section variants={item} className="aboutp__current">
            <div className="aboutp__current-card">
              <span className="aboutp__current-dot" aria-hidden="true" />
              <div>
                <div className="aboutp__current-label">Currently</div>
                <div className="aboutp__current-value">
                  Product Designer at <strong>Beat Software Solutions</strong> · Istanbul
                </div>
              </div>
            </div>
          </motion.section>

          {/* ============ EXPERIENCE ============ */}
          <motion.section variants={item} className="aboutp__section">
            <header className="aboutp__section-head">
              <h2 className="aboutp__h2">Experience</h2>
              <span className="aboutp__section-meta">{EXPERIENCE.length} roles</span>
            </header>

            <ol className="aboutp__timeline">
              {EXPERIENCE.map((e, i) => (
                <li key={i} className="aboutp__role">
                  <div className="aboutp__role-period">{e.period}</div>
                  <div className="aboutp__role-body">
                    <div className="aboutp__role-head">
                      <h3 className="aboutp__role-title">{e.role}</h3>
                      <div className="aboutp__role-where">
                        <span className="aboutp__role-company">{e.company}</span>
                        <span className="aboutp__role-sep" aria-hidden="true">·</span>
                        <span className="aboutp__role-loc">{e.location}</span>
                      </div>
                    </div>
                    <ul className="aboutp__role-points">
                      {e.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>

          {/* ============ SHIPPED PRODUCTS ============ */}
          <motion.section variants={item} className="aboutp__section">
            <header className="aboutp__section-head">
              <h2 className="aboutp__h2">Shipped to production</h2>
              <span className="aboutp__section-meta">All live, all in use</span>
            </header>
            <div className="aboutp__shipped">
              {SHIPPED.map((s, i) => (
                <div key={i} className="aboutp__shipped-item">
                  <span className="aboutp__shipped-bullet" aria-hidden="true" />
                  <div>
                    <div className="aboutp__shipped-name">{s.name}</div>
                    <div className="aboutp__shipped-note">{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ============ EDUCATION ============ */}
          <motion.section variants={item} className="aboutp__section">
            <header className="aboutp__section-head">
              <h2 className="aboutp__h2">Education</h2>
            </header>
            <ol className="aboutp__timeline">
              {EDUCATION.map((e, i) => (
                <li key={i} className="aboutp__role">
                  <div className="aboutp__role-period">{e.period}</div>
                  <div className="aboutp__role-body">
                    <div className="aboutp__role-head">
                      <h3 className="aboutp__role-title">{e.school}</h3>
                      <div className="aboutp__role-where">
                        <span className="aboutp__role-company">{e.field}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>

          {/* ============ SKILLS ============ */}
          <motion.section variants={item} className="aboutp__section">
            <header className="aboutp__section-head">
              <h2 className="aboutp__h2">Skills &amp; tools</h2>
            </header>
            <div className="aboutp__skills">
              {Object.entries(SKILLS).map(([cat, skills]) => (
                <div key={cat} className="aboutp__skill-group">
                  <div className="aboutp__skill-cat">{cat}</div>
                  <div className="aboutp__skill-chips">
                    {skills.map(s => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ============ LANGUAGES ============ */}
          <motion.section variants={item} className="aboutp__section">
            <header className="aboutp__section-head">
              <h2 className="aboutp__h2">Languages</h2>
            </header>
            <div className="aboutp__lang">
              <div className="aboutp__lang-row">
                <span className="aboutp__lang-name">English</span>
                <span className="aboutp__lang-level">Professional working proficiency</span>
              </div>
              <div className="aboutp__lang-row">
                <span className="aboutp__lang-name">Turkish</span>
                <span className="aboutp__lang-level">Native</span>
              </div>
            </div>
          </motion.section>

          {/* ============ CTA ============ */}
          <motion.section variants={item} className="aboutp__cta">
            <div className="aboutp__cta-inner">
              <h2 className="h-display aboutp__cta-title">Let’s work together.</h2>
              <p className="aboutp__cta-lede">
                Have a product challenge or role in mind? I’m always open to discussing
                new opportunities.
              </p>
              <div className="aboutp__actions">
                <button type="button" className="btn btn-primary" onClick={onHireClick}>
                  Hire me
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <a
                  href="/baran-aslan-resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Download CV
                </a>
              </div>
            </div>
          </motion.section>

        </motion.div>
      </div>
    </main>
  )
}
