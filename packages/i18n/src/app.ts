import { createI18nConfig, type I18nSettings } from "./config"
import { createLocalizeHref, createNavigation } from "./navigation"
import { createRouting } from "./routing"

/** Build the complete locale configuration shared by one Next app's i18n entry point. It stays free of `next/root-params`, so the proxy and every client bundle may import it; the request config (which reads root params) is built by the app's own `request.ts` with `createRequestConfig`. */
export const createAppI18n = <const Locales extends readonly [string, ...string[]]>(
    settings: I18nSettings<Locales>,
) => {
    const { locales, defaultLocale, timeZone } = settings
    const config = createI18nConfig({ locales, defaultLocale, timeZone })
    const routing = createRouting({ locales, defaultLocale })
    const navigation = createNavigation(routing)
    const localizeHref = createLocalizeHref(navigation.getPathname)

    return {
        ...config,
        routing,
        navigation,
        Link: navigation.Link,
        redirect: navigation.redirect,
        getPathname: navigation.getPathname,
        localizeHref,
    }
}
