"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { useScrollSpy } from "@/lib/hooks/useScrollSpy";

function scrollToAnchor(href: string) {
  if (!href.startsWith("#")) return;
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", href);
  }
}

export function Nav() {
  const [open, setOpen] = useState(false);
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

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-touch"
              className="mobile-only"
              aria-label="Abrir menú"
            >
              {open ? (
                <X className="icn-md" aria-hidden="true" />
              ) : (
                <Menu className="icn-md" aria-hidden="true" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sheet-panel">
            <div className="sheet-body">
              <Link
                href="/"
                className="sheet-logo"
                onClick={() => {
                  setOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Alexendros
              </Link>
              <ul className="sidebar-links" role="list">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        setTimeout(() => scrollToAnchor(item.href), 150);
                      }}
                      aria-current={activeHash === item.href ? "page" : undefined}
                      className={`sidebar-link${activeHash === item.href ? " sidebar-link--active" : ""}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
