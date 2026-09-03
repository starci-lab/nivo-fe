import { oauthRedirectUrl, type OauthProvider } from "@/modules/api/auth";

/**
 * The provider hand-off: the address a reader leaves through, and the memory of who they left with.
 *
 * NEITHER OF THESE IS TRANSPORT. One builds a URL and the other writes a browser storage key;
 * nothing here opens a request, so neither belongs in the hooks' internal transport folder, whose
 * job is to own network effects. They lived there only because `useOauthReturnExchange` reads the
 * remembered provider, and that one shared constant dragged two plain functions across a boundary
 * they never needed.
 *
 * A CONNECTED COMPONENT REACHES DATA THROUGH ONE DOOR, `@/hooks`, and that barrel names hooks only.
 * So a page that both starts a provider journey and consumes its result imports the hook from
 * `@/hooks` and these two from here, rather than reaching into the transport folder for a helper
 * that happened to be filed beside a hook.
 *
 * THE VERIFIER IS NEVER HERE. The backend mints and holds the PKCE pair for the whole round trip;
 * what this file remembers is only which provider was chosen, which is not a secret and is kept out
 * of the callback URL so the return address stays byte-identical between the leg out and the leg
 * back - Keycloak compares the two.
 */

/** Where the chosen provider is remembered. Session-scoped: it dies with the tab, like the trip. */
const PROVIDER_KEY = "nivo.oauth.provider";

/** The provider assumed when nothing was remembered, so a return leg is never left without one. */
const DEFAULT_PROVIDER: OauthProvider = "google";

/**
 * Remember the OAuth provider for the return leg without placing it in the callback URL.
 *
 * @param provider - The provider the reader chose.
 */
export const rememberOauthProvider = (provider: OauthProvider) => {
  try {
    window.sessionStorage.setItem(PROVIDER_KEY, provider);
  } catch {
    // Storage can be unavailable; the return leg safely falls back to the default provider.
  }
};

/**
 * Read the remembered provider once and forget it, so a reload cannot replay a spent trip.
 *
 * @returns The remembered provider, or the default when nothing was kept.
 */
export const takeOauthProvider = (): OauthProvider => {
  try {
    const remembered = window.sessionStorage.getItem(PROVIDER_KEY);
    window.sessionStorage.removeItem(PROVIDER_KEY);
    return remembered === "github" ? "github" : DEFAULT_PROVIDER;
  } catch {
    return DEFAULT_PROVIDER;
  }
};

/**
 * Build the backend-owned provider hand-off URL from the authentication boundary.
 *
 * @param provider - The provider the reader chose.
 * @param returnTo - The address the backend sends the reader back to, query and hash dropped.
 * @returns The absolute URL to navigate away to.
 */
export const authenticationOauthRedirectUrl = (provider: OauthProvider, returnTo: string) => oauthRedirectUrl(provider, returnTo);
