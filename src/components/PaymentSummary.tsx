"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatEUR, formatRate } from "@/lib/mortgage/format";
import { useSimulationResult } from "@/store/useSimulationResult";

export function PaymentSummary() {
  const t = useTranslations("Summary");
  const locale = useLocale();
  const result = useSimulationResult();

  if (!result) {
    return <p className="text-muted text-lg text-balance">{t("empty")}</p>;
  }

  const { schedule, annualRate, crossoverMonth, principal } = result;
  const capitalShare = (principal / schedule.totalPaid) * 100;
  const interestShare = 100 - capitalShare;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted text-sm font-medium">{t("label")}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="text-ink text-6xl font-bold tracking-tighter tabular-nums sm:text-7xl">
            {formatEUR(schedule.payment, locale)}
          </span>
          <span className="text-muted text-lg">{t("perMonth")}</span>
        </p>
        <p className="text-muted mt-2 text-sm">
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
          className="bg-line flex h-3 overflow-hidden rounded-full"
        >
          <div className="bg-azulejo" style={{ width: `${capitalShare}%` }} />
          <div className="bg-ochre" style={{ width: `${interestShare}%` }} />
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-azulejo size-2.5 shrink-0 rounded-full"
            />
            <dt className="text-muted">{t("capital")}</dt>
            <dd className="text-ink font-semibold tabular-nums">
              {formatEUR(principal, locale)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-ochre size-2.5 shrink-0 rounded-full"
            />
            <dt className="text-muted">{t("interest")}</dt>
            <dd className="text-ink font-semibold tabular-nums">
              {formatEUR(schedule.totalInterest, locale)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="text-ink flex flex-col gap-2 text-base leading-relaxed text-pretty">
        <p>
          {t("totalSentence", {
            total: formatEUR(schedule.totalPaid, locale),
            months: result.months,
          })}
        </p>
        {crossoverMonth ? (
          <p className="text-muted">
            {t("crossover", { month: crossoverMonth })}
          </p>
        ) : null}
        <p className="text-muted">
          {t("lastPayment", {
            amount: formatEUR(schedule.lastPayment, locale),
          })}
        </p>
      </div>
    </div>
  );
}
