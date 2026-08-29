import createNextIntlPlugin from "next-intl/plugin"
import type { NextConfig } from "next"

/**
 * `@nivo/ui` ships TypeScript source rather than a build output, so Next must compile it the same
 * way it compiles this app. That is the price of one shared copy, and it is cheaper than the drift
 * a per-app copy caused.
 *
 * The translation plugin is what lets `src/i18n/request.ts` resolve a locale per request, so a
 * section can ask for a string instead of holding an English sentence beside its markup.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/ui"],
    experimental: {
        optimizePackageImports: ["@heroui/react"],
        rootParams: true,
    },
}

export default createNextIntlPlugin()(nextConfig)