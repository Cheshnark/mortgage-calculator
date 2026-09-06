"use client";

import { useTranslations } from "next-intl";
import { CurrencyField } from "./CurrencyField";
import { NumberField } from "./NumberField";
import { useSimulationStore, type RateMode } from "@/store/simulation";

const RATE_MODES: RateMode[] = ["fixed", "variable"];

export function SimulatorForm() {
  const t = useTranslations("Form");
  const { principal, years, rateMode, fixedRate, euribor, spread, set, reset } =
    useSimulationStore();

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <CurrencyField
        id="principal"
        label={t("principal")}
        value={principal}
        onChange={(value) => set("principal", value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="years" className="text-ink text-sm font-medium">
          {t("years")}
        </label>
        <div className="flex items-center gap-4">
          <input
            id="years"
            type="range"
            min={5}
            max={40}
            step={1}
            value={Number.isNaN(years) ? 25 : years}
            onChange={(event) => set("years", event.target.valueAsNumber)}
            className="bg-line accent-azulejo h-1.5 w-full cursor-pointer appearance-none rounded-full"
          />
          <output
            htmlFor="years"
            className="text-ink w-20 shrink-0 text-right text-lg font-semibold tabular-nums"
          >
            {t("yearsValue", { count: years })}
          </output>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-ink mb-2 text-sm font-medium">
          {t("rateMode")}
        </legend>
        <div className="border-line bg-surface grid grid-cols-2 gap-1 rounded-lg border p-1">
          {RATE_MODES.map((mode) => {
            const checked = rateMode === mode;
            return (
              <label
                key={mode}
                className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                  checked
                    ? "bg-azulejo text-on-azulejo"
                    : "text-muted hover:text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="rateMode"
                  value={mode}
                  checked={checked}
                  onChange={() => set("rateMode", mode)}
                  className="sr-only"
                />
                {t(mode)}
              </label>
            );
          })}
        </div>
      </fieldset>

      {rateMode === "fixed" ? (
        <NumberField
          id="fixedRate"
          label={t("fixedRate")}
          value={fixedRate}
          onChange={(value) => set("fixedRate", value)}
          suffix="%"
          min={0}
          step={0.05}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="euribor"
            label={t("euribor")}
            value={euribor}
            onChange={(value) => set("euribor", value)}
            suffix="%"
            step={0.05}
            hint={t("euriborHint")}
          />
          <NumberField
            id="spread"
            label={t("spread")}
            value={spread}
            onChange={(value) => set("spread", value)}
            suffix="%"
            min={0}
            step={0.05}
          />
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        className="text-azulejo hover:text-ink self-start text-sm font-medium underline underline-offset-4"
      >
        {t("reset")}
      </button>
    </form>
  );
}
