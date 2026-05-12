"use client";

import { useEffect } from "react";
import { useAppRouter, ROUTES } from "@/lib/router";
import { isAuthenticated, getUser } from "@/lib/auth";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;

  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useAppRouter();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router, user, allowedRoles]);

  if (!isAuthenticated()) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
