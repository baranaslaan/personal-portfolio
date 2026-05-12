import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ZOOM_MIN = 0.5
const ZOOM_MAX = 6
const ZOOM_STEP = 1.25

/**
 * Image lightbox with pan + zoom.
 *
 * Controls:
 *   - Wheel  → zoom toward cursor
 *   - Drag   → pan when zoom > 1
 *   - Toolbar buttons: zoom in/out, reset (1×), close
 *   - Keys: + / − / = (zoom), 0 (reset), Esc (close)
 *   - Click on backdrop or close button → dismiss
 */
export default function Lightbox({ frame, onClose }) {
  const stageRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragStart = useRef(null)

  // reset transform every time a new frame is opened
  useEffect(() => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }, [frame])

  const reset = () => { setScale(1); setPan({ x: 0, y: 0 }) }
  const zoomIn  = () => setScale(s => Math.min(s * ZOOM_STEP, ZOOM_MAX))
  const zoomOut = () => setScale(s => {
    const next = Math.max(s / ZOOM_STEP, ZOOM_MIN)
    if (next <= 1) setPan({ x: 0, y: 0 })
    return next
  })

  // wheel zoom around cursor
  const onWheel = (e) => {
    if (!frame) return
    e.preventDefault()
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left - rect.width / 2
    const mouseY = e.clientY - rect.top - rect.height / 2

    const factor = e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP
    const next = Math.min(Math.max(scale * factor ** Math.min(Math.abs(e.deltaY) / 100, 1), ZOOM_MIN), ZOOM_MAX)
    if (next === scale) return
    const ratio = next / scale
    setScale(next)
    setPan(p => ({
      x: mouseX - (mouseX - p.x) * ratio,
      y: mouseY - (mouseY - p.y) * ratio,
    }))
  }

  // drag-to-pan
  const onMouseDown = (e) => {
    if (scale <= 1) return
    e.preventDefault()
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  useEffect(() => {
    if (!frame) return
    const onMove = (e) => {
      if (!dragStart.current) return
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panY + (e.clientY - dragStart.current.y),
      })
    }
    const onUp = () => { dragStart.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [frame])

  // keyboard shortcuts
  useEffect(() => {
    if (!frame) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn() }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomOut() }
      else if (e.key === '0') { e.preventDefault(); reset() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [frame, onClose])

  // body scroll lock while open
  useEffect(() => {
    if (!frame) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [frame])

  const isDragging = dragStart.current !== null
  const canDrag = scale > 1
  const cursor = canDrag ? (isDragging ? 'grabbing' : 'grab') : 'default'

  return (
    <AnimatePresence>
      {frame && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={frame.caption || 'Project image'}
        >
          <div
            ref={stageRef}
            className="lightbox__stage"
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor }}
          >
            <img
              src={frame.src}
              alt={frame.caption || ''}
              draggable={false}
              className="lightbox__img"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform .2s cubic-bezier(.22,1,.36,1)',
              }}
              onLoad={(e) => { /* fit naturally on load */ }}
            />
          </div>

          {frame.caption && (
            <div className="lightbox__caption" onClick={(e) => e.stopPropagation()}>
              {frame.caption}
            </div>
          )}

          <div className="lightbox__toolbar" onClick={(e) => e.stopPropagation()}>
            <button
              type="button" className="lightbox__btn"
              onClick={zoomOut} aria-label="Zoom out (−)" title="Zoom out (−)"
              disabled={scale <= ZOOM_MIN}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="7.5" y1="11" x2="14.5" y2="11" />
                <line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
            </button>

            <span className="lightbox__scale">{Math.round(scale * 100)}%</span>

            <button
              type="button" className="lightbox__btn"
              onClick={zoomIn} aria-label="Zoom in (+)" title="Zoom in (+)"
              disabled={scale >= ZOOM_MAX}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="7.5" y1="11" x2="14.5" y2="11" />
                <line x1="11" y1="7.5" x2="11" y2="14.5" />
                <line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
            </button>

            <span className="lightbox__divider" />

            <button
              type="button" className="lightbox__btn"
              onClick={reset} aria-label="Reset (0)" title="Reset (0)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <polyline points="3 4 3 10 9 10" />
              </svg>
            </button>

            <span className="lightbox__divider" />

            <button
              type="button" className="lightbox__btn lightbox__btn--close"
              onClick={onClose} aria-label="Close (Esc)" title="Close (Esc)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
