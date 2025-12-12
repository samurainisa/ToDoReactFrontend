import type { Config } from "@react-router/dev/config";

export default {
  // Отключаем SSR: собираем только клиент.
  ssr: false,
} satisfies Config;
