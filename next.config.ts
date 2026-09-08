import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Export estático: `next build` deja en `out/` HTML/CSS/JS servibles por
  // cualquier servidor de ficheros. Sin proceso Node, sin middleware, sin
  // route handlers. El dato del BCE (v3) se resolverá en build, no en runtime.
  output: "export",
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
