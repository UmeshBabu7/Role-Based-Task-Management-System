"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter, ROUTES } from "@/lib/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/api";
import { setAuth, isAuthenticated } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || ROUTES.DASHBOARD;
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await login(data.email, data.password);

      setAuth(res.data.access, res.data.refresh, res.data.user);
      router.push(nextPath);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{ width: "100%", maxWidth: 400, animation: "fadeIn 0.4s ease" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "var(--accent-light)",
              letterSpacing: "-1px",
              marginBottom: 8,
            }}
          >
            ⬡ TaskFlow
          </div>
          <p
            style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}
          >
            Role-Based Task Management
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700 }}>
            Sign in
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "var(--danger)",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              style={{ marginTop: 4, width: "100%", padding: "11px" }}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
