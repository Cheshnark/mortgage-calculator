"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useUrlSync } from "@/store/useUrlSync";

type Status = "idle" | "copied" | "failed";

/**
 * Sincroniza la simulación con la URL y ofrece compartirla.
 *
 * Monta el `useUrlSync` una sola vez en toda la página: es el único punto que
 * escribe en la barra de direcciones. En reposo es solo un botón; la
 * explicación de qué hace el enlace aparece en un popover al pulsar, para no
 * ocupar sitio de forma permanente.
 */
export function ShareLink() {
  const t = useTranslations("Share");
  const [status, setStatus] = useState<Status>("idle");

  useUrlSync();

  // El popover se cierra solo.
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 3500);
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
    <div className="relative inline-block">
      <button
        type="button"
        onClick={copy}
        className="bg-azulejo text-on-azulejo inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 shrink-0"
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
        {t("label")}
      </button>

      {status !== "idle" ? (
        <div
          role="status"
          className="border-line bg-surface text-ink absolute top-full left-0 z-10 mt-2 w-72 rounded-lg border p-3 text-sm leading-relaxed text-pretty shadow-lg"
        >
          <span
            aria-hidden="true"
            className="border-line bg-surface absolute -top-1.5 left-5 size-3 rotate-45 border-t border-l"
          />
          {status === "copied" ? t("copied") : t("failed")}
        </div>
      ) : null}
    </div>
  );
}
