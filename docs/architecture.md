# Arquitectura

## Stack

Decidido:

| Capa | Tecnología |
|---|---|
| UI | React |
| Estilos | Tailwind CSS |
| Estado | Zustand |

Pendiente:

- **React (Vite) vs Next.js** — sin decidir. Ver `decisions.md`.
- **Testing** — previsto Vitest + React Testing Library. Sin instalar.
- **Backend** — no se prevé de momento; el cálculo es de cliente.

## Estructura

Repositorio recién inicializado. Aún no hay código.

```
mortgage-calculator/
├── .gitignore
└── docs/
```

## Dependencias

Ninguna todavía. No existe `package.json`.

## Entorno

- Node.js v20.10.0
- Git con `core.excludesfile` global en `~/.gitignore_global` (ignora `.env*` en todos los repos)
- Trabajo **solo en local**, sin sincronización en la nube
