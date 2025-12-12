import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    // Форсим ESM-версию утилит, иначе SSR может схватить CJS и упасть с exports is not defined.
    alias: {
      "primereact/utils": "primereact/utils/utils.esm.js",
    },
    dedupe: ["react", "react-dom"],
    conditions: ["import", "module", "browser", "default"],
  },
  ssr: {
    // Собираем primereact внутрь SSR-бандла, чтобы не оставлять внешние директории.
    noExternal: ["primereact", "primeicons"],
    resolve: {
      conditions: ["import", "module", "browser", "default"],
    },
  },
  optimizeDeps: {
    include: ["primereact"],
  },
});
