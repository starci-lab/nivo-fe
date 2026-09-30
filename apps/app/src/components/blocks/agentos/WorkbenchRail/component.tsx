import type { ReactNode } from "react"
import { SurfaceCard } from "@starci/grammar/common"

/** The shared card frame used by a workbench rail. */
type WorkbenchRailCardProps = {
    readonly props: {
        readonly label: string
        readonly children: ReactNode
    }
}

/** Draw one labelled workbench rail card. */
export const WorkbenchRailCard = (props: WorkbenchRailCardProps) => (
    <SurfaceCard label={props.props.label}>{props.props.children}</SurfaceCard>
)

/** The copy both workbenches share, resolved once by their connected owners. */
export type WorkbenchSharedCopy = { readonly loadMore: string; readonly surfaceUnavailable: string }
