"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  hue: 0 | 1;
};

export function ParticleBg() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Respetar prefers-reduced-motion: si el usuario reduce movimiento, no montamos el canvas.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const styles = getComputedStyle(document.documentElement);
    // Fallbacks alineados a Patrón VAP gama Vergina (oro + ámbar profundo).
    const primary = styles.getPropertyValue("--primary").trim() || "oklch(0.80 0.16 85)";
    const accent = styles.getPropertyValue("--accent").trim() || "oklch(0.66 0.14 65)";

    let particles: Particle[] = [];
    let raf = 0;
    let resizeRaf = 0;

    const applyResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = w < 640 ? 0.00004 : 0.00008;
      const minCount = w < 640 ? 20 : 40;
      const maxCount = w < 640 ? 60 : 120;
      const count = Math.max(minCount, Math.min(maxCount, Math.floor(w * h * density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.35 + 0.1,
        hue: Math.random() < 0.8 ? 0 : 1,
      }));
    };

    const resize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        applyResize();
      });
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -2) p.x = w + 2;
        else if (p.x > w + 2) p.x = -2;
        if (p.y < -2) p.y = h + 2;
        else if (p.y > h + 2) p.y = -2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const color = p.hue === 0 ? primary : accent;
        ctx.fillStyle = color.startsWith("oklch") ? color.replace(/\)$/, ` / ${p.a})`) : color;
        ctx.globalAlpha = color.startsWith("oklch") ? 1 : p.a;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };

    applyResize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />
  );
}
