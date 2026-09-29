import type { ReactNode } from "react"
import type { AgentosModuleInstallation, AgentosSolutionModule } from "@/modules/api/agentos-modules"
import type { NivoQueryReading } from "@/modules/query"

export type AgentOSSolutionTone = "neutral" | "success" | "warning" | "danger"

/** One resolved catalog or installation card visible in the module center. */
export type AgentOSSolutionModuleCard = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: AgentOSSolutionTone
    readonly detail?: string
    readonly actionLabel: string
    readonly disabled?: boolean
    readonly actionHref?: string
}

/** One installed solution prepared as a ledger row whose name and action lead to its workspace. */
export type AgentOSSolutionLedgerRow = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly kind: string
    readonly status: string
    readonly statusTone: AgentOSSolutionTone
    readonly action: string
    readonly href: string
}

/** What one ledger section holds: nothing yet, a failed read, resting content, or rows. */
export type AgentOSSolutionLedgerSectionStatus = "resting" | "failed" | "empty" | "ready"

/** The ledger form's copy, per-section state and recovery. */
export type AgentOSSolutionModuleLedgerProps = {
    readonly installedLabel: string
    readonly catalogLabel: string
    readonly installedState: AgentOSSolutionLedgerSectionStatus
    readonly catalogueState: AgentOSSolutionLedgerSectionStatus
    readonly installedNotice?: ReactNode
    readonly catalogueNotice?: ReactNode
    readonly installedRows: ReadonlyArray<AgentOSSolutionLedgerRow>
    readonly installedEmptyTitle: string
    readonly installedEmpty: string
    readonly catalogueEmptyTitle: string
    readonly catalogueEmpty: string
    readonly installedEmptyAction: string
}

/** Closed pure state for the solution-module catalog and installation fleet. */
export type AgentOSSolutionModuleCenterViewProps = {
    readonly state: "resting" | "failed" | "answered"
    readonly layout?: "tabs" | "ledger"
    readonly mode: "catalog" | "installed"
    readonly sectionLabel: string
    readonly modesLabel: string
    readonly modes: ReadonlyArray<{ readonly id: "catalog" | "installed"; readonly label: string }>
    readonly notice?: ReactNode
    readonly emptyLabel: string
    readonly emptyActionLabel: string
    readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>
    readonly pendingId?: string
    readonly outcome?: string
    readonly ledger?: AgentOSSolutionModuleLedgerProps
}

/** Actions and resolved view data the render half draws. */
export type AgentOSSolutionModuleCenterProps = {
    readonly state: AgentOSSolutionModuleCenterViewProps["state"]
    readonly props: Omit<AgentOSSolutionModuleCenterViewProps, "state">
    readonly on: {
        readonly onSelectMode: (mode: "catalog" | "installed") => void
        readonly onPressCard: (id: string) => void
    }
}

/** Human-readable copy the connected owner resolves once for every projection. */
export type AgentOSSolutionModuleCenterCopy = {
    readonly available: string
    readonly installedCount: (count: number) => string
    readonly catalogDetail: (values: {
        readonly agents: number
        readonly channels: number
        readonly safety: string
    }) => string
    readonly install: string
    readonly installedDescription: string
    readonly status: (state: string) => string
    readonly version: (version: string) => string
    readonly viewDetails: string
    readonly installed: string
    readonly catalogSection: string
    readonly installedSection: string
    readonly modesLabel: string
    readonly catalogMode: string
    readonly installedMode: string
    readonly empty: string
    readonly browse: string
    readonly emptyTitle: string
    readonly emptyHint: string
    readonly catalogueEmptyTitle: string
    readonly catalogueEmptyHint: string
    readonly installedEmptyAction: string
}

/** Exact owner workspace scope consumed by the connected module center. */
export type AgentOSSolutionModuleCenterRouteProps = {
    readonly workspaceId: string
    readonly layout?: "tabs" | "ledger"
}

/** Tone for a known installation lifecycle; unknown states stay neutral. */
export const solutionToneOf = (status: string): AgentOSSolutionTone => {
    if (status === "ready") return "success"
    if (status === "failed") return "danger"
    if (status === "provisioning" || status === "degraded") return "warning"
    return "neutral"
}

/** Derive the section's visible state from its settled query answer. */
export const solutionSectionState = <TValue>(
    reading: NivoQueryReading<ReadonlyArray<TValue>>,
): AgentOSSolutionLedgerSectionStatus => {
    if (reading.status === "resting") return "resting"
    if (reading.status === "failed") return "failed"
    return reading.data.length === 0 ? "empty" : "ready"
}

/** Project catalog entries and already-installed counts into visible offer cards. */
export const solutionCatalogCards = (
    catalog: ReadonlyArray<AgentosSolutionModule> | undefined,
    installations: ReadonlyArray<AgentosModuleInstallation> | undefined,
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

/** Project known installations to cards and destination-bound ledger rows. */
export const solutionInstallationCards = (
    installations: ReadonlyArray<AgentosModuleInstallation> | undefined,
    catalog: ReadonlyArray<AgentosSolutionModule> | undefined,
    locale: string,
    workspaceId: string,
    copy: AgentOSSolutionModuleCenterCopy,
): {
    readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>
    readonly rows: ReadonlyArray<AgentOSSolutionLedgerRow>
} => {
    const catalogByKey = new Map<string, AgentosSolutionModule>()
    for (const item of catalog ?? []) catalogByKey.set(item.key, item)
    const rows = (installations ?? []).map((installation) => {
        const module = catalogByKey.get(installation.moduleKey)
        const detail = installation.failureCode ?? copy.version(installation.moduleVersion)
        return {
            id: installation.id,
            name: installation.displayName || module?.name || installation.moduleKey,
            detail,
            kind: copy.installed,
            status: copy.status(installation.status),
            statusTone: solutionToneOf(installation.status),
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
                catalogByKey.get((installations ?? []).find((item) => item.id === row.id)?.moduleKey ?? "")?.summary ??
                copy.installedDescription,
            statusLabel: row.status,
            statusTone: row.statusTone,
            detail: row.detail,
            actionLabel: row.action,
            actionHref: row.href,
        })),
    }
}
