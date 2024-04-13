import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import auth from "auth-astro";
import vercel from "@astrojs/vercel/serverless";
const PORT = process.env.PORT || 4000;

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), auth()],
  devOptions: {
    open: true,
    proxy: {
      "/api": `http://localhost:${PORT}`
    }
  },
  output: "server",
  adapter: vercel()
});