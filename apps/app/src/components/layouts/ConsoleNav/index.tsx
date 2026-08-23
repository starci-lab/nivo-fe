"use client"

import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { ConsoleNavBase, type ConsoleDestinationKey, type ConsoleNavMode } from "./component"

export type { ConsoleDestinationKey, ConsoleNavMode } from "./component"
/** Optional presentation selected by a console shell consumer. */
export interface ConsoleNavProps { readonly mode?: ConsoleNavMode }
interface ConsoleDestination { readonly key: ConsoleDestinationKey, readonly route: string | null }

const DESTINATIONS: ReadonlyArray<ConsoleDestination> = [
    { key: "overview", route: "/overview" }, { key: "apps", route: "/apps" },
    { key: "agentos", route: "/agentos" }, { key: "servers", route: null },
    { key: "domains", route: null }, { key: "wallet", route: "/wallet" }, { key: "support", route: null },
]

const routeOf = (pathname: string, locale: string): string => pathname === `/${locale}` ? "/" : pathname.startsWith(`/${locale}/`) ? pathname.slice(locale.length + 1) : pathname
const hrefOf = (route: string, locale: string): string => locale === DEFAULT_LOCALE ? route : `/${locale}${route}`

/** Connect current route and locale-aware navigation to the pure console destination owner. */
export const ConsoleNav = ({ mode = "desktop" }: ConsoleNavProps) => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const route = routeOf(usePathname(), locale)
    const selectedKey = DESTINATIONS.find((destination) => destination.route !== null && route.startsWith(destination.route))?.key ?? "overview"
    const activate = (key: ConsoleDestinationKey) => {
        const destination = DESTINATIONS.find((candidate) => candidate.key === key)
        if (destination?.route !== null && destination?.route !== undefined) router.push(hrefOf(destination.route, locale))
    }
    return <ConsoleNavBase
        mode={mode}
        selectedKey={selectedKey}
        labels={{
            navigation: t("navigationLabel"), openMenu: t("openMenu"), closeMenu: t("closeMenu"),
            title: t("title"), services: t("servicesCaption"), account: t("accountCaption"), unavailable: t("unavailable"),
            destinations: {
                overview: t("nav.overview"), apps: t("nav.apps"), agentos: t("nav.agentos"),
                servers: t("nav.servers"), domains: t("nav.domains"), wallet: t("nav.wallet"), support: t("nav.support"),
            },
        }}
        onActivate={activate}
    />
}

/** Registry identity for the connected console navigation twin. */
export const meta = { shape: "layout", world: "connected" } as const
