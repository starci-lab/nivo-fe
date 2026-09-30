import type {
    AgentosModuleInstallationFieldsFragment,
    AgentosSolutionModuleSummary,
} from "@/modules/api/__generated__/core"
import type {
    AgentOSSolutionLedgerRow,
    AgentOSSolutionModuleCard,
    AgentOSSolutionModuleCenterCopy,
} from "./solution-module-center"

/** Project the exact installation fields selected by the catalog query into offer cards. */
export const solutionCatalogCardsFromQuery = (
    catalog: ReadonlyArray<AgentosSolutionModuleSummary> | undefined,
    installations: ReadonlyArray<AgentosModuleInstallationFieldsFragment> | undefined,
    copy: AgentOSSolutionModuleCenterCopy,
): ReadonlyArray<AgentOSSolutionModuleCard> =>
    (catalog ?? []).map((module) => {
        const installedCount = installations?.filter((item) => item.moduleKey === module.key).length ?? 0
        return {
            id: module.key,
            title: module.name,
            description: module.summary,
            statusLabel: installedCount === 0 ? copy.available : copy.installedCount(installedCount),
            statusTone: installedCount === 0 ? "neutral" : "success",
            detail: copy.catalogDetail({
                agents: module.agentRoles.length,
                channels: module.channelRoles.length,
                safety: module.safetyMode,
            }),
            actionLabel: copy.install,
        }
    })

/** Project the exact installation fields selected by the catalog query into installed rows and cards. */
export const solutionInstallationCardsFromQuery = (
    installations: ReadonlyArray<AgentosModuleInstallationFieldsFragment> | undefined,
    catalog: ReadonlyArray<AgentosSolutionModuleSummary> | undefined,
    locale: string,
    workspaceId: string,
    copy: AgentOSSolutionModuleCenterCopy,
): {
    readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>
    readonly rows: ReadonlyArray<AgentOSSolutionLedgerRow>
} => {
    const catalogByKey = new Map<string, AgentosSolutionModuleSummary>()
    for (const item of catalog ?? []) catalogByKey.set(item.key, item)
    const rows = (installations ?? []).map((installation): AgentOSSolutionLedgerRow => {
        const module = catalogByKey.get(installation.moduleKey)
        const statusTone =
            installation.status === "ready"
                ? "success"
                : installation.status === "failed"
                  ? "danger"
                  : installation.status === "provisioning" || installation.status === "degraded"
                    ? "warning"
                    : "neutral"
        return {
            id: installation.id,
            name: installation.displayName || module?.name || installation.moduleKey,
            detail: installation.failureCode ?? copy.version(installation.moduleVersion),
            kind: copy.installed,
            status: copy.status(installation.status),
            statusTone,
            action: copy.viewDetails,
            href: `/${locale}/agentos/workspaces/${workspaceId}/modules/${installation.id}`,
        }
    })
    return {
        rows,
        cards: rows.map((row) => ({
            id: row.id,
            title: row.name,
            description:
                catalogByKey.get(installations?.find((item) => item.id === row.id)?.moduleKey ?? "")?.summary ??
                copy.installedDescription,
            statusLabel: row.status,
            statusTone: row.statusTone,
            detail: row.detail,
            actionLabel: row.action,
            actionHref: row.href,
        })),
    }
}
