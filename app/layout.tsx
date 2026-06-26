import localFont from "next/font/local";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Atmosphere } from "@/components/atmosphere";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site";

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

// Vergina Imperial v0.2.2 · Inter weight 700/800 para hero h1.display.
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
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-mode="dark"
      data-accent="gold"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${interDisplay.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.trustedTypes && trustedTypes.createPolicy) {
                trustedTypes.createPolicy("json-ld", {
                  createHTML: (s) => s,
                  createScript: (s) => s,
                  createScriptURL: (s) => s,
                });
              }
            `,
          }}
        />
      </head>
      <body className="body-layout">
        <a href="#main" className="skip-link">
          Saltar al contenido
        </a>
        <JsonLd />
        <Atmosphere />
        <ParticleBg />
        <Nav />
        <main id="main" className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
