/**
 * The locale vocabulary, and NOTHING that only runs on a server.
 *
 * `request.ts` reads the cookie, so it imports `next/headers`, so it is server-only. The moment a
 * client component imported one constant from it the whole module would be pulled into the browser
 * bundle, and the build would fail at runtime with `tsc` still reporting zero errors. So the names
 * live here, where both sides may read them, and the reading of the request stays next door.
 */

/** The locales this app ships copy for. The first is what an unrecognised cookie falls back to. */
export const LOCALES = ["en", "vi"] as const;

/** One of the locales the app ships. */
export type Locale = (typeof LOCALES)[number];

/*
 * THE COOKIE CONSTANTS ARE GONE, and their absence is the point.
 *
 * `LOCALE_COOKIE` / `LOCALE_COOKIE_MAX_AGE` described a mechanism only half of which existed:
 * `request.ts` read the cookie and nothing in this app ever wrote one, so a reader had no way to
 * choose a language at all. The locale now lives in the path (`i18n/routing.ts`), and remembering a
 * deliberate choice is `next-intl`'s middleware's job under its own cookie name -- a second name
 * declared here would be one nothing sets and nothing reads.
 */

/**
 * The locale served when the reader has expressed no preference.
 *
 * English, because an academy instance may be provisioned for any market. It is also the locale
 * that keeps the bare path: `routing.ts` uses `as-needed`, so `/` is this one and `/vi` is the
 * other.
 *
 * The academy's OWN words - its name, its tagline, what its sections say - are never translated by
 * this product. It only picks which of the versions the expert authored to show, and this is the
 * one it falls back to when the expert did not write the reader's language.
 */
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Narrow an arbitrary value to a locale the app actually ships.
 *
 * The value is whatever sat in the URL segment, so it is checked rather than trusted: an unknown
 * one resolves to the default instead of reaching the message loader and throwing on a file that
 * does not exist.
 *
 * @param value - The raw cookie value, if there was one.
 * @returns A locale this app ships copy for.
 */
export const toLocale = (value: string | undefined): Locale => LOCALES.includes(value as Locale) ? value as Locale : DEFAULT_LOCALE;
