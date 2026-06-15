import { siteConfig } from "./site";

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Alejandro Domingo Agustí",
  alternateName: "Alexendros",
  url: "https://alexendros.me",
  jobTitle: "Fullstack Developer",
  description:
    "Espacio personal y libre de dinero: pensamiento, soberanía digital y crítica tecnológica. Lo comercial vive en alexendros.dev.",
  knowsAbout: [
    "Soberanía digital",
    "Software libre",
    "Privacidad",
    "Filosofía política",
    "Pensamiento crítico",
    "Next.js",
    "TypeScript",
    "Supabase",
    "Stripe",
    "RGPD",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Valencia",
    addressCountry: "ES",
  },
  sameAs: [siteConfig.links.github, siteConfig.links.linkedin, siteConfig.links.twitter],
} as const;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Alexendros",
  url: "https://alexendros.me",
  description: siteConfig.description,
  author: { "@type": "Person", name: "Alejandro Domingo Agustí" },
  inLanguage: "es",
} as const;
