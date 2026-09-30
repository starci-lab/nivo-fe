import { CORE_API_URL } from "@/modules/config"

/** One identity provider the authentication entry offers. */
export type OauthProvider = "google" | "github"

/**
 * Where a provider hand-off starts.
 *
 * IT IS A NAVIGATION, NOT A REQUEST. The endpoint answers 302 towards Keycloak, and only a top-level
 * navigation may follow that - fetched, the browser would chase the redirect itself as a
 * cross-origin request and the reader would never leave this page.
 *
 * NOTHING SECRET IS BUILT HERE. The verifier and the state are the backend's; this browser hands
 * over one thing, the address it wants the reader returned to.
 *
 * @param provider - Which identity provider to hand off to.
 * @param redirectUri - The page Keycloak returns the reader to. Passed raw, because the backend both
 * forwards it and replays it at the token exchange, and those two must be the same string.
 * @returns The absolute URL to navigate to.
 */
export const oauthRedirectUrl = (provider: OauthProvider, redirectUri: string): string => {
    /*
     * An ABSOLUTE path against the endpoint, so the whole path is replaced rather than appended.
     * `CORE_API_URL` ends in `/graphql`, and concatenating would aim the hand-off at
     * `/graphql/api/v1/...` - a 404 that looks like a broken provider rather than a broken URL.
     */
    const url = new URL(`/api/v1/keycloak/${provider}/redirect`, CORE_API_URL)
    url.searchParams.set("redirect_uri", redirectUri)
    return url.toString()
}
