import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import IntroOverlay from './components/IntroOverlay'
import HireModal from './components/HireModal'
import Home from './pages/Home'
import About from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import Lab from './pages/Lab'
import CursorSymphony from './pages/lab/CursorSymphony'
import TokenForge from './pages/lab/TokenForge'
import DriftPhysics from './pages/lab/DriftPhysics'
import ScrollCinema from './pages/lab/ScrollCinema'
import SystemCreator from './pages/lab/SystemCreator'
import TypeSymphony from './pages/lab/TypeSymphony'
import Logo from './assets/aslan.svg'
import { Analytics } from '@vercel/analytics/react'

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
      </AnimatePresence>
      <Footer />
      <HireModal open={hireOpen} onClose={() => setHireOpen(false)} />
      <Analytics />
    </>
  )
}
