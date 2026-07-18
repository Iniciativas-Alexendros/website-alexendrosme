"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function SwRegister() {
  const { t } = useI18n();
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      return;
    }
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
              setWaiting(newWorker);
            }
          });
        });

        await reg.update();
      } catch (err) {
        // SW opcional — no bloquear UX
        // eslint-disable-next-line no-console
        console.warn("[SW] registration failed:", err);
      }
    };

    void register();
  }, []);

  const applyUpdate = () => {
    if (waiting) {
      waiting.postMessage({ type: "SKIP_WAITING" });
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {
          window.location.reload();
        },
        { once: true },
      );
    } else {
      window.location.reload();
    }
  };

  if (!updateReady || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 60,
        padding: "0.75rem 1rem",
        background: "var(--ax-surface-2, #1f1a14)",
        border: "1px solid var(--border, #444)",
        borderRadius: "var(--ax-radius-md, 8px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        maxWidth: "20rem",
      }}
    >
      <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", margin: 0 }}>
        {t("pwa.updateReady")}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={applyUpdate}
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "0.75rem",
            background: "var(--primary, #d9b267)",
            color: "var(--primary-foreground, #17130f)",
            border: "none",
            borderRadius: "var(--ax-radius-sm, 4px)",
            cursor: "pointer",
          }}
        >
          {t("pwa.updateApply")}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "0.75rem",
            background: "transparent",
            color: "var(--muted-foreground, #888)",
            border: "1px solid var(--border, #444)",
            borderRadius: "var(--ax-radius-sm, 4px)",
            cursor: "pointer",
          }}
        >
          {t("pwa.updateDismiss")}
        </button>
      </div>
    </div>
  );
}
