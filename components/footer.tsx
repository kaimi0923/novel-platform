import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export async function Footer() {
  const { t } = await getT();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>{t("footer.brand")}</p>
          <p>{t("footer.notice")}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/terms" className="hover:text-brand-600">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-brand-600">
              {t("footer.privacy")}
            </Link>
            <Link href="/copyright" className="hover:text-brand-600">
              {t("footer.copyright")}
            </Link>
          </div>
          <p>{t("footer.ratingNote")}</p>
        </div>
      </div>
    </footer>
  );
}
