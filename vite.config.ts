import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',    // Входной файл вашего пакета
      name: 'sqljsManager',
      fileName: (format) => `sqljs-manager.${format}.js`,  // Выходные файлы
      formats: ['es', 'cjs'],   // Форматы, которые будут поддерживаться
    },
    rollupOptions: {
      external: ['sql.js'], // Указываем зависимости, которые не включаются в бандл
      output: {
        globals: {
          'sql.js': 'SQL', // Глобальная переменная для sql.js
        },
      },
    },
  },
  plugins: [
    dts({
      skipDiagnostics: false,   // Для генерации dts файлов
    }),
  ],
});
