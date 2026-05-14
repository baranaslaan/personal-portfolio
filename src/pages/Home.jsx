import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import Hero from '../components/Hero';
import Capabilities from '../components/Capabilities';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
// Reveal bileşenini import ediyoruz
import { Reveal } from '../components/Reveal';

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate(); 

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          navigate(location.pathname, { replace: true });
        }
      }, 150); 
    }
  }, [location, navigate]); 

  return (
    <>
      {/* Hero genellikle ilk açılışta göründüğü için biraz delay veriyoruz */}
      <Reveal delay={0.1}>
        <Hero />
      </Reveal>

      {/* Diğer bölümler scroll edildikçe Reveal içindeki mantıkla tetiklenecek */}
      <Reveal>
        <Capabilities />
      </Reveal>

      {/* Projects ve Contact kendi içlerinde whileInView yönetiyor; uzun bölüm
          olan Projects mobilde Reveal'ın amount eşiğine takılıp görünmez kalıyordu. */}
      <Projects />

      <Contact />
    </>
  );
}
