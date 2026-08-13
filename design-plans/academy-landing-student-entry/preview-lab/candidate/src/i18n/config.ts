/** The locales the candidate ships copy for, mirroring apps/expert. */
export const LOCALES = ["en", "vi"] as const

/** One of them. */
export type Locale = (typeof LOCALES)[number]

/** What an unrecognised segment falls back to. */
export const DEFAULT_LOCALE: Locale = "en"
