/**
 * Deployment facts this app reads but does not decide.
 *
 * A module never reads `process.env` itself: the variable is read here, once, so a missing
 * deployment value stops the build instead of quietly pointing a production site at a laptop.
 */

/** The academy API a developer machine talks to; consulted only when the build is not a production one. */
const DEVELOPMENT_ACADEMY_API_URL = "http://localhost:4068/graphql"

/**
 * Read the academy API address.
 *
 * @param configured - The raw variable, or undefined when unset.
 * @param nodeEnv - The build mode.
 * @returns The GraphQL endpoint of the academy API.
 * @throws When the variable is unset in a production build.
 */
export const resolveAcademyApiUrl = (configured: string | undefined, nodeEnv: string | undefined): string => {
    if (configured !== undefined && configured.length > 0) return configured
    if (nodeEnv === "production") {
        throw new Error("NEXT_PUBLIC_ACADEMY_API_URL is not set: a production build must name the academy API GraphQL endpoint.")
    }
    return DEVELOPMENT_ACADEMY_API_URL
}

/** The academy API GraphQL endpoint. */
export const ACADEMY_API_URL = resolveAcademyApiUrl(process.env.NEXT_PUBLIC_ACADEMY_API_URL, process.env.NODE_ENV)
