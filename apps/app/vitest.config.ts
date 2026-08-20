import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

/** Workspace lane for `@nivo/app`. The root config owns coverage; this owns the environment. */
export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "src"),
        },
    },
    test: {
        name: "@nivo/app",
        root: import.meta.dirname,
        environment: "jsdom",
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.spec.{ts,tsx}"],
    },
    plugins: [react()],
})
