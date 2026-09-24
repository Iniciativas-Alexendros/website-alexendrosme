"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ExternalLink, Search } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useScrollSpy } from "@/lib/hooks/useScrollSpy";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useSearch } from "@/components/search-provider";

const MobileMenu = dynamic(() => import("@/components/mobile-menu").then((m) => m.MobileMenu), {
  ssr: false,
});

function scrollToAnchor(href: string) {
  if (!href.startsWith("#")) return;
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", href);
  }
}

function localePrefix(pathname: string): string {
  return pathname === "/en" || pathname.startsWith("/en/") ? "/en" : "";
}

export function Nav() {
  const headerRef = useRef<HTMLElement | null>(null);
  const { t } = useI18n();
  const { openSearch } = useSearch();
  const pathname = usePathname();
  const prefix = localePrefix(pathname);
  const [modKey, setModKey] = useState("Ctrl");

  const activeHash = useScrollSpy(siteConfig.nav.map((item) => item.href.replace("#", "")));
  const onHome = pathname === "/" || pathname === "/en";
  const stripped = prefix ? pathname.slice(prefix.length) || "/" : pathname;
  const onProyectos = stripped.startsWith("/proyectos");
  const onOpinion = stripped.startsWith("/opinion");

  useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    setModKey(mac ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => {
      header.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const homeHref = prefix || "/";

  return (
    <header ref={headerRef} className="site-nav">
      <nav className="site-shell site-nav__inner" aria-label={t("nav.navLabel")}>
        <Link
          href={homeHref}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (onHome) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.history.replaceState(null, "", homeHref);
            }
          }}
          className="nav-logo"
          aria-label={t("nav.logoLabel")}
        >
          Alexendros
        </Link>

        <ul className="site-nav__links" role="list">
          <li>
            {onHome ? (
              <a
                href="#biografia"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToAnchor("#biografia");
                }}
                aria-current={activeHash === "#biografia" ? "page" : undefined}
                className={`site-nav__link${activeHash === "#biografia" ? " site-nav__link--active" : ""}`}
              >
                {t("nav.biografia")}
              </a>
            ) : (
              <Link
                href={`${homeHref === "/" ? "" : homeHref}/#biografia`}
                className="site-nav__link"
              >
                {t("nav.biografia")}
              </Link>
            )}
          </li>
          <li>
            <Link
              href={`${prefix}/proyectos`}
              className={onProyectos ? "site-nav__link site-nav__link--active" : "site-nav__link"}
              aria-current={onProyectos ? "page" : undefined}
            >
              {t("nav.proyectos")}
            </Link>
          </li>
          <li>
            <Link
              href={`${prefix}/opinion`}
              className={onOpinion ? "site-nav__link site-nav__link--active" : "site-nav__link"}
              aria-current={onOpinion ? "page" : undefined}
            >
              {t("nav.opinion")}
            </Link>
          </li>
        </ul>

        <button
          type="button"
          onClick={openSearch}
          className="desktop-only site-nav__link"
          aria-label={t("search.triggerAria")}
        >
          <Search className="icn-sm" aria-hidden="true" />
          <span className="text-xs text-muted-foreground ml-1 font-mono">{modKey}+K</span>
        </button>

        <a
          href={siteConfig.links.dev}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("nav.productosLabel")}
          className="desktop-only site-nav__link site-nav__link--external"
        >
          {t("nav.productos")}
          <ExternalLink className="icn-sm" aria-hidden="true" />
        </a>

        <LocaleToggle />
        <ThemeToggle />

        <MobileMenu activeHash={activeHash} />
      </nav>
    </header>
  );
}
