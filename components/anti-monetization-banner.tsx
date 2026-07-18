"use client";

import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function AntiMonetizationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Leer localStorage ANTES de setMounted para evitar que el banner
    // se renderice brevemente entre setMounted(true) y setDismissed(true).
    const dismissedValue = localStorage.getItem("anti-monetization-dismissed");
    if (dismissedValue === "true") {
      setDismissed(true);
    }
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!mounted || dismissed) {
    return null;
  }

  const bannerClass = cn(
    "anti-monetization-banner",
    reduceMotion && "anti-monetization-banner--reduced-motion",
    isHovered && "anti-monetization-banner--hovered",
  );

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("anti-monetization-dismissed", "true");
  };

  const textWithStrong = t("antiMonetization.text").replace(
    "{strong}",
    `<strong>${t("antiMonetization.strong")}</strong>`,
  );

  return (
    <div
      className={bannerClass}
      role="status"
      aria-live="polite"
      data-reduced-motion={reduceMotion ? "true" : "false"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="anti-monetization-banner__content">
        <Shield className="anti-monetization-banner__icon" aria-hidden="true" />
        <p
          className="anti-monetization-banner__text"
          dangerouslySetInnerHTML={{ __html: textWithStrong }}
        />
        <a
          href="https://alexendros.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="anti-monetization-banner__link"
        >
          {t("antiMonetization.link")}
          <X className="anti-monetization-banner__link-icon" aria-hidden="true" size={14} />
        </a>
      </div>
      <button
        type="button"
        className="anti-monetization-banner__dismiss"
        onClick={handleDismiss}
        aria-label={t("antiMonetization.dismissLabel")}
      >
        <X className="anti-monetization-banner__dismiss-icon" aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
