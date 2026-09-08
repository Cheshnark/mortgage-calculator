"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useSimulationStore } from "@/store/simulation";
import { toSearchParams } from "@/store/urlState";
import styles from "./LocaleSwitcher.module.css";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const active = useLocale();
  const pathname = usePathname();
  const state = useSimulationStore();

  // Cambiar de idioma no debe perder la simulación en curso.
  const query = Object.fromEntries(toSearchParams(state));

  return (
    <nav
      aria-label={t("label")}
      className={`${styles.nav} flex items-center gap-1`}
    >
      {routing.locales.map((locale) => {
        const current = locale === active;
        return (
          <Link
            key={locale}
            href={{ pathname, query }}
            locale={locale}
            aria-current={current ? "true" : undefined}
            className={`${styles.link} ${
              current ? styles.linkCurrent : styles.linkIdle
            } px-2 py-1`}
          >
            {t(locale)}
          </Link>
        );
      })}
    </nav>
  );
}
