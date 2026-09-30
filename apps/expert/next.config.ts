import { resolve } from "node:path"
import createNextIntlPlugin from "next-intl/plugin"
import type { NextConfig } from "next"

/**
 * The translation plugin is what lets `src/modules/i18n/request.ts` resolve a locale per request, so
 * a section can ask for a string instead of holding an English sentence beside its markup. The path
 * is named rather than inferred: the plugin's default candidates are the old `src/i18n/` location,
 * and a request config nothing loads is a locale that silently stops resolving.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/api", "@nivo/i18n", "@nivo/ui", "@starci/grammar"],
    turbopack: {
        root: resolve(import.meta.dirname, "../.."),
    },
    experimental: {
        optimizePackageImports: ["@heroui/react"],
        rootParams: true,
    },
}

export default createNextIntlPlugin("./src/modules/i18n/request.ts")(nextConfig)
