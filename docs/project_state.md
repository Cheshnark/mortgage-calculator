# Estado del proyecto

_Última actualización: 2026-09-06_

## Dónde estamos

Fase cero: entorno preparado, **sin una sola línea de código de aplicación**.

Hecho:

- Repositorio Git propio inicializado (rama `main`).
- Remoto `origin` → `https://github.com/Cheshnark/mortgage-calculator.git`, `main` publicada y sincronizada.
- `.gitignore` de proyecto creado.
- Estructura `docs/` creada con los cinco ficheros obligatorios.

Contexto relevante: antes existía un repositorio Git suelto en `C:\Users\Cheshnark\`
que englobaba toda la carpeta personal. Se investigó (contenía un único commit con un
ejemplo ajeno, `next-example`), se apartó y finalmente se borró. Ahora la política es
**un repositorio por proyecto**.

## Próximos pasos

1. Definir alcance funcional (ver `business.md` — está sin concretar).
2. Decidir React+Vite vs Next.js (ver `decisions.md`).
3. Andamiar el proyecto (`package.json`, Tailwind, Zustand).
4. Configurar Vitest + React Testing Library.
5. Hook de Prettier/ESLint tras cada edición (requiere `package.json`).
