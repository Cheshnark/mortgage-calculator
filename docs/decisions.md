# Decisiones técnicas

## 2026-09-06 · Un repositorio Git por proyecto

**Decisión:** cada proyecto tiene su propio `.git`. Se eliminó el repositorio que
existía en `C:\Users\Cheshnark\`.

**Motivo:** ese repositorio tenía como raíz la carpeta personal completa, con un
remoto apuntando a un proyecto ajeno (`next-auth.git`). Cualquier `git add -A` habría
preparado para commit `.ssh/`, `.aws/`, `.claude.json` y el historial de shell. Un
commit automático ahí habría publicado credenciales.

## 2026-09-06 · `.gitignore` global además del de proyecto

**Decisión:** `~/.gitignore_global` activado con `git config --global core.excludesfile`,
ignorando `.env*`, claves y credenciales en **todos** los repositorios.

**Motivo:** el `.gitignore` de proyecto protege solo ese proyecto y solo si alguien se
acuerda de crearlo. El global cubre también los repos que se creen con prisa.

## 2026-09-06 · Sin commit+push automático por turno

**Decisión:** descartado el hook `Stop` que hacía commit y push tras cada respuesta.
En su lugar, commit al cerrar cada tarea relevante.

**Motivo:** un hook por turno publica trabajo a medias y genera un historial ilegible.
El beneficio (no perder trabajo) no compensa publicar sin revisar.

## Abierta · React + Vite vs Next.js

**Estado:** sin decidir.

A favor de **Vite**: la calculadora es cálculo de cliente, no necesita servidor ni SSR.
Más simple y más rápido de arrancar.

A favor de **Next.js**: si la calculadora es pública y busca posicionamiento (SEO), o si
más adelante necesita un back ligero (guardar simulaciones, envío de email).

**Depende de** cerrar `business.md`.
