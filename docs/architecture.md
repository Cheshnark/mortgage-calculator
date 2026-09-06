# Arquitectura

_Última actualización: 2026-09-06_

## Stack

Decidido (ver motivos en `decisions.md`):

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Lenguaje | TypeScript |
| UI | React |
| Estilos | Tailwind CSS |
| Estado | Zustand |
| i18n | next-intl (ES por defecto, EN) |
| Tests | Vitest + React Testing Library |
| Lint / formato | ESLint + Prettier |

Sin decidir:

- **Despliegue** — probablemente Vercel por afinidad con Next, pero abierto.
- **Estrategia final del euríbor** — *fetch* en build vs `route handler`. Depende de
  si el BCE permite CORS desde el navegador (pendiente de verificar).

Sin backend propio salvo, como mucho, un `route handler` mínimo para el euríbor.
El cálculo es 100 % en cliente.

## Estructura prevista

Aún no hay código. Organización objetivo:

```
mortgage-calculator/
├── .editorconfig
├── .gitattributes
├── .nvmrc                     # línea Node 20 LTS
├── .gitignore
├── docs/
├── public/
├── messages/                  # traducciones next-intl (es.json, en.json)
└── src/
    ├── app/
    │   └── [locale]/          # routing por idioma
    ├── components/            # UI, sin lógica de cálculo
    ├── lib/
    │   └── mortgage/          # MOTOR DE CÁLCULO — funciones puras, sin React
    │       ├── payment.ts     # cuota sistema francés
    │       ├── amortization.ts# cuadro de amortización
    │       ├── taxes.ts       # ITP / IVA+AJD sobre las tablas de src/data
    │       ├── fees.ts        # notaría/registro por aranceles + gestoría/tasación
    │       ├── subsidies.ts   # reglas de aval ICO y avales autonómicos
    │       ├── financing.ts   # escenarios de % financiado / ahorro necesario
    │       └── format.ts      # formateo de importes EUR
    ├── data/                  # TABLAS CURADAS, versionadas, con fuente y fecha
    │   ├── euribor/           # semilla/fallback histórico
    │   ├── taxes/             # ITP/AJD por CCAA y año
    │   ├── fees/              # escalas de aranceles notaría/registro
    │   └── subsidies/         # aval ICO + programas autonómicos
    └── store/                 # Zustand + serialización del estado a la URL
```

Reglas de dependencia:

- `src/lib/mortgage/` **no importa** de `src/app`, `src/components` ni `src/store`.
- `src/lib/mortgage/` puede leer de `src/data/` (datos, no lógica).
- La UI nunca calcula: llama al motor.

## Modelo de datos externos

Patrón común a impuestos, aranceles y ayudas: JSON en `src/data/`, cada entrada con
`sourceUrl` y `lastReviewed`. Sin scraping. Revisión manual periódica. La UI muestra
la fecha de última revisión y un descargo de responsabilidad en las secciones de
v2/v3.

El euríbor es la excepción: valor por defecto traído del **ECB Data Portal**
(serie `FM.M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA`). Siempre editable por el usuario.
Detalle y endpoint en `decisions.md` → "Fuentes de datos externas".

## Dependencias

Ninguna instalada todavía. No existe `package.json`. El andamiaje se hará al cerrar
esta fase de documentación.

## Entorno

- Node.js: línea **20 LTS** (`.nvmrc` = `20`). El equipo actual tiene 20.10.0;
  CI fijará una versión exacta.
- Git con `core.excludesfile` global en `~/.gitignore_global` (ignora `.env*` en
  todos los repos) y `.gitattributes` de proyecto que normaliza finales de línea a
  LF en el repo.
- Trabajo **solo en local**, sin sincronización en la nube más allá de `origin`.
