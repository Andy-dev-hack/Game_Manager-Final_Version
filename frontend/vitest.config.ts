import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((env) => {
  // Execute viteConfig if it's a function, otherwise use it directly
  const viteConfigResult =
    typeof viteConfig === "function" ? viteConfig(env) : viteConfig;

  return mergeConfig(
    viteConfigResult,
    defineConfig({
      test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/lib/test-setup.ts",
      },
    })
  );
});
