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

  it("codifica espacios como %20", () => {
    expect(buildMailto("asunto con espacios")).toContain("subject=asunto%20con%20espacios");
  });

  it("maneja string vacío como subject (sin ?subject=)", () => {
    expect(buildMailto("")).toBe("mailto:contacto@alexendros.me");
  });

  it("maneja caracteres unicode en el subject", () => {
    const result = buildMailto("Ñandú");
    expect(result).toContain("subject=");
    const subject = result.split("subject=")[1];
    expect(subject).toBeDefined();
    expect(decodeURIComponent(String(subject))).toBe("Ñandú");
  });

  it("la URL base siempre termina en el email correcto", () => {
    const result = buildMailto("test");
    expect(result).toMatch(/^mailto:contacto@alexendros\.me/);
  });
});
