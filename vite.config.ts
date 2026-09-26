import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vitest/config";

// Single source of truth for the version: package.json. The manifest's version is rewritten from it
// at build time, so the two can never drift and the Chrome Web Store always sees a real bump.
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf8")) as {
    version: string;
};

// One config, not two: Vitest reads the `test` block from here, with the same plugins and resolve.
export default defineConfig({
    base: "./",
    plugins: [
        react(),
        // React Compiler memoizes components and hooks at build time, so the code carries no
        // React.memo / useMemo / useCallback for performance. Babel is here only for the compiler:
        // JSX, TypeScript and Fast Refresh are Oxc's job. (plugin-react's own `compiler` option is
        // still experimental; this is the stable path.)
        babel({ presets: [reactCompilerPreset()] }),
        viteStaticCopy({
            targets: [
                {
                    src: "src/manifest.json",
                    dest: "",
                    // v4 always preserves the source directory structure; strip it so the
                    // manifest lands at the dist/ root, where Chrome looks for it.
                    rename: { stripBase: true },
                    transform: (content) =>
                        JSON.stringify(
                            { ...(JSON.parse(content) as Record<string, unknown>), version: pkg.version },
                            null,
                            4,
                        ),
                },
            ],
        }),
    ],
    resolve: {
        // The `@/*` alias lives only in tsconfig.app.json `paths`; Vite resolves it from there.
        tsconfigPaths: true,
    },
    build: {
        rolldownOptions: {
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
            // Thresholds so coverage can't silently erode, a little under the current numbers to
            // leave headroom; `npm run coverage` (and CI) fail below these. Branches/statements read
            // lower than lines because the tests run the React-Compiler output (what ships): its
            // memo-cache "unchanged" paths only execute on a re-render with equal inputs.
            thresholds: {
                lines: 97,
                functions: 97,
                branches: 88,
                statements: 94,
            },
        },
    },
});
