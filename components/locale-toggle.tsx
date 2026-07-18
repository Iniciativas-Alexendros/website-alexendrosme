"use client";

import { useI18n } from "@/lib/i18n";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Languages, Check } from "lucide-react";

const locales = [
  { value: "es" as const, label: "Español" },
  { value: "en" as const, label: "English" },
];

export function LocaleToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium",
            "transition-colors duration-fast ease-out-expo",
            "bg-muted hover:bg-muted/80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "theme-toggle-trigger",
          )}
          aria-label={t("localeToggle.ariaLabel").replace(
            "{locale}",
            locale === "es" ? "Español" : "English",
          )}
        >
          <Languages className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline text-xs font-mono uppercase tracking-wider">
            {locale}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1" sideOffset={8} align="end" forceMount>
        {locales.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setLocale(l.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
              "transition-colors duration-fast ease-out-expo",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:bg-muted",
              locale === l.value ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
            role="menuitemradio"
            aria-checked={locale === l.value}
          >
            <span className="flex-1 text-left">{l.label}</span>
            {locale === l.value && <Check className="size-4 text-primary" aria-hidden="true" />}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}
