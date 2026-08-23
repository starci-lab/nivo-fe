import type { ReactNode } from "react"
import { Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { ConsoleLayout } from "@/components/layouts/ConsoleLayout"

interface ConsoleRouteLayoutProps { readonly children: ReactNode }

/** Route-group entry for the authenticated Nivo console. */
const ConsoleRouteLayout = ({ children }: ConsoleRouteLayoutProps) => {
    const body = <Tree contract="console-body-main" render={defineContractComponent("console-body-main", {
        page: defineLeafComponent("page", {}, () => children),
    })} />
    return <ConsoleLayout body={body} />
}

export default ConsoleRouteLayout
