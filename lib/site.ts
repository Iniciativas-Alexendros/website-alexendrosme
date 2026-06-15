export const siteConfig = {
  name: "Alexendros",
  fullName: "Alejandro, Domingo y Agustí",
  title: "Alexendros. Pensador, tecnólogo, investigador, amante. Yo me hice así.",
  description:
    "Espacio digital de humanismo y libertades creado por Alexendros: pensador, tecnólogo, investigador, estimulante. Procesando desde Valencia.",
  url: "https://alexendros.me",
  email: "contacto@alexendros.me",
  location: "Valencia, España",
  links: {
    dev: "https://alexendros.dev",
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
