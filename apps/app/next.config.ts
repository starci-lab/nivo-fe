import type { NextConfig } from "next"

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

export default nextConfig
