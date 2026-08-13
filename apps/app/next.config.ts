import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

/**
 * `@nivo/ui` ships TypeScript source rather than a build output, so Next must compile it the same
 * way it compiles this app. That is the price of one shared copy, and it is cheaper than the drift
 * a per-app copy caused.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/ui"],
    experimental: {
        optimizePackageImports: ["@heroui/react"],
    },
}

/*
 * The plugin is what makes `src/i18n/request.ts` run at all: without it `getTranslations` and the
 * client provider resolve against nothing and every key renders as its own name. It is wired here
 * rather than left to a convention because a missing catalogue does not fail the build - it ships a
 * screen whose every label is a dotted path.
 */
export default createNextIntlPlugin()(nextConfig)
