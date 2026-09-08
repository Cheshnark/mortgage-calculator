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

| Necesidad                    | Cómo                                                             |
| ---------------------------- | -------------------------------------------------------------- |
| `/` → idioma por defecto     | `redir / /es 302` (Caddy) / `location = / { return 302 /es; }` |
| `/es` y `/en` sin `.html`    | `try_files {path} {path}.html …`                               |
| 404 con código correcto      | `handle_errors` → `/404.html`                                  |
| Cache de `/_next/static/*`   | `immutable`, un año                                            |
| Cache de HTML                | `max-age=0, must-revalidate`                                   |
| Compresión                   | `encode zstd gzip` (la hace el proxy, no Next)                 |

Sin servidor delante (abrir `out/` con un servidor tonto, GitHub Pages, etc.)
`/` también funciona: `out/index.html` redirige a `/es` por JS al hidratar. El
redirect de servidor solo lo hace además sin depender del cliente.

## i18n sin middleware

Al quitar `src/proxy.ts` se pierde la negociación de idioma por
`Accept-Language` y la cookie `NEXT_LOCALE`. A cambio, `next-intl` funciona en
modo export estático (equivale a `localePrefix: 'always'` +
`localeDetection: false`):

- `src/app/[locale]/layout.tsx` — `generateStaticParams` + `dynamicParams = false`
  + `setRequestLocale`. Prerenderiza `/es` y `/en`; cualquier otro segmento es
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
