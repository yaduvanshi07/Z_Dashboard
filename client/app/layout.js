import "./globals.css";
import { ClientRoot } from "@/components/ClientRoot";

// Entire app is client-auth driven; force dynamic so Vercel does not treat routes as pure static export.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finance Dashboard",
  description: "Production-style finance dashboard with RBAC and JWT auth",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
