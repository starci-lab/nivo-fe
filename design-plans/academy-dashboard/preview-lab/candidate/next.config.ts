import createNextIntlPlugin from "next-intl/plugin"
import type { NextConfig } from "next"

/**
 * The candidate compiles `@nivo/ui` from source exactly as `apps/expert` does. That is the point of
 * a candidate rather than a mock-up: if the shared package cannot be transpiled here, it cannot be
 * transpiled there either, and the phase is supposed to find that out now.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/ui"],
    experimental: { optimizePackageImports: ["@heroui/react"] },
}

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig)
