import { createRouting } from "@nivo/i18n/routing"
import { DEFAULT_LOCALE, LOCALES } from "./config"

export const routing = createRouting({ locales: LOCALES, defaultLocale: DEFAULT_LOCALE })
