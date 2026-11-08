"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const t = useT();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setError(
        error.message === "User already registered"
          ? t("auth.emailTaken")
          : error.message
      );
      setLoading(false);
      return;
    }

    // 若專案關閉了{t("auth.email")}確認，註冊即登入，直接進入作者中心
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // 若開啟了{t("auth.email")}確認，提示去{t("auth.email")}驗證
    setNotice(t("auth.verifyNotice"));
    setLoading(false);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-slate-900">
          {t("auth.signupBrand")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("auth.usernameLabel")}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("auth.usernamePh")}
              className="input-base"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordMin")}
              className="input-base"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t("auth.signingUp") : t("auth.signup")}
          </button>

          <p className="text-center text-sm text-slate-500">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              {t("auth.loginNow")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
