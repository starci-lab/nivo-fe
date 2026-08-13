import { createNavigation } from "next-intl/navigation"
import { DEFAULT_LOCALE, LOCALES } from "./config"

/**
 * NAVIGATION THAT KNOWS WHICH LANGUAGE THE READER IS IN.
 *
 * Every `replace("/dashboard")` in this candidate would otherwise mean exactly
 * `/dashboard`. With the locale in the path it has to mean `/vi/dashboard` for a
 * Vietnamese reader and `/dashboard` for an English one, and the difference
 * cannot be left to each call site: one forgotten prefix drops a reader out of
 * their language mid-journey, and it is invisible until somebody browsing in
 * Vietnamese signs in and lands in English.
 *
 * So the prefixing happens here, once. Call sites keep writing the locale-free
 * path they always wrote.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: "as-needed",
})
