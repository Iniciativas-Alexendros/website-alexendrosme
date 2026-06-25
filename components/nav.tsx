"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { siteConfig } from "@/lib/site";
import { useScrollSpy } from "@/lib/hooks/useScrollSpy";

const MobileMenu = dynamic(
  () => import("@/components/mobile-menu").then((m) => m.MobileMenu),
  { ssr: false },
);

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
  const activeHash = useScrollSpy(siteConfig.nav.map((item) => item.href.replace("#", "")));

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

  return (
    <header ref={headerRef} className="site-nav">
      <nav className="site-shell site-nav__inner" aria-label="Navegación principal">
        <Link
          href="/"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.history.replaceState(null, "", "/");
          }}
          className="nav-logo"
          aria-label="Alexendros — volver al inicio"
        >
          Alexendros
        </Link>

        <ul className="site-nav__links" role="list">
          {siteConfig.nav.map((item) => {
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
        </ul>

        <MobileMenu activeHash={activeHash} />
      </nav>
    </header>
  );
}
