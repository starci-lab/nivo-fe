import { resolve } from "node:path"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

/**
 * `@nivo/ui` ships TypeScript source rather than a build output, so Next must compile it the same
 * way it compiles this app. That is the price of one shared copy, and it is cheaper than the drift
 * a per-app copy caused.
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
}

/*
 * The plugin is what makes `src/modules/i18n/request.ts` run at all: without it `getTranslations`
 * and the client provider resolve against nothing and every key renders as its own name.
 */
export default createNextIntlPlugin("./src/modules/i18n/request.ts")(nextConfig)
