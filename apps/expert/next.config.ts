import { resolve } from "node:path"
import createNextIntlPlugin from "next-intl/plugin"
import type { NextConfig } from "next"

/**
 * `@nivo/ui` ships TypeScript source rather than a build output, so Next must compile it the same
 * way it compiles this app. That is the price of one shared copy, and it is cheaper than the drift
 * a per-app copy caused.
 *
 * The translation plugin is what lets `src/modules/i18n/request.ts` resolve a locale per request, so
 * a section can ask for a string instead of holding an English sentence beside its markup. The path
 * is named rather than inferred: the plugin's default candidates are the old `src/i18n/` location,
 * and a request config nothing loads is a locale that silently stops resolving.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/ui", "@starci/grammar"],
    turbopack: {
        root: resolve(import.meta.dirname, "../.."),
    },
    experimental: {
        optimizePackageImports: ["@heroui/react"],
        rootParams: true,
    },
    webpack: (config) => {
        config.resolve.symlinks = false
        return config
    },
}

export default createNextIntlPlugin("./src/modules/i18n/request.ts")(nextConfig)
