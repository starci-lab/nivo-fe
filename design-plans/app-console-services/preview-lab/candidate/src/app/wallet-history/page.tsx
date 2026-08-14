import { ConsoleNav } from "@/components/layouts/ConsoleNav"
import { WalletPage } from "@/components/pages/WalletPage"
import { Tree } from "@/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/contracts/props"

/**
 * The wallet with its movements and its invoices under the balance.
 *
 * This is the first screen that draws `labelled-fact-stack` and `label-value-row` in anger -
 * both are callerless in shipped source and alive only through the child-slot exemption.
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
 * TARGET: `apps/app/src/app/[locale]/wallet/page.tsx`.
 *
 * @returns The route.
 */
const WalletHistoryRoute = () => (
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
                page: defineLeafComponent("page", {}, () => <WalletPage state="history" />),
            }),
        })}
    />
)

export default WalletHistoryRoute
