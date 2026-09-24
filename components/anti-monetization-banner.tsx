"use client";

import { useLayoutEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const DISMISS_KEY = "anti-monetization-dismissed";

export function AntiMonetizationBanner() {
  // SSR + first client paint assume visible (matches pre-paint data-ax-banner=1) to avoid CLS.
  const [dismissed, setDismissed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useI18n();

  useLayoutEffect(() => {
    const isDismissed = localStorage.getItem(DISMISS_KEY) === "true";
    setDismissed(isDismissed);
    document.documentElement.setAttribute("data-ax-banner", isDismissed ? "0" : "1");

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (dismissed) {
    return null;
  }

  const bannerClass = cn(
    "anti-monetization-banner",
    reduceMotion && "anti-monetization-banner--reduced-motion",
    isHovered && "anti-monetization-banner--hovered",
  );

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
    document.documentElement.setAttribute("data-ax-banner", "0");
  };

  const textWithStrong = t("antiMonetization.text").replace(
    "{strong}",
    `<strong>${t("antiMonetization.strong")}</strong>`,
  );

  return (
    <div
      className={bannerClass}
      role="region"
      aria-label={t("antiMonetization.regionLabel")}
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
