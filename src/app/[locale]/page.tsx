import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AmortizationTable } from "@/components/AmortizationTable";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { PaymentSummary } from "@/components/PaymentSummary";
import { SimulatorForm } from "@/components/SimulatorForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("HomePage");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <header className="mb-12 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-ink max-w-[16ch] text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h1>
          <LocaleSwitcher />
        </div>
        <p className="text-muted max-w-[52ch] text-base leading-relaxed text-pretty">
          {t("tagline")}
        </p>
      </header>

      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <section
          aria-labelledby="results-heading"
          className="lg:col-start-2 lg:row-start-1"
        >
          <h2 id="results-heading" className="sr-only">
            {t("resultsHeading")}
          </h2>
          <PaymentSummary />
        </section>

        <section
          aria-labelledby="form-heading"
          className="lg:sticky lg:top-8 lg:col-start-1 lg:row-start-1 lg:self-start"
        >
          <h2
            id="form-heading"
            className="text-ink mb-5 text-lg font-semibold tracking-tight"
          >
            {t("formHeading")}
          </h2>
          <SimulatorForm />
        </section>

        <section className="lg:col-start-2 lg:row-start-2">
          <AmortizationTable />
        </section>
      </div>

      <footer className="border-line text-muted mt-16 max-w-[60ch] border-t pt-6 text-sm leading-relaxed">
        {t("disclaimer")}
      </footer>
    </main>
  );
}
