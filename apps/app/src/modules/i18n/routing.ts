import { createRouting } from "@nivo/i18n/routing"
import { DEFAULT_LOCALE, LOCALES } from "./config"

/** The next-intl routing table for this app locales. */
export const routing = createRouting({ locales: LOCALES, defaultLocale: DEFAULT_LOCALE })
