const statusConfig = {
  TODO: { label: "To Do", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  DONE: { label: "Done", color: "#22d3a3", bg: "rgba(34,211,163,0.1)" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: "#888",
    bg: "rgba(128,128,128,0.1)",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: cfg.color,
        background: cfg.bg,
        padding: "3px 10px",
        borderRadius: 20,
      }}
    >
      {cfg.label}
    </span>
  );
}

const roleConfig = {
  admin: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  manager: { color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  employee: { color: "#22d3a3", bg: "rgba(34,211,163,0.1)" },
};

export function RoleBadge({ role }: { role: string }) {
  const cfg = roleConfig[role as keyof typeof roleConfig] || {
    color: "#888",
    bg: "rgba(128,128,128,0.1)",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: cfg.color,
        background: cfg.bg,
        padding: "3px 10px",
        borderRadius: 20,
      }}
    >
      {role}
    </span>
  );
}
