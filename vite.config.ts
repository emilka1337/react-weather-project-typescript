/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Single source of truth for the version: package.json. The manifest's version is rewritten from it
// at build time, so the two can never drift and the Chrome Web Store always sees a real bump.
const pkg = JSON.parse(
    readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf8")
) as { version: string };

// One config, not two: vitest.config.ts used to redeclare the react plugin and would have had to
// redeclare the alias as well. Vitest reads the `test` block from here.
export default defineConfig({
    base: "./",
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: "src/manifest.json",
                    dest: "",
                    transform: (content) =>
                        JSON.stringify(
                            { ...(JSON.parse(content.toString()) as Record<string, unknown>), version: pkg.version },
                            null,
                            4
                        ),
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            // Two entries into one bundle: the popup/Pages HTML, and the background service worker.
            // The worker must land at a stable dist/background.js - the manifest points at it - so it
            // is named without a content hash, while everything else keeps hashed names.
            input: {
                index: fileURLToPath(new URL("./index.html", import.meta.url)),
                background: fileURLToPath(new URL("./src/background.ts", import.meta.url)),
            },
            output: {
                entryFileNames: (chunk) =>
                    chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
            },
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/testing/setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        restoreMocks: true,
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            // background.ts is an entry point wired to chrome.* globals, like main.tsx - its logic
            // lives in tested utils; the glue is covered by the manual Chrome smoke test.
            exclude: ["src/testing/**", "src/**/*.d.ts", "src/main.tsx", "src/background.ts"],
        },
    },
});
