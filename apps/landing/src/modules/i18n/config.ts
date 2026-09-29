/**
 * The locale vocabulary for the public site, and NOTHING that only runs on a server.
 *
 * `request.ts` next door reads the request, so it is server-only; the names live here so a client
 * component can read them without pulling the server module into the browser bundle.
 */

/** The locales this site ships copy for. The first is what an unrecognised value falls back to. */
export const LOCALES = ["vi", "en"] as const

/** One of the locales the site ships. */
export type Locale = (typeof LOCALES)[number]

/** What an unrecognised or absent locale resolves to: the site was written in Vietnamese first. */
export const DEFAULT_LOCALE: Locale = "vi"

/**
 * The zone every date on the screen is written in, fixed so server and client format one instant
 * the same way instead of hydrating into a different string.
 */
export const TIME_ZONE = "Asia/Ho_Chi_Minh"

/**
 * Narrow an unknown value to a locale this site actually has messages for.
 *
 * @param value - The candidate locale, a string from outside (a segment, a header).
 * @returns A locale this site ships.
 */
export const toLocale = (value: unknown): Locale => LOCALES.includes(value as Locale) ? value as Locale : DEFAULT_LOCALE
