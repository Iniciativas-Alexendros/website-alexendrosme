export const siteConfig = {
  name: "Alexendros",
  fullName: "Alejandro Domingo Agustí",
  title: "Alejandro Agustí — pensamiento, soberanía digital y software",
  description:
    "Espacio personal y libre de dinero de Alejandro Domingo Agustí: pensamiento, soberanía digital y crítica tecnológica. Valencia. Lo comercial vive en alexendros.pro.",
  url: "https://alexendros.me",
  email: "contacto@alexendros.me",
  location: "Valencia, España",
  links: {
    pro: "https://alexendros.pro",
    github: "https://github.com/alexendros",
    linkedin: "https://linkedin.com/in/alexendros",
    twitter: "https://x.com/alexendros",
  },
  nav: [
    { label: "(Auto)biografía", href: "#biografia" },
    { label: "Misiones", href: "#misiones" },
    { label: "Experiencias", href: "#experiencias" },
  ],
  legalNav: [
    { label: "Aviso legal", href: "/legal/aviso-legal" },
    { label: "Privacidad", href: "/legal/privacidad" },
    { label: "Cookies", href: "/legal/cookies" },
  ],
  contact: {
    email: "contacto@alexendros.me",
    telegram: { handle: "@alexendros", status: "preparacion" as const },
    matrix: { handle: "@alexendros:matrix.org", status: "proximamente" as const },
  },
} as const;
