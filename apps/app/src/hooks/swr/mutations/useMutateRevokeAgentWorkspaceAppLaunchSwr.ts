import { revokeAgentWorkspaceAppLaunch } from "@/modules/api/agentos-workspaces"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_REVOKE_SWR_KEY } from "../swr.shared"

/** Revoke one exact workspace application launch grant. */
export const useMutateRevokeAgentWorkspaceAppLaunchSwr = (workspaceId: string) =>
    useNivoMutation(MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_REVOKE_SWR_KEY(workspaceId), (launchId: string) =>
        revokeAgentWorkspaceAppLaunch(launchId),
    )
