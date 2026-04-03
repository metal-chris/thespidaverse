"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  es: "ES",
  ja: "JA",
  pt: "PT",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-0.5 text-xs">
      {Object.entries(LOCALE_LABELS).map(([code, label]) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            code === locale
              ? "text-accent font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
