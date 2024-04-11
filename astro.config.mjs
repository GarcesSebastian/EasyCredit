import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
const PORT = process.env.PORT || 3001;

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  devOptions: {
    port: 3000,
    // Puerto para Astro
    open: true,
    /* ... Otras opciones dev */

    proxy: {
      "/api": `http://localhost:${PORT}` // Utiliza el mismo puerto configurado en tu backend
    }
  },
  output: "server"
}); 