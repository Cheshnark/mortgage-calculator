import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Entorno por defecto: `node`. El motor de cálculo (`src/lib/mortgage/`) es
    // lógica pura y no necesita DOM. Los tests de componentes deben declarar
    // `// @vitest-environment jsdom` al principio del fichero (requiere Node
    // >= 20.19, ver .nvmrc).
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
