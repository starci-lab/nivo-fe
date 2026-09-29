import { resolve } from "node:path"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const localePrefixes = [
    { source: "", destination: "" },
    { source: "/vi", destination: "" },
    { source: "/en", destination: "/en" },
] as const

/** Static compatibility paths that must redirect before Next matches their old page files. */
export const legacyRedirects = async () =>
    localePrefixes.flatMap(({ source, destination }) => [
        {
            source: `${source}/apps/new/:templateKey`,
            destination: `${destination}/apps/create/:templateKey`,
            permanent: false,
        },
        {
            source: `${source}/agentos/create`,
            destination: `${destination}/agentos/workspaces/new`,
            permanent: false,
        },
    ])

const nextConfig: NextConfig = {
    output: "standalone",
    outputFileTracingRoot: resolve(import.meta.dirname, "../.."),
    transpilePackages: ["@nivo/i18n", "@nivo/ui", "@starci/grammar"],
    turbopack: {
        root: resolve(import.meta.dirname, "../.."),
    },
    experimental: {
        optimizePackageImports: ["@heroui/react"],
        rootParams: true,
    },
    redirects: legacyRedirects,
}

/*
 * The plugin is what makes `src/modules/i18n/request.ts` run at all: without it `getTranslations`
 * and the client provider resolve against nothing and every key renders as its own name. It is
 * wired here rather than left to a convention because a missing catalogue does not fail the build -
 * it ships a screen whose every label is a dotted path.
 */
export default createNextIntlPlugin("./src/modules/i18n/request.ts")(nextConfig)
