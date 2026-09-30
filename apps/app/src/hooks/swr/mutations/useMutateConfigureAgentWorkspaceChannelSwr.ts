

import type { ConfigureAgentWorkspaceChannelMutationVariables } from "@/modules/api/__generated__/core"

import { configureAgentWorkspaceChannel } from "../../../modules/api/agentos-module-runtime"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_WORKSPACE_CHANNEL_SWR_KEY, QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Apply one channel credential set to the exact AgentOS workspace. */
export const useMutateConfigureAgentWorkspaceChannelSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_WORKSPACE_CHANNEL_SWR_KEY(workspaceId),
        (input: ConfigureAgentWorkspaceChannelMutationVariables["input"]) => configureAgentWorkspaceChannel(input),
        {
            // Channel configuration is rendered by the workspace control center as well as by
            // module settings. Keep both surfaces coherent for every consumer of this mutation;
            // callers may still apply an immediate response when they need optimistic UX.
            invalidates: [QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY(workspaceId)],
            shouldInvalidate: accepted,
        },
    )
