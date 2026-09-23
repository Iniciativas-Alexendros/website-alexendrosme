"use client";

import { Mail, Send, Hash } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { siteConfig } from "@/lib/site";
import { buildMailto } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";

export function ContactFab() {
  const { contact } = siteConfig;
  const { t } = useI18n();

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <button type="button" className="fab-btn" aria-label="Abrir opciones de contacto">
          <Mail className="icn-sm" aria-hidden="true" />
          <span>{t("hero.ctaContact")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end">
        <p className="fab-section-label">Contacto directo</p>

        <a href={buildMailto()} className="fab-item">
          <Mail className="icn-sm icn-primary" aria-hidden="true" />
          <span className="fab-item__label">
            <span className="fab-item__name">Email</span>
            <span className="fab-item__desc">{contact.email}</span>
          </span>
        </a>

        <div
          className="fab-item"
          role="button"
          aria-disabled="true"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Send className="icn-sm icn-disabled" aria-hidden="true" />
          <span className="fab-item__label" aria-hidden="true">
            <span className="fab-item__name fab-item__name--disabled">Telegram</span>
            <span className="fab-item__desc">{contact.telegram.handle} · en preparación</span>
          </span>
        </div>

        <div
          className="fab-item"
          role="button"
          aria-disabled="true"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Hash className="icn-sm icn-disabled" aria-hidden="true" />
          <span className="fab-item__label" aria-hidden="true">
            <span className="fab-item__name fab-item__name--disabled">Matrix</span>
            <span className="fab-item__desc">{contact.matrix.handle} · próximamente</span>
          </span>
        </div>

        <p className="fab-section-label">Form formal → alexendros.dev</p>
      </PopoverContent>
    </PopoverRoot>
  );
}
