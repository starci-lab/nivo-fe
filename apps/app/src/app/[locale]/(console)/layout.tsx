"use client"

import type { ComponentProps } from "react"
import { Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { ConsoleLayout } from "@/components/layouts/ConsoleLayout"

interface ConsoleRouteLayoutProps { readonly children: ComponentProps<"div">["children"] }

const ConsoleRoutedBody = ({ children }: ConsoleRouteLayoutProps) => (
    <Tree contract="console-body-main" render={defineContractComponent("console-body-main", {
        page: defineLeafComponent("page", {}, () => children),
    })} />
)

/** Route-group entry for the authenticated Nivo console. */
const ConsoleRouteLayout = ({ children }: ConsoleRouteLayoutProps) => (
    <ConsoleLayout body={ConsoleRoutedBody} bodyProps={{ children }} />
)

export default ConsoleRouteLayout
