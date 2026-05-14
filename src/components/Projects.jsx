import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PROJECTS } from '../data/projects' // Yolun kendi projene göre doğru olduğundan emin ol

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

function ProjectCard({ project, index }) {
  const { t } = useTranslation()
  const num = String(index + 1).padStart(2, '0')
  const accent = project.accent
  
  return (
    <motion.div variants={cardVariants} whileHover="hover" whileTap={{ scale: 0.985 }} style={{ height: '100%' }}>
      <Link
        to={`/project/${project.id}`}
        aria-label={`View ${project.title} case study`}
        className="project-card"
        style={{ '--card-accent': accent }}
      >
        <motion.div variants={{ hover: { opacity: 1 } }} initial={{ opacity: 0 }} transition={{ duration: 0.25 }} className="project-card__bg" />
        <motion.div variants={{ hover: { opacity: 1 } }} initial={{ opacity: 0 }} transition={{ duration: 0.25 }} className="project-card__ring" />
        <motion.div variants={{ hover: { y: -4 } }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="project-card__lift">
          <motion.div variants={{ hover: { opacity: 1, scaleY: 1 } }} initial={{ opacity: 0, scaleY: 0.4 }} transition={{ duration: 0.3 }} className="project-card__shelf" />
          <motion.div variants={{ hover: { opacity: 1 } }} initial={{ opacity: 0 }} transition={{ duration: 0.35 }} className="project-card__corner-glow" />

          {project.cover && (
            <div className="project-card__cover">
              <motion.img
                src={project.cover}
                alt={project.title}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: project.coverPosition || 'center' }}
                variants={{ hover: { scale: 1.04 } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )}

          <div className="project-card__top">
            <div className="project-card__top-left">
              <span className="project-card__num">{num}</span>
            </div>
            <motion.div variants={{ hover: { opacity: 1, x: 0 } }} initial={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }} className="project-card__year">
              <span>{project.year}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </motion.div>
          </div>

          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__desc">{project.desc}</p>

          {project.metric && (
            <div className="project-card__metric">
              <span className="project-card__metric-value">{project.metric.value}</span>
              <span className="project-card__metric-label">{project.metric.label}</span>
            </div>
          )}

          <div className="project-card__tags">
            {project.tags?.map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          <div className="project-card__cta">
            <motion.span variants={{ hover: { color: accent } }} initial={{ color: 'var(--text-3)' }} className="project-card__cta-text">
              {t('projects.viewCaseStudy')}
            </motion.span>
            <motion.svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" variants={{ hover: { x: 6, stroke: accent } }} initial={{ x: 0, stroke: 'var(--text-3)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function Projects() {
  const { t } = useTranslation()
  const translatedItems = t('projects.items', { returnObjects: true })

  return (
    <section id="work" className="section">
      <motion.div
        className="projects__header"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="kicker">
            <motion.span
              className="kicker__line"
              style={{ display: 'inline-block' }}
              initial={{ width: 0 }}
              whileInView={{ width: 20 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            />
            {t('projects.kicker')}
          </p>
          <h2 className="h-display projects__title">{t('projects.heading')}</h2>
        </div>
        <span className="projects__count">{PROJECTS.length} {t('projects.countLabel')}</span>
      </motion.div>

      <motion.div
        className="project-grid"
        variants={gridVariants}
        initial="show"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
      >
        {PROJECTS.map((p, i) => {
          // Statik görsel verisi ile JSON'dan gelen çeviri verisi burada birleşiyor:
          const tProject = translatedItems[i] || {}
          const mergedProject = { ...p, ...tProject }

          return (
            <div key={mergedProject.id} className={mergedProject.wide ? 'project-wide' : ''}>
              <ProjectCard project={mergedProject} index={i} />
            </div>
          )
        })}
      </motion.div>
    </section>
  )
}
