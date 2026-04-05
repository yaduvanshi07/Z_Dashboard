"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight animated starfield — vanilla canvas, no extra deps.
 */
export function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let raf;
    const stars = [];
    const num = 140;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.length = 0;
      for (let i = 0; i < num; i += 1) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.8 + 0.2,
          s: Math.random() * 1.2 + 0.3,
          v: Math.random() * 0.15 + 0.02,
        });
      }
    }

    function frame() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "rgba(5, 8, 20, 0.35)";
      ctx.fillRect(0, 0, w, h);
      for (const st of stars) {
        st.y += st.v * 40 * st.z;
        if (st.y > h) {
          st.y = 0;
          st.x = Math.random() * w;
        }
        const a = 0.35 + st.z * 0.65;
        ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="starfield-canvas"
    />
  );
}
