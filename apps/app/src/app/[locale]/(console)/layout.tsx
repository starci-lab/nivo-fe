"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { ConsoleNav } from "@/components/layouts/ConsoleNav"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import type { ReactNode } from "react"

/**
 * The console frame: a standing rail beside a routed body.
 *
 * IT SITS IN A ROUTE GROUP RATHER THAN IN THE ROOT LAYOUT, and the parentheses are load-bearing. The
 * root layout is above every address this app serves, including `/authentication` - a rail drawn
 * there would offer a signed-out reader six destinations they cannot reach. `(console)` adds no
 * segment to any URL and scopes the frame to the destinations that belong inside it.
 *
 * THE RAIL IS A SIBLING OF THE BODY, NEVER ITS PARENT. `sidebar-then-body-app` puts them side by
 * side, so replacing the body on every press cannot take the way back with it, and the rail keeps its
 * own scroll position rather than being remounted by every navigation.
 *
 * THE BODY IS THE DOCUMENT'S ONE MAIN LANDMARK, and it is marked here rather than by each page.
 * `console-body-main` declares `host: "main"`, so the element comes from the entry rather than from a
 * hand-written tag, and the pages below render `titled-section-stack-page`, which declares no host -
 * there is no second landmark to be ambiguous with.
 *
 * THE BODY IS A PROJECTION RATHER THAN A SLOT RECORD, and that is not a workaround. The landmark
 * belongs to whoever composes the whole screen, so the file that owns it should be the file the mark
 * is legible in - written as a slot record the key would appear only inside a builder call, where
 * neither a reader nor `routed-page-is-a-main-landmark` can see which element this layout opens. The
 * projection draws exactly one `console-body-main` node, which is the same node either way.
 *
 * THE FRAMEWORK'S `children` IS CLOSED INTO A LEAF IMMEDIATELY. Next hands over an opaque
 * `ReactNode`, and no `ReactNode` narrows into a `ContractComponent` - so the entry constrains which
 * ELEMENT the routed body opens rather than which page renders inside it.
 */

/** Props for {@link ConsoleLayout}. */
interface ConsoleLayoutProps {
    /** The routed page. */
    readonly children: ReactNode
}

/**
 * The console's chrome, and the routed body beside it.
 *
 * @param input - The rendered route.
 * @returns The frame.
 */
const ConsoleLayout = ({ children }: ConsoleLayoutProps) => {
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const status = session.state.status

    /*
     * A SIGNED-OUT READER IS SENT TO THE DOOR RATHER THAN SHOWN SIX REFUSALS. Every query behind this
     * frame is auth-guarded, so without this the console would paint five sections of
     * "could not be read" at somebody whose actual problem is that they are not signed in.
     *
     * IT WAITS FOR `restoring` TO END. That state is a real answer and not the same as signed out: a
     * redirect on `!signed-in` would bounce every returning reader to the sign-in screen for the
     * length of the refresh round trip.
     */
    useEffect(() => {
        if (status === "anonymous") {
            router.replace(locale === DEFAULT_LOCALE ? "/authentication" : `/${locale}/authentication`)
        }
    }, [status, locale, router])

    return (
        <Tree
            contract="sidebar-then-body-app"
            render={defineContractComponent("sidebar-then-body-app", {
                /*
                 * A PROJECTION RATHER THAN A SLOT RECORD, because `ConsoleNav` draws that whole node
                 * itself: which destination is current is navigation, and navigation is the chrome's
                 * own domain rather than something this layout resolves and hands down.
                 */
                sidebar: defineContractProjection("home-services-account-nav", () => <ConsoleNav />),
                body: defineContractProjection("console-body-main", () => (
                    <Tree
                        contract="console-body-main"
                        render={defineContractComponent("console-body-main", {
                            page: defineLeafComponent("page", {}, () => children),
                        })}
                    />
                )),
                mobileNav: defineContractProjection("console-mobile-tab-bar", () => (
                    <ConsoleNav mode="mobile" />
                )),
            })}
        />
    )
}

export default ConsoleLayout
