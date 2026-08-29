import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "./config";

/**
 * Which locales are routed, and how they show up in the address.
 *
 * `as-needed` RATHER THAN `always`. The default locale keeps the bare path - `/provisioning` stays
 * `/provisioning` in Vietnamese and becomes `/en/provisioning` in English. The alternative would have
 * moved every address this product already published: `/provisioning` shipped, `/sign-in` shipped,
 * and a customer who bookmarked either would land on a 404 the day the prefix became mandatory.
 *
 * WHY THIS APP GETS A ROUTED LOCALE AT ALL, having deliberately not had one. The earlier reading was
 * that a signed-in control plane needs no path segment because nothing here is crawled - true, and
 * beside the point. A routed locale is also how a reader CHOOSES: without a segment the choice has
 * nowhere to live but a cookie, which cannot be linked, cannot be shared with a colleague who reads
 * the other language, and cannot be set by an operator sending somebody a URL.
 *
 * The same shape `apps/expert` already runs, so the workspace has one answer rather than two.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed"
});
