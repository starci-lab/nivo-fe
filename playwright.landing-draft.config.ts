import { defineConfig } from "@playwright/test"

export default defineConfig({
    testDir: "./e2e",
    testMatch: "landing-draft.spec.ts",
    fullyParallel: false,
    workers: 1,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:5070",
        colorScheme: "light",
        reducedMotion: "reduce",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run dev -w @nivo/landing-draft",
        url: "http://127.0.0.1:5070",
        reuseExistingServer: true,
        timeout: 120_000,
    },
})
