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
import { RoleBadge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { getUsers, createUser } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { getApiError } from "@/lib/errors";
import { Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name required"),
  password: z.string().min(6, "Min 6 characters"),
  role: z.enum(["admin", "manager", "employee"]),
  is_active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const user = getUser();
  const router = useAppRouter();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers(page).then((r) => r.data),
    enabled: user?.role === "admin",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "employee", is_active: true },
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      reset();
    },
  });

  const users = Array.isArray(data) ? data : data?.results || [];
  const totalCount = data?.count ?? users.length;
  const totalPages = data?.count ? Math.ceil(data.count / 10) : 1;

  if (user?.role !== "admin") {
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
              Users
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "8px 0 0",
                fontSize: 14,
              }}
            >
              {totalCount} users
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Create User
          </Button>
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
            Failed to load users. Please try again.
          </div>
        )}

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Email", "Role", "Status", "Created"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "14px 20px",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {u.name}
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      fontSize: 14,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {u.email}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <RoleBadge role={u.role} />
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: u.is_active ? "var(--success)" : "var(--danger)",
                        fontWeight: 600,
                      }}
                    >
                      {u.is_active ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          title="Create User"
        >
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Input
              label="Name *"
              type="text"
              placeholder="Full name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password *"
              type="password"
              placeholder="••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <Select
              label="Role *"
              options={[
                { value: "employee", label: "Employee" },
                { value: "manager", label: "Manager" },
                { value: "admin", label: "Admin" },
              ]}
              {...register("role")}
            />
            {mutation.isError && (
              <div style={{ color: "var(--danger)", fontSize: 13 }}>
                {getApiError(mutation.error, "Failed to create user")}
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
              <Button type="submit" loading={mutation.isPending}>
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}