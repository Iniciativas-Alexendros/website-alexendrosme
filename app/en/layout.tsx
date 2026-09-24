import { I18nProvider } from "@/lib/i18n";

/**
 * English locale tree. Root <html lang> is corrected pre-paint via script;
 * I18nProvider is forced to `en` so SSR/client chrome matches.
 */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="en";try{localStorage.setItem("ax-locale","en")}catch(e){}`,
        }}
      />
      <I18nProvider forcedLocale="en">{children}</I18nProvider>
    </>
  );
}
