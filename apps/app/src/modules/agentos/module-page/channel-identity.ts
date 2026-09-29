import type { AgentWorkspaceControlCenter } from "../../api/agentos-workspaces"
import { nivoQueryPayload, type NivoQueryAnswer } from "../../query"
import type { ModulePageCopy } from "../module-page-copy"

/** The channel state line the shell shows for the installation's connected account. */
export const channelLabelFor = (channelAccountRef: string | null, copy: ModulePageCopy): string => {
    if (channelAccountRef === null) return copy.shell.channelDisconnected
    return channelAccountRef.toLowerCase().includes("telegram")
        ? copy.shell.telegramConnected
        : copy.shell.channelConnected
}

/**
 * The hostname of the controller instance serving this workspace, or null while the owned
 * workspace has no instance yet — an unprovisioned workspace has no controller to name.
 */
export const controllerHostnameForWorkspace = (
    answer: NivoQueryAnswer<AgentWorkspaceControlCenter> | undefined,
    workspaceId: string,
): string | null => {
    const candidate = nivoQueryPayload(answer)
    return candidate?.workspace.id === workspaceId ? (candidate.instance?.hostname ?? null) : null
}
