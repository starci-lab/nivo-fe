import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/** Workspace lane for `@nivo/ui`. The root config owns coverage; this owns the environment. */
export default defineConfig({
    test: {
        name: "@nivo/ui",
        root: import.meta.dirname,
        environment: "jsdom",
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
    },
    plugins: [react()],
})
