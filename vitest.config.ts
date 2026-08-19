import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/**
 * ONE run, ONE report.
 *
 * Vitest `projects` keeps four workspaces isolated -- their own roots, their own aliases -- while
 * still being a single invocation that writes a single `coverage/lcov.info`. The alternative
 * shape, `turbo run test` fanning out to four independent Vitest runs, produces four coverage
 * files that Codecov and SonarQube then have to be told how to merge; two dashboards reading two
 * differently-merged numbers is exactly the drift the delivery fence exists to prevent.
 *
 * The apps are wired but hold no specs yet. `passWithNoTests` is what lets that be honest: the
 * lane runs, reports zero, and nobody has to invent a placeholder assertion to keep CI green.
 */
export default defineConfig({
    test: {
        passWithNoTests: true,
        projects: [
            "packages/*/vitest.config.ts",
            "apps/*/vitest.config.ts",
        ],
        coverage: {
            provider: "v8",
            reporter: ["text-summary", "lcov"],
            reportsDirectory: "coverage",
            include: [
                "packages/*/src/**/*.{ts,tsx}",
                "apps/*/src/**/*.{ts,tsx}",
            ],
            exclude: [
                "**/*.d.ts",
                "**/*.test.{ts,tsx}",
                "**/src/messages/**",
                "**/src/app/**/layout.tsx",
                "**/src/app/**/page.tsx",
            ],
        },
    },
    plugins: [react()],
})
