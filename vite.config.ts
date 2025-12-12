import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "primereact/utils": "primereact/utils/utils.cjs.js",
    },
  },
  ssr: {
    // Собираем primereact внутрь SSR-бандла, чтобы не оставлять
    // внешние директории и не ловить ERR_UNSUPPORTED_DIR_IMPORT.
    noExternal: ["primereact", "primeicons"],
  },
});
