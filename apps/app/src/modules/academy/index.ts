/**
 * Academy domain vocabulary shared outside the transport layer.
 *
 * `modules/api/console` owns requests and wire shapes; the custom domain state
 * it reports is a domain fact, so it lives here and the transport file imports
 * it - one home for the closed set, re-exported nowhere.
 */

/** Custom domain state, including the DNS target the customer must publish. */
export type AcademyCustomDomainState = {
  readonly domain: string | null;
  readonly target: string;
  readonly dnsReady: boolean;
  readonly delivery: string;
  readonly detail: string;
};
