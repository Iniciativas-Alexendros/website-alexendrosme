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
import { SearchDialog } from "@/components/search-dialog";

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

export function Nav() {
  const headerRef = useRef<HTMLElement | null>(null);
  const { t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const activeHash = useScrollSpy(siteConfig.nav.map((item) => item.href.replace("#", "")));
  const onNowPage = pathname === "/now";

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

  const navItems = [
    { label: t("nav.biografia"), href: "#biografia" },
    { label: t("nav.misiones"), href: "#misiones" },
    { label: t("nav.experiencias"), href: "#experiencias" },
  ];

  return (
    <header ref={headerRef} className="site-nav">
      <nav className="site-shell site-nav__inner" aria-label={t("nav.navLabel")}>
        <Link
          href="/"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.history.replaceState(null, "", "/");
          }}
          className="nav-logo"
          aria-label={t("nav.logoLabel")}
        >
          Alexendros
        </Link>

        <ul className="site-nav__links" role="list">
          {navItems.map((item) => {
            const isActive = activeHash === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToAnchor(item.href);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`site-nav__link${isActive ? " site-nav__link--active" : ""}`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
          <li>
            <Link
              href="/now"
              className={onNowPage ? "site-nav__link site-nav__link--active" : "site-nav__link"}
              aria-current={onNowPage ? "page" : undefined}
            >
              {t("nav.now")}
            </Link>
          </li>
        </ul>

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="desktop-only site-nav__link"
          aria-label={t("search.triggerAria")}
        >
          <Search className="icn-sm" aria-hidden="true" />
          <span className="text-xs text-muted-foreground ml-1 font-mono">⌘K</span>
        </button>

        {/* Products link - solo desktop */}
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

        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </nav>
    </header>
  );
}
