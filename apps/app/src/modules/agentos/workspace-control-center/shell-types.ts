import type { ShellSessionStanding, ShellSourceObservation } from "@/modules/agentos/shell-observation-store"

/** Settled shell situations projected from their source-owned observations. */
export type AgentOSShellViewStatus =
    | "loading"
    | "sign-in-required"
    | "access-unverified"
    | "access-denied"
    | "no-runtime"
    | "installed-current"
    | "installed-empty"
    | "evidence-limited"
    | "last-known"
    | "retrying"
    | "operation-pending"
    | "operation-confirmed"
    | "operation-uncertain"

/** How one source-qualified facet stands, kept apart from every sibling facet. */
export type AgentOSShellFacetStanding =
    "current" | "partial" | "stale" | "unavailable" | "unsupported" | "refused" | "loading" | "unresolved"

/**
 * Where one returned receiver-owned operation stands.
 *
 * `pending` is the receiver's acceptance without a result - it is never a confirmation.
 * `confirmed` requires a receiver `final` observation on a settled queue; `uncertain` covers every
 * ambiguous or delayed answer (`possible_start`, `quarantined`, a cancelled start, an outcome the
 * receiver itself could not classify). A source that did not settle stays its own facet standing.
 */
export type AgentOSShellOperationStanding = "pending" | "confirmed" | "uncertain" | AgentOSShellFacetStanding

/** One returned operation exactly as its own receiver receipt carries it. */
export interface AgentOSShellOperationView {
    readonly installationId: string
    readonly intentId: string
    readonly commandId: string | null
    readonly receiverName: string
    readonly standing: AgentOSShellOperationStanding
    readonly observedAt: string | null
}

/** One installation exactly as its own inventory row carries it, with its own configuration facet. */
export interface AgentOSShellInstallationView {
    readonly installationId: string
    readonly moduleKey: string | null
    readonly displayName: string
    readonly status: string | null
    readonly configuration: {
        readonly standing: AgentOSShellFacetStanding
        readonly desiredDigest: string | null
        readonly testedDigest: string | null
        readonly appliedDigest: string | null
        readonly observedAt: string | null
    } | null
}

/** The settled connected-shell view the drawing half renders; every string is already resolved. */
export interface AgentOSShellView {
    readonly state: AgentOSShellViewStatus
    readonly workspaceId: string | null
    readonly instanceId: string | null
    readonly name: string | null
    readonly identityObservedAt: string | null
    readonly inventoryStanding: AgentOSShellFacetStanding
    readonly inventoryObservedAt: string | null
    /** True only on a current, complete, authorized zero inventory - the permitted empty answer. */
    readonly inventoryEmpty: boolean
    readonly runtimeStanding: AgentOSShellFacetStanding
    readonly runtimeAvailability: string | null
    readonly runtimeGeneration: string | null
    readonly runtimeObservedAt: string | null
    readonly installations: ReadonlyArray<AgentOSShellInstallationView>
    readonly attentionStanding: AgentOSShellFacetStanding
    readonly attentionObservedAt: string | null
    readonly operations: ReadonlyArray<AgentOSShellOperationView>
    readonly retrying: boolean
}

/** Everything the projection reads off the connected shell; the handle satisfies it structurally. */
export interface AgentOSShellReading {
    readonly session: ShellSessionStanding
    readonly sessionStatus: string
    readonly sources: ReadonlyArray<ShellSourceObservation>
}

/** The three digests a current configuration observation names; the connected half phrases them. */
export type AgentOSShellConfigurationDigests = {
    readonly desired: string
    readonly tested: string
    readonly applied: string
}

/** Bilingual copy the settled shell view is rendered from, resolved before the drawing half runs. */
export interface AgentOSWorkspaceControlCenterShellLabels {
    readonly headingFallback: string
    readonly eyebrow: string
    readonly description: string
    readonly signInRequired: string
    readonly signInAction: string
    readonly accessDenied: string
    readonly accessUnverified: string
    readonly retry: string
    readonly loading: string
    readonly sourceTime: string
    readonly identityInstance: string
    readonly inventorySection: string
    readonly inventoryEmpty: string
    readonly inventoryEmptyDescription: string
    readonly inventoryLimitPartial: string
    readonly inventoryLimitStale: string
    readonly inventoryLimitUnavailable: string
    readonly inventoryLimitUnsupported: string
    readonly inventoryLimitRefused: string
    readonly inventoryLimitLoading: string
    readonly lastKnown: string
    readonly retrying: string
    readonly runtimeSection: string
    readonly runtimeProvisioned: string
    readonly runtimeNotProvisioned: string
    readonly runtimeUnavailable: string
    readonly runtimeUnknown: string
    readonly configurationSection: string
    readonly configurationAbsent: string
    readonly configurationUnsupported: string
    readonly attentionSection: string
    readonly attentionUnsupported: string
    readonly resultSection: string
    readonly resultUnavailable: string
    readonly resultPending: string
    readonly resultConfirmed: string
    readonly resultUncertain: string
    readonly resultRecheck: string
    readonly installEntry: string
}
