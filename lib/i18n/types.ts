export type Locale = "es" | "en";

export type TranslationValue =
  | string
  | string[]
  | { [key: string]: TranslationValue };

export type TranslationDict = { [key: string]: TranslationValue };

export interface I18nContextType {
  locale: Locale;
  t: (path: string) => string;
  tArray: (path: string) => string[];
  setLocale: (locale: Locale) => void;
}