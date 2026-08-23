import type { ReactNode } from "react"
import { StarCiDashboardThemeBoundary, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { ConsoleNav } from "@/components/layouts/ConsoleNav"
import { ConsoleTopBar } from "@/components/layouts/ConsoleTopBar"

/** Framework-owned routed body after the route closes it into its main contract. */
export type ConsoleLayoutBaseProps = { readonly body: ReactNode }

/** Draw stable authenticated chrome around one opaque routed page. */
export const ConsoleLayoutBase = ({ body }: ConsoleLayoutBaseProps) => {
    const frame = <Tree contract="console-topbar-over-sidebar-body" render={defineContractComponent("console-topbar-over-sidebar-body", {
        topbar: defineContractProjection("console-global-navbar", () => <ConsoleTopBar />),
        content: defineContractComponent("sidebar-then-body-app", {
            sidebar: defineLeafComponent("collapsible-rail", {}, () => <ConsoleNav />),
            body: defineContractProjection("console-body-main", () => body),
        }),
    })} />
    return <StarCiDashboardThemeBoundary content={frame} />
}

/** Registry identity for the pure console layout twin. */
export const meta = { shape: "layout", world: "pure" } as const
