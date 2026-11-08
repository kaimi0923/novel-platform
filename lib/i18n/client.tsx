"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LANG, translate, type Lang } from "./dict";

type TFunc = (key: string, vars?: Record<string, string | number>) => string;

const I18nContext = createContext<{ lang: Lang; t: TFunc }>({
  lang: DEFAULT_LANG,
  t: (key: string) => key,
});

export function I18nProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      lang,
      t: (key: string, vars?: Record<string, string | number>) =>
        translate(lang, key, vars),
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLang() {
  return useContext(I18nContext).lang;
}
