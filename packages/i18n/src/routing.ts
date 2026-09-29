import { defineRouting } from "next-intl/routing"
import type { I18nSettings } from "./config"

/**
 * Build the locale-aware route config used by middleware, navigation, and layouts. The default
 * locale keeps the existing bare path, and other locales receive an explicit path segment.
 */
export const createRouting = <const Locales extends readonly [string, ...string[]]>(
    settings: Pick<I18nSettings<Locales>, "locales" | "defaultLocale">,
) =>
    defineRouting({
        locales: settings.locales,
        defaultLocale: settings.defaultLocale,
        localePrefix: "as-needed",
    })
