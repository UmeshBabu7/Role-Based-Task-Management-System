"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  getTasks,
  createTask,
  updateTask,
  getAllProjects,
  getEmployees,
} from "@/lib/api";
import { getUser } from "@/lib/auth";
import { getApiError } from "@/lib/errors";
import { Task } from "@/types";
import { Plus, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  project: z.string().min(1, "Project required"),
  assigned_to: z.string().optional(),
  status: z.string().optional().default("TODO"),
});
type FormData = z.infer<typeof schema>;

const employeeEditSchema = z.object({
  status: z.enum(["TODO", "DONE"], { required_error: "Status required" }),
});
type EmployeeEditData = z.infer<typeof employeeEditSchema>;

const managerEditSchema = z.object({
  status: z.enum(["TODO", "DONE"], { required_error: "Status required" }),
  assigned_to: z.string().optional(),
});
type ManagerEditData = z.infer<typeof managerEditSchema>;

export default function TasksPage() {
  const user = getUser();

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", page],
    queryFn: () => getTasks(page).then((r) => r.data),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getAllProjects().then((r) => r.data),
    enabled: user?.role === "manager",
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees().then((r) => r.data),
    enabled: user?.role === "manager",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const {
    register: regEmployeeEdit,
    handleSubmit: handleEmployeeEdit,
    formState: { errors: empErrors, isSubmitting: empEditSubmitting },
  } = useForm<EmployeeEditData>({ resolver: zodResolver(employeeEditSchema) });
  const {
    register: regManagerEdit,
    handleSubmit: handleManagerEdit,
    formState: { errors: mgrErrors, isSubmitting: mgrEditSubmitting },
  } = useForm<ManagerEditData>({ resolver: zodResolver(managerEditSchema) });

  const createMutation = useMutation({
    mutationFn: (d: any) =>
      createTask({
        ...d,
        project: Number(d.project),
        assigned_to: d.assigned_to ? Number(d.assigned_to) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      const payload: any = { status: data.status };
      if (data.assigned_to !== undefined) {
        payload.assigned_to = data.assigned_to
          ? Number(data.assigned_to)
          : null;
      }
      return updateTask(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditTask(null);
    },
  });

  const tasks: Task[] = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / 10) : 1;
  const projects = Array.isArray(projectsData)
    ? projectsData
    : projectsData?.results || [];
  const employees = Array.isArray(employeesData)
    ? employeesData
    : employeesData?.results || [];

  const statusOptions = [
    { value: "TODO", label: "To Do" },
    { value: "DONE", label: "Done" },
  ];

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
              Tasks
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "8px 0 0",
                fontSize: 14,
              }}
            >
              {data?.count || 0} total tasks
              {user?.role === "admin" && (
                <span style={{ marginLeft: 8, color: "var(--accent-light)" }}>
                  (All tasks — read only)
                </span>
              )}
            </p>
          </div>
          {user?.role === "manager" && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> New Task
            </Button>
          )}
        </div>

        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 72 }} />
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
            Failed to load tasks. Please try again.
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--text-secondary)",
            }}
          >
            <CheckSquare size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>No tasks found</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {task.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: 16,
                  }}
                >
                  <span>📁 {task.project_name}</span>
                  {task.assigned_to && <span>👤 {task.assigned_to.name}</span>}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <StatusBadge status={task.status} />

                {(user?.role === "employee" || user?.role === "manager") && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditTask(task)}
                  >
                    Update
                  </Button>
                )}
              </div>
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
            <Button
              size="sm"
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        )}

        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
            reset();
          }}
          title="Create Task"
        >
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Input
              label="Title *"
              type="text"
              placeholder="Task title"
              error={errors.title?.message}
              {...register("title")}
            />
            <Textarea
              label="Description"
              rows={2}
              {...register("description")}
            />
            <Select
              label="Project *"
              error={errors.project?.message}
              options={[
                { value: "", label: "Select project..." },
                ...projects.map((p: any) => ({ value: p.id, label: p.name })),
              ]}
              {...register("project")}
            />
            <Select
              label="Assign To"
              options={[
                { value: "", label: "Unassigned" },
                ...employees.map((e: any) => ({ value: e.id, label: e.name })),
              ]}
              {...register("assigned_to")}
            />
            {createMutation.isError && (
              <div style={{ color: "var(--danger)", fontSize: 13 }}>
                {getApiError(createMutation.error, "Failed to create task")}
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
                loading={isSubmitting || createMutation.isPending}
              >
                Create
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          open={!!editTask}
          onClose={() => setEditTask(null)}
          title={
            user?.role === "employee" ? "Update Task Status" : "Update Task"
          }
        >
          {editTask && user?.role === "employee" && (
            <form
              onSubmit={handleEmployeeEdit((d) =>
                updateMutation.mutate({ id: editTask.id, data: d }),
              )}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                  {editTask.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {editTask.project_name}
                </p>
              </div>
              <Select
                label="Status"
                error={empErrors.status?.message}
                defaultValue={editTask.status}
                options={statusOptions}
                {...regEmployeeEdit("status")}
              />
              <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
              >
                <Button
                  variant="secondary"
                  onClick={() => setEditTask(null)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={empEditSubmitting || updateMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </form>
          )}
          {editTask && user?.role === "manager" && (
            <form
              onSubmit={handleManagerEdit((d) =>
                updateMutation.mutate({ id: editTask.id, data: d }),
              )}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <Select
                label="Status"
                error={mgrErrors.status?.message}
                defaultValue={editTask.status}
                options={statusOptions}
                {...regManagerEdit("status")}
              />
              <Select
                label="Assign To"
                defaultValue={editTask.assigned_to?.id?.toString() || ""}
                options={[
                  { value: "", label: "Unassigned" },
                  ...employees.map((e: any) => ({
                    value: e.id,
                    label: e.name,
                  })),
                ]}
                {...regManagerEdit("assigned_to")}
              />
              <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
              >
                <Button
                  variant="secondary"
                  onClick={() => setEditTask(null)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={mgrEditSubmitting || updateMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
