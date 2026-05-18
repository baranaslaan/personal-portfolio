export const PROJECTS = [
  {
    id: 1,
    accent: '#22C55E',
    wide: true,
    cover: '/projects/standardflow-cover.png',
    gallery: [
      // Marketing surfaces — landing → features → details
      { src: '/projects/standardflow-1.webp' },
      { src: '/projects/standardflow-2.webp' },
      { src: '/projects/standardflow-3.webp' },
      // Product entry — onboarding + auth
      { src: '/projects/standardflow-choose-started.webp' },
      { src: '/projects/standardflow-log-in.webp' },
      // Role-based signup flows
      { src: '/projects/standardflow-join-as-a-founder.webp' },
      { src: '/projects/standardflow-join-as-a-investor.webp' }
    ],
    links: { behance: 'https://www.behance.net/gallery/244575927/StandardFlow-Website-UI-Design' }
  },
  {
    id: 2,
    accent: '#818CF8',
    coverPosition: 'top center',
    cover: '/projects/accounting-1.webp',
    gallery: [
      { src: '/projects/accounting-1.webp' },
      { src: '/projects/accounting-2.webp' },
      { src: '/projects/accounting-3.webp' }
    ],
    links: { behance: 'https://www.behance.net/gallery/158785939/Accounting-Software-UI-Design' }
  },
  {
    id: 3,
    accent: '#F59E0B',
    cover: '/projects/pm-cover.png',
    gallery: [
      { src: '/projects/pm-1.webp' },
      { src: '/projects/pm-2.webp' }
    ],
    links: { behance: 'https://www.behance.net/gallery/193530253/Project-Management-App' }
  },
  {
    id: 4,
    accent: '#EC4899',
    cover: '/projects/pricing-cover.png',
    gallery: [
      { src: '/projects/pricing-1.webp' },
      { src: '/projects/pricing-2.webp' }
    ],
    links: { behance: 'https://www.behance.net/gallery/151169159/Pricing-Page-UI-Design' }
  },
  {
    id: 5,
    accent: '#06B6D4',
    cover: '/projects/routewise-cover.png',
    gallery: [
      { src: '/projects/routewise-1.png' },
      { src: '/projects/routewise-login.png' },
      { src: '/projects/routewise-register.png' },
      { src: '/projects/routewise-dashboard.png' },
      { src: '/projects/routewise-cars.png' },
      { src: '/projects/routewise-cars-map.png' },
      { src: '/projects/routewise-new-car.png' }
    ],
    links: { behance: 'https://www.behance.net/gallery/131648297/Routewise-UI-Design' }
  },
  {
    id: 6,
    accent: '#A78BFA',
    wide: true,
    cover: '/projects/logotype-cover.png',
    gallery: [
      { src: '/projects/logotype-1.webp' },
      { src: '/projects/logotype-2.webp' }
    ],
    links: { behance: 'https://www.behance.net/gallery/132034079/LogoType-Design' }
  }
];

export const SKILLS = {
  'Design Tools':   ['Figma', 'Framer', 'FigJam', 'Rive', 'Linear'],
  'UX Process':     ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
  'Design Systems': ['Design Tokens', 'Components', 'WCAG / A11y', 'Documentation'],
  'Hand-off':       ['Variables', 'Auto-layout', 'Code Connect', 'Storybook'],
  'Frontend':       ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind', 'Git'],
};

export const SOCIALS = [
  {
    name: 'Behance',
    href: 'https://www.behance.net/baaranaslan',
    d: 'M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/baran-aslan-5461721b7/',
    d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];
