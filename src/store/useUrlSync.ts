"use client";

import { useEffect, useRef } from "react";
import { useSimulationStore } from "./simulation";
import { fromSearchParams, toSearchParams } from "./urlState";

/** Margen para no reescribir la URL en cada pulsación mientras se teclea. */
const WRITE_DELAY_MS = 300;

/**
 * Mantiene la query string en sintonía con el estado de la simulación, para
 * poder compartir un enlace con unos valores concretos.
 *
 * Se usa `history.replaceState` en lugar del router de Next a propósito: aquí no
 * hay navegación, solo estamos anotando la URL actual. `router.replace`
 * dispararía un re-render del árbol en cada tecla, y `push` llenaría el
 * historial de entradas basura.
 */
export function useUrlSync(): void {
  const hydrated = useRef(false);

  // Lectura inicial: la URL manda sobre los valores por defecto.
  useEffect(() => {
    const patch = fromSearchParams(new URLSearchParams(window.location.search));
    if (Object.keys(patch).length > 0) {
      useSimulationStore.setState(patch);
    }
    hydrated.current = true;
  }, []);

  // Escritura: solo después de hidratar, para no pisar la URL entrante.
  // Se suscribe al store en vez de leerlo con el hook porque el formulario ya
  // tiene dieciséis campos y enumerarlos aquí otra vez es una fuente de olvidos.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const write = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!hydrated.current) return;
        const query = toSearchParams(useSimulationStore.getState()).toString();
        const { pathname, hash } = window.location;
        window.history.replaceState(
          null,
          "",
          query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`,
        );
      }, WRITE_DELAY_MS);
    };

    const unsubscribe = useSimulationStore.subscribe(write);
    write();

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
