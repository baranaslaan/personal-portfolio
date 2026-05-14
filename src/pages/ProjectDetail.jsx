import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PROJECTS } from '../data/projects'
import Lightbox from '../components/Lightbox'
// Animasyon bileşenini ekliyoruz
import { Reveal } from '../components/Reveal'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  
  const staticProject = PROJECTS.find(p => p.id === Number(id))
  const [activeFrame, setActiveFrame] = useState(null)

  if (!staticProject) return <Navigate to="/" replace />

  const translatedProjects = t('projects.items', { returnObjects: true })
  const tProject = translatedProjects[staticProject.id - 1] || {}
  const project = { ...staticProject, ...tProject }

  const accent = project.accent
  const hasLinks = project.links?.behance || project.links?.prototype || project.links?.figma

  return (
    <main className="pdetail" style={{ '--card-accent': accent }}>
      <div className="pdetail__ambient" />

      <div className="pdetail__container">
        <motion.div variants={container} initial="hidden" animate="show">

          {/* GERİ DÖNÜŞ VE BAŞLIK */}
          <motion.div variants={item}>
            <Link to="/" className="pdetail__back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              {t('nav.work')}
            </Link>
          </motion.div>

          <motion.div variants={item} className="pdetail__header">
            <div className="pdetail__eyebrow">
              <div className="pdetail__dot" />
              <span>Case Study</span>
            </div>
            <h1 className="pdetail__title">{project.title}</h1>
            <p className="pdetail__lede">{project.desc}</p>
          </motion.div>

          {/* 1. SHARED LAYOUT: HERO IMAGE */}
          {/* Ana sayfadaki karttan gelen görsel buraya "akacak" */}
          <motion.div variants={item} className="pdetail__hero">
            <motion.img 
              layoutId={`project-img-${project.id}`} 
              src={project.image} 
              alt={project.title}
              className="pdetail__main-img"
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </motion.div>

          {/* METADATA */}
          <motion.div variants={item} className="pdetail__meta">
            {[
              { label: 'Role', value: project.role },
              { label: 'Year', value: project.year },
            ].map(({ label, value }) => (
              <div key={label} className="pdetail__meta-cell">
                <div className="pdetail__meta-label">{label}</div>
                <div className="pdetail__meta-value">{value}</div>
              </div>
            ))}
            {project.metric && (
              <div className="pdetail__meta-cell pdetail__meta-cell--accent">
                <div className="pdetail__meta-label">Impact</div>
                <div className="pdetail__meta-value pdetail__meta-value--accent">
                  {project.metric.value}
                  <span className="pdetail__meta-sub">{project.metric.label}</span>
                </div>
              </div>
            )}
            <div className="pdetail__meta-cell pdetail__meta-cell--wide">
              <div className="pdetail__meta-label">Disciplines</div>
              <div className="pdetail__meta-tags">
                {project.tags?.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </motion.div>

          {/* 2. SCROLL REVEAL: HIGHLIGHTS */}
          <Reveal>
            <div className="pdetail__section">
              <h2 className="pdetail__h2">Key Highlights</h2>
              <div className="pdetail__highlights">
                {project.highlights?.map((h, i) => (
                  <div key={i} className="pdetail__highlight">
                    <div className="pdetail__highlight-icon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p>{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 3. SCROLL REVEAL: GALLERY */}
          {project.gallery?.length > 0 && (
            <Reveal>
              <div className="pdetail__section">
                <h2 className="pdetail__h2">Selected Frames</h2>
                <div className="pdetail__gallery">
                  {project.gallery.map((g, i) => {
                    const captionText = project.galleryCaptions?.[i] || g.caption || '';
                    return (
                      <figure key={i} className="pdetail__gallery-item">
                        <button
                          type="button"
                          className="pdetail__gallery-trigger"
                          onClick={() => setActiveFrame({ ...g, caption: captionText })}
                        >
                          <img src={g.src} alt={captionText} loading="lazy" />
                          <span className="pdetail__gallery-zoom">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                          </span>
                        </button>
                        {captionText && <figcaption className="pdetail__caption">{captionText}</figcaption>}
                      </figure>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {/* LINKS */}
          {hasLinks && (
            <Reveal>
              <div className="pdetail__links">
                {project.links.behance && (
                  <motion.a
                    href={project.links.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="btn btn-primary"
                  >
                    {t('projectDetail.viewOnBehance')}
                  </motion.a>
                )}

                {project.links.prototype && (
                  <motion.a
                    href={project.links.prototype}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="btn btn-secondary"
                  >
                    {t('projects.viewPrototype')}
                  </motion.a>
                )}
              </div>
            </Reveal>
          )}

        </motion.div>
      </div>

      <Lightbox frame={activeFrame} onClose={() => setActiveFrame(null)} />
    </main>
  );
}
