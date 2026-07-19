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
    <div role="status" aria-live="polite" className="sw-toast">
      <p className="sw-toast__text">{t("pwa.updateReady")}</p>
      <div className="sw-toast__actions">
        <button
          type="button"
          onClick={applyUpdate}
          className="sw-toast__btn sw-toast__btn--primary"
        >
          {t("pwa.updateApply")}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="sw-toast__btn sw-toast__btn--secondary"
        >
          {t("pwa.updateDismiss")}
        </button>
      </div>
    </div>
  );
}
