import { defineConfig } from "@playwright/test"

/**
 * The one Playwright config: every `e2e/**\/*.e2e-spec.ts` runs here, one runner. Each suite owns
 * the production server it needs (see e2e/support/serve-next.ts); `npm run test:e2e` builds first.
 * Suites run serially in one worker because they share loopback ports and fixtures.
 *
 * The three projects are the ui-screen record viewports. Specs that size their own browser
 * contexts read the running project's viewport instead of pinning one.
 */
export default defineConfig({
    testDir: "./e2e",
    testMatch: "**/*.e2e-spec.ts",
    fullyParallel: false,
    workers: 1,
    timeout: 120_000,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:5067",
        colorScheme: "light",
        contextOptions: { reducedMotion: "reduce" },
        trace: "retain-on-failure",
    },
    projects: [
        { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
        { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
        { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    ],
})
