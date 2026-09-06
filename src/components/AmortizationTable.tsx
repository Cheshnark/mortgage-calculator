"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatEUR } from "@/lib/mortgage/format";
import { useSimulationResult } from "@/store/useSimulationResult";
import styles from "./AmortizationTable.module.css";

export function AmortizationTable() {
  const t = useTranslations("Schedule");
  const locale = useLocale();
  const result = useSimulationResult();
  // Las filas solo se montan al abrir: un préstamo a 40 años son 480 filas.
  const [open, setOpen] = useState(false);

  if (!result) return null;

  const { schedule, crossoverMonth } = result;

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="border-line border-t pt-6"
    >
      <summary className="text-azulejo hover:text-ink cursor-pointer list-none text-base font-semibold">
        {open ? t("hide") : t("show", { months: schedule.rows.length })}
      </summary>

      {open ? (
        <div className={`${styles.wrapper} mt-4`}>
          <table className={styles.table}>
            <caption>
              {crossoverMonth
                ? t("captionWithCrossover", { month: crossoverMonth })
                : t("caption")}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("month")}</th>
                <th scope="col">{t("payment")}</th>
                <th scope="col">{t("interest")}</th>
                <th scope="col">{t("principal")}</th>
                <th scope="col">{t("balance")}</th>
              </tr>
            </thead>
            <tbody>
              {schedule.rows.map((row) => (
                <tr
                  key={row.month}
                  className={
                    row.month === crossoverMonth ? styles.crossover : undefined
                  }
                >
                  <td className={styles.month}>{row.month}</td>
                  <td>{formatEUR(row.payment, locale)}</td>
                  <td className={styles.interest}>
                    {formatEUR(row.interest, locale)}
                  </td>
                  <td className={styles.principal}>
                    {formatEUR(row.principalPaid, locale)}
                  </td>
                  <td>{formatEUR(row.balance, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </details>
  );
}
