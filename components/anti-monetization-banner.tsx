"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function AntiMonetizationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissedValue = localStorage.getItem("anti-monetization-dismissed");
    if (dismissedValue === "true") {
      setDismissed(true);
    }

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
  );

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("anti-monetization-dismissed", "true");
  };

  return (
    <div
      className={bannerClass}
      role="status"
      aria-live="polite"
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      <div className="anti-monetization-banner__content">
        <Shield className="anti-monetization-banner__icon" aria-hidden="true" />
        <p className="anti-monetization-banner__text">
          Este espacio es libre de dinero. Sin anuncios, sin afiliados, sin tracking.
        </p>
        <a
          href="https://alexendros.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="anti-monetization-banner__link"
        >
          Lo comercial vive en alexendros.dev
        </a>
      </div>
      <button
        type="button"
        className="anti-monetization-banner__dismiss"
        onClick={handleDismiss}
        aria-label="Cerrar aviso de espacio libre de dinero"
      >
        ×
      </button>
    </div>
  );
}
