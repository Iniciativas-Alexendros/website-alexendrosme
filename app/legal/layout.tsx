export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell section">
      <article className="legal-doc">{children}</article>
    </div>
  );
}
