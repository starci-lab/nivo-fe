import { Heading, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { AgentOSSummary, type AgentOSSummaryProps } from "@/components/blocks/console/AgentOSSummary"
import { AppsSummary, type AppsSummaryProps } from "@/components/blocks/console/AppsSummary"
import { InfrastructureSummary, type InfrastructureSummaryProps } from "@/components/blocks/console/InfrastructureSummary"
import { WalletSummary, type WalletSummaryProps } from "@/components/blocks/console/WalletSummary"
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"

/** Legacy app-section view retained for existing pure-page consumers during this revision. */
export type AppsSectionView =
    | { readonly phase: "resting", readonly label: string, readonly openSetLabel: string }
    | { readonly phase: "empty", readonly label: string, readonly fact: string, readonly offers: ReadonlyArray<unknown> }
    | { readonly phase: "answered", readonly label: string, readonly openSetLabel: string, readonly rows: ReadonlyArray<{ readonly id: string, readonly name: string, readonly detail: string, readonly kindLabel?: string, readonly status: FleetStatus, readonly statusLabel: string, readonly actionLabel: string }> }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/** Legacy AgentOS view retained for existing pure-page consumers. */
export type AgentOsSectionView =
    | { readonly phase: "resting", readonly label: string, readonly openLabel: string }
    | { readonly phase: "empty", readonly label: string, readonly plansLabel: string, readonly message: string }
    | { readonly phase: "answered", readonly label: string, readonly openLabel: string, readonly rows: ReadonlyArray<{ readonly id: string, readonly name: string, readonly status: FleetStatus, readonly statusLabel: string }> }
    | { readonly phase: "refused", readonly label: string, readonly openLabel: string, readonly note: string, readonly rows: ReadonlyArray<{ readonly id: string, readonly name: string, readonly status: FleetStatus, readonly statusLabel: string }> }

/** Legacy domains view retained for existing pure-page consumers. */
export type DomainsSectionView =
    | { readonly phase: "resting", readonly label: string }
    | { readonly phase: "empty" | "refused", readonly label: string, readonly note: string }
    | { readonly phase: "answered", readonly label: string, readonly facts: ReadonlyArray<{ readonly id: string, readonly label: string, readonly value: string }> }

/** Legacy wallet view retained for existing pure-page consumers. */
export type WalletSectionView =
    | { readonly phase: "resting", readonly label: string, readonly actionLabel: string }
    | { readonly phase: "empty" | "answered", readonly label: string, readonly actionLabel: string, readonly facts: ReadonlyArray<{ readonly id: string, readonly label: string, readonly value: string }> }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

type AcceptedOverviewPageViewProps = {
    readonly title: string
    readonly apps: AppsSummaryProps
    readonly agentOs: AgentOSSummaryProps
    readonly infrastructure: InfrastructureSummaryProps
    readonly wallet: WalletSummaryProps
}

type LegacyOverviewPageViewProps = {
    readonly title: string
    readonly apps: AppsSectionView
    readonly agentOs: AgentOsSectionView
    readonly servers: { readonly label: string, readonly note: string }
    readonly domains: DomainsSectionView
    readonly wallet: WalletSectionView
    readonly on?: { readonly openApps?: () => void, readonly openAgentOs?: () => void, readonly openWallet?: () => void }
}

/** Fully resolved overview content, including the previous call shape during migration. */
export type OverviewPageViewProps = AcceptedOverviewPageViewProps | LegacyOverviewPageViewProps

const legacyTone = (status: FleetStatus) => status === "failed" ? "danger" as const
    : status === "awaiting_dns" ? "warning" as const
        : status === "ready" || status === "active" ? "success" as const : "neutral" as const

const normalize = (input: OverviewPageViewProps): AcceptedOverviewPageViewProps => {
    if ("infrastructure" in input) return input
    const apps: AppsSummaryProps = {
        label: input.apps.label,
        onOpenApp: () => input.on?.openApps?.(),
        state: input.apps.phase === "resting" ? { phase: "pending" }
            : input.apps.phase === "refused" ? { phase: "forbidden", message: input.apps.note }
                : input.apps.phase === "empty" ? { phase: "empty", message: input.apps.fact }
                    : { phase: "populated", items: input.apps.rows.map((row) => ({ ...row, statusTone: legacyTone(row.status) })) },
    }
    const agentRows = input.agentOs.phase === "answered" || input.agentOs.phase === "refused" ? input.agentOs.rows : []
    const row = agentRows[0]
    const agentOs: AgentOSSummaryProps = {
        label: input.agentOs.label,
        onOpenService: () => input.on?.openAgentOs?.(),
        state: input.agentOs.phase === "resting" ? { phase: "pending" }
            : input.agentOs.phase === "empty" || row === undefined ? { phase: "empty", message: input.agentOs.phase === "empty" ? input.agentOs.message : input.agentOs.phase === "refused" ? input.agentOs.note : "" }
                : { phase: input.agentOs.phase === "refused" ? "partial" : "populated", workspace: { ...row, description: "", statusTone: legacyTone(row.status), actionLabel: input.agentOs.openLabel } },
    }
    const domainState = input.domains.phase === "resting" ? { phase: "pending" as const }
        : input.domains.phase === "answered" ? { phase: "populated" as const, facts: input.domains.facts }
            : input.domains.phase === "empty" ? { phase: "empty" as const, note: input.domains.note }
                : { phase: "failed" as const, note: input.domains.note }
    const walletState = input.wallet.phase === "resting" ? { phase: "pending" as const }
        : input.wallet.phase === "refused" ? { phase: "failed" as const, note: input.wallet.note }
            : { phase: input.wallet.phase === "empty" ? "empty" as const : "populated" as const, facts: input.wallet.facts }
    return {
        title: input.title,
        apps,
        agentOs,
        infrastructure: { label: input.domains.label, context: input.servers.note, domains: domainState },
        wallet: { label: input.wallet.label, actionLabel: "actionLabel" in input.wallet ? input.wallet.actionLabel : undefined, state: walletState, onOpenWallet: input.on?.openWallet },
    }
}

/** Draw the accepted dashboard shell from its four independently settled summary blocks. */
export const OverviewPageBase = (input: OverviewPageViewProps) => {
    const { title, apps, agentOs, infrastructure, wallet } = normalize(input)
    return (
    <Tree
        contract="dashboard-overview-page"
        render={defineContractComponent("dashboard-overview-page", {
            heading: defineContractComponent("title-with-end-action", {
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />),
            }),
            section: [
                defineContractProjection("label-row-over-card", () => <AppsSummary {...apps} />),
                defineContractProjection("label-row-over-card", () => <AgentOSSummary {...agentOs} />),
                defineContractProjection("label-row-over-card", () => <InfrastructureSummary {...infrastructure} />),
                defineContractProjection("label-row-over-card", () => <WalletSummary {...wallet} />),
            ],
        })}
    />
    )
}

/** Source-level tier marker for the pure overview page. */
export const meta = { shape: "page", world: "pure" } as const
