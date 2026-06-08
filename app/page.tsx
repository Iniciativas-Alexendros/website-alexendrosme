import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContactFab } from "@/components/contact-fab";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const misions = [
  {
    title: "alexendros.pro",
    status: "En construcción",
    statusVariant: "default" as const,
    year: "2024–",
    stack: ["Next.js", "Supabase", "Prisma", "Stripe", "Turborepo"],
    description:
      "Mi proyecto comercial, a propósito fuera de este espacio: lo que se cobra y se vende vive allí, no en el .me.",
    url: "https://alexendros.pro",
  },
  {
    title: "alexendros.me",
    status: "Rebuild activo",
    statusVariant: "secondary" as const,
    year: "2025–",
    stack: ["Next.js", "Tailwind v4", "Vergina v0.2.2"],
    description:
      "Este sitio. Espacio personal y libre de dinero: pensamiento, soberanía digital y crítica tecnológica. Criterio en abierto.",
    url: null,
  },
  {
    title: "LexKit · GestKit",
    status: "Roadmap",
    statusVariant: "secondary" as const,
    year: "2026",
    stack: [],
    description:
      "Verticales (despachos jurídicos, gestorías) del roadmap comercial. Viven en alexendros.pro, no aquí.",
    url: null,
  },
];

const experiencias = [
  {
    category: "Formación de base",
    items: [
      "Años en hostelería, gestión y atención al cliente — aprendí a leer negocios antes que a escribir código.",
      "Transición al software: autodidacta intensivo. Next.js, Supabase, Stripe, Docker, n8n.",
      "Primer proyecto freelance. Apertura del repositorio público. Decisión firme de trabajar en abierto.",
    ],
  },
  {
    category: "Stack actual",
    items: [
      "Next.js 15 App Router · TypeScript strict · React 19",
      "Supabase (Postgres + Auth + Storage + RLS)",
      "Stripe (Subscriptions + Connect Express)",
      "Tailwind CSS v4 · shadcn/ui · Radix UI",
      "Turborepo · Vercel · GitHub Actions",
      "n8n self-hosted · Sentry · Playwright · Vitest",
    ],
  },
  {
    category: "Herramientas aliadas",
    items: [
      "Claude AI — par de desarrollo. Lo uso a diario desde el terminal y VS Code.",
      "Proton — mail, VPN y Drive cifrados. Alternativa real a Google fuera del circuito publicitario.",
      "Hostinger — VPS y dominios cuando necesito control total y precio honesto.",
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="site-shell hero-section">
        <div className="flex flex-wrap items-center gap-3">
          <p className="hero-eyebrow">Valencia · pensamiento, soberanía digital y libertades</p>
        </div>
        <h1 className="hero-signature">Grandes soluciones de un ingenio no previsto.</h1>
        <p className="prose-lead">
          Espacio personal y libre de dinero: humanismo, soberanía digital y crítica tecnológica. Lo
          que se vende vive en{" "}
          <a
            href="https://alexendros.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
          >
            alexendros.pro
          </a>
          ; aquí solo se piensa, se escribe y se comparte.
        </p>
        <p className="text-sm text-muted-foreground italic">
          Ánimo de todo tipo. Lucro ni idea de quién es.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={`mailto:${siteConfig.contact.email}`}>Convócame</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#biografia">Conóceme</a>
          </Button>
        </div>
      </section>

      <Separator className="site-shell" />

      {/* ──────────────────────── BIOGRAFÍA ───────────────────────── */}
      <section
        id="biografia"
        className="site-shell section section-below-fold scroll-mt-16"
        aria-labelledby="h2-biografia"
      >
        <div className="max-w-3xl space-y-8">
          <h2 id="h2-biografia" className="headline">
            (Auto)biografía
          </h2>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="title">Acto I — Origen</h3>
              <p className="text-muted-foreground leading-relaxed">
                Años fuera del software —hostelería, gestión, atención al cliente— que me enseñaron
                a leer negocios antes que a escribir código. Traje de ahí dos cosas: criterio para
                distinguir lo que importa del ruido y paciencia para los detalles que nadie ve.
                Cuando por fin me senté a programar, ya tenía claro para qué.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="title">Acto II — Transición</h3>
              <p className="text-muted-foreground leading-relaxed">
                Salto al software a tiempo completo. Formación autodidacta intensiva en stack
                moderno: Next.js, Supabase, Stripe, Docker, n8n. Primeros proyectos freelance,
                apertura del repositorio público y decisión firme de trabajar en abierto.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="title">Acto III — Actualidad</h3>
              <p className="text-muted-foreground leading-relaxed">
                Operador de{" "}
                <a
                  href="https://alexendros.pro"
                  className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  alexendros.pro
                </a>
                . Monorepo multi-app en construcción y build in public documentado. Lo comercial
                vive en alexendros.pro; esto, alexendros.me, es un espacio personal y libre de
                dinero.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="site-shell" />

      {/* ──────────────────────── MISIONES ────────────────────────── */}
      <section
        id="misiones"
        className="site-shell section section-below-fold scroll-mt-16"
        aria-labelledby="h2-misiones"
      >
        <div className="max-w-3xl space-y-8">
          <div className="space-y-2">
            <h2 id="h2-misiones" className="headline">
              Misiones
            </h2>
            <p className="text-muted-foreground">
              Compromisos reales. Público cuando hay algo operativo, no antes.
            </p>
          </div>

          <div className="space-y-6">
            {misions.map((m) => (
              <div key={m.title} className="mission-card">
                <div className="mission-card__header">
                  <div className="min-w-0">
                    <h3 className="text-foreground font-semibold text-lg">{m.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.year}</p>
                  </div>
                  <Badge variant={m.statusVariant} className="shrink-0">
                    {m.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">{m.description}</p>
                {m.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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
                    className="inline-block text-sm text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
                  >
                    {m.url.replace(/^https?:\/\//, "")} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="site-shell" />

      {/* ─────────────────────── EXPERIENCIAS ─────────────────────── */}
      <section
        id="experiencias"
        className="site-shell section section-below-fold scroll-mt-16"
        aria-labelledby="h2-experiencias"
      >
        <div className="max-w-3xl space-y-10">
          <div className="space-y-2">
            <h2 id="h2-experiencias" className="headline">
              Experiencias
            </h2>
            <p className="text-muted-foreground">
              Lo extra-laboral que me ha formado, el stack que uso y los aliados que recomiendo.
            </p>
          </div>

          {experiencias.map((exp) => (
            <div key={exp.category} className="space-y-3">
              <h3 className="title">{exp.category}</h3>
              <ul className="space-y-2">
                {exp.items.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground leading-relaxed">
                    <span className="text-primary mt-1 shrink-0" aria-hidden="true">
                      ›
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <h3 className="title">Pruebas de trabajo</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/alexendros"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary text-sm"
                >
                  GitHub · alexendros →
                </a>
              </li>
              <li>
                <a
                  href="https://alexendros.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary text-sm"
                >
                  Producto en producción · alexendros.pro →
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FABs — always visible */}
      <div className="fab-stack" role="region" aria-label="Acciones de contacto">
        <ContactFab />
      </div>
    </>
  );
}
