import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  if (!env.VITE_API_URL) {
    throw new Error("❌ FATAL ERROR: VITE_API_URL is not defined in .env");
  }

  console.log("✅ [Vite Config] Loaded API URL:", env.VITE_API_URL);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          // If env.VITE_API_URL includes /api (e.g. http://localhost:3500/api),
          // we must strip it for the proxy target, otherwise requests become /api/api/...
          target: env.VITE_API_URL.replace(/\/api$/, ""),
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: env.VITE_API_URL.replace(/\/api$/, ""),
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000, // Increased limit for sanity
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-ui": ["framer-motion", "react-icons", "react-hot-toast"],
            "vendor-utils": [
              "axios",
              "date-fns",
              "lodash.debounce",
              "zod",
              "i18next",
              "react-i18next",
            ],
            "vendor-query": ["@tanstack/react-query"],
          },
        },
      },
    },
  };
});
