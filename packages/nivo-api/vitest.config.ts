import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        name: "@nivo/api",
        root: import.meta.dirname,
        environment: "node",
        globals: true,
        include: ["src/**/*.spec.ts"],
    },
})
