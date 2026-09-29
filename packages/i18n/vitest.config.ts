import react from "@vitejs/plugin-react"
import { createRequire } from "node:module"
import { defineConfig } from "vitest/config"

const require = createRequire(import.meta.url)

export default defineConfig({
    resolve: {
        dedupe: ["react", "react-dom"],
        alias: { "next/navigation": require.resolve("next/navigation") },
    },
    test: {
        name: "@nivo/i18n",
        root: import.meta.dirname,
        environment: "jsdom",
        globals: true,
        setupFiles: ["../../vitest.setup.ts"],
        include: ["src/**/*.spec.{ts,tsx}"],
    },
    plugins: [react()],
})
