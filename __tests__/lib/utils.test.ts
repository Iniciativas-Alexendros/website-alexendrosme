import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("devuelve una cadena vacía cuando no recibe argumentos", () => {
    expect(cn()).toBe("");
  });

  it("concatena clases estáticas", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resuelve condicionales y objetos", () => {
    expect(cn("base", { active: true, disabled: false }, "end")).toBe("base active end");
  });

  it("mezcla clases conflictivas de Tailwind", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
