"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { getApiError } from "@/lib/errors";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => login(data.email, data.password),
    onSuccess: (res) => {
      const { user } = res.data;
      setAuth("", "", user);
      router.replace(ROUTES.DASHBOARD);
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "40px 36px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--accent-light)",
              letterSpacing: "-0.5px",
              marginBottom: 6,
            }}
          >
            ⬡ TaskFlow
          </div>
          <p
            style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}
          >
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                color: "var(--text-secondary)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: `1px solid ${errors.email ? "var(--danger)" : "var(--border)"}`,
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errors.email && (
              <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                color: "var(--text-secondary)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: `1px solid ${errors.password ? "var(--danger)" : "var(--border)"}`,
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errors.password && (
              <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {mutation.isError && (
            <div
              style={{
                color: "var(--danger)",
                background: "rgba(239,68,68,0.1)",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {getApiError(mutation.error, "Invalid email or password")}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              padding: "12px",
              background: mutation.isPending
                ? "var(--accent-dim)"
                : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              marginTop: 4,
              transition: "background 0.15s ease",
            }}
          >
            {mutation.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
