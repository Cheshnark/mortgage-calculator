"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatEUR, formatRate } from "@/lib/mortgage/format";
import { useSimulationStore } from "@/store/simulation";
import { usePurchaseResult } from "@/store/usePurchaseResult";
import type { Range } from "@/store/purchase";
import styles from "./CostBreakdown.module.css";

/** Una horquilla se enseña como cifra central; los extremos van en letra chica. */
function RangeValue({ range, locale }: { range: Range; locale: string }) {
  const t = useTranslations("Costs");
  const isRange = range.high - range.low > 1;

  return (
    <span className="flex flex-col items-end">
      <span className={styles.value}>{formatEUR(range.amount, locale)}</span>
      {isRange ? (
        <span className={styles.rangeText}>
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
    return <p className={styles.empty}>{t("empty")}</p>;
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
        <p className={styles.label}>{t("savingsNeeded")}</p>
        <p className={`${styles.savings} mt-1`}>
          {formatEUR(savingsNeeded.amount, locale)}
        </p>
        <p className={`${styles.savingsRange} mt-1.5`}>
          {t("range", {
            low: formatEUR(savingsNeeded.low, locale),
            high: formatEUR(savingsNeeded.high, locale),
          })}
        </p>
        {financing.savingsGap !== null ? (
          <p
            className={`${styles.gap} mt-3 ${
              financing.savingsGap < 0 ? styles.gapShort : styles.gapEnough
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

      <dl
        className={`${styles.stats} grid grid-cols-2 gap-x-6 gap-y-4 py-5 sm:grid-cols-3`}
      >
        <div>
          <dt className={styles.statTerm}>{t("price")}</dt>
          <dd className={styles.statValue}>{formatEUR(price, locale)}</dd>
        </div>
        <div>
          <dt className={styles.statTerm}>{t("loan")}</dt>
          <dd className={styles.statValue}>
            {formatEUR(financing.principal, locale)}
          </dd>
        </div>
        <div>
          <dt className={styles.statTerm}>{t("downPayment")}</dt>
          <dd className={styles.statValue}>
            {formatEUR(financing.downPayment, locale)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <h3 className={styles.heading}>{t("breakdownHeading")}</h3>

        <dl className={`${styles.lines} flex flex-col gap-3`}>
          {taxes.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className={styles.lineTerm}>
                {t(line.id)}
                <span className={`${styles.lineRate} ml-1.5`}>
                  {formatRate(line.effectiveRate, locale)}
                </span>
              </dt>
              <dd className={styles.value}>{formatEUR(line.amount, locale)}</dd>
            </div>
          ))}

          {fees.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-start justify-between gap-4"
            >
              <dt className={`${styles.lineTerm} pt-0.5`}>{t(line.id)}</dt>
              <dd>
                <RangeValue range={line} locale={locale} />
              </dd>
            </div>
          ))}

          <div
            className={`${styles.total} flex items-start justify-between gap-4 pt-3`}
          >
            <dt className={`${styles.totalTerm} pt-0.5`}>
              {t("total")}
              <span className={`${styles.totalShare} ml-1.5`}>
                {t("ofPrice", { share: formatRate(costsShare, locale) })}
              </span>
            </dt>
            <dd>
              <RangeValue range={upfrontCosts} locale={locale} />
            </dd>
          </div>
        </dl>
      </div>

      <div className={`${styles.notes} flex flex-col gap-2`}>
        {reduction ? (
          <p className={styles.noteHighlight}>
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
                className={styles.link}
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
