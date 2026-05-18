import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      className="footer"
    >
      <Link to="/" className="footer-brand" aria-label="Home">
        <span className="footer-brand__name">aslanbaran.com</span>
      </Link>

      <nav className="footer-links" aria-label="Footer">
      <Link to="/about" className="footer-link">{t('footer.about')}</Link>
      <Link to="/#work" className="footer-link">{t('footer.work')}</Link>
      <Link to="/lab" className="footer-link">{t('footer.lab', { defaultValue: 'Lab' })}</Link>
      <Link to="/#contact" className="footer-link">{t('footer.contact')}</Link>
      <a
          href="/baran-aslan-resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link footer-link--cv"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t('footer.cv')}
        </a>
      </nav>

      <span className="footer-copy">
        © {new Date().getFullYear()} · {t('footer.copyright')}
      </span>
    </motion.footer>
  )
}
