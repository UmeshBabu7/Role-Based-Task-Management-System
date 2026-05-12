"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppRouter, ROUTES } from "@/lib/router";
import { isAuthenticated, getUser } from "@/lib/auth";
import { canAccessRoute } from "@/lib/guards";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useAppRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    const user = getUser();
    if (user && !canAccessRoute(pathname, user.role)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router, pathname]);

  const user = getUser();
  if (!isAuthenticated() || !user) return null;
  if (!canAccessRoute(pathname, user.role)) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "220px",
          padding: "32px",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
