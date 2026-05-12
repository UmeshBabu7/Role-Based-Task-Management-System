"use client";
import { usePathname } from "next/navigation";
import { useAppRouter, ROUTES } from "@/lib/router";
import { getUser, clearAuth } from "@/lib/auth";
import { logout } from "@/lib/api";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  LogOut,
  ClipboardList,
} from "lucide-react";

const navItems = [
  {
    href: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "employee"],
  },
  {
    href: ROUTES.PROJECTS,
    label: "Projects",
    icon: FolderOpen,
    roles: ["admin", "manager"],
  },
  {
    href: ROUTES.TASKS,
    label: "Tasks",
    icon: CheckSquare,
    roles: ["admin", "manager", "employee"],
  },
  { href: ROUTES.USERS, label: "Users", icon: Users, roles: ["admin"] },
  {
    href: ROUTES.DAILY_LOGS,
    label: "Daily Logs",
    icon: ClipboardList,
    roles: ["manager", "employee"],
  },
];

const roleColors: Record<string, string> = {
  admin: "#ef4444",
  manager: "#6c63ff",
  employee: "#22d3a3",
};

export function Sidebar() {
  const router = useAppRouter();
  const pathname = usePathname();
  const user = getUser();

  if (!user) return null;

  const filtered = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: "0 20px 28px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--accent-light)",
            letterSpacing: "-0.5px",
          }}
        >
          ⬡ TaskFlow
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: roleColors[user.role] || "var(--accent)",
              background: `${roleColors[user.role]}20`,
              padding: "2px 8px",
              borderRadius: 20,
              display: "inline-block",
              marginTop: 2,
            }}
          >
            {user.role}
          </div>
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "0 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {filtered.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                background: active ? "var(--accent-dim)" : "transparent",
                color: active ? "var(--accent-light)" : "var(--text-secondary)",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
            background: "transparent",
            color: "var(--danger)",
            fontSize: 14,
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
