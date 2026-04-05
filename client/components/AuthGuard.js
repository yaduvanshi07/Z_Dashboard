"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, ready, router]);

  if (!ready || !user) {
    return (
      <div className="shell-loading">
        <p>Loading session…</p>
      </div>
    );
  }

  return children;
}
