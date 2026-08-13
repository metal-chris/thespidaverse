import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "ja", "pt", "ko", "fr", "zh-CN", "zh-TW"],
  defaultLocale: "en",
  localePrefix: "as-needed", // no prefix for default locale (en)
});
