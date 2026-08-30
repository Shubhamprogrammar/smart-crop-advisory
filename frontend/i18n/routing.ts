import { defineRouting } from "next-intl/routing";
import { LANGUAGES } from "@/lib/languages";

export const routing = defineRouting({
  locales: LANGUAGES.map((l) => l.code),
  defaultLocale: "en",
  localePrefix: "as-needed",
});
