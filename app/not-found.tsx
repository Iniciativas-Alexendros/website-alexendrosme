import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 — Página no encontrada",
  description: "La página que buscas no existe o ha sido movida.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="site-shell page-center section">
      <h1 className="headline">Página no encontrada</h1>
      <p className="error-text">La página que buscas no existe o ha sido movida.</p>
      <div className="btn-wrapper">
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
