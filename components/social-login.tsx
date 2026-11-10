"use client";

import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/client";

type ProviderKey = "google" | "facebook" | "apple" | "line";

interface Provider {
  key: ProviderKey;
  label: string;
  button: string;
  icon: ReactNode;
}

const PROVIDERS: Provider[] = [
  {
    key: "google",
    label: "Google",
    button: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#4285F4" aria-hidden>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    button: "bg-[#1877F2] text-white hover:bg-[#166FE5]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#ffffff" aria-hidden>
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z" />
      </svg>
    ),
  },
  {
    key: "apple",
    label: "Apple",
    button: "bg-black text-white hover:bg-[#1d1d1f]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#ffffff" aria-hidden>
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z" />
      </svg>
    ),
  },
  {
    key: "line",
    label: "LINE",
    button: "bg-[#06C755] text-white hover:bg-[#05b34c]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#ffffff" aria-hidden>
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33v-2.945c0-.344.281-.629.632-.629.347 0 .626.285.626.629v3.85zm-5.499.273c0 .345-.281.63-.63.63-.349 0-.63-.285-.63-.63V8.108c0-.345.281-.63.63-.63.349 0 .63.285.63.63v5.041zm-2.4.03c0 .291-.245.529-.547.529H4.045c-.302 0-.547-.238-.547-.529V8.108c0-.291.245-.529.547-.529.302 0 .547.238.547.529v4.511h2.475c.302 0 .547.238.547.53zm16.383-4.28c0-5.112-4.99-9.256-11.146-9.256-6.155 0-11.145 4.144-11.145 9.256 0 4.575 4.156 8.409 9.742 9.14.379.082.895.251 1.026.578.117.296.077.729.038 1.016-.117.322-.678 2.517.567 1.38 1.44-1.32 4.02-3.013 5.55-4.216 1.74-1.37 2.428-2.572 2.428-4.895z" />
      </svg>
    ),
  },
];

export function SocialLogin({ next = "/dashboard" }: { next?: string }) {
  const t = useT();
  const [busy, setBusy] = useState<ProviderKey | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function signIn(key: ProviderKey) {
    setErr(null);
    setBusy(key);

    // LINE 走站內自建 OAuth（Supabase 的自訂供應商在回呼時取不到 provider id）
    if (key === "line") {
      window.location.href = `/api/auth/line?next=${encodeURIComponent(next)}`;
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: key as never,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setErr(
        /not enabled|not supported|unsupported provider/i.test(error.message)
          ? t("auth.oauthOff")
          : error.message
      );
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-slate-500">{t("auth.oauthHint")}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => signIn(p.key)}
            disabled={busy !== null}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold shadow-sm transition duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${p.button}`}
          >
            {p.icon}
            <span>{busy === p.key ? t("auth.oauthConnecting") : p.label}</span>
          </button>
        ))}
      </div>
      {err && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          {err}
        </p>
      )}
    </div>
  );
}
