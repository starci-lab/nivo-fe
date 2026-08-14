"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Heading, Text } from "@nivo/ui"
import { NavLink } from "@nivo/ui/leaves/NavLink"
import { Tree } from "@/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/contracts/props"

/**
 * LAYOUT - `layout-console-chrome`: the standing rail, and which destination is current.
 *
 * TARGET PATH: `apps/app/src/components/layouts/ConsoleNav/index.tsx`, mounted once from
 * `apps/app/src/app/[locale]/layout.tsx` as the `sidebar` of `sidebar-then-body-app`.
 *
 * IT TAKES NOTHING FROM THE ROUTED BODY. LAYOUT-8 refuses `children` on a component layout, and the
 * entry above makes this a SIBLING of the body rather than a wrapper around it: the body is replaced
 * on every press, this is not. A rail that read the page to decide its own shape would make every
 * new page a layout edit.
 *
 * IT RESOLVES ITS OWN DOMAIN. Which destination is current is navigation, and navigation is the
 * chrome's own question, so it reads the path itself rather than being told. It is also the one half
 * in this candidate that legitimately calls `useTranslations`: the page tiers below draw a settled
 * situation, this reads the world.
 *
 * IT CARRIES NO COUNT, AND CANNOT. `NavLink` has no count slot and nivo publishes no count query at
 * all - every `my*` query returns a complete set with no `total`, no `cursor` and no `hasMore`. A
 * number here would be one the browser computed over a list this component does not own.
 *
 * IT OWNS NO CLASS. What is fixed-width and what fills is `home-services-account-nav` and its parent
 * `sidebar-then-body-app`; the rail's resting state - holding its width while the body's blocks
 * arrive - comes from `md:[&>*:first-child]:w-72` plus `shrink-0` on the parent entry, never from
 * anything written here.
 *
 * TWO CAPTIONS, AND A KNOWN LIMIT OF THEM. The wallet and support talk ABOUT the four services rather than
 * standing beside them, so each run is introduced by a caption a reader can read. Neither `Text` nor
 * `NavLink` exposes an aria hook, so the grouping is VISUAL: the promise in the entry's `why` is kept
 * by the caption being read, not by list semantics. Real grouping would be two nested labelled `nav`
 * entries, which is a Preview revision rather than an Apply improvisation.
 */

/** The catalogue keys under `console.nav`, one per destination this console can reach. */
export type ConsoleDestinationKey =
    | "overview" | "apps" | "agentos" | "servers" | "domains" | "wallet" | "support"

/** One destination: where it goes in production, and which sealed state stands in for it here. */
export interface ConsoleDestination {
    /** The catalogue key for its label. */
    readonly key: ConsoleDestinationKey
    /**
     * The route this destination owns in production, and the prefix that lights it.
     *
     * Named `route` rather than `href`, and the rename is the point: a destination held as an `href`
     * is one a pure leaf could follow on its own, and internal navigation belongs to connected code
     * that can decide what a press means. `NavLink` reports a press; this layout calls the router.
     */
    readonly route: string
    /**
     * The candidate URL a press opens, or null when this destination has no sealed state.
     *
     * A static export seals a URL rather than a click path, so the third level and the three service
     * pages this revision deferred simply have nowhere to go here. They are drawn and inert rather
     * than hidden: the rail's shape is part of what is being reviewed.
     */
    readonly preview: string | null
}

/**
 * The rail, in the order the revision fixed it.
 *
 * The home destination stands alone above both runs because it is not a service - which is the correction the
 * whole revision exists to carry. Then the four services, then the two account destinations.
 */
const DESTINATIONS: ReadonlyArray<ConsoleDestination> = [
    { key: "overview", route: "/", preview: "/" },
    { key: "apps", route: "/apps", preview: "/apps-listed" },
    { key: "agentos", route: "/agentos", preview: null },
    { key: "servers", route: "/servers", preview: null },
    { key: "domains", route: "/domains", preview: null },
    { key: "wallet", route: "/wallet", preview: "/wallet-balance" },
    { key: "support", route: "/support", preview: null },
]

/** The four services, in the order the rail draws them. */
const SERVICE_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["apps", "agentos", "servers", "domains"]

/** The two destinations that talk about the other four. */
const ACCOUNT_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["wallet", "support"]

/**
 * Whether a destination owns the path currently being read.
 *
 * The home is matched exactly plus the overview's own sealed states, because every one of those is
 * the same destination in a different network state. Everything else matches its own prefix, so
 * `/apps-listed` and `/apps-empty-catalogue` both light the app set rather than leaving the rail with
 * nothing current.
 *
 * @param destination - The destination being drawn.
 * @param pathname - The path being read.
 * @returns Whether this destination is the current one.
 */
const isCurrentDestination = (destination: ConsoleDestination, pathname: string) =>
    destination.route === "/"
        ? pathname === "/" || pathname.startsWith("/overview")
        : pathname.startsWith(destination.route)

/**
 * The console's standing rail.
 *
 * @returns The navigation node.
 */
export const ConsoleNav = () => {
    const t = useTranslations("console")
    const pathname = usePathname()
    const router = useRouter()

    const destinationOf = (key: ConsoleDestinationKey) =>
        DESTINATIONS.find((one) => one.key === key) ?? DESTINATIONS[0]

    const link = (key: ConsoleDestinationKey) => {
        const destination = destinationOf(key)
        const target = destination.preview
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
                    isCurrent: isCurrentDestination(destination, pathname),
                }}
                /*
                 * A destination with no sealed state reports no press. Sending it to a route this
                 * export does not contain would seal a broken click rather than an honest gap.
                 */
                on={{ press: target === null ? undefined : () => router.push(target) }}
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
