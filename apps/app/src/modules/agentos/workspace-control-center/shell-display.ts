import type { AgentOSShellFacetStanding, AgentOSShellOperationView, AgentOSShellView, AgentOSWorkspaceControlCenterShellLabels } from "./shell-types"

/** The one sentence a limited facet owes its reader, chosen by that source's own standing. */
export const facetLimitOf = (
    standing: AgentOSShellFacetStanding,
    labels: AgentOSWorkspaceControlCenterShellLabels,
): string => {
    if (standing === "stale") return labels.inventoryLimitStale
    if (standing === "unavailable") return labels.inventoryLimitUnavailable
    if (standing === "unsupported") return labels.inventoryLimitUnsupported
    if (standing === "refused") return labels.inventoryLimitRefused
    if (standing === "loading" || standing === "unresolved") return labels.inventoryLimitLoading
    return labels.inventoryLimitPartial
}

/** The runtime facet's own value: what the runtime source said, never what a neighbour implied. */
export const runtimeValueOf = (view: AgentOSShellView, labels: AgentOSWorkspaceControlCenterShellLabels): string => {
    if (view.runtimeStanding === "unsupported" || view.runtimeStanding === "refused")
        return facetLimitOf(view.runtimeStanding, labels)
    if (view.runtimeAvailability === "provisioned") return labels.runtimeProvisioned
    if (view.runtimeAvailability === "not_provisioned") return labels.runtimeNotProvisioned
    if (view.runtimeAvailability === "unavailable") return labels.runtimeUnavailable
    return labels.runtimeUnknown
}

/** One source-qualified fact: the label names its source, the value is what that source answered. */

export const operationValueOf = (
    operation: AgentOSShellOperationView,
    labels: AgentOSWorkspaceControlCenterShellLabels,
): string => {
    if (operation.standing === "pending") return labels.resultPending
    if (operation.standing === "confirmed") return labels.resultConfirmed
    if (operation.standing === "uncertain") return labels.resultUncertain
    return facetLimitOf(operation.standing, labels)
}
