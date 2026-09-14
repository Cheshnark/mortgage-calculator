# Despliegue

_Última actualización: 2026-09-08_

## Modelo: export estático en servidor propio

`next.config.ts` fija `output: "export"`. `npm run build` deja en `out/` un
sitio de HTML/CSS/JS que sirve **cualquier servidor de ficheros**. No hay
proceso Node, ni middleware, ni route handlers en producción.

Se descartó Vercel: la app es 100 % cálculo en cliente y el único trozo de
servidor era el redirect de idioma. Ver `decisions.md` → _2026-09-08_.

## Construir y publicar

```bash
# En una máquina con Node 22 (idealmente en CI, no en el servidor de prod)
npm ci
npm run build          # genera out/
rsync -az --delete out/ usuario@servidor:/var/www/mortgage-calculator/out/
```

Transferencia de unos pocos MB. Un re-deploy es re-build + rsync; con los
`Cache-Control` del Caddyfile de ejemplo el cambio se ve al instante (el HTML
revalida siempre; los assets llevan hash en el nombre).

**El dato del euríbor (v3) se resolverá en build**, no en runtime: recompilar y
volver a subir es el mecanismo de actualización. Frescura al minuto no es un
requisito (ver `business.md` / `todos.md`).

## Servir

`Caddyfile.example` en la raíz del repo tiene una configuración lista (Caddy,
con TLS automático) y el equivalente en nginx como fragmento. Puntos que el
servidor tiene que cubrir:

| Necesidad                  | Cómo                                                           |
| -------------------------- | -------------------------------------------------------------- |
| `/` → idioma por defecto   | `redir / /es 302` (Caddy) / `location = / { return 302 /es; }` |
| `/es` y `/en` sin `.html`  | `try_files {path} {path}.html …`                               |
| 404 con código correcto    | `handle_errors` → `/404.html`                                  |
| Cache de `/_next/static/*` | `immutable`, un año                                            |
| Cache de HTML              | `max-age=0, must-revalidate`                                   |
| Compresión                 | `encode zstd gzip` (la hace el proxy, no Next)                 |

Sin servidor delante (abrir `out/` con un servidor tonto, GitHub Pages, etc.)
`/` también funciona: `out/index.html` redirige a `/es` por JS al hidratar. El
redirect de servidor solo lo hace además sin depender del cliente.

## i18n sin middleware

Al quitar `src/proxy.ts` se pierde la negociación de idioma por
`Accept-Language` y la cookie `NEXT_LOCALE`. A cambio, `next-intl` funciona en
modo export estático (equivale a `localePrefix: 'always'` +
`localeDetection: false`):

- `src/app/[locale]/layout.tsx` — `generateStaticParams` + `dynamicParams = false`
  - `setRequestLocale`. Prerenderiza `/es` y `/en`; cualquier otro segmento es
  404.
- `src/app/layout.tsx` — layout raíz mínimo (`return children`), solo existe para
  que `/` tenga página.
- `src/app/page.tsx` — `redirect("/es")`. En el export se materializa como
  `out/index.html` con redirección en cliente.
- `src/i18n/request.ts` — sin cambios: `requestLocale` lo alimenta
  `setRequestLocale`.

Volver a meter el middleware más adelante (más idiomas con autodetección,
geo-routing) es re-crear `src/proxy.ts`; `next-intl` soporta los dos modos.
Recuperar `Accept-Language` sin dejar el export estático se podría hacer con un
snippet en el propio servidor (Caddy/nginx) mirando la cabecera antes del
`redir /`.

## CI

`.github/workflows/ci.yml` corre `lint` + `typecheck` + `test` + `build` en cada
push y PR a `main`. El `build` ya valida el export estático. Publicar (rsync al
servidor) todavía es manual; automatizarlo es un paso pendiente (`todos.md`).

## Canal de demo: GitHub Pages

Además del servidor propio (el destino de producción), `main` se publica
también en GitHub Pages para poder enseñar la app sin depender de tener el
servidor aprovisionado. Motivo completo en `decisions.md` → _2026-09-14_.

`.github/workflows/deploy-pages.yml` construye con `next build` y sube `out/`
con `actions/upload-pages-artifact` + `actions/deploy-pages` en cada push a
`main` (y a mano con `workflow_dispatch`). URL:
`https://cheshnark.github.io/mortgage-calculator/`.

Diferencia clave con el servidor propio: un repositorio de proyecto en GitHub
Pages sirve bajo `/<repo>/`, no en la raíz del dominio. `next.config.ts` fija
`basePath`/`assetPrefix` a `/mortgage-calculator` **solo** cuando el build
recibe `GITHUB_PAGES=true` — variable que únicamente pone este workflow. El
build normal (servidor propio, `npm run build` sin esa variable) sigue
sirviendo en la raíz, sin tocar nada.

`public/.nojekyll` evita que GitHub le aplique el procesado de Jekyll al
sitio, que por defecto ignora cualquier carpeta que empiece por `_` (se
comería `_next/`).

**Paso manual de una sola vez** (no hay `gh` CLI en esta máquina para
hacerlo por terminal): en GitHub, `Settings → Pages → Source: GitHub
Actions`, en
`https://github.com/Cheshnark/mortgage-calculator/settings/pages`. Sin esto
activado el workflow corre pero no publica nada.
