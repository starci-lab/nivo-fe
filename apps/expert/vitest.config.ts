import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { createRequire } from "node:module"
import { resolve } from "node:path"

const require = createRequire(import.meta.url)

/** Workspace lane for `@nivo/expert`. The root config owns coverage; this owns the environment. */
export default defineConfig({
    test: {
        name: "@nivo/expert",
        root: import.meta.dirname,
        environment: "jsdom",
        // The real catalog every spec render is wrapped in - see the root vitest.setup.ts.
        env: { NIVO_MESSAGES_DIR: resolve(import.meta.dirname, "src/messages") },
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.spec.{ts,tsx}"],
        server: {
            deps: {
                inline: [
                    "next-intl",
                    /[\\/]node_modules[\\/]@starci[\\/]grammar[\\/]/,
                    /[\\/]starci-academy-fe[\\/]packages[\\/]grammar[\\/]/,
                ],
            },
        },
    },
    resolve: {
        dedupe: ["react", "react-dom", "@heroui/react", "@heroui/styles"],
        alias: {
            "@": resolve(import.meta.dirname, "src"),
            // next-intl imports the package subpath without an extension; Node's ESM runner used
            // by Vitest needs the concrete compatibility entry while Next resolves it itself.
            "next/navigation": require.resolve("next/navigation"),
        },
    },
    plugins: [react()],
})
