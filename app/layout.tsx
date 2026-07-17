import Script from "next/script";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Atmosphere } from "@/components/atmosphere";
import { JsonLd } from "@/components/json-ld";
import { ThemeProvider } from "@/components/theme-provider";
import { AntiMonetizationBanner } from "@/components/anti-monetization-banner";
import { siteConfig } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";

const ParticleBg = dynamic(() => import("@/components/particle-bg").then((m) => m.ParticleBg));

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

// Alexendros.me Design System v1 · Inter weight 700/800 para hero h1.display.
// Inter aprobado en otro hilo como reemplazo definitivo de la familia
// neogrotesque (Outfit/Bricolage/Manrope descatalogados). Geist sigue
// como sans body (doctrina alexendros.me CLAUDE.md §3).
const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [
      {
        url: "/og/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17130f",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-accent="gold"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${interDisplay.variable}`}
    >
      <head>
        {/* Critical above-the-fold CSS — paints nav + hero before stylesheet loads.
            Only ~2KB of layout, nav, hero, skip-link, and base typography.
            Below-fold sections use content-visibility: auto and load lazily. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{font-family:var(--font-sans);font-size:var(--text-base);line-height:1.5;letter-spacing:var(--tracking-body);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;margin:0;padding:0;font-feature-settings:"ss01","cv11","calt"}
html{color-scheme:dark light}
body{background:var(--ax-surface-0);color:var(--ax-text-primary)}
.skip-link{position:absolute;left:-9999px;top:auto;width:0;height:0;overflow:hidden}
.skip-link:focus,.skip-link:focus-visible{position:fixed;left:1rem;top:1rem;width:auto;height:auto;z-index:100;padding:.5rem 1rem;background:var(--primary);color:var(--primary-foreground);border-radius:var(--ax-radius-md)}
.site-shell{margin-inline:auto;width:100%;max-width:72rem;padding-inline:var(--ax-safe-inset)}
.site-nav{position:sticky;top:0;z-index:50;width:100%;height:3.5rem;border-bottom:1px solid var(--border);background:color-mix(in oklch, var(--background) 80%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
@media(min-width:40rem){.site-nav{height:4rem}}
.site-nav__inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:100%;max-width:48rem}
.site-nav__links{display:none;align-items:center;gap:.5rem}
@media(min-width:48rem){.site-nav__links{display:flex}}
.site-nav__link{position:relative;display:inline-flex;align-items:center;min-height:var(--ax-tap-target);padding:.5rem .75rem;border-radius:var(--ax-radius-md);font-size:var(--text-sm);font-weight:500;color:var(--muted-foreground);text-decoration:none}
.nav-logo{display:inline-flex;align-items:center;min-height:var(--ax-tap-target);font-family:var(--font-geist-sans,ui-sans-serif,system-ui,sans-serif);font-size:var(--text-lg);font-weight:700;letter-spacing:-.025em;color:var(--primary);text-decoration:none}
.hero-section{position:relative;padding-block:clamp(3rem,8vw,6rem);display:flex;flex-direction:column;gap:clamp(1rem,2vw,1.5rem);max-width:52rem}
.hero-signature{font-family:var(--font-sans);font-weight:700;font-size:var(--text-display);line-height:1.05;letter-spacing:-.02em;text-wrap:balance}
.body-layout{display:flex;min-height:100vh;flex-direction:column}
.main-content{flex:1;padding-bottom:7rem}
@media(min-width:48rem){.main-content{padding-bottom:0}}
.desktop-only{display:none}@media(min-width:48rem){.desktop-only{display:inline-flex;align-items:center;gap:.375rem}}
.mobile-only{display:block}@media(min-width:48rem){.mobile-only{display:none}}
.theme-toggle-trigger{min-height:var(--ax-tap-target,2.75rem);min-width:var(--ax-tap-target,2.75rem)}
h1.display,.hero h1{font-family:var(--font-display);font-weight:700;letter-spacing:-.025em;line-height:.98;text-wrap:balance;background:linear-gradient(180deg,var(--ax-text-primary) 0%,var(--ax-text-primary) 55%,color-mix(in oklch,var(--ax-text-primary) 78%,transparent) 80%,color-mix(in oklch,var(--ax-text-primary) 35%,transparent) 100%);background-clip:text;-webkit-background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
@keyframes hero-fade-in{from{opacity:0;transform:translateY(.75rem)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.hero-animate{animation:none;opacity:1;transform:none}}`,
          }}
        />
        <Script src="/theme.js" strategy="beforeInteractive" />
      </head>
      <body className="body-layout">
        <a href="#main" className="skip-link">
          Saltar al contenido
        </a>
        <ThemeProvider>
          <JsonLd />
          <Atmosphere />
          <ParticleBg />
          <AntiMonetizationBanner />
          <Nav />
          <main id="main" className="main-content">
            {children}
          </main>
          <Footer />
          {/* Vercel Web Analytics — privacy-first, no cookies. Activate in Vercel Dashboard → Analytics → Enable */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
