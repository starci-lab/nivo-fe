import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/** Workspace lane for `@nivo/ui`. The root config owns coverage; this owns the environment. */
export default defineConfig({
    resolve: {
        dedupe: ["react", "react-dom", "@heroui/react", "@heroui/styles"],
    },
    test: {
        name: "@nivo/ui",
        root: import.meta.dirname,
        environment: "jsdom",
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.spec.{ts,tsx}"],
        server: {
            deps: {
                inline: [
                    /[\\/]node_modules[\\/]@starci[\\/]grammar[\\/]/,
                    /[\\/]starci-academy-fe[\\/]packages[\\/]grammar[\\/]/,
                ],
            },
        },
    },
    plugins: [react()],
})
