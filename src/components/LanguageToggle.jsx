import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Artık useTheme hook'u yerine doğrudan Navbar'dan gelen 'theme' prop'unu kullanıyoruz
export default function LanguageToggle({ theme }) {
  const { i18n } = useTranslation();
  
  // ThemeToggle ile birebir aynı sorgu!
  const isLight = theme === 'light';
  
  const currentLang = i18n.language || 'en';
  const targetLang = currentLang.startsWith('tr') ? 'en' : 'tr';

  return (
    <motion.button
      type="button"
      onClick={() => i18n.changeLanguage(targetLang)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="theme-toggle"
      // Gönderdiğin çalışan ThemeToggle kodundan BİREBİR kopyalanan style objesi:
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
        // Sadece yazı fontu ve boyutu için ekstra 2 satır:
        fontSize: '11px',
        fontWeight: '800'
      }}
      aria-label={isLight ? 'Switch to TR' : 'Switch to EN'}
      title={isLight ? 'Switch to TR' : 'Switch to EN'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentLang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ textTransform: 'uppercase' }}
        >
          {targetLang}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}