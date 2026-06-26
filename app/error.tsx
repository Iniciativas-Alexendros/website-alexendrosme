"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="site-shell page-center section">
      <h1 className="headline">Algo ha ido mal</h1>
      <p className="error-text">
        Se ha producido un error inesperado. Puedes reintentarlo o volver al inicio.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="error-block">{error.message}</pre>
      ) : null}
      <div className="btn-group btn-wrapper">
        <Button onClick={() => reset()}>Reintentar</Button>
        <Button variant="outline" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
