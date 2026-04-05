"use client";

import dynamic from "next/dynamic";
import { Providers } from "@/components/Providers";

// Canvas + window only after mount — avoids prerender/export edge cases on CI (e.g. Vercel).
const Starfield = dynamic(
  () => import("@/components/Starfield").then((m) => ({ default: m.Starfield })),
  { ssr: false }
);

export function ClientRoot({ children }) {
  return (
    <>
      <Starfield />
      <div className="page-layer">
        <Providers>{children}</Providers>
      </div>
    </>
  );
}
