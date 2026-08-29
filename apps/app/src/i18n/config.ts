/**
 * The locale vocabulary for the control plane, and NOTHING that only runs on a server.
 *
 * `request.ts` next door reads the request, so it is server-only. The moment a client component
 * imported one constant from it, the whole module would be pulled into the browser bundle and the
 * build would fail at runtime with `tsc` still reporting zero errors. So the names live here, where
 * both sides may read them.
 *
 * Locale routing is owned by `routing.ts` and `navigation.ts`. Keeping only the closed vocabulary
 * here lets server and client code share locale identities without importing either runtime.
 */

/** The locales this app ships copy for. The first is what an unrecognised value falls back to. */
export const LOCALES = ["vi", "en"] as const;

/** One of the locales the app ships. */
export type Locale = (typeof LOCALES)[number];

/** What an unrecognised or absent locale resolves to. */
export const DEFAULT_LOCALE: Locale = "vi";

/**
 * The zone every date on the screen is written in.
 *
 * Fixed rather than inferred. Left unset, next-intl formats on the server in the SERVER's zone and
 * on the client in the READER's, so the same timestamp renders one way and hydrates into another - a
 * markup mismatch React does not patch up, and it takes the handlers on that subtree down with it.
 * The library says so out loud: with no zone configured it reports `ENVIRONMENT_FALLBACK` the first
 * time anything is formatted.
 *
 * It lives beside the locale rather than inside `request.ts` because more than one entry point has
 * to configure the same runtime - the server request config, and any client provider handed a
 * catalogue directly. Two entry points naming the zone independently is exactly the drift this
 * constant exists to prevent.
 */
export const TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Narrow an unknown value to a locale this app actually has messages for.
 *
 * VALIDATED, NEVER TRUSTED. Whatever arrives is a string from outside - a header, a segment, a
 * stored preference - and an unrecognised one reaching the message loader throws on a file that is
 * not there. Falling back is the difference between a reader seeing the default language and a
 * reader seeing a stack trace.
 *
 * @param value - The candidate locale.
 * @returns A locale this app ships.
 */
export const toLocale = (value: unknown): Locale => LOCALES.includes(value as Locale) ? value as Locale : DEFAULT_LOCALE;
