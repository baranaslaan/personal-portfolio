import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import IntroOverlay from './components/IntroOverlay'
import HireModal from './components/HireModal'
import Home from './pages/Home'
import About from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import { Analytics } from '@vercel/analytics/react'

// Lab routes are opt-in — load them only when a visitor goes there.
const Lab = lazy(() => import('./pages/Lab'))
const CursorSymphony = lazy(() => import('./pages/lab/CursorSymphony'))
const TokenForge = lazy(() => import('./pages/lab/TokenForge'))
const DriftPhysics = lazy(() => import('./pages/lab/DriftPhysics'))
const ScrollCinema = lazy(() => import('./pages/lab/ScrollCinema'))
const SystemCreator = lazy(() => import('./pages/lab/SystemCreator'))
const TypeSymphony = lazy(() => import('./pages/lab/TypeSymphony'))

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [threshold])
  return scrolled
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })
  return <motion.div className="scroll-progress" style={{ scaleX }} />
}

export default function App() {
  const location = useLocation()
  const scrolled = useScrolled()
  const [hireOpen, setHireOpen] = useState(false)
  return (
    <>
      <IntroOverlay />
      <ScrollProgress />
      <Navbar scrolled={scrolled} onHireClick={() => setHireOpen(true)} />
      <AnimatePresence mode="wait">
        <Suspense fallback={<div style={{ minHeight: '60vh' }} aria-hidden="true" />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home onHireClick={() => setHireOpen(true)} />} />
            <Route path="/about" element={<About onHireClick={() => setHireOpen(true)} />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/lab/cursor-symphony" element={<CursorSymphony />} />
            <Route path="/lab/token-forge" element={<TokenForge />} />
            <Route path="/lab/drift-physics" element={<DriftPhysics />} />
            <Route path="/lab/scroll-cinema" element={<ScrollCinema />} />
            <Route path="/lab/system-creator" element={<SystemCreator />} />
            <Route path="/lab/type-symphony" element={<TypeSymphony />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
      <HireModal open={hireOpen} onClose={() => setHireOpen(false)} />
      <Analytics />
    </>
  )
}
