// Mirrors backend/src/constants/enums.ts LANGUAGES exactly — keep in sync.
export const LANGUAGES = [
  { code: "en", nativeName: "English" },
  { code: "hi", nativeName: "हिन्दी" },
  { code: "mr", nativeName: "मराठी" },
  { code: "gu", nativeName: "ગુજરાતી" },
] as const;

export type LocaleCode = (typeof LANGUAGES)[number]["code"];
