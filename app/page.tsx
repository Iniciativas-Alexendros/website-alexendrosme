import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactFab } from "@/components/contact-fab";
import { StackMarquee } from "@/components/stack-marquee";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const misions = [
  {
    title: "alexendros.dev",
    status: "En construcción",
    statusVariant: "default" as const,
    year: "2024–",
    stack: ["Next.js", "Supabase", "Prisma", "Stripe", "Turborepo"],
    description:
      "Mi proyecto comercial, a propósito fuera de este espacio: lo que se cobra y se vende vive allí, no en el .me.",
    url: "https://alexendros.dev",
  },
];

const experiencias = [
  {
    category: "Formación de base",
    items: [
      "Años en hostelería, gestión y atención al cliente — aprendí a leer negocios antes que a escribir código.",
      "Transición al software: autodidacta intensivo. Next.js, Supabase, Stripe, Docker.",
      "Primer proyecto freelance. Apertura del repositorio público. Decisión firme de trabajar en abierto.",
    ],
  },
  {
    category: "Stack actual",
    items: [
      "Next.js 16 App Router · TypeScript strict · React 19",
      "Supabase (Postgres + Auth + Storage + RLS)",
      "Stripe (Subscriptions + Connect Express)",
      "Tailwind CSS v4 · shadcn/ui · Radix UI",
      "Turborepo · Vercel · GitHub Actions",
      "Playwright · Vitest",
    ],
  },
  {
    category: "Herramientas de mi día a día",
    items: [
      "Claude Code y OpenCode — Mi apoyo en el desarrollo de código y producción de proyectos.",
      "Proton.me — Mail, VPN, Drive, IA... todo un ecosistema privado alojado en Suiza con cifrado de alta seguridad.",
      "Hostinger — Dominios cuando necesito control total y precio honesto.",
      "GitHub — Aquí encontrarás casi todos mis trabajos y proyectos de software, los cuales trato de tratar con la máxima profesionalidad sin pérdida de contenido original y soluciones creativas.",
    ],
  },
];

export default function Home() {
  return (
    <>
      <section className="site-shell hero-section">
        <div className="cluster-center">
          <p className="hero-eyebrow">Valencia · pensamiento, soberanía digital y libertades</p>
        </div>
        <h1 className="hero-signature hero-signature--shimmer hero-animate">
          Grandes soluciones de un ingenio no previsto.
        </h1>
        <p className="prose-lead">
          Espacio personal y libre de dinero: humanismo, soberanía digital y crítica tecnológica. Lo
          que se vende vive en{" "}
          <a
            href="https://alexendros.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="brand-link"
          >
            alexendros.dev
          </a>
          ; aquí solo se piensa, se escribe y se comparte.
        </p>
        <p className="hero-tagline">Ánimo de todo tipo. Lucro ni idea de quién es.</p>
        <div className="cluster">
          <Button asChild>
            <a href={`mailto:${siteConfig.contact.email}`}>Convócame</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#biografia">Conóceme</a>
          </Button>
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      <section
        id="biografia"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-biografia"
      >
        <div className="content-container stack-lg">
          <h2 id="h2-biografia" className="headline">
            (Auto)biografía
          </h2>

          <div className="stack-md">
            <p className="empty-state">Autobiografía en construcción.</p>
          </div>
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      <section
        id="misiones"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-misiones"
      >
        <div className="content-container stack-lg">
          <div className="section-head">
            <h2 id="h2-misiones" className="headline">
              Misiones
            </h2>
            <p className="section-desc">
              Compromisos reales. Público cuando hay algo operativo, no antes.
            </p>
          </div>

          <div className="stack-xl-gap">
            {misions.map((m) => (
              <div key={m.title} className="mission-card">
                <div className="mission-card__header">
                  <div className="min-w-0">
                    <h3 className="card-title">{m.title}</h3>
                    <p className="card-subtitle">{m.year}</p>
                  </div>
                  <Badge variant={m.statusVariant} className="shrink-0">
                    {m.status}
                  </Badge>
                </div>
                <p className="card-body">{m.description}</p>
                {m.stack.length > 0 && (
                  <div className="cluster-sm">
                    {m.stack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-link brand-link"
                  >
                    {m.url.replace(/^https?:\/\//, "")} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      <section
        id="experiencias"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-experiencias"
      >
        <div className="content-container stack-xl">
          <div className="section-head">
            <h2 id="h2-experiencias" className="headline">
              Experiencias
            </h2>
            <p className="section-desc">
              Lo extra-laboral que me ha formado, el stack que uso y los aliados que recomiendo.
            </p>
          </div>

          {experiencias.map((exp) => (
            <div key={exp.category} className="exp-category">
              <h3 className="title">{exp.category}</h3>
              <ul className="exp-list">
                {exp.items.map((item) => (
                  <li key={item} className="exp-item">
                    <span className="exp-arrow" aria-hidden="true">
                      ›
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      <section aria-labelledby="h2-stack-marquee" className="marquee-section">
        <h2 id="h2-stack-marquee" className="site-shell headline marquee-heading">
          Mis tecnologías favoritas
        </h2>
        <p className="site-shell prose-lead marquee-desc">
          El stack con el que construyo, en movimiento.
        </p>
        <StackMarquee />
      </section>

      <div className="fab-stack" role="region" aria-label="Acciones de contacto">
        <ContactFab />
      </div>
    </>
  );
}
