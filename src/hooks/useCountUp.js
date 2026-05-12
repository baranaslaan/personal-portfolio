import { useEffect, useState } from 'react'

/**
 * Smoothly counts from 0 → target int when `enabled` becomes true.
 * `target` may end with "+" (e.g., "4+"); the suffix is preserved.
 * Respects prefers-reduced-motion by jumping straight to final value.
 */
export function useCountUp(target, enabled, duration = 1200) {
  const targetStr = String(target)
  const suffix = targetStr.endsWith('+') ? '+' : ''
  const num = parseInt(targetStr, 10) || 0
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') { setValue(num); return }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || num === 0) { setValue(num); return }

    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setValue(Math.round(eased * num))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [num, enabled, duration])

  return `${value}${suffix}`
}
