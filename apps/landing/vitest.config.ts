import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/** Workspace lane for `@nivo/landing`. The root config owns coverage; this owns the environment. */
export default defineConfig({
    test: {
        name: "@nivo/landing",
        root: import.meta.dirname,
        environment: "jsdom",
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.spec.{ts,tsx}"],
    },
    plugins: [react()],
})
