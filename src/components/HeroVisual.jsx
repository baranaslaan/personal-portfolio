import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Hero visual — avatar portrait.
 * Loads /avatar.jpg from public folder. If missing or fails, renders a styled
 * initials placeholder. Surrounded by a soft halo, dashed orbit ring, and a
 * single accent satellite dot — designer-y framing without literal mockups.
 *
 * To set the real avatar: drop a square photo at /public/avatar.jpg
 * (or .png — update AVATAR_SRC accordingly).
 */
const AVATAR_SRC = '/avatar-baran.png'

export default function HeroVisual() {
  const reduced = useReducedMotion()
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="hero-portrait" aria-hidden="true">
      {/* outer halo */}
      <div className="hero-portrait__halo" />

      {/* dashed orbit ring */}
      <div className="hero-portrait__ring" />

      {/* avatar disc */}
      <motion.div
        className="hero-portrait__avatar"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <motion.div
          className="hero-portrait__avatar-inner"
          animate={reduced ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {!imgFailed ? (
            <img
              src={AVATAR_SRC}
              alt="Avatar"
              className="hero-portrait__img"
              onError={() => setImgFailed(true)}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="hero-portrait__placeholder">
              {/* Burası hata durumunda görünecek yedek resim */}
              <img 
                src={AVATAR_SRC} 
                className="hero-portrait__img" 
                alt="Fallback" 
              />
            </div>
          )}
        </motion.div>

        {/* subtle inner rim */}
        <span className="hero-portrait__rim" />
      </motion.div>
    </div>
  );
}