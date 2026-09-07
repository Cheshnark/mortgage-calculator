"use client";

import { useTranslations } from "next-intl";
import { CheckboxField } from "./CheckboxField";
import { CurrencyField } from "./CurrencyField";
import { NumberField } from "./NumberField";
import { SegmentedField } from "./SegmentedField";
import { SelectField } from "./SelectField";
import { SliderField } from "./SliderField";
import { REGIONS } from "@/data/taxes/regions";
import type { PropertyCondition } from "@/lib/mortgage/taxes";
import { useSimulationStore, type RateMode } from "@/store/simulation";

const REGION_OPTIONS = REGIONS.map((region) => ({
  value: region.code,
  // Los nombres de las comunidades son topónimos oficiales: no se traducen.
  label: region.name,
}));

/**
 * Tope del control. El motor admite hasta el 120 %, pero por encima del 110 %
 * no hay producto que se le parezca ni con aval.
 */
const MAX_LTV = 110;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-muted mb-1 text-xs font-semibold tracking-wide uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function SimulatorForm() {
  const t = useTranslations("Form");
  const state = useSimulationStore();
  const { set, reset } = state;

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => event.preventDefault()}
    >
      <Section title={t("sectionProperty")}>
        <CurrencyField
          id="price"
          label={t("price")}
          value={state.price}
          onChange={(value) => set("price", value)}
        />

        <SegmentedField<PropertyCondition>
          name="condition"
          legend={t("condition")}
          value={state.condition}
          onChange={(value) => set("condition", value)}
          options={[
            { value: "used", label: t("used") },
            { value: "new", label: t("new") },
          ]}
        />

        <SelectField
          id="region"
          label={t("region")}
          value={state.regionCode}
          onChange={(value) => set("regionCode", value)}
          options={REGION_OPTIONS}
          hint={t("regionHint")}
        />

        <div className="flex flex-col gap-1.5">
          <CheckboxField
            id="agencyFee"
            label={t("agencyFee")}
            checked={state.agencyFee}
            onChange={(checked) => set("agencyFee", checked)}
            describedBy="agencyFee-hint"
          />
          <p id="agencyFee-hint" className="text-muted text-xs leading-relaxed">
            {t("agencyFeeHint")}
          </p>
        </div>
      </Section>

      <Section title={t("sectionFinancing")}>
        <SliderField
          id="ltv"
          label={t("ltv")}
          value={state.ltv}
          onChange={(value) => set("ltv", value)}
          min={40}
          max={MAX_LTV}
          step={1}
          fallback={80}
          display={t("ltvValue", { value: state.ltv })}
          hint={state.ltv > 100 ? t("ltvAboveHint") : undefined}
        />

        <SliderField
          id="years"
          label={t("years")}
          value={state.years}
          onChange={(value) => set("years", value)}
          min={5}
          max={40}
          fallback={25}
          display={t("yearsValue", { count: state.years })}
        />

        <SegmentedField<RateMode>
          name="rateMode"
          legend={t("rateMode")}
          value={state.rateMode}
          onChange={(value) => set("rateMode", value)}
          options={[
            { value: "fixed", label: t("fixed") },
            { value: "variable", label: t("variable") },
          ]}
        />

        {state.rateMode === "fixed" ? (
          <NumberField
            id="fixedRate"
            label={t("fixedRate")}
            value={state.fixedRate}
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
              value={state.euribor}
              onChange={(value) => set("euribor", value)}
              suffix="%"
              step={0.05}
              hint={t("euriborHint")}
            />
            <NumberField
              id="spread"
              label={t("spread")}
              value={state.spread}
              onChange={(value) => set("spread", value)}
              suffix="%"
              min={0}
              step={0.05}
            />
          </div>
        )}
      </Section>

      <details className="border-line bg-surface group rounded-lg border">
        <summary className="text-ink cursor-pointer list-none px-4 py-3 text-sm font-medium">
          <span className="text-azulejo mr-2 inline-block transition-transform group-open:rotate-90">
            ›
          </span>
          {t("profileSummary")}
        </summary>
        <div className="flex flex-col gap-5 px-4 pt-1 pb-5">
          <p className="text-muted text-xs leading-relaxed">
            {t("profileHint")}
          </p>

          <CurrencyField
            id="savings"
            label={t("savings")}
            value={state.savings}
            onChange={(value) => set("savings", value)}
            placeholder={t("optional")}
            hint={t("savingsHint")}
          />

          <CurrencyField
            id="appraisalValue"
            label={t("appraisal")}
            value={state.appraisalValue}
            onChange={(value) => set("appraisalValue", value)}
            placeholder={t("optional")}
            hint={t("appraisalHint")}
          />

          <NumberField
            id="age"
            label={t("age")}
            value={state.age}
            onChange={(value) => set("age", value)}
            min={18}
            max={99}
            step={1}
          />

          <fieldset className="flex flex-col gap-3">
            <legend className="text-ink mb-2 text-sm font-medium">
              {t("buyerProfile")}
            </legend>
            <CheckboxField
              id="firstHome"
              label={t("firstHome")}
              checked={state.firstHome}
              onChange={(checked) => set("firstHome", checked)}
            />
            <CheckboxField
              id="primaryResidence"
              label={t("primaryResidence")}
              checked={state.primaryResidence}
              onChange={(checked) => set("primaryResidence", checked)}
            />
            <CheckboxField
              id="largeFamily"
              label={t("largeFamily")}
              checked={state.largeFamily}
              onChange={(checked) => set("largeFamily", checked)}
            />
            <CheckboxField
              id="disability"
              label={t("disability")}
              checked={state.disability}
              onChange={(checked) => set("disability", checked)}
            />
          </fieldset>
        </div>
      </details>

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
