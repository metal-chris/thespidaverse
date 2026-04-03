import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "ja", "pt"],
  defaultLocale: "en",
  localePrefix: "as-needed", // no prefix for default locale (en)
});
