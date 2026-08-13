"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Heading, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { NavLink } from "@nivo/ui/leaves/NavLink"

/**
 * LAYOUT - the console's section list.
 *
 * TARGET PATH: `apps/app/src/components/layouts/ConsoleNav/index.tsx`.
 *
 * IT TAKES NOTHING FROM THE BODY, and that is the whole of what makes it a layout rather than a very
 * large block. LAYOUT-8 refuses `children` on a component layout, and LAYOUT-2 makes it a SIBLING of
 * the routed body: the body is replaced on every link, this is not. A layout that read the page to
 * decide its own shape would make every new page a layout edit (LAYOUT-4).
 *
 * IT RESOLVES ITS OWN DOMAIN. Which section is current is navigation, and navigation is the chrome's
 * own question - so it reads the path itself rather than being told (LAYOUT-3). The same rule is why
 * the section COUNTS will be fetched here when they exist, and never threaded down from a page.
 *
 * THE COUNTS ARE ABSENT ON PURPOSE IN 1.0. `NavLink` has no count slot, and nivo-backend has no
 * count query at all - the plan record proposes `counts-by-status` as an enabler. Drawing a number
 * here now would mean either inventing a slot for a value that cannot be fetched, or counting in the
 * browser over a list this component does not own. The section list is honest without them.
 *
 * IT OWNS NO CLASS. LAYOUT-5: what is pinned and what fills is `sidebar-nav-cluster`, a node with a
 * stated reason, not a string written here.
 */

/** One console destination. */
interface ConsoleSection {
    /**
     * The route this section owns.
     *
     * Named `route` rather than `href`, and the rename is the point rather than a workaround: a
     * destination held as an `href` is one a pure component could follow on its own, and internal
     * navigation belongs to connected code that can decide what a press means. The leaf below reports
     * a press; this layout is what calls `router.push`.
     */
    readonly route: string
    /** The catalogue key for its label. */
    readonly key: "sectionResources" | "sectionDomains" | "sectionBilling"
}

/**
 * The sections this build can reach.
 *
 * ORDER IS THE DESIGN. Resources first because it is what the console is for; money last because a
 * reader goes there deliberately rather than on the way to something else.
 */
const SECTIONS: ReadonlyArray<ConsoleSection> = [
    { route: "/", key: "sectionResources" },
    { route: "/domains", key: "sectionDomains" },
    { route: "/billing", key: "sectionBilling" },
]

/**
 * Whether a section owns the path currently being read.
 *
 * The root is matched exactly. Anything else matches its own prefix, so a resource detail route
 * still lights the section it belongs to rather than leaving the sidebar with nothing current.
 *
 * @param route - The section route.
 * @param pathname - The path being read.
 * @returns Whether this section is the current one.
 */
const isCurrent = (route: string, pathname: string) =>
    route === "/" ? pathname === "/" || pathname.startsWith("/resource") : pathname.startsWith(route)

/**
 * The console's section list.
 *
 * @returns The navigation node.
 */
export const ConsoleNav = () => {
    const t = useTranslations("console")
    const pathname = usePathname()
    const router = useRouter()

    return (
        <Tree
            contract="sidebar-nav-cluster"
            render={defineContractComponent("sidebar-nav-cluster", {
                brand: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: t("brand"), level: 2 }} />
                )),
                link: SECTIONS.map((section) => defineLeafComponent("nav-link", {}, () => (
                    <NavLink
                        props={{
                            label: t(section.key),
                            kind: "route",
                            isCurrent: isCurrent(section.route, pathname),
                        }}
                        /*
                         * A PRESS, NOT AN HREF. The leaf reports the choice and this layout decides
                         * where it goes - which is why the leaf has no destination slot at all: a
                         * primitive that knew about routes would know about this product.
                         */
                        on={{ press: () => router.push(section.route) }}
                    />
                ))),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "layout", world: "connected" } as const
