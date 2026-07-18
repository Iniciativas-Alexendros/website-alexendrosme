"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { SearchDialog } from "@/components/search-dialog";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useI18n();

  const navItems = [
    { label: t("nav.biografia"), href: "#biografia" },
    { label: t("nav.misiones"), href: "#misiones" },
    { label: t("nav.experiencias"), href: "#experiencias" },
  ];

  return (
    <>
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
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Alexendros
            </Link>
            <ul className="sidebar-links" role="list">
              {/* Search item */}
              <li>
                <button
                  type="button"
                  className="sidebar-link w-full text-left"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => setSearchOpen(true), 200);
                  }}
                >
                  <Search className="icn-sm mr-2" aria-hidden="true" />
                  {t("search.trigger")}
                </button>
              </li>

              {navItems.map((item) => (
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
              <li>
                <Link href="/now" onClick={() => setOpen(false)} className="sidebar-link">
                  {t("nav.now")}
                </Link>
              </li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
