"use client"

import { useContext } from "react"
import { AgentOSModuleStudioProjectionContext } from "@/modules/agentos/module-studio-projection"

/** Read the shared studio projection or fail when its owning page boundary is absent. */
export const useAgentOSModuleStudioProjection = () => {
    const projection = useContext(AgentOSModuleStudioProjectionContext)
    if (projection === null) throw new Error("AgentOSModuleStudioProjectionProvider is required")
    return projection
}
