import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

/** Workspace lane for `@nivo/app`. The root config owns coverage; this owns the environment. */
export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "src"),
            // next-intl imports the package subpath without an extension; Node's ESM runner used
            // by Vitest needs the concrete compatibility entry while Next resolves it itself.
            "next/navigation": resolve(import.meta.dirname, "../../node_modules/next/navigation.js"),
        },
    },
    test: {
        name: "@nivo/app",
        root: import.meta.dirname,
        server: { deps: { inline: ["next-intl"] } },
        environment: "jsdom",
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.spec.{ts,tsx}"],
    },
    plugins: [react()],
})