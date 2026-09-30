import { renewAgentWorkspaceAppLaunch, type RenewedAgentWorkspaceAppLaunch } from "@/modules/api/agentos-workspaces"
import { refreshSession } from "@/modules/api/auth"
import { failed, type Outcome } from "@nivo/api"
import { useSession } from "../../auth/useSession"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_RENEW_SWR_KEY } from "../swr.shared"

/** Refresh the Nivo session and renew one exact workspace launch without exposing transport to UI. */
export const useMutateRenewAgentWorkspaceAppLaunchSwr = (workspaceId: string) => {
    const session = useSession()
    return useNivoMutation(
        MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_RENEW_SWR_KEY(workspaceId),
        async (launchId: string): Promise<Outcome<RenewedAgentWorkspaceAppLaunch>> => {
            const refreshed = await refreshSession()
            if (!refreshed.ok) return refreshed
            if (refreshed.data.accessToken === null || refreshed.data.requiresTwoFactor) {
                return failed("refused", { code: "AUTH_REQUIRED", reason: "session renewal requires authentication" })
            }
            session.adopt(refreshed.data)
            return renewAgentWorkspaceAppLaunch(launchId)
        },
    )
}
