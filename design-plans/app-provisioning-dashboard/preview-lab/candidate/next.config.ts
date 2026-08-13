import type { NextConfig } from "next"

/**
 * The candidate runs the SAME rendering model production will: `@nivo/ui` ships TypeScript source,
 * so Next compiles it exactly as `apps/app/next.config.ts` does. Any other setup here would prove
 * the candidate renders under a compiler that Apply will not use.
 *
 * `output: "export"` is the one deliberate difference. The review chrome loads each state as a
 * static URL in an iframe, and a static export is a build artifact that can be hashed - which is
 * what turns "it executes" from an assertion into evidence.
 */
const nextConfig: NextConfig = {
    transpilePackages: ["@nivo/ui"],
    experimental: {
        optimizePackageImports: ["@heroui/react"],
    },
    output: "export",
    distDir: ".next",
}

/*
 * NO next-intl PLUGIN HERE, AND THAT IS THE SAME DIFFERENCE DECLARED ABOVE. The plugin exists to run
 * `src/i18n/request.ts` per REQUEST, and this build serves no requests - it emits files. Pointing the
 * plugin at the app's config was tried and fails at prerender: `getTranslations` on the server needs
 * a request scope a static export never enters.
 *
 * So the candidate hands the catalogue to the client provider directly. What must not differ is the
 * catalogue itself, and it does not: `providers.tsx` imports the app's own `src/messages/vi.json`,
 * so every word these screenshots seal is a word the app already ships. The mechanism differs
 * because the output format differs; the content is the same file.
 */
export default nextConfig
