"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useUrlSync } from "@/store/useUrlSync";

type Status = "idle" | "copied" | "failed";

/**
 * Sincroniza la simulación con la URL y ofrece copiarla.
 *
 * Monta el `useUrlSync` una sola vez en toda la página: es el único punto que
 * escribe en la barra de direcciones.
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
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className="border-line bg-surface hover:border-azulejo hover:text-azulejo rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
      >
        {t("copy")}
      </button>
      <p aria-live="polite" className="text-muted text-sm">
        {status === "copied" ? t("copied") : null}
        {status === "failed" ? t("failed") : null}
      </p>
    </div>
  );
}
