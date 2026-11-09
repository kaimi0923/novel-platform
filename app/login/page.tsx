"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { SocialLogin } from "@/components/social-login";
import { useT } from "@/lib/i18n/client";

function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? t("auth.invalid")
        : error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("auth.email")}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-base"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("auth.password")}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordPh")}
          className="input-base"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? t("auth.loggingIn") : t("auth.login")}
      </button>

      <p className="text-center text-sm text-slate-500">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          {t("auth.signupNow")}
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-slate-900">
          {t("auth.loginBrand")}
        </h1>

        <SocialLogin next="/dashboard" />

        <div className="my-5 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          {t("auth.orEmail")}
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Suspense fallback={<p className="text-center text-sm text-slate-400">{t("common.loading")}</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
