import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';


function ThemeToggle({ theme, toggle }) {
  const isLight = theme === 'light'
  return (
    <motion.button
  type="button"
  onClick={toggle}
  whileTap={{ scale: 0.9, rotate: -20 }}
  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
  className="theme-toggle"
  style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '37px',
  height: '37px',
  padding: '0',
  cursor: 'pointer',
  background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)',
  border: isLight ? '1px solid rgba(0, 0, 0, 0.15)' : '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  color: 'inherit',
  position: 'relative',
  overflow: 'hidden'
}}
  aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
  title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'inline-flex' }}
        >
          {isLight ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

export default function Navbar({ scrolled, onHireClick }) {
  const { t } = useTranslation();
  
  const { theme, toggle } = useTheme();

  // Tek bir fonksiyonla hem Work hem Contact yönlendirmesini çözüyoruz
  const handleScroll = (e, targetId) => {
    // Sadece anasayfadaysak (/) sayfayı kaydır, aksi halde tarayıcının normal çalışmasına izin ver
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
      className={`nav ${scrolled ? 'is-scrolled' : ''}`}
    >
      {/* 1. SOL BÖLGE: Logo */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Link to="/" className="nav-brand" aria-label="Home">
          <span className="nav-brand__name">aslanbaran.com</span>
        </Link>
      </div>

      {/* 2. ORTA BÖLGE: Metin Linkleri */}
      <div className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/#work" className="nav-link">{t('nav.work')}</Link>
        <Link to="/about" className="nav-link">{t('nav.about')}</Link>
        <Link to="/#contact" className="nav-link">{t('nav.contact')}</Link>
      </div>

      {/* 3. SAĞ BÖLGE: Aksiyon Butonları (Toggles & Hire Me) */}
      <div className="nav-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
        <ThemeToggle theme={theme} toggle={toggle} />
        <LanguageToggle theme={theme} />
        
        <motion.button
          type="button"
          onClick={onHireClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="nav-hire"
        >
          <span className="nav-hire__dot" />
          {t('nav.hireMe')}
        </motion.button>
      </div>
    </motion.nav>
  );
}