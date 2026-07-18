"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactFab } from "@/components/contact-fab";
import { StackMarquee } from "@/components/stack-marquee";
import { useI18n } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import type { getContentCollection } from "@/lib/content/loader";
import type { CollectionType } from "@/lib/content/types";

type ArticleSummary = Omit<Awaited<ReturnType<typeof getContentCollection>>[number], "content"> & {
  type: CollectionType;
};

interface HomeContentProps {
  latestArticles: ArticleSummary[];
  years: {
    misionYear: string;
  };
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function HomeContent({ latestArticles, years }: HomeContentProps) {
  const { t, locale } = useI18n();

  // Experience items by locale
  const expItems = {
    es: {
      formacion: [
        "Años en hostelería, gestión y atención al cliente — aprendí a leer negocios antes que a escribir código.",
        "Transición al software: autodidacta intensivo. Next.js, Supabase, Stripe, Docker.",
        "Primer proyecto freelance. Apertura del repositorio público. Decisión firme de trabajar en abierto.",
      ],
      stack: [
        "Next.js 16 App Router · TypeScript strict · React 19",
        "Supabase (Postgres + Auth + Storage + RLS)",
        "Stripe (Subscriptions + Connect Express)",
        "Tailwind CSS v4 · shadcn/ui · Radix UI",
        "Turborepo · Vercel · GitHub Actions",
        "Playwright · Vitest",
      ],
      herramientas: [
        "Claude Code y OpenCode — Mi apoyo en el desarrollo de código y producción de proyectos.",
        "Proton.me — Mail, VPN, Drive, IA... todo un ecosistema privado alojado en Suiza con cifrado de alta seguridad.",
        "Hostinger — Dominios cuando necesito control total y precio honesto.",
        "GitHub — Aquí encontrarás casi todos mis trabajos y proyectos de software, los cuales trato de tratar con la máxima profesionalidad sin pérdida de contenido original y soluciones creativas.",
      ],
    },
    en: {
      formacion: [
        "Years in hospitality, management and customer service — I learned to read businesses before writing code.",
        "Transition to software: intensive self-taught. Next.js, Supabase, Stripe, Docker.",
        "First freelance project. Opened public repository. Firm decision to work in the open.",
      ],
      stack: [
        "Next.js 16 App Router · TypeScript strict · React 19",
        "Supabase (Postgres + Auth + Storage + RLS)",
        "Stripe (Subscriptions + Connect Express)",
        "Tailwind CSS v4 · shadcn/ui · Radix UI",
        "Turborepo · Vercel · GitHub Actions",
        "Playwright · Vitest",
      ],
      herramientas: [
        "Claude Code and OpenCode — My coding and project production companions.",
        "Proton.me — Mail, VPN, Drive, AI... a complete private ecosystem hosted in Switzerland with high-security encryption.",
        "Hostinger — Domains when I need full control and honest pricing.",
        "GitHub — You'll find almost all my work and software projects here, which I strive to handle with maximum professionalism without losing original content and creative solutions.",
      ],
    },
  };

  type ExpKey = "formacion" | "stack" | "herramientas";

  const experienceSections: { key: ExpKey; categoryKey: string }[] = [
    { key: "formacion", categoryKey: "sections.expFormacion.category" },
    { key: "stack", categoryKey: "sections.expStack.category" },
    { key: "herramientas", categoryKey: "sections.expHerramientas.category" },
  ];

  const currentExpItems = locale === "en" ? expItems.en : expItems.es;

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="site-shell hero-section">
        <div className="cluster-center">
          <p className="hero-eyebrow">{t("hero.eyebrow")}</p>
        </div>
        <h1 className="hero-signature hero-signature--shimmer hero-animate">
          {t("hero.signature")}
        </h1>
        <p
          className="prose-lead"
          dangerouslySetInnerHTML={{
            __html: t("hero.lead").replace(
              "{link}",
              `<a href="https://alexendros.dev" target="_blank" rel="noopener noreferrer" class="brand-link">${t("hero.leadLink")}</a>`,
            ),
          }}
        />
        <p className="hero-tagline">{t("hero.tagline")}</p>
        <div className="cluster">
          <Button asChild>
            <a href={`mailto:${siteConfig.contact.email}`}>{t("hero.ctaContact")}</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#biografia">{t("hero.ctaAbout")}</a>
          </Button>
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      {/* ── (Auto)biografía ────────────────────────────────── */}
      <section
        id="biografia"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-biografia"
      >
        <div className="content-container stack-lg">
          <h2 id="h2-biografia" className="headline">
            {t("sections.biografia.title")}
          </h2>
          <div className="stack-md prose">
            <p>{t("sections.biografia.p1")}</p>
            <p
              dangerouslySetInnerHTML={{
                __html: t("sections.biografia.p2").replace(
                  "{link}",
                  `<a href="https://alexendros.dev" target="_blank" rel="noopener noreferrer" class="brand-link">${t("sections.biografia.p2Link")}</a>`,
                ),
              }}
            />
            <p>{t("sections.biografia.p3")}</p>
          </div>
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      {/* ── Misiones ──────────────────────────────────────── */}
      <section
        id="misiones"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-misiones"
      >
        <div className="content-container stack-lg">
          <div className="section-head">
            <h2 id="h2-misiones" className="headline">
              {t("sections.misiones.title")}
            </h2>
            <p className="section-desc">{t("sections.misiones.desc")}</p>
          </div>

          <div className="stack-xl-gap">
            <div className="mission-card">
              <div className="mission-card__header">
                <div className="min-w-0">
                  <h3 className="card-title">{t("sections.misionAlexendrosDev.title")}</h3>
                  <p className="card-subtitle">{years.misionYear}</p>
                </div>
                <Badge variant="default" className="shrink-0">
                  {t("sections.misionAlexendrosDev.status")}
                </Badge>
              </div>
              <p className="card-body">{t("sections.misionAlexendrosDev.description")}</p>
              <div className="cluster-sm">
                {["Next.js", "Supabase", "Prisma", "Stripe", "Turborepo"].map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <a
                href="https://alexendros.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="card-link brand-link"
              >
                alexendros.dev →
              </a>
            </div>
          </div>
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      {/* ── Experiencias ──────────────────────────────────── */}
      <section
        id="experiencias"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-experiencias"
      >
        <div className="content-container stack-xl">
          <div className="section-head">
            <h2 id="h2-experiencias" className="headline">
              {t("sections.experiencias.title")}
            </h2>
            <p className="section-desc">{t("sections.experiencias.desc")}</p>
          </div>

          {experienceSections.map(({ key, categoryKey }) => (
            <div key={key} className="exp-category">
              <h3 className="title">{t(categoryKey)}</h3>
              <ul className="exp-list">
                {(currentExpItems[key] ?? []).map((item: string, i: number) => (
                  <li key={i} className="exp-item">
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

      {/* ── Últimos ensayos ──────────────────────────────── */}
      <section
        id="publicaciones"
        className="site-shell section section-below-fold scroll-section"
        aria-labelledby="h2-publicaciones"
      >
        <div className="content-container stack-lg">
          <div className="section-head">
            <h2 id="h2-publicaciones" className="headline">
              {t("sections.publicaciones.title")}
            </h2>
            <p
              className="section-desc"
              dangerouslySetInnerHTML={{
                __html: t("sections.publicaciones.desc")
                  .replace(
                    "{espensarLink}",
                    `<a href="/espensar" class="brand-link">${t("sections.publicaciones.espensarLabel")}</a>`,
                  )
                  .replace(
                    "{esposibleLink}",
                    `<a href="/esposible" class="brand-link">${t("sections.publicaciones.esposibleLabel")}</a>`,
                  ),
              }}
            />
          </div>

          {latestArticles.length === 0 ? (
            <p className="empty-state">{t("sections.publicaciones.empty")}</p>
          ) : (
            <div className="stack-lg">
              {latestArticles.map((article) => (
                <article key={`${article.type}-${article.slug}`}>
                  <Link href={`/${article.type}/${article.slug}`} className="article-item">
                    <time dateTime={article.frontmatter.date} className="ds-caption">
                      {formatDate(article.frontmatter.date, locale)}
                    </time>
                    <h3 className="article-item__title">{article.frontmatter.title}</h3>
                    {article.frontmatter.description && (
                      <p className="article-item__desc">{article.frontmatter.description}</p>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <hr className="site-shell shrink-0 bg-border h-px w-full border-0" />

      {/* ── StackMarquee ───────────────────────────────────── */}
      <section aria-labelledby="h2-stack-marquee" className="marquee-section">
        <h2 id="h2-stack-marquee" className="site-shell headline marquee-heading">
          {t("sections.stackMarquee.title")}
        </h2>
        <p className="site-shell prose-lead marquee-desc">{t("sections.stackMarquee.desc")}</p>
        <StackMarquee />
      </section>

      <div className="fab-stack" role="region" aria-label={t("contact.fabLabel")}>
        <ContactFab />
      </div>
    </>
  );
}
