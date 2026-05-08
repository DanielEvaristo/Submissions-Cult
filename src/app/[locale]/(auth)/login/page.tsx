"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center animate-fade-in">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cm-text-secondary mb-2">
          Cult Machine
        </p>
        <h1 className="font-mono text-xl font-bold text-cm-text-primary tracking-tight">
          Submissions Portal
        </h1>
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Success banner */}
        {verified && (
          <div className="mb-6 px-4 py-3 border border-ok/30 bg-ok/10 font-mono text-[11px] text-ok">
            Account created — sign in to continue.
          </div>
        )}

        <div className="card">
          <p className="section-label mb-6">{t("auth.signIn")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-text-muted hover:text-cm-text-secondary transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className="error-msg">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {loading ? t("common.loading") : t("auth.signIn")}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-6" />

          <p className="font-sans text-sm text-cm-text-secondary text-center">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="text-cm-text-primary hover:text-accent-red underline underline-offset-2 transition-colors"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
