"use client"

import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { NavLink } from "@nivo/ui/leaves/NavLink"
import { DEFAULT_LOCALE } from "@/i18n/config"

/**
 * LAYOUT - the console's standing rail, and which destination is current.
 *
 * IT TAKES NOTHING FROM THE ROUTED BODY. LAYOUT-8 refuses `children` on a component layout, and
 * `sidebar-then-body-app` makes this a SIBLING of the body rather than a wrapper around it: the body
 * is replaced on every press, this is not. A rail that read the page to decide its own shape would
 * make every new page a layout edit.
 *
 * IT RESOLVES ITS OWN DOMAIN. Which destination is current is navigation, and navigation is the
 * chrome's own question, so it reads the path itself rather than being told.
 *
 * IT CARRIES NO COUNT, AND CANNOT. `NavLink` has no count slot and nivo publishes no count query at
 * all - every `my*` query returns a complete set with no `total`, no `cursor` and no `hasMore`. A
 * number here would be one the browser computed over a list this component does not own.
 *
 * IT OWNS NO CLASS. What is fixed-width and what fills is `home-services-account-nav` and its parent
 * `sidebar-then-body-app`; the rail holding its width while the body's blocks arrive comes from
 * `md:[&>*:first-child]:w-72` plus `shrink-0` on the parent entry, never from anything written here.
 *
 * TWO CAPTIONS, AND A KNOWN LIMIT OF THEM. The wallet and support talk ABOUT the four services rather
 * than standing beside them, so each run is introduced by a caption a reader can read. Neither `Text`
 * nor `NavLink` exposes an aria hook, so the grouping is VISUAL: the promise in the entry's `why` is
 * kept by the caption being read, not by list semantics. Real grouping would be two nested labelled
 * `nav` entries, which is a Preview revision rather than an Apply improvisation.
 *
 * ONE FILE RATHER THAN TWO, per SPLIT-6: the split exists because a request exists, and this reads
 * the router rather than the network. `connected-block-has-presentational-twin` scopes to blocks, and
 * a rail whose whole content is seven labels has no settled situation to hand across a seam.
 */

/** The catalogue keys under `console.nav`, one per destination this console can reach. */
export type ConsoleDestinationKey =
    | "overview" | "apps" | "agentos" | "servers" | "domains" | "wallet" | "support"

/** One destination: what it is called, and where it goes when it goes anywhere. */
export interface ConsoleDestination {
    /** The catalogue key for its label. */
    readonly key: ConsoleDestinationKey
    /**
     * The route this destination owns, or null while it owns none.
     *
     * Named `route` rather than `href`, and the rename is the point: a destination held as an `href`
     * is one a pure leaf could follow on its own, and internal navigation belongs to connected code
     * that can decide what a press means. `NavLink` reports a press; this layout calls the router.
     *
     * NULL IS DRAWN RATHER THAN HIDDEN. The three services this case did not ship and the support
     * destination are part of the rail's shape, and a rail that grew an entry per delivery would move
     * every destination each time one arrived. A destination with no route reports no press, because
     * sending it to an address this app does not serve would ship a broken click rather than an
     * honest gap.
     */
    readonly route: string | null
}

/**
 * The rail, in the order the revision fixed it.
 *
 * The home destination stands alone above both runs because it is not a service - which is the
 * correction the whole revision exists to carry. Then the four services, then the two account
 * destinations.
 */
const DESTINATIONS: ReadonlyArray<ConsoleDestination> = [
    { key: "overview", route: "/overview" },
    { key: "apps", route: "/apps" },
    { key: "agentos", route: null },
    { key: "servers", route: null },
    { key: "domains", route: null },
    { key: "wallet", route: "/wallet" },
    { key: "support", route: null },
]

/** The four services, in the order the rail draws them. */
const SERVICE_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["apps", "agentos", "servers", "domains"]

/** The two destinations that talk about the other four. */
const ACCOUNT_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["wallet", "support"]

/**
 * The path with its locale segment removed.
 *
 * WITHOUT THIS THE RAIL LIGHTS NOTHING FOR AN ENGLISH READER. `localePrefix` is `as-needed`, so the
 * default locale keeps the bare path and every other locale carries a segment - `usePathname` from
 * `next/navigation` answers `/en/apps`, and a prefix test against `/apps` is simply false. The
 * comparison is done on the route rather than on the address for that reason.
 *
 * @param pathname - The address being read.
 * @param locale - The locale in force.
 * @returns The route below the locale segment.
 */
const routeOf = (pathname: string, locale: string): string => {
    if (pathname === `/${locale}`) {
        return "/"
    }
    return pathname.startsWith(`/${locale}/`) ? pathname.slice(locale.length + 1) : pathname
}

/**
 * The address a route is reached at in the locale in force.
 *
 * The mirror of {@link routeOf}: the default locale is served without a segment, so pushing one
 * would send the reader through the middleware's redirect on every press.
 *
 * @param route - The route being opened.
 * @param locale - The locale in force.
 * @returns The address to push.
 */
const hrefOf = (route: string, locale: string): string =>
    locale === DEFAULT_LOCALE ? route : `/${locale}${route}`

/**
 * Whether a destination owns the route currently being read.
 *
 * A prefix rather than an exact match, so a destination stays current while the reader is somewhere
 * below it. A destination with no route is never current, because there is nowhere to be.
 *
 * @param destination - The destination being drawn.
 * @param route - The route being read, locale segment already removed.
 * @returns Whether this destination is the current one.
 */
const isCurrentDestination = (destination: ConsoleDestination, route: string): boolean =>
    destination.route !== null && route.startsWith(destination.route)

/**
 * The console's standing rail.
 *
 * @returns The navigation node.
 */
export const ConsoleNav = () => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const route = routeOf(usePathname(), locale)

    const destinationOf = (key: ConsoleDestinationKey) =>
        DESTINATIONS.find((one) => one.key === key) ?? DESTINATIONS[0]

    const link = (key: ConsoleDestinationKey) => {
        const destination = destinationOf(key)
        const target = destination.route
        return defineLeafComponent("nav-link", {}, () => (
            <NavLink
                props={{
                    label: t(`nav.${key}`),
                    kind: "route",
                    /*
                     * ONE FACT, TWO OUTPUTS. `isCurrent` drives the weight a reader sees AND the
                     * `aria-current` a screen reader is told, inside the leaf - so the two cannot
                     * disagree, which is exactly what happens when they are set in two places.
                     */
                    isCurrent: isCurrentDestination(destination, route),
                }}
                on={{ press: target === null ? undefined : () => router.push(hrefOf(target, locale)) }}
            />
        ))
    }

    const caption = (content: string) =>
        defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content, size: "xs", tone: "muted" }} />
        ))

    return (
        <Tree
            contract="home-services-account-nav"
            render={defineContractComponent("home-services-account-nav", {
                brand: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: t("brand"), level: 2 }} />
                )),
                home: link("overview"),
                servicesCaption: caption(t("servicesCaption")),
                service: SERVICE_KEYS.map(link),
                accountCaption: caption(t("accountCaption")),
                account: ACCOUNT_KEYS.map(link),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "layout", world: "connected" } as const
