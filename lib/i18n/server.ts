import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, LANGS, translate, type Lang } from "./dict";

export function normalizeLang(value?: string | null): Lang {
  const hit = LANGS.find((l) => l.code === value);
  return (hit?.code ?? DEFAULT_LANG) as Lang;
}

/** 伺服器端讀取目前語言與翻譯函式 */
export async function getT() {
  const store = await cookies();
  const lang = normalizeLang(store.get(LANG_COOKIE)?.value);
  return {
    lang,
    t: (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
  };
}
