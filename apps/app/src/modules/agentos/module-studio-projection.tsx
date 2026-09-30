
import type { MyAgentosCustomModuleStudioQuery } from "@/modules/api/__generated__/core"

import { createContext, type ReactNode } from "react"
/** One page-owned studio read shared by sibling connected blocks. */
type AgentOSModuleStudioProjection = {
    readonly studio: NonNullable<MyAgentosCustomModuleStudioQuery["myAgentosCustomModuleStudio"]["data"]> | undefined
    readonly refresh: () => Promise<void>
}

/** Values and content owned by the studio projection boundary. */
type AgentOSModuleStudioProjectionProviderProps = {
    readonly value: AgentOSModuleStudioProjection
    readonly children: ReactNode
}

/** The page-scoped studio projection context consumed by its hook under `src/hooks/agentos`. */
export const AgentOSModuleStudioProjectionContext = createContext<AgentOSModuleStudioProjection | null>(null)

/** Provide one studio query result without coupling lower blocks to a page module. */
export const AgentOSModuleStudioProjectionProvider = (props: AgentOSModuleStudioProjectionProviderProps) => (
    <AgentOSModuleStudioProjectionContext.Provider value={props.value}>
        {props.children}
    </AgentOSModuleStudioProjectionContext.Provider>
)
