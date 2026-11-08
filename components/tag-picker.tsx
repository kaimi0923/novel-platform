"use client";

import { useState } from "react";
import { TAG_GROUPS } from "@/lib/constants";

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

const MAX_PER_GROUP = 3;

export function TagPicker({ value, onChange }: TagPickerProps) {
  const [message, setMessage] = useState("");

  function toggle(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
      setMessage("");
      return;
    }
    const group = TAG_GROUPS.find((g) => g.tags.includes(tag));
    if (!group) return;
    const groupCount = value.filter((t) => group.tags.includes(t)).length;
    if (groupCount >= MAX_PER_GROUP) {
      setMessage(`「${group.name}」型別最多選 ${MAX_PER_GROUP} 個標籤`);
      return;
    }
    onChange([...value, tag]);
    setMessage("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">每個型別下可選 1-3 個標籤</p>
        <p className="text-xs font-medium text-brand-600">
          已選 {value.length} 個
        </p>
      </div>

      {TAG_GROUPS.map((group) => {
        const selected = value.filter((t) => group.tags.includes(t));
        return (
          <div key={group.name}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {group.name}
              </span>
              <span className={`text-xs ${selected.length >= MAX_PER_GROUP ? "text-amber-600" : "text-slate-400"}`}>
                {selected.length}/{MAX_PER_GROUP}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const active = value.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle(tag)}
                    className={
                      active
                        ? "rounded-full bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
                        : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-brand-400 hover:text-brand-600"
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {message && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {message}
        </p>
      )}
    </div>
  );
}
