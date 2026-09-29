import { defineConfig } from "@playwright/test"

/**
 * The one Playwright config: every `e2e/**\/*.e2e-spec.ts` runs here, one runner. Each suite owns
 * the production server it needs (see e2e/serve-next.ts); `npm run test:e2e` builds first.
 * Suites run serially in one worker because they share loopback ports and fixtures.
 */
export default defineConfig({
    testDir: "./e2e",
    testMatch: "**/*.e2e-spec.ts",
    fullyParallel: false,
    workers: 1,
    timeout: 120_000,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:5070",
        colorScheme: "light",
        reducedMotion: "reduce",
        trace: "retain-on-failure",
    },
})
