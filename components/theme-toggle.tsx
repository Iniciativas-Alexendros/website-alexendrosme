"use client";

import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Monitor, Sun, Moon, Check } from "lucide-react";

type ThemeValue = "system" | "light" | "dark";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const themes: readonly {
    value: ThemeValue;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "system" as const,
      label: t("theme.system"),
      icon: <Monitor className="size-4" />,
    },
    { value: "light" as const, label: t("theme.light"), icon: <Sun className="size-4" /> },
    {
      value: "dark" as const,
      label: t("theme.dark"),
      icon: <Moon className="size-4" />,
    },
  ];

  const currentTheme = (themes.find((t) => t.value === theme) ?? themes[0]) as (typeof themes)[0];

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium theme-toggle-trigger",
            "transition-colors duration-fast ease-out-expo",
            "bg-muted hover:bg-muted/80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "data-[state=open]:bg-muted",
            "aria-invalid:border-destructive",
          )}
          aria-label={t("theme.ariaLabel").replace("{theme}", currentTheme.label)}
        >
          {currentTheme.icon}
          <span className="hidden sm:inline">{currentTheme.label}</span>
          <svg
            className="size-4 opacity-60 transition-transform duration-fast"
            style={{ transform: "rotate(0deg)" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" sideOffset={8} align="end" forceMount>
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm theme-toggle-option",
              "transition-colors duration-fast ease-out-expo",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:bg-muted",
              theme === t.value ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
            role="menuitemradio"
            aria-checked={theme === t.value}
          >
            {t.icon}
            <span className="flex-1 text-left">{t.label}</span>
            {theme === t.value && <Check className="size-4 text-primary" aria-hidden="true" />}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}
