import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

const PORT = process.env.PORT || 3001;

export default defineConfig({
  integrations: [tailwind()],

  devOptions: {
    port: 3000, // Puerto para Astro
    open: true,
    /* ... Otras opciones dev */

    proxy: {
      "/api": `http://localhost:${PORT}`, // Utiliza el mismo puerto configurado en tu backend
    },
  },
});
