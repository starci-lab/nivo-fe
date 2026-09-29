/** The one mutation this door registers. Core refuses any other operation name. */
export const AGENTOS_SHELL_NAVIGATION_OPERATION = "navigation.resolve@1"

/** The navigation grammar version a destination must declare before it may be opened. */
export const SHELL_NAVIGATION_GRAMMAR_VERSION = 1

/** The registered return route name the shell restores its selection under after a visit. */
export const SHELL_RETURN_ROUTE_NAME = "purchased_agentos"

/** One overview carries one envelope per source; the bound keeps a single request finite. */
export const MAX_SHELL_READS_PER_REQUEST = 32

/** Read generations are bounded so a browser cannot allocate an unbounded integer. */
export const MAX_SHELL_READ_GENERATION = 2_147_483_647

/** Wire availability. `unresolved` and `loading` are local states and never cross this boundary. */
export type ShellWireAvailability = "available" | "partial" | "unavailable" | "unsupported" | "refused"

/** Whether an observation was taken now, is known to lag, or its age cannot be established. */
export type ShellFreshness = "current" | "stale" | "unknown"

/** Whether a payload covers the whole facet, part of it, or its coverage cannot be established. */
export type ShellCompleteness = "complete" | "partial" | "unknown"

/** Whole-selection source kinds: the identity carries no narrower scope. */
export type ShellSelectionSourceKind = "core_registry" | "installation_inventory" | "runtime"

/** Per-installation source kinds: siblings never share an identity. */
export type ShellInstallationSourceKind = "capability" | "attention" | "configuration"

/**
 * One closed shell source identity.
 *
 * The installation- and receiver-scoped variants carry their scope in the type, so a sibling
 * installation's envelope cannot be applied to the selected one by accident.
 */
export type ShellSourceIdentity =
    | { readonly kind: ShellSelectionSourceKind }
    | { readonly kind: ShellInstallationSourceKind; readonly installationId: string }
    | { readonly kind: "receiver"; readonly installationId: string; readonly intentId: string }

/** One requested read: an identity plus the generation the shell allocated for it. */
export interface ShellRead {
    readonly identity: ShellSourceIdentity
    readonly readGeneration: number
}

/** One source's own answer, qualified by its own availability, freshness and completeness. */
export interface ShellSourceEnvelope {
    readonly sourceIdentity: string
    readonly readGeneration: number
    readonly availability: ShellWireAvailability
    readonly freshness: ShellFreshness
    readonly completeness: ShellCompleteness
    readonly observedAt: string | null
    readonly payload: Readonly<Record<string, unknown>> | null
}

/** Core's own registry standing beside a source answer; independently nullable on the overview. */
export interface ShellCoreResult {
    readonly availability: "available" | "unavailable" | "refused"
    readonly reason: string | null
    readonly workspaceId: string | null
    readonly instanceId: string | null
    readonly name: string | null
    readonly runtimeGeneration: string | null
    readonly runtimeAvailability: "provisioned" | "not_provisioned" | "unavailable"
    readonly inventory: {
        readonly availability: "available" | "partial" | "unavailable"
        readonly completeness: "complete" | "partial"
        readonly observedAt: string
        readonly installations: ReadonlyArray<unknown>
    } | null
}

/** The closed overview answer. */
export interface ShellOverviewAnswer {
    readonly kind: "overview"
    readonly selectionGeneration: string
    readonly core: ShellCoreResult | null
    readonly sources: ReadonlyArray<ShellSourceEnvelope>
}

/** One source's answer to a read that is not the overview: available with a payload, or nothing. */
export type ShellObservationProjection<T> =
    | { readonly availability: "available"; readonly reason: null; readonly projection: T }
    | {
          readonly availability: Exclude<ShellWireAvailability, "available">
          readonly reason: string
          readonly projection: null
      }

/** One authentic receiver entry; the inline payload is deliberately absent from the wire. */
export interface ShellReceiverObservation {
    readonly observationId: string
    readonly observationVersion: number
    readonly receiverReceiptId: string | null
    readonly kind: "progress" | "question" | "final" | "outcome_unknown"
    readonly schemaId: string
    readonly payloadDigest: string | null
    readonly observedAt: string | null
}

/** One local transport gap; it carries no receiver version and no authenticity, by contract. */
export interface ShellLocalTransportGap {
    readonly attempt: number
    readonly kind: string
    readonly observedAt: string | null
}

/**
 * Queue evidence Core may state about one command.
 *
 * Six different meanings, not a scale, and none of them is completion: `settled` states that the
 * receiver stopped working, which its owning module interprets - never the shell. `possible_start`
 * and `quarantined` are explicitly ambiguous and must never be presented as a confirmed outcome.
 */
export interface ShellCommandObservation {
    readonly commandId: string
    readonly receiverInstallationId: string
    readonly queueState: "queued" | "claimed" | "possible_start" | "settled" | "cancelled_before_start" | "quarantined"
    readonly attempt: number
    readonly possibleStartAt: string | null
    readonly observations: ReadonlyArray<ShellReceiverObservation>
    readonly localTransportGaps: ReadonlyArray<ShellLocalTransportGap>
}

/** The closed command-receipt answer; the read identity is echoed in full. */
export interface ShellCommandReceiptAnswer {
    readonly kind: "command_observation"
    readonly selectionGeneration: string
    readonly sourceIdentity: string
    readonly readGeneration: number
    readonly core: ShellCoreResult
    readonly commandObservation: ShellObservationProjection<ShellCommandObservation>
}

/** One source's own standing inside the current authority. */
export interface ShellAuthoritySourceStatus {
    readonly availability: ShellWireAvailability
    readonly reason: string | null
    readonly current: unknown
}

/** Core's current authority status for exactly one installation; lifecycle state is not here. */
export interface ShellAuthorityStatus {
    readonly installationId: string
    readonly grant: ShellAuthoritySourceStatus
    readonly config: ShellAuthoritySourceStatus
    readonly setup: ShellAuthoritySourceStatus
    readonly runtime: ShellAuthoritySourceStatus
}

/** The closed authority-status answer. */
export interface ShellAuthorityStatusAnswer {
    readonly kind: "authority_status"
    readonly core: ShellCoreResult
    readonly authorityStatus: ShellAuthorityStatus
}

/** One installation's lifecycle truth; desired, tested and applied stay separate fields. */
export interface ShellLifecycleObservation {
    readonly installationId: string
    readonly lifecycleRevision: number
    readonly desiredCandidateGeneration: string
    readonly configurationRequirement: "required" | "server_established_not_applicable"
    readonly configurationRevisionId: string | null
    readonly testState: "not_tested" | "testing" | "passed" | "rejected"
    readonly testEvidenceId: string | null
    readonly applicationState:
        | "prepared"
        | "applying"
        | "active"
        | "withdrawing"
        | "withdrawn"
        | "removing"
        | "removed"
        | "outcome_unknown"
        | "unavailable"
    readonly appliedGeneration: string | null
    readonly runtimeFenceGeneration: number
    readonly lastObservationAt: string | null
}

/** What a recorder holds for one installation after an actual observation. */
export interface ShellAppliedRecord {
    readonly installationId: string
    readonly currentCandidate: string
    readonly appliedGeneration: string | null
    readonly runtimeFenceGeneration: number
    readonly observedAt: string | null
    readonly configurationIdentity: unknown
}

/** The gap between what is wanted and what was observed running. */
export interface ShellAppliedMismatch {
    readonly currentCandidate: string
    readonly appliedGeneration: string | null
    readonly reason: "not-applied" | "candidate-drift" | "configuration-drift"
}

/** A recorder either states applied truth, holds a mismatch, or refuses to answer. */
export type ShellAppliedObservation =
    | { readonly status: "applied"; readonly record: ShellAppliedRecord; readonly mismatch: null }
    | { readonly status: "held"; readonly record: ShellAppliedRecord; readonly mismatch: ShellAppliedMismatch }
    | { readonly status: "refused"; readonly reason: string }

/** The closed lifecycle answer; applied truth is reported apart from the claimed lifecycle. */
export interface ShellLifecycleObservationAnswer {
    readonly kind: "lifecycle_observation"
    readonly core: ShellCoreResult
    readonly lifecycleObservation: ShellObservationProjection<ShellLifecycleObservation>
    readonly appliedObservation: ShellAppliedObservation
}

/** The four registered navigation intents a shell entry may express. */
export type ShellRouteKey = "module_home" | "attention_item" | "result_item" | "operation_entry"

/** The registered destination views Core may resolve; a name, never a URL. */
export type ShellRegisteredViewName =
    | "module-home"
    | "sales-opportunity"
    | "sales-owner-decision"
    | "sales-action"
    | "accounting-handoff"
    | "accounting-result"
    | "accounting-exception"
    | "chatbot-conversation"
    | "chatbot-handoff"
    | "module-diagnostics"

/** Where the shell came from; Core echoes it back so a return restores the same selection. */
export interface ShellReturnContext {
    readonly routeName: typeof SHELL_RETURN_ROUTE_NAME
    readonly workspaceId: string
    readonly instanceId: string
    readonly installationId: string | null
}

/** The registered destination Core resolved: registered names and opaque identities only. */
export interface ShellRegisteredDestination {
    readonly grammarVersion: typeof SHELL_NAVIGATION_GRAMMAR_VERSION
    readonly routeName: ShellRegisteredViewName
    readonly workspaceId: string
    readonly instanceId: string
    readonly installationId: string
    readonly opaqueItemId: string | null
    readonly returnContext: ShellReturnContext
}

/*
 * WHAT A CALLER LEARNS from one registered read or one navigation resolution is the shared
 * `Outcome`: the answer, or the failure whose kind says which of five things it was.
 *
 * - `refused`     the session is not accepted (the route's own 401): a session outcome that belongs
 *                 to the whole selection, not to one source.
 * - `forbidden`   a current authorization refusal for the exact source asked about. The registered
 *                 route refuses the whole read set, so the status Core chose travels in `status` and
 *                 the reason token in `code`: a permission refusal is told from an outage without
 *                 parsing a sentence.
 * - `not-found`   Core states the source is not there.
 * - `invalid`     a request this client refuses to send (`UNSUPPORTED`), a destination resolved for a
 *                 selection no longer displayed (`OBSOLETE_SELECTION`), or a malformed request Core
 *                 refused.
 * - `unavailable` no answer arrived (`NETWORK`, `TIMEOUT`), Core had an outage, or the reply is one
 *                 the registered grammar cannot express (`UNSUPPORTED_REPLY`): an unknown kind or
 *                 version, an echoed identity that disagrees with the request, a re-ordered or
 *                 duplicated read set, or a body that is not an envelope at all.
 *
 * A navigation answer is the destination and nothing else: no failure may open anything.
 */

/** Everything a registered read needs that is not the access token. */
export interface ShellReadScope {
    readonly workspaceId: string
    readonly instanceId: string
}

/** The exact installation inside the selected workspace and instance. */
export interface ShellInstallationScope extends ShellReadScope {
    readonly installationId: string
}

/** The receiver-source read identity a command receipt is asked and echoed under. */
export interface ShellCommandReceiptScope extends ShellReadScope {
    readonly commandId: string
    readonly sourceIdentity: string
    readonly readGeneration: number
    readonly selectionGeneration: string
}

/** One navigation request: the selection, a registered route key and the optional opaque item. */
export interface ShellNavigationScope extends ShellInstallationScope {
    readonly routeKey: ShellRouteKey
    readonly opaqueItemId: string | null
    readonly selectionGeneration: string
}
/** One arrived route reply before its registered grammar is narrowed. */
export interface ShellArrivedReply {
    readonly status: number
    readonly body: unknown
}

/** The method and, for a mutation, the JSON body of one registered request. */
