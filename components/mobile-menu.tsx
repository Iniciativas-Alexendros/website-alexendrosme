"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSearch } from "@/components/search-provider";

function scrollToAnchor(href: string) {
  if (!href.startsWith("#")) return;
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", href);
  }
}

export function MobileMenu({ activeHash }: { activeHash: string }) {
  const [open, setOpen] = useState(false);
  const { openSearch } = useSearch();
  const { t } = useI18n();
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-touch"
          className="mobile-only"
          aria-label={t("nav.menuLabel")}
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
              if (onHome) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Alexendros
          </Link>
          <ul className="sidebar-links" role="list">
            <li>
              <button
                type="button"
                className="sidebar-link w-full text-left"
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => openSearch(), 200);
                }}
              >
                <Search className="icn-sm mr-2" aria-hidden="true" />
                {t("search.trigger")}
              </button>
            </li>

            <li>
              {onHome ? (
                <a
                  href="#biografia"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    setTimeout(() => scrollToAnchor("#biografia"), 150);
                  }}
                  aria-current={activeHash === "#biografia" ? "page" : undefined}
                  className={`sidebar-link${activeHash === "#biografia" ? " sidebar-link--active" : ""}`}
                >
                  {t("nav.biografia")}
                </a>
              ) : (
                <Link href="/#biografia" onClick={() => setOpen(false)} className="sidebar-link">
                  {t("nav.biografia")}
                </Link>
              )}
            </li>
            <li>
              <Link href="/proyectos" onClick={() => setOpen(false)} className="sidebar-link">
                {t("nav.proyectos")}
              </Link>
            </li>
            <li>
              <Link href="/opinion" onClick={() => setOpen(false)} className="sidebar-link">
                {t("nav.opinion")}
              </Link>
            </li>
            <li>
              <Link href="/now" onClick={() => setOpen(false)} className="sidebar-link">
                {t("nav.now")}
              </Link>
            </li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
