import { useState, useEffect } from 'react'
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
  overflow: 'hidden',
  flexShrink: 0
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  // Prevent body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleScroll = (e, targetId) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
        className={`nav ${scrolled ? 'is-scrolled' : ''}`}
      >
        {/* SOL: Logo */}
        <div className="nav-left">
          <Link to="/" className="nav-brand" aria-label="Home" onClick={closeMenu}>
            <span className="nav-brand__name">aslanbaran.com</span>
          </Link>
        </div>

        {/* ORTA: Desktop linkler */}
        <div className="nav-menu">
          <Link to="/#work" className="nav-link" onClick={(e) => handleScroll(e, 'work')}>{t('nav.work')}</Link>
          <Link to="/about" className="nav-link" onClick={closeMenu}>{t('nav.about')}</Link>
          <Link to="/#contact" className="nav-link" onClick={(e) => handleScroll(e, 'contact')}>{t('nav.contact')}</Link>
        </div>

        {/* SAĞ: Aksiyonlar */}
        <div className="nav-actions">
          <div className="nav-actions__desktop">
            <ThemeToggle theme={theme} toggle={toggle} />
            <LanguageToggle theme={theme} />
          </div>

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

          {/* Hamburger butonu - sadece mobilde görünür */}
          <button
            type="button"
            className="nav-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className={`nav-burger__line ${menuOpen ? 'is-open-1' : ''}`} />
            <span className={`nav-burger__line ${menuOpen ? 'is-open-2' : ''}`} />
            <span className={`nav-burger__line ${menuOpen ? 'is-open-3' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile dropdown panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-mobile-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/#work" className="nav-mobile-link" onClick={(e) => handleScroll(e, 'work')}>{t('nav.work')}</Link>
            <Link to="/about" className="nav-mobile-link" onClick={closeMenu}>{t('nav.about')}</Link>
            <Link to="/#contact" className="nav-mobile-link" onClick={(e) => handleScroll(e, 'contact')}>{t('nav.contact')}</Link>

            <div className="nav-mobile-divider" />

            <div className="nav-mobile-toggles">
              <div className="nav-mobile-toggle-row">
                <span className="nav-mobile-toggle-label">{theme === 'light' ? t('nav.darkMode', { defaultValue: 'Dark mode' }) : t('nav.lightMode', { defaultValue: 'Light mode' })}</span>
                <ThemeToggle theme={theme} toggle={toggle} />
              </div>
              <div className="nav-mobile-toggle-row">
                <span className="nav-mobile-toggle-label">{t('nav.language', { defaultValue: 'Language' })}</span>
                <LanguageToggle theme={theme} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
