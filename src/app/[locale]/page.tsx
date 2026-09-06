import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("HomePage");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-foreground/70 text-sm">{t("tagline")}</p>
    </main>
  );
}
