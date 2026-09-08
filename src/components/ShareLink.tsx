"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useUrlSync } from "@/store/useUrlSync";

type Status = "idle" | "copied" | "failed";

/**
 * Sincroniza la simulación con la URL y ofrece compartirla.
 *
 * Monta el `useUrlSync` una sola vez en toda la página: es el único punto que
 * escribe en la barra de direcciones. Se presenta como un panel destacado
 * porque compartir el enlace es la acción principal de la pantalla de
 * resultados y antes pasaba desapercibida.
 */
export function ShareLink() {
  const t = useTranslations("Share");
  const [status, setStatus] = useState<Status>("idle");

  useUrlSync();

  // La confirmación vuelve a su estado inicial sola.
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      // El portapapeles falla fuera de contexto seguro o sin permiso.
      setStatus("failed");
    }
  }

  return (
    <div className="border-azulejo/30 bg-azulejo-soft flex max-w-md flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="bg-azulejo text-on-azulejo mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          </svg>
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-ink text-sm font-semibold">{t("heading")}</p>
          <p className="text-muted text-sm leading-relaxed text-pretty">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="bg-azulejo text-on-azulejo rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          {t("copy")}
        </button>
        <p aria-live="polite" className="text-muted text-sm">
          {status === "copied" ? t("copied") : null}
          {status === "failed" ? t("failed") : null}
        </p>
      </div>
    </div>
  );
}
