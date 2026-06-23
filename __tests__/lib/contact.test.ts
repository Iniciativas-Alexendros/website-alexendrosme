import { describe, expect, it } from "vitest";
import { buildMailto } from "@/lib/contact";

describe("buildMailto", () => {
  it("genera el enlace mailto base sin asunto", () => {
    expect(buildMailto()).toBe("mailto:contacto@alexendros.me");
  });

  it("añade el asunto codificado cuando se proporciona", () => {
    expect(buildMailto("Hola")).toBe("mailto:contacto@alexendros.me?subject=Hola");
  });

  it("codifica caracteres especiales en el asunto", () => {
    expect(buildMailto("Hola, ¿qué tal?")).toBe(
      "mailto:contacto@alexendros.me?subject=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F",
    );
  });
});
