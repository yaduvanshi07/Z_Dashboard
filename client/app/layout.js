import "./globals.css";
import { Providers } from "@/components/Providers";
import { Starfield } from "@/components/Starfield";

export const metadata = {
  title: "Finance Dashboard",
  description: "Production-style finance dashboard with RBAC and JWT auth",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Starfield />
        <div className="page-layer">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
