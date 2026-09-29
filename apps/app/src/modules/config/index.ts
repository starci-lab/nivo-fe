/**
 * Deployment and account facts the console reads but does not decide.
 *
 * A component never reads `process.env` and never spells a currency code: both
 * are one decision with one home, so a new host suffix or a second billing
 * currency is one edit here rather than one edit per block.
 */

/** Host suffix appended to an expert-site slug when it holds no custom domain. */
export const ACADEMY_HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"

/** ISO 4217 code every wallet, invoice and catalogue amount is billed in. */
export const BILLING_CURRENCY = "VND"

/** The core API a developer machine talks to; consulted only when the build is not a production one. */
const DEVELOPMENT_CORE_API_URL = "http://localhost:3068/graphql";

/**
 * Read the core API address once, from the one variable that names it.
 *
 * A production build never guesses: a missing or empty variable stops the build (and any server that
 * starts without it) instead of quietly talking to a developer's `localhost`. The literal
 * `process.env.NEXT_PUBLIC_CORE_API_URL` access is required, because Next only inlines that exact
 * spelling into the client bundle.
 *
 * @param configured - The raw variable, or undefined when unset.
 * @param nodeEnv - The build mode.
 * @returns The GraphQL endpoint of the core API.
 * @throws When the variable is unset in a production build.
 */
export const resolveCoreApiUrl = (configured: string | undefined, nodeEnv: string | undefined): string => {
  if (configured !== undefined && configured.length > 0) return configured;
  if (nodeEnv === "production") {
    throw new Error("NEXT_PUBLIC_CORE_API_URL is not set: a production build must name the core API GraphQL endpoint.");
  }
  return DEVELOPMENT_CORE_API_URL;
};

/** The core API GraphQL endpoint; every route of the core API is resolved against it. */
export const CORE_API_URL = resolveCoreApiUrl(process.env.NEXT_PUBLIC_CORE_API_URL, process.env.NODE_ENV);

/** The core API origin with no path: where the REST routes and the realtime sockets live. */
export const CORE_API_ORIGIN = new URL(CORE_API_URL).origin;

/** The core API endpoint without its `/graphql` suffix: the base of the realtime socket namespaces. */
export const CORE_API_BASE = CORE_API_URL.replace(/\/graphql\/?$/, "");
