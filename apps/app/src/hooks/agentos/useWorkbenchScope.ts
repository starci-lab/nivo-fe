import { useParams } from "next/navigation"
import type { Outcome } from "@nivo/api"
import { nivoQueryPayload } from "@/modules/query"
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr"
type WorkbenchScopeStanding = "loading" | "denied" | "unavailable" | "ready"
/** What the installation line shows before an address exists: a held read, a refusal, or a true standing. */
const scopeStandingFor = (
    answer: Outcome<unknown> | undefined,
    error: unknown,
    hasInstance: boolean,
): WorkbenchScopeStanding => {
    if (answer === undefined && error === undefined) return "loading"
    if (error !== undefined) return "unavailable"
    if (answer?.ok === false) return answer.kind === "refused" || answer.kind === "forbidden" ? "denied" : "unavailable"
    return hasInstance ? "ready" : "unavailable"
}

/** Resolve the operation scope from the route and the owner-safe workspace read. */
export const useWorkbenchScope = (moduleId: string) => {
    const params = useParams<{ readonly workspaceId?: string; readonly installationId?: string }>()
    const routeWorkspaceId = typeof params?.workspaceId === "string" ? params.workspaceId : ""
    const routeInstallationId = typeof params?.installationId === "string" ? params.installationId : moduleId
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(routeWorkspaceId, routeWorkspaceId.length > 0)
    const instanceId = nivoQueryPayload(controlCenter.data)?.instance?.id ?? ""
    const scope =
        routeWorkspaceId.length > 0 && instanceId.length > 0
            ? { workspaceId: routeWorkspaceId, instanceId, installationId: routeInstallationId }
            : null
    const scopeStanding = scopeStandingFor(controlCenter.data, controlCenter.error, instanceId.length > 0)
    const addressable = scope ?? { workspaceId: "", instanceId: "", installationId: routeInstallationId }
    const ready = scope !== null

    const scopeFingerprint = scope === null ? "" : `${scope.workspaceId}~${scope.instanceId}~${scope.installationId}`
    return { scope, scopeStanding, addressable, ready, routeInstallationId, scopeFingerprint }
}
