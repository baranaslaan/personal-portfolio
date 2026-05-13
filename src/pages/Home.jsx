import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import Hero from '../components/Hero';
import Capabilities from '../components/Capabilities';
import Projects from '../components/Projects';
import Contact from '../components/Contact';

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
      <Hero />
      <Capabilities />
      <Projects />
      <Contact />
    </>
  );
}
