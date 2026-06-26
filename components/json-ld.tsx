"use client";

import { useEffect } from "react";

export function JsonLd() {
  useEffect(() => {
    const schemas = [
      { url: "/schema/person.json", id: "person-json-ld" },
      { url: "/schema/website.json", id: "website-json-ld" },
    ];

    schemas.forEach(({ url, id }) => {
      if (document.getElementById(id)) return;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const script = document.createElement("script");
          script.type = "application/ld+json";
          script.id = id;
          script.textContent = JSON.stringify(data);
          document.head.appendChild(script);
        })
        .catch((err) => {
          if (process.env.NODE_ENV === "development") {
            console.error(`Failed to load JSON-LD from ${url}:`, err);
          }
        });
    });
  }, []);

  return null;
}
