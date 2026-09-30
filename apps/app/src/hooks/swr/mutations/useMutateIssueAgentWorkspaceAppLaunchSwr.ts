import { issueAgentWorkspaceAppLaunch } from "@/modules/api/agentos-workspaces"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_ISSUE_SWR_KEY } from "../swr.shared"

/** Issue one short-lived workspace application launch grant. */
export const useMutateIssueAgentWorkspaceAppLaunchSwr = (workspaceId: string) =>
    useNivoMutation(MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_ISSUE_SWR_KEY(workspaceId), () =>
        issueAgentWorkspaceAppLaunch(workspaceId),
    )
