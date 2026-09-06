"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => {
        const current = locale === active;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            aria-current={current ? "true" : undefined}
            className={
              current
                ? "bg-azulejo-soft text-azulejo rounded-md px-2 py-1 font-semibold"
                : "text-muted hover:text-ink rounded-md px-2 py-1"
            }
          >
            {t(locale)}
          </Link>
        );
      })}
    </nav>
  );
}
