"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatEUR, formatRate } from "@/lib/mortgage/format";
import { useSimulationStore } from "@/store/simulation";
import { usePurchaseResult } from "@/store/usePurchaseResult";
import type { Range } from "@/store/purchase";

/** Una horquilla se enseña como cifra central; los extremos van en letra chica. */
function RangeValue({ range, locale }: { range: Range; locale: string }) {
  const t = useTranslations("Costs");
  const isRange = range.high - range.low > 1;

  return (
    <span className="flex flex-col items-end">
      <span className="text-ink font-semibold tabular-nums">
        {formatEUR(range.amount, locale)}
      </span>
      {isRange ? (
        <span className="text-muted text-xs tabular-nums">
          {t("range", {
            low: formatEUR(range.low, locale),
            high: formatEUR(range.high, locale),
          })}
        </span>
      ) : null}
    </span>
  );
}

export function CostBreakdown() {
  const t = useTranslations("Costs");
  const locale = useLocale();
  const purchase = usePurchaseResult();
  const { price, condition, agencyFee } = useSimulationStore();

  if (!purchase) {
    return <p className="text-muted text-base text-balance">{t("empty")}</p>;
  }

  const { region, taxes, fees, financing, upfrontCosts, savingsNeeded } =
    purchase;
  const costsShare = upfrontCosts.amount / price;
  const reduction = taxes.appliedReduction;
  const reductionSaving = taxes.totalWithoutReduction - taxes.total;
  const appraisalCaps = financing.financingBase < price;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted text-sm font-medium">{t("savingsNeeded")}</p>
        <p className="text-ink mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
          {formatEUR(savingsNeeded.amount, locale)}
        </p>
        <p className="text-muted mt-1.5 text-sm tabular-nums">
          {t("range", {
            low: formatEUR(savingsNeeded.low, locale),
            high: formatEUR(savingsNeeded.high, locale),
          })}
        </p>
        {financing.savingsGap !== null ? (
          <p
            className={`mt-3 text-base font-medium text-pretty ${
              financing.savingsGap < 0 ? "text-ochre-ink" : "text-azulejo"
            }`}
          >
            {financing.savingsGap < 0
              ? t("savingsShort", {
                  amount: formatEUR(-financing.savingsGap, locale),
                })
              : t("savingsEnough", {
                  amount: formatEUR(financing.savingsGap, locale),
                })}
          </p>
        ) : null}
      </div>

      <dl className="border-line grid grid-cols-2 gap-x-6 gap-y-4 border-y py-5 sm:grid-cols-3">
        <div>
          <dt className="text-muted text-sm">{t("price")}</dt>
          <dd className="text-ink text-lg font-semibold tabular-nums">
            {formatEUR(price, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-sm">{t("loan")}</dt>
          <dd className="text-ink text-lg font-semibold tabular-nums">
            {formatEUR(financing.principal, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-sm">{t("downPayment")}</dt>
          <dd className="text-ink text-lg font-semibold tabular-nums">
            {formatEUR(financing.downPayment, locale)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <h3 className="text-ink text-base font-semibold">
          {t("breakdownHeading")}
        </h3>

        <dl className="flex flex-col gap-3 text-sm">
          {taxes.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-muted">
                {t(line.id)}
                <span className="ml-1.5 text-xs tabular-nums">
                  {formatRate(line.effectiveRate, locale)}
                </span>
              </dt>
              <dd className="text-ink font-semibold tabular-nums">
                {formatEUR(line.amount, locale)}
              </dd>
            </div>
          ))}

          {fees.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-start justify-between gap-4"
            >
              <dt className="text-muted pt-0.5">{t(line.id)}</dt>
              <dd>
                <RangeValue range={line} locale={locale} />
              </dd>
            </div>
          ))}

          <div className="border-line flex items-start justify-between gap-4 border-t pt-3">
            <dt className="text-ink pt-0.5 font-semibold">
              {t("total")}
              <span className="text-muted ml-1.5 text-xs font-normal tabular-nums">
                {t("ofPrice", { share: formatRate(costsShare, locale) })}
              </span>
            </dt>
            <dd>
              <RangeValue range={upfrontCosts} locale={locale} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="text-muted flex flex-col gap-2 text-sm leading-relaxed text-pretty">
        {reduction ? (
          <p className="text-azulejo font-medium">
            {t("reductionApplied", {
              rate: formatRate(reduction.rate, locale),
              saving: formatEUR(reductionSaving, locale),
            })}
          </p>
        ) : null}
        {appraisalCaps ? (
          <p>
            {t("appraisalCaps", {
              base: formatEUR(financing.financingBase, locale),
              ltv: formatRate(financing.effectiveLtv, locale),
            })}
          </p>
        ) : null}
        {fees.aboveRegulatedRange ? <p>{t("aboveRegulated")}</p> : null}
        {agencyFee ? <p>{t("agencyNote")}</p> : null}
        {condition === "new" ? <p>{t("newBuildNote")}</p> : null}
        {/* Las notas de la tabla fiscal están redactadas solo en español. */}
        {condition === "new" && region.newBuildNote ? (
          <p lang="es">{region.newBuildNote}</p>
        ) : null}
        {condition === "used" && region.note ? (
          <p lang="es">{region.note}</p>
        ) : null}
        <p>
          {t.rich("source", {
            region: region.name,
            reviewed: region.lastReviewed,
            link: (chunks) => (
              <a
                href={region.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-azulejo underline underline-offset-2"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
