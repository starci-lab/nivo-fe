import { ConsoleNav } from "@/components/layouts/ConsoleNav"
import { AppsPage } from "@/components/pages/AppsPage"
import { Tree } from "@/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/contracts/props"

/**
 * The app set when the read was refused.
 *
 * A RECORDED GAP RATHER THAN AN INVENTED EXCEPTION. The plan record marks this state REQUIRED,
 * and no query this level reads can throw - `myExpertSites`, `catalogItems` and
 * `myCatalogOrders` are plain finds. So the section draws the GENERIC envelope failure with no
 * named code, and the design record carries the question rather than this route justifying
 * itself with an exception the backend does not raise.
 *
 * THE CONSOLE FRAME IS MOUNTED HERE, and the reason is recorded in `app/layout.tsx` beside the
 * composition it hands over: the frame needs the LOCAL contract table, the local `Tree` typed by
 * it and `ConsoleNav`, none of which the document shell may reach. Mounting it in the route is
 * lawful on its own terms - `main-landmark-belongs-to-a-route-file` admits a route `page.tsx`
 * exactly as it admits a layout, because the guarantee is ONE `main` owned by whoever owns the
 * whole screen. At Apply the identical tree moves up to `apps/app/src/app/[locale]/layout.tsx`,
 * where the rail stands while a client-routed body is replaced underneath it - a claim a static
 * export cannot show either way, and which the entry's own `why` is what actually carries.
 *
 * TARGET: `apps/app/src/app/[locale]/apps/page.tsx`.
 *
 * @returns The route.
 */
const AppsRefusedRoute = () => (
    <Tree
        contract="sidebar-then-body-app"
        render={defineContractComponent("sidebar-then-body-app", {
            /*
             * A PROJECTION RATHER THAN A SLOT RECORD, because `ConsoleNav` draws that whole node
             * itself: which destination is current is navigation, and navigation is the chrome's own
             * domain rather than something this route resolves and hands down.
             */
            sidebar: defineContractProjection("home-services-account-nav", () => <ConsoleNav />),
            body: defineContractComponent("console-body-main", {
                /*
                 * A LEAF, NOT A CONTRACT. The framework boundary hands over an opaque node, so the
                 * entry constrains which ELEMENT the routed body opens - the document's one `main` -
                 * rather than which page renders inside it.
                 */
                page: defineLeafComponent("page", {}, () => <AppsPage state="refused" />),
            }),
        })}
    />
)

export default AppsRefusedRoute
