import { myAgentWorkspace } from "@/modules/api/agentos-workspaces"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENT_WORKSPACES_SWR_KEY } from "../swr.shared"

/** Read the signed-in owner's AgentOS workspaces when the consumer needs them. */
export const useQueryMyAgentWorkspacesSwr = (enabled = true) =>
    useNivoQuery(enabled ? QUERY_AGENT_WORKSPACES_SWR_KEY : null, myAgentWorkspace)
