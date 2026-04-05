"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "./AuthGuard";
import { useAuth } from "@/lib/auth-context";

export function AppShell({ children }) {
  const { user, logout, isAnalystUp, isAdmin } = useAuth();
  const path = usePathname();

  return (
    <AuthGuard>
      <div className="app-shell">
        <header className="top-nav glass">
          <div className="brand">
            <Link href="/dashboard">Finance Dashboard</Link>
          </div>
          <nav className="nav-links">
            <Link className={path === "/dashboard" ? "active" : ""} href="/dashboard">
              Dashboard
            </Link>
            <Link className={path === "/records" ? "active" : ""} href="/records">
              Records
            </Link>
          </nav>
          <div className="user-meta">
            <span className="role-pill" title="Role">
              {user?.role}
            </span>
            {isAdmin && <span className="hint">Admin scope</span>}
            {!isAnalystUp && (
              <span className="hint" title="View-only">
                View-only
              </span>
            )}
            <button type="button" className="btn ghost" onClick={logout}>
              Log out
            </button>
          </div>
        </header>
        <main className="main-area">{children}</main>
      </div>
    </AuthGuard>
  );
}
