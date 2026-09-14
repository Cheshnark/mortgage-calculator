import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// GitHub Pages sirve un repositorio de proyecto (no de usuario) bajo
// /<repo>/, no en la raíz del dominio. El servidor propio sí sirve en la
// raíz, así que el basePath solo se activa cuando construye el workflow de
// Pages (`GITHUB_PAGES=true`, ver .github/workflows/deploy-pages.yml). Ver
// docs/deploy.md y decisions.md.
const basePath = process.env.GITHUB_PAGES === "true" ? "/mortgage-calculator" : "";

const nextConfig: NextConfig = {
  // Export estático: `next build` deja en `out/` HTML/CSS/JS servibles por
  // cualquier servidor de ficheros. Sin proceso Node, sin middleware, sin
  // route handlers. El dato del BCE (v3) se resolverá en build, no en runtime.
  output: "export",
  basePath,
  assetPrefix: basePath,
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
