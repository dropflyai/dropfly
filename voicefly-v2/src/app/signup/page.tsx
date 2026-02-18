"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(formData.password),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      name: formData.name,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-purple)]">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              VoiceFly
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Create your account
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Start your 14-day free trial
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-error-subtle)] border border-[var(--color-error)] text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Full name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {/* Password requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        req.met
                          ? "bg-[var(--color-success)]"
                          : "bg-[var(--color-bg-elevated)]"
                      }`}
                    >
                      {req.met && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span
                      className={
                        req.met
                          ? "text-[var(--color-text-secondary)]"
                          : "text-[var(--color-text-tertiary)]"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-[var(--color-text-tertiary)]">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--color-text-secondary)]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[var(--color-text-secondary)]">
              Privacy Policy
            </Link>
          </p>

          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--color-accent-purple)] hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
