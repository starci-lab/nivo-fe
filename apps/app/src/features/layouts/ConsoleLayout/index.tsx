import type { ReactNode } from "react"
import { ConsoleLayout as ConsoleLayoutBlock } from "@/components/blocks/console/ConsoleLayout"

/** Routed content accepted by the console layout. */
export type ConsoleLayoutProps = {
    readonly children: ReactNode
}

/** Compose the interactive authenticated frame below the server route layout. */
export const ConsoleLayout = (props: ConsoleLayoutProps) => <ConsoleLayoutBlock {...props} />

export default ConsoleLayout