"use client";

import { Mail, Send, Hash } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { siteConfig } from "@/lib/site";
import { buildMailto } from "@/lib/contact";

export function ContactFab() {
  const { contact } = siteConfig;

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <button type="button" className="fab-btn" aria-label="Abrir opciones de contacto">
          <Mail className="icn-sm" aria-hidden="true" />
          <span>Convócame</span>
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
          <span className="fab-item__label">
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
          <span className="fab-item__label">
            <span className="fab-item__name fab-item__name--disabled">Matrix / Element</span>
            <span className="fab-item__desc">{contact.matrix.handle} · próximamente</span>
          </span>
        </div>

        <div className="fab-divider" role="separator" />
        <p className="fab-section-label">Form formal → alexendros.dev</p>
      </PopoverContent>
    </PopoverRoot>
  );
}
