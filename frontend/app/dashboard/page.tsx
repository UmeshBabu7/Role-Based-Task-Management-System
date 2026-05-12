"use client";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/Card";
import { getDashboard } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { AdminDashboard, ManagerDashboard, EmployeeDashboard } from "@/types";

export default function DashboardPage() {
  const user = getUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard().then((r) => r.data),
  });

  const heading =
    {
      admin: "System Overview",
      manager: "My Projects Overview",
      employee: "My Tasks Overview",
    }[user?.role || "employee"] || "Dashboard";

  return (
    <AppLayout>
      <div className="fade-in">
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            {heading}
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              margin: "8px 0 0",
              fontSize: 14,
            }}
          >
            Welcome back, {user?.name}
          </p>
        </div>

        {isLoading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 100 }} />
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "var(--danger)",
              background: "rgba(239,68,68,0.1)",
              padding: 16,
              borderRadius: 8,
            }}
          >
            Failed to load dashboard
          </div>
        )}

        {data && user?.role === "admin" && (
          <AdminStats data={data as AdminDashboard} />
        )}
        {data && user?.role === "manager" && (
          <ManagerStats data={data as ManagerDashboard} />
        )}
        {data && user?.role === "employee" && (
          <EmployeeStats data={data as EmployeeDashboard} />
        )}
      </div>
    </AppLayout>
  );
}

function AdminStats({ data }: { data: AdminDashboard }) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Users"
          value={data.total_users}
          color="var(--accent-light)"
        />
        <StatCard
          label="Total Projects"
          value={data.total_projects}
          color="var(--success)"
        />
        <StatCard
          label="Total Tasks"
          value={data.total_tasks}
          color="var(--warning)"
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>
            Users by Role
          </h3>
          {data.users_by_role.map(({ role, count }) => (
            <div
              key={role}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  textTransform: "capitalize",
                  color: "var(--text-secondary)",
                }}
              >
                {role}
              </span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{count}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>
            Tasks by Status
          </h3>
          {data.tasks_by_status.map(({ status, count }) => (
            <div
              key={status}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {status}
              </span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManagerStats({ data }: { data: ManagerDashboard }) {
  const completion =
    data.total_tasks > 0
      ? Math.round((data.completed_tasks / data.total_tasks) * 100)
      : 0;
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="My Projects"
          value={data.total_projects}
          color="var(--accent-light)"
        />
        <StatCard
          label="Total Tasks"
          value={data.total_tasks}
          color="var(--warning)"
        />
        <StatCard
          label="Completed"
          value={data.completed_tasks}
          color="var(--success)"
        />
        <StatCard
          label="Completion Rate"
          value={`${completion}%`}
          color="#f59e0b"
        />
      </div>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>
          Task Breakdown
        </h3>
        {[
          { label: "To Do", value: data.todo_tasks, color: "#f59e0b" },
          { label: "Done", value: data.completed_tasks, color: "#22d3a3" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
            </div>
            <div
              style={{
                height: 4,
                background: "var(--bg-elevated)",
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${data.total_tasks > 0 ? (value / data.total_tasks) * 100 : 0}%`,
                  background: color,
                  borderRadius: 2,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeStats({ data }: { data: EmployeeDashboard }) {
  const completion =
    data.total_assigned_tasks > 0
      ? Math.round((data.completed_tasks / data.total_assigned_tasks) * 100)
      : 0;
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Assigned Tasks"
          value={data.total_assigned_tasks}
          color="var(--accent-light)"
        />
        <StatCard
          label="Completed"
          value={data.completed_tasks}
          color="var(--success)"
        />
        <StatCard
          label="Completion Rate"
          value={`${completion}%`}
          color="#f59e0b"
        />
      </div>
    </div>
  );
}
