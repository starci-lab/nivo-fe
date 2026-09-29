import { defineRouting } from "next-intl/routing"
import { DEFAULT_LOCALE, LOCALES } from "./config"

/**
 * Which locales are routed, and how they show up in the address.
 *
 * `as-needed`: the default (Vietnamese) locale keeps the bare path, so every address the site has
 * already published - `/company`, `/pricing`, `/ideas/...` - stays where it is, and English lives
 * under `/en/...`. A routed locale is also how a reader chooses: it can be linked and shared.
 */
export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: "as-needed",
})
