import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next' // 1. i18n eklendi
import { PROJECTS } from '../data/projects'
import Lightbox from '../components/Lightbox'

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
  const { t } = useTranslation() // 2. Hook çağrıldı
  
  // Statik veriyi buluyoruz
  const staticProject = PROJECTS.find(p => p.id === Number(id))
  
  const [activeFrame, setActiveFrame] = useState(null)

  if (!staticProject) return <Navigate to="/" replace />

  // 3. EN KRİTİK KISIM: JSON çevirisini bulup statik veriyle birleştiriyoruz!
  // Not: Diziler index (0,1,2) ile çalıştığı için, id - 1 yaparak JSON'daki doğru metni buluyoruz.
  const translatedProjects = t('projects.items', { returnObjects: true })
  const tProject = translatedProjects[staticProject.id - 1] || {}
  
  // İki veriyi tek bir objede birleştiriyoruz (project objesi artık hem resimleri hem Türkçe metinleri içeriyor)
  const project = { ...staticProject, ...tProject }

  const accent = project.accent
  const hasLinks = project.links?.behance || project.links?.prototype || project.links?.figma

  return (
    <main className="pdetail" style={{ '--card-accent': accent }}>
      <div className="pdetail__ambient" />

      <div className="pdetail__container">
        <motion.div variants={container} initial="hidden" animate="show">

          <motion.div variants={item}>
            <Link to="/" className="pdetail__back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              {/* Back to work metnini statik bıraktım, istersen t('nav.work') ile değiştirebilirsin */}
              Back to work 
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
                {/* Artık project.tags undefined değil, çünkü JSON'dan geliyor */}
                {project.tags?.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="pdetail__section">
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
          </motion.div>

          {project.gallery?.length > 0 && (
            <motion.div variants={item} className="pdetail__section">
              <h2 className="pdetail__h2">Selected Frames</h2>
              <div className="pdetail__gallery">
                {project.gallery.map((g, i) => {
                  // Galeri alt yazısını (caption) JSON'dan çekiyoruz
                  const captionText = project.galleryCaptions?.[i] || g.caption || '';
                  
                  return (
                    <figure key={i} className="pdetail__gallery-item">
                      <button
                        type="button"
                        className="pdetail__gallery-trigger"
                        onClick={() => setActiveFrame({ ...g, caption: captionText })}
                        aria-label={`Open ${captionText || `frame ${i + 1}`} in lightbox`}
                      >
                        <img
                          src={g.src}
                          alt={captionText || `${project.title} frame ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="pdetail__gallery-zoom" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="7.5" y1="11" x2="14.5" y2="11" />
                            <line x1="11" y1="7.5" x2="11" y2="14.5" />
                            <line x1="20" y1="20" x2="16.5" y2="16.5" />
                          </svg>
                        </span>
                      </button>
                      {captionText && <figcaption className="pdetail__caption">{captionText}</figcaption>}
                    </figure>
                  );
                })}
              </div>
            </motion.div>
          )}

          {hasLinks && (
            <motion.div variants={item} className="pdetail__links">
              {project.links.behance && (
                <motion.a
                  href={project.links.behance}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="btn btn-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
                  </svg>
                  {t('projectDetail.viewOnBehance')}
                </motion.a>
              )}

              {project.links.prototype && (
                <motion.a
                  href={project.links.prototype}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="btn btn-secondary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {t('projects.viewPrototype')}
                </motion.a>
              )}
            </motion.div>
          )}

        </motion.div>
      </div>

      <Lightbox frame={activeFrame} onClose={() => setActiveFrame(null)} />
    </main>
  );
}
