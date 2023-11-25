import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv, PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { cp } from "node:fs/promises";

const obsidianDev = (): PluginOption => {
  let pluginDirectory: string;

  return {
    name: "copy-to-obsidian",
    async config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), "");

      pluginDirectory = env.OBSIDIAN_PLUGIN_DIRECTORY;
    },
    async closeBundle() {
      if (!pluginDirectory) return;

      const manifest = require(resolve(__dirname, "public/manifest.json"));

      const source = resolve(__dirname, "dist");
      const target = resolve(pluginDirectory, manifest.id);

      await cp(source, target, { recursive: true });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), obsidianDev()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/plugin/main.ts"),
      fileName: "main",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["obsidian"],
      output: {
        assetFileNames: "styles.css",
      },
    },
    watch: {},
  },
});
