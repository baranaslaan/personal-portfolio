import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * AnnotatedImage — inline trigger card that opens a fullscreen walkthrough modal.
 *
 * Inline:  thumbnail + intro + "Open walkthrough →"
 * Modal:   large image with hotspots + side panel (desktop) / bottom sheet (mobile)
 *
 * Keyboard inside modal:
 *   - Esc           → close
 *   - ArrowRight    → next hotspot
 *   - ArrowLeft     → previous hotspot
 *   - Tab           → focus hotspots, Enter/Space activates
 *
 * hotspots: [{ x, y, title, body }] — x,y are 0–100 percentages
 */
export default function AnnotatedImage({ src, alt, hotspots = [], labels, intro, thumbnail }) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const containerRef = useRef(null)

  const goPrev = useCallback(() => setActiveIdx(i => (i - 1 + hotspots.length) % hotspots.length), [hotspots.length])
  const goNext = useCallback(() => setActiveIdx(i => (i + 1) % hotspots.length), [hotspots.length])

  const openModal = () => { setActiveIdx(0); setOpen(true) }
  const closeModal = () => setOpen(false)

  // Body scroll lock + keyboard shortcuts while modal is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape')        { e.preventDefault(); closeModal() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, goNext, goPrev])

  if (!hotspots.length) return null
  const active = hotspots[activeIdx]

  return (
    <>
      <button
        type="button"
        className="annotated-trigger"
        onClick={openModal}
        aria-label={labels?.openWalkthrough || 'Open walkthrough'}
      >
        <span className="annotated-trigger__thumb">
          <img src={thumbnail || src} alt="" loading="lazy" decoding="async" aria-hidden="true" />
          <span className="annotated-trigger__count">{hotspots.length}</span>
        </span>
        <span className="annotated-trigger__body">
          <span className="annotated-trigger__title">{labels?.openWalkthrough || 'Walk through the design decisions'}</span>
          {intro && <span className="annotated-trigger__intro">{intro}</span>}
        </span>
        <span className="annotated-trigger__arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="annotated-modal"
          role="dialog"
          aria-modal="true"
          aria-label={labels?.openWalkthrough || 'Design walkthrough'}
          onClick={closeModal}
        >
          <div className="annotated-modal__inner" onClick={(e) => e.stopPropagation()} ref={containerRef}>
            <button
              type="button"
              className="annotated-modal__close"
              onClick={closeModal}
              aria-label={labels?.close || 'Close (Esc)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18"/>
                <line x1="18" y1="6" x2="6" y2="18"/>
              </svg>
            </button>
            <div className="annotated-modal__stage">
              <div className="annotated-modal__frame">
                <img src={src} alt={alt} className="annotated-modal__image" />
                <div className="annotated-modal__overlay">
                  {hotspots.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`annotated__hotspot${i === activeIdx ? ' is-active' : ''}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`${labels?.hotspot || 'Marker'} ${i + 1}: ${h.title}`}
                    aria-pressed={i === activeIdx}
                  >
                    <span className="annotated__hotspot-dot" />
                    <span className="annotated__hotspot-num">{i + 1}</span>
                  </button>
                ))}
                </div>
              </div>
            </div>

            <div className="annotated-modal__panel">
              <div className="annotated__panel-meta">
                <span className="annotated__panel-counter">{String(activeIdx + 1).padStart(2, '0')} / {String(hotspots.length).padStart(2, '0')}</span>
                <span className="annotated__panel-kicker">{labels?.kicker || 'Design rationale'}</span>
              </div>

              <div key={activeIdx} className="annotated__panel-body annotated__panel-body--enter">
                <h4 className="annotated__panel-title">{active.title}</h4>
                <p className="annotated__panel-text">{active.body}</p>
              </div>

              <div className="annotated__panel-nav">
                <button type="button" onClick={goPrev} className="annotated__nav-btn" aria-label={labels?.prev || 'Previous'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button type="button" onClick={goNext} className="annotated__nav-btn" aria-label={labels?.next || 'Next'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
