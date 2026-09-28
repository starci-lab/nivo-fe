import { resolve } from "node:path"
import type { NextConfig } from "next"

/**
 * `@nivo/ui` ships TypeScript source rather than a build output, so Next must compile it the same
 * way it compiles this app. That is the price of one shared copy, and it is cheaper than the drift
 * a per-app copy caused.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/ui", "@starci/grammar"],
    turbopack: {
        root: resolve(import.meta.dirname, "../../.."),
    },
    experimental: {
        optimizePackageImports: ["@heroui/react"],
    },
    webpack: (config) => {
        config.resolve.symlinks = false
        return config
    },
}

export default nextConfig
