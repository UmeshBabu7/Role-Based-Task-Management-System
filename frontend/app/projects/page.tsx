"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppRouter, ROUTES } from "@/lib/router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { getProjects, createProject } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { getApiError } from "@/lib/errors";
import { Project } from "@/types";
import {
  Plus,
  FolderOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProjectsPage() {
  const user = getUser();
  const router = useAppRouter();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", page],
    queryFn: () => getProjects(page).then((r) => r.data),
    enabled: user?.role === "admin" || user?.role === "manager",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      reset();
    },
  });

  const projects: Project[] = Array.isArray(data) ? data : data?.results || [];
  const totalCount = data?.count ?? projects.length;
  const totalPages = data?.count ? Math.ceil(data.count / 10) : 1;

  if (user?.role === "employee") {
    router.replace(ROUTES.DASHBOARD);
    return null;
  }

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
              Projects
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "8px 0 0",
                fontSize: 14,
              }}
            >
              {totalCount} project{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          {user?.role === "manager" && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> New Project
            </Button>
          )}
        </div>

        {isLoading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 140 }} />
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
            Failed to load projects. Please try again.
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--text-secondary)",
            }}
          >
            <FolderOpen size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 16 }}>No projects yet</p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 24,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "var(--accent-dim)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderOpen size={18} color="var(--accent-light)" />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--accent-light)",
                    background: "var(--accent-dim)",
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {project.task_count} tasks
                </span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>
                {project.name}
              </h3>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {project.description || "No description"}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-secondary)",
                  fontSize: 12,
                }}
              >
                <Calendar size={12} />
                {new Date(project.created_at).toLocaleDateString()}
                {project.created_by && (
                  <span style={{ marginLeft: 8 }}>
                    by {project.created_by.name}
                  </span>
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
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}

        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
            reset();
          }}
          title="Create Project"
        >
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Input
              label="Name *"
              placeholder="Project name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Textarea
              label="Description"
              placeholder="Describe the project..."
              rows={3}
              {...register("description")}
            />
            {mutation.isError && (
              <div style={{ color: "var(--danger)", fontSize: 13 }}>
                {getApiError(mutation.error, "Failed to create project")}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 8,
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
                Create
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
