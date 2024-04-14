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
<<<<<<< HEAD
  output: "server",
  adapter: vercel()
=======
  output: "hybrid",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 8,
    imageService: true,
    devImageService: true,
  }),
>>>>>>> 0c2d0a61c9164fe5918923877d6d9661dc4580e8
});