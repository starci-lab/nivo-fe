"use client"
import { myAgentWorkspaceControlCenter } from "@/modules/api/agentos-workspaces"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY } from "../swr.shared"

/** AgentOS workspace and module reads. */
export const useQueryMyAgentWorkspaceControlCenterSwr = (workspaceId: string, enabled = true) =>
    useNivoQuery(enabled ? QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY(workspaceId) : null, () =>
        myAgentWorkspaceControlCenter(workspaceId),
    )
