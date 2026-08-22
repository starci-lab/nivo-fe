"use client"

import { useState } from "react"
import { AgentOSWorkspacePageBase, type AgentOSWorkspacePageState } from "./component"

/** Exact workspace route identity connected by the page. */
export type AgentOSWorkspacePageProps = { readonly workspaceId: string }

/** Own the tab-driven page architecture and delegate the aggregate lifecycle to its connected block. */
export const AgentOSWorkspacePage = ({ workspaceId }: AgentOSWorkspacePageProps) => {
    const [pageState, setPageState] = useState<AgentOSWorkspacePageState>("overview")
    return <AgentOSWorkspacePageBase workspaceId={workspaceId} pageState={pageState} onSelectPageState={setPageState} />
}

/** Source-level tier marker for the connected workspace page. */
export const meta = { shape: "page", world: "connected" } as const
