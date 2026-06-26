"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-touch" className="mobile-only" aria-label="Abrir menú">
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
  );
}
