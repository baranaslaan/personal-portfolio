import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

const STORAGE_KEY = 'theme'

function getInitial() {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // Default to dark. Returning visitors keep their toggled choice via localStorage.
  return 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = (event) => {
    const next = theme === 'dark' ? 'light' : 'dark'

    const supportsVT  = typeof document !== 'undefined' && 'startViewTransition' in document
    const prefersLess = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    /* fallback: no API support or reduced motion → instant swap */
    if (!supportsVT || prefersLess) {
      setTheme(next)
      return
    }

    /* origin point for the circular reveal (toggle button center) */
    const target = event?.currentTarget?.getBoundingClientRect?.()
    const x = target ? target.left + target.width / 2 : event?.clientX ?? window.innerWidth / 2
    const y = target ? target.top + target.height / 2 : event?.clientY ?? window.innerHeight / 2

    /* furthest viewport corner → max reveal radius */
    const r = Math.hypot(
      Math.max(x, window.innerWidth  - x),
      Math.max(y, window.innerHeight - y),
    )

    const root = document.documentElement
    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    root.style.setProperty('--theme-r', `${r}px`)

    /* startViewTransition requires the DOM mutation to be synchronous
       within its callback — flushSync makes the React state update commit
       immediately so the transition snapshot captures the new theme. */
    document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })
  }

  return { theme, toggle }
}
