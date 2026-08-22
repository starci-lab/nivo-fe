import { Button, Heading, Text, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { AgentOSSummary, type AgentOSSummaryProps } from "@/components/blocks/console/AgentOSSummary"
import { AppsSummary, type AppsSummaryProps } from "@/components/blocks/console/AppsSummary"
import { InfrastructureSummary, type InfrastructureSummaryProps } from "@/components/blocks/console/InfrastructureSummary"
import { OverviewPulse, type OverviewPulseProps } from "@/components/blocks/console/OverviewPulse"
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
    readonly lede?: string
    readonly buildAppLabel?: string
    readonly pulse?: OverviewPulseProps
    readonly apps: AppsSummaryProps
    readonly agentOs: AgentOSSummaryProps
    readonly infrastructure: InfrastructureSummaryProps
    readonly wallet: WalletSummaryProps
    readonly onBuildApp?: () => void
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

const legacyTone = (status: FleetStatus) => {
    if (status === "failed") return "danger" as const
    if (status === "awaiting_dns") return "warning" as const
    if (status === "ready" || status === "active") return "success" as const
    return "neutral" as const
}

const normalizeLegacyApps = (input: LegacyOverviewPageViewProps): AppsSummaryProps => {
    let state: AppsSummaryProps["state"]
    if (input.apps.phase === "resting") state = { phase: "pending" }
    else if (input.apps.phase === "refused") state = { phase: "forbidden", message: input.apps.note }
    else if (input.apps.phase === "empty") state = { phase: "empty", message: input.apps.fact }
    else {
        state = {
            phase: "populated",
            items: input.apps.rows.map((row) => ({ ...row, statusTone: legacyTone(row.status) })),
        }
    }
    return {
        label: input.apps.label,
        onOpenApp: () => input.on?.openApps?.(),
        state,
    }
}

const normalizeLegacyAgentOs = (input: LegacyOverviewPageViewProps): AgentOSSummaryProps => {
    const agentRows = input.agentOs.phase === "answered" || input.agentOs.phase === "refused"
        ? input.agentOs.rows
        : []
    const row = agentRows[0]
    let state: AgentOSSummaryProps["state"]
    if (input.agentOs.phase === "resting") state = { phase: "pending" }
    else if (input.agentOs.phase === "empty") state = { phase: "empty", message: input.agentOs.message }
    else if (row === undefined) {
        const message = input.agentOs.phase === "refused" ? input.agentOs.note : ""
        state = { phase: "empty", message }
    } else {
        state = {
            phase: input.agentOs.phase === "refused" ? "partial" : "populated",
            workspace: {
                ...row,
                description: "",
                statusTone: legacyTone(row.status),
                actionLabel: input.agentOs.openLabel,
            },
        }
    }
    return {
        label: input.agentOs.label,
        onOpenService: () => input.on?.openAgentOs?.(),
        state,
    }
}

const normalizeLegacyDomains = (input: LegacyOverviewPageViewProps): InfrastructureSummaryProps["domains"] => {
    if (input.domains.phase === "resting") return { phase: "pending" }
    if (input.domains.phase === "answered") return { phase: "populated", facts: input.domains.facts }
    if (input.domains.phase === "empty") return { phase: "empty", note: input.domains.note }
    return { phase: "failed", note: input.domains.note }
}

const normalizeLegacyWallet = (input: LegacyOverviewPageViewProps): WalletSummaryProps["state"] => {
    if (input.wallet.phase === "resting") return { phase: "pending" }
    if (input.wallet.phase === "refused") return { phase: "failed", note: input.wallet.note }
    if (input.wallet.phase === "empty") return { phase: "empty", facts: input.wallet.facts }
    return { phase: "populated", facts: input.wallet.facts }
}

const normalize = (input: OverviewPageViewProps): AcceptedOverviewPageViewProps => {
    if ("infrastructure" in input) return input
    return {
        title: input.title,
        apps: normalizeLegacyApps(input),
        agentOs: normalizeLegacyAgentOs(input),
        infrastructure: { label: input.domains.label, context: input.servers.note, domains: normalizeLegacyDomains(input) },
        wallet: {
            label: input.wallet.label,
            actionLabel: "actionLabel" in input.wallet ? input.wallet.actionLabel : undefined,
            state: normalizeLegacyWallet(input),
            onOpenWallet: input.on?.openWallet,
        },
    }
}

/** Draw the accepted dashboard shell from its four independently settled summary blocks. */
export const OverviewPageBase = (input: OverviewPageViewProps) => {
    const { title, lede, buildAppLabel, pulse, apps, agentOs, infrastructure, wallet, onBuildApp } = normalize(input)
    const hasBuildAction = buildAppLabel !== undefined && onBuildApp !== undefined
    return (
    <Tree
        contract="console-primary-aside-page"
        render={defineContractComponent("console-primary-aside-page", {
            heading: defineContractComponent("display-title-with-end-action", {
                title: defineLeafComponent("heading", { scale: "display" }, () => (
                    <Heading props={{ content: title, level: 1, scale: "display" }} />
                )),
                ...(hasBuildAction ? {
                    end: defineLeafComponent("button", { size: "lg" }, () => (
                        <Button props={{ label: buildAppLabel, size: "lg", variant: "primary" }} on={{ press: onBuildApp }} />
                    )),
                } : {}),
            }),
            ...(lede === undefined ? {} : {
                lede: defineLeafComponent("text", { size: "md", tone: "muted" }, () => (
                    <Text props={{ content: lede, size: "md", tone: "muted" }} />
                )),
            }),
            ...(pulse === undefined ? {} : {
                signals: defineContractProjection("account-signal-grid", () => <OverviewPulse {...pulse} />),
            }),
            content: defineContractComponent("console-primary-aside", {
                primary: defineContractComponent("console-section-stack", {
                    section: [
                        defineContractProjection("label-row-over-card", () => <AppsSummary {...apps} />),
                        defineContractProjection("label-row-over-card", () => <AgentOSSummary {...agentOs} />),
                    ],
                }),
                aside: defineContractComponent("console-section-stack", {
                    section: [
                        defineContractProjection("wallet-summary", () => <WalletSummary {...wallet} />),
                        defineContractProjection("infrastructure-summary", () => <InfrastructureSummary {...infrastructure} />),
                    ],
                }),
            }),
        })}
    />
    )
}

/** Source-level tier marker for the pure overview page. */
export const meta = { shape: "page", world: "pure" } as const
