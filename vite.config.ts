import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts", // Точка входа в ваш пакет
      name: "sqljs-manager", // Глобальное имя, если используется UMD
      fileName: (format) => `sqljs-manager.${format}.js`, // Имена файлов
      formats: ["es", "cjs"], // Форматы сборки: ESM и CommonJS
    },
    rollupOptions: {
      external: ["sql.js"], // Укажите внешние зависимости
      output: {
        globals: {
          "sql.js": "initSqlJs", // Глобальная переменная для UMD
        },
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true, // Генерация `index.d.ts` в папке сборки
    }),
  ],
});
