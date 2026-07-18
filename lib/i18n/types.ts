export type Locale = "es" | "en";

export type TranslationDict = Record<
  string,
  string | Record<string, string | Record<string, string>>
>;

export interface I18nContextType {
  locale: Locale;
  t: (path: string) => string;
  setLocale: (locale: Locale) => void;
}
