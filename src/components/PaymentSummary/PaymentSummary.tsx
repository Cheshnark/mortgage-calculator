"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatEUR, formatRate } from "@/lib/mortgage/format";
import { useSimulationResult } from "@/store/useSimulationResult";
import styles from "./PaymentSummary.module.css";

export function PaymentSummary() {
  const t = useTranslations("Summary");
  const locale = useLocale();
  const result = useSimulationResult();

  if (!result) {
    return <p className={styles.empty}>{t("empty")}</p>;
  }

  const { schedule, annualRate, crossoverMonth, principal } = result;
  const capitalShare = (principal / schedule.totalPaid) * 100;
  const interestShare = 100 - capitalShare;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className={styles.label}>{t("label")}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className={styles.amount}>
            {formatEUR(schedule.payment, locale)}
          </span>
          <span className={styles.perMonth}>{t("perMonth")}</span>
        </p>
        <p className={`${styles.rate} mt-2`}>
          {t("rateApplied", { rate: formatRate(annualRate, locale) })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div
          role="img"
          aria-label={t("barLabel", {
            capital: Math.round(capitalShare),
            interest: Math.round(interestShare),
          })}
          className={`${styles.bar} flex h-3 overflow-hidden`}
        >
          <div
            className={styles.barCapital}
            style={{ width: `${capitalShare}%` }}
          />
          <div
            className={styles.barInterest}
            style={{ width: `${interestShare}%` }}
          />
        </div>

        <dl className={`${styles.legend} flex flex-wrap gap-x-8 gap-y-2`}>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`${styles.dotCapital} size-2.5 shrink-0`}
            />
            <dt className={styles.term}>{t("capital")}</dt>
            <dd className={styles.value}>{formatEUR(principal, locale)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`${styles.dotInterest} size-2.5 shrink-0`}
            />
            <dt className={styles.term}>{t("interest")}</dt>
            <dd className={styles.value}>
              {formatEUR(schedule.totalInterest, locale)}
            </dd>
          </div>
        </dl>
      </div>

      <div className={`${styles.prose} flex flex-col gap-2`}>
        <p>
          {t("totalSentence", {
            total: formatEUR(schedule.totalPaid, locale),
            months: result.months,
          })}
        </p>
        {crossoverMonth ? (
          <p className={styles.subtle}>
            {t("crossover", { month: crossoverMonth })}
          </p>
        ) : null}
        <p className={styles.subtle}>
          {t("lastPayment", {
            amount: formatEUR(schedule.lastPayment, locale),
          })}
        </p>
      </div>
    </div>
  );
}
