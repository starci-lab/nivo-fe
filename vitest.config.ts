import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

/**
 * ONE run, ONE report.
 *
 * Vitest `projects` keeps five workspaces isolated -- their own roots, their own aliases -- while
 * still being a single invocation that writes a single `coverage/lcov.info`. The alternative
 * shape, `turbo run test` fanning out to four independent Vitest runs, produces four coverage
 * files that Codecov and SonarQube then have to be told how to merge; two dashboards reading two
 * differently-merged numbers is exactly the drift the delivery fence exists to prevent.
 *
 * Every declared project must contribute a real test; an empty project is a gate failure rather
 * than a green placeholder.
 */
export default defineConfig({
    test: {
        projects: ["packages/*/vitest.config.ts", "apps/*/vitest.config.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text-summary", "json-summary", "json", "lcov"],
            reportsDirectory: resolve(import.meta.dirname, "coverage"),
            include: ["packages/*/src/**/*.{ts,tsx}", "apps/*/src/**/*.{ts,tsx}"],
            exclude: ["**/*.d.ts", "**/*.spec.{ts,tsx}", "**/src/messages/**"],
        },
    },
    resolve: {
        alias: {
            "@nivo/api": resolve(import.meta.dirname, "packages/nivo-api/src/index.ts"),
            "@nivo/i18n/app": resolve(import.meta.dirname, "packages/i18n/src/app.ts"),
            "@nivo/i18n/provider": resolve(import.meta.dirname, "packages/i18n/src/provider.tsx"),
            "@nivo/i18n/messages": resolve(import.meta.dirname, "packages/i18n/src/messages.ts"),
            "@nivo/i18n": resolve(import.meta.dirname, "packages/i18n/src/index.ts"),
        },
    },
    plugins: [react()],
})
