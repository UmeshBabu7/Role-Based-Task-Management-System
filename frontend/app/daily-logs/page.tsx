"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppRouter, useReactRouter, ROUTES } from "@/lib/router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import { getDailyLogs, createDailyLog, getDailyLogTasks } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { getApiError } from "@/lib/errors";
import { Plus, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const logSchema = z.object({
  task: z.string().min(1, "Please select a task"),
  note: z.string().min(1, "Note is required").max(2000, "Note too long"),
});
type LogFormData = z.infer<typeof logSchema>;

export default function DailyLogsPage() {
  const user = getUser();
  const router = useAppRouter();

  const { location, navigate } = useReactRouter();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["daily-logs", page],
    queryFn: () => getDailyLogs(page).then((r) => r.data),
  });

  const { data: tasksData } = useQuery({
    queryKey: ["tasks-for-log", taskPage],
    queryFn: () => getDailyLogTasks(taskPage).then((r) => r.data),
    enabled: user?.role === "employee",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogFormData>({ resolver: zodResolver(logSchema) });

  const mutation = useMutation({
    mutationFn: (d: LogFormData) =>
      createDailyLog({ ...d, task: Number(d.task) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
      setOpen(false);
      reset();
    },
  });

  const logs = Array.isArray(data) ? data : data?.results || [];
  const totalCount = data?.count ?? logs.length;
  const totalPages = data?.count ? Math.ceil(data.count / 10) : 1;
  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.results || [];
  const taskTotalPages = tasksData?.count ? Math.ceil(tasksData.count / 10) : 1;

  if (user?.role === "admin") {
    router.replace(ROUTES.DASHBOARD);
    return null;
  }

  const isManager = user?.role === "manager";

  return (
    <AppLayout>
      <div className="fade-in">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Daily Logs
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "8px 0 0",
                fontSize: 14,
              }}
            >
              {isManager
                ? `${totalCount} log${totalCount !== 1 ? "s" : ""} — employee activity across your projects`
                : `${totalCount} log${totalCount !== 1 ? "s" : ""} — track your work done on tasks`}
            </p>
          </div>

          {!isManager && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Add Log
            </Button>
          )}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              opacity: 0.7,
            }}
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Dashboard
          </span>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ opacity: 0.7 }}>
            {location.pathname
              .replace("/", "")
              .replace("-", " ")
              .replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        </div>

        {isLoading && (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
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
            Failed to load daily logs. Please try again.
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--text-secondary)",
            }}
          >
            <ClipboardList
              size={48}
              style={{ marginBottom: 16, opacity: 0.3 }}
            />
            <p>
              {isManager
                ? "No employee logs yet for your projects."
                : "No logs yet. Start tracking your work!"}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {logs.map((log: any) => (
            <div
              key={log.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    📋 {log.task_title}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--accent-light)",
                      background: "var(--accent-dim)",
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    {log.user.name}
                  </span>
                  {isManager && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        background: "var(--bg-elevated)",
                        padding: "2px 8px",
                        borderRadius: 20,
                        textTransform: "capitalize",
                      }}
                    >
                      {log.user.role}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(log.logged_at).toLocaleString()}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {log.note}
              </p>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {!isManager && (
          <Modal
            open={open}
            onClose={() => {
              setOpen(false);
              reset();
              setTaskPage(1);
            }}
            title="Add Daily Log"
          >
            <form
              onSubmit={handleSubmit((d) => mutation.mutate(d))}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <Select
                label="Task *"
                error={errors.task?.message}
                options={[
                  { value: "", label: "Select task..." },
                  ...tasks.map((t: any) => ({ value: t.id, label: t.title })),
                ]}
                {...register("task")}
              />
              {taskTotalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                    disabled={taskPage === 1}
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: "inherit",
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>
                    Page {taskPage} of {taskTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTaskPage((p) => Math.min(taskTotalPages, p + 1))
                    }
                    disabled={taskPage === taskTotalPages}
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: "inherit",
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
              <Textarea
                label="Note *"
                placeholder="What did you work on today?"
                rows={4}
                error={errors.note?.message}
                {...register("note")}
              />
              {mutation.isError && (
                <div style={{ color: "var(--danger)", fontSize: 13 }}>
                  {getApiError(mutation.error, "Failed to save log.")}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <Button
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting || mutation.isPending}
                >
                  Save Log
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
