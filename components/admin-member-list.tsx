"use client";

import { useMemo, useState } from "react";
import type { AdminMember } from "@/lib/supabase/queries";

const ROLE_LABEL: Record<string, string> = {
  reader: "读者",
  author: "作家",
  admin: "管理员",
};

const ROLE_COLOR: Record<string, string> = {
  reader: "bg-slate-100 text-slate-600",
  author: "bg-brand-50 text-brand-700",
  admin: "bg-rose-50 text-rose-700",
};

const VERIFY_LABEL: Record<string, string> = {
  pending: "待审核",
  approved: "已实名",
  rejected: "未通过",
};

const VERIFY_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

const WORK_STATUS: Record<string, string> = {
  approved: "已通过",
  pending: "待审",
  rejected: "已驳回",
};

type Filter = "all" | "author" | "reader" | "verified" | "pendingVerify";

export function AdminMemberList({ members }: { members: AdminMember[] }) {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return members.filter((m) => {
      if (filter === "author" && m.workCount === 0) return false;
      if (filter === "reader" && m.workCount > 0) return false;
      if (filter === "verified" && m.verify_status !== "approved") return false;
      if (filter === "pendingVerify" && m.verify_status !== "pending") return false;
      if (!kw) return true;
      const hay = [
        m.username,
        m.email,
        m.real_name,
        m.qq,
        m.contact_phone,
        m.contact_email,
        m.id_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(kw);
    });
  }, [members, keyword, filter]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜笔名 / 邮箱 / 真名 / QQ / 手机号"
          className="input-base sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: "all", label: "全部" },
              { key: "author", label: "有作品的" },
              { key: "reader", label: "纯读者" },
              { key: "verified", label: "已实名" },
              { key: "pendingVerify", label: "待实名审核" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                filter === f.key
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs text-slate-400">
        共 {list.length} 位（全站 {members.length} 位）
      </p>

      <div className="space-y-3">
        {list.map((m) => {
          const open = openId === m.id;
          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt={m.username ?? "头像"}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                    {(m.username ?? m.email ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {m.username ?? "（未设笔名）"}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] ${ROLE_COLOR[m.role] ?? ""}`}
                    >
                      {ROLE_LABEL[m.role] ?? m.role}
                    </span>
                    {m.verify_status && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] ${VERIFY_COLOR[m.verify_status] ?? ""}`}
                      >
                        {VERIFY_LABEL[m.verify_status] ?? m.verify_status}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {m.email ?? "无邮箱"}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                    <span>{m.workCount} 部作品</span>
                    <span className="text-slate-300">|</span>
                    <span>{m.totalViews} 总阅读</span>
                    <span className="text-slate-300">|</span>
                    <span>{m.followerCount} 粉丝</span>
                    <span className="text-slate-300">|</span>
                    <span>关注 {m.followingCount} 人</span>
                    <span className="text-slate-300">|</span>
                    <span>注册 {m.created_at.slice(0, 10)}</span>
                  </p>
                </div>

                <button
                  onClick={() => setOpenId(open ? null : m.id)}
                  className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-400 hover:text-brand-600"
                >
                  {open ? "收起" : "资料"}
                </button>
              </div>

              {open && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                    {[
                      ["真名", m.real_name],
                      ["证件号", m.id_number],
                      ["证件地址", m.id_address],
                      ["QQ", m.qq],
                      ["微信", m.wechat],
                      ["联系邮箱", m.contact_email],
                      ["联系手机", m.contact_phone],
                      ["收货地址", m.shipping_address],
                    ].map(([label, value]) => (
                      <div key={label as string} className="flex gap-2">
                        <dt className="w-16 shrink-0 text-slate-400">
                          {label}
                        </dt>
                        <dd className="min-w-0 break-all text-slate-700">
                          {(value as string) || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-3">
                    <p className="mb-1.5 text-xs text-slate-400">
                      TA 的作品（{m.works.length}）
                    </p>
                    {m.works.length === 0 ? (
                      <p className="text-xs text-slate-400">还没有发布作品</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {m.works.map((w) => (
                          <a
                            key={w.id}
                            href={`/works/${w.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                          >
                            {w.title}
                            <span className="text-slate-400">
                              {WORK_STATUS[w.status] ?? w.status}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            没有符合条件的会员
          </div>
        )}
      </div>
    </div>
  );
}
