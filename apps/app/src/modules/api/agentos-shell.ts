/*
 * The browser half of CONTRACT-SH-HUMAN-ROUTE: the registered Core reads the AgentOS shell is
 * allowed to perform, and nothing else.
 *
 * FOUR PROPERTIES ARE THE WHOLE POINT OF THIS FILE.
 *
 * 1. BEARER ONLY, NEVER THE COOKIE. The refresh cookie stays at the Core session boundary; this
 *    transport sends `credentials: "omit"` so the browser cannot attach it, and the access token
 *    travels in the Authorization header only - never in a URL, a query, browser storage or a log.
 *    A read authorized by a cookie would let a refresh-only request pose as an authorized read.
 * 2. READS AND ONE NAVIGATION RESOLUTION. Nothing on this route can reach a domain effect, so this
 *    client registers no module command, retry or reconciliation call. The single mutation it can
 *    send is `navigation.resolve@1`, which resolves an already-authorized entry to a route name.
 * 3. CLOSED OUTCOMES. Every reply is narrowed against the registered grammar before it is returned.
 *    An unknown kind, an unknown version, a re-spelled read identity or a body that is not an
 *    envelope at all fails closed rather than being coerced into a nearby answer, because a shell
 *    that applies the wrong envelope shows the owner a truthful-looking answer about a source they
 *    never asked for.
 * 4. NO SOURCE IS PROMOTED. Admission, queueing, refusal, failure, ambiguity and receiver
 *    confirmation stay separate meanings, and each one is carried through unchanged. Reading a
 *    receipt never reconciles, cancels or retries the command it reports on.
 */

import { CORE_API_URL } from "@/modules/config"
import { failed, failureKindOfStatus, type Failure, type Outcome } from "./outcome"
import { OPERATION_ROUTE_PREFIX } from "./operation-route"
import { send } from "./transport"

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

const WIRE_AVAILABILITIES: ReadonlySet<string> = new Set([
    "available",
    "partial",
    "unavailable",
    "unsupported",
    "refused",
])
const FRESHNESSES: ReadonlySet<string> = new Set(["current", "stale", "unknown"])
const COMPLETENESSES: ReadonlySet<string> = new Set(["complete", "partial", "unknown"])
const QUEUE_STATES: ReadonlySet<string> = new Set([
    "queued",
    "claimed",
    "possible_start",
    "settled",
    "cancelled_before_start",
    "quarantined",
])
const OBSERVATION_KINDS: ReadonlySet<string> = new Set(["progress", "question", "final", "outcome_unknown"])
const CONFIGURATION_REQUIREMENTS: ReadonlySet<string> = new Set(["required", "server_established_not_applicable"])
const TEST_STATES: ReadonlySet<string> = new Set(["not_tested", "testing", "passed", "rejected"])
const APPLICATION_STATES: ReadonlySet<string> = new Set([
    "prepared",
    "applying",
    "active",
    "withdrawing",
    "withdrawn",
    "removing",
    "removed",
    "outcome_unknown",
    "unavailable",
])
const REGISTERED_VIEWS: ReadonlySet<string> = new Set([
    "module-home",
    "sales-opportunity",
    "sales-owner-decision",
    "sales-action",
    "accounting-handoff",
    "accounting-result",
    "accounting-exception",
    "chatbot-conversation",
    "chatbot-handoff",
    "module-diagnostics",
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value)
const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0
const isCount = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
const isUuid = (value: unknown): value is string =>
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value)
const nullableText = (value: unknown): string | null | undefined => {
    if (value === null) return null
    return isText(value) ? value : undefined
}
/** Membership in the registered availability set, as a narrowing the compiler can follow. */
const isWireAvailability = (value: unknown): value is ShellWireAvailability =>
    typeof value === "string" && WIRE_AVAILABILITIES.has(value)
/** Membership in the registered freshness set, as a narrowing the compiler can follow. */
const isFreshness = (value: unknown): value is ShellFreshness => typeof value === "string" && FRESHNESSES.has(value)
/** Membership in the registered completeness set, as a narrowing the compiler can follow. */
const isCompleteness = (value: unknown): value is ShellCompleteness =>
    typeof value === "string" && COMPLETENESSES.has(value)

/** Canonical wire spelling of one source identity; the inverse of the registry's own parser. */
export const formatShellSourceIdentity = (identity: ShellSourceIdentity): string => {
    if (identity.kind === "receiver") return `receiver:{${identity.installationId},${identity.intentId}}`
    if (identity.kind === "capability" || identity.kind === "attention" || identity.kind === "configuration")
        return `${identity.kind}:{${identity.installationId}}`
    return identity.kind
}

/**
 * Order two canonical identities by Unicode code point.
 *
 * `localeCompare` is deliberately not used: its result depends on the runtime's collation data, so a
 * locale-aware sort would order one pair of identities one way in one browser and the other way in
 * the next, while Core - which sorts by code point - would refuse the request as unsorted.
 */
export const compareShellSourceIdentity = (left: string, right: string): number => {
    const leftPoints = [...left]
    const rightPoints = [...right]
    for (let index = 0; index < Math.min(leftPoints.length, rightPoints.length); index += 1) {
        const difference = (leftPoints[index]?.codePointAt(0) ?? 0) - (rightPoints[index]?.codePointAt(0) ?? 0)
        if (difference !== 0) return difference
    }
    return leftPoints.length - rightPoints.length
}

/** Canonical percent-encoded `read=` value for one identity and generation. */
export const formatShellRead = (identity: ShellSourceIdentity, readGeneration: number): string =>
    `${encodeURIComponent(formatShellSourceIdentity(identity))}:${readGeneration}`

/**
 * Order a read set into the canonical order the registered route accepts.
 *
 * @param reads - Reads in any order.
 * @returns The reads in code-point order, or null when the set cannot be expressed at all: an empty
 *   set, a duplicated source, an unusable generation, or more sources than one request may carry.
 *   The caller fails closed on null rather than sending a request Core would refuse as malformed.
 */
export const canonicalShellReads = (reads: ReadonlyArray<ShellRead>): ReadonlyArray<ShellRead> | null => {
    if (reads.length === 0 || reads.length > MAX_SHELL_READS_PER_REQUEST) return null
    const ordered = [...reads].sort((left, right): number =>
        compareShellSourceIdentity(formatShellSourceIdentity(left.identity), formatShellSourceIdentity(right.identity)),
    )
    for (let index = 0; index < ordered.length; index += 1) {
        const read = ordered[index]
        if (
            read === undefined ||
            !isCount(read.readGeneration) ||
            read.readGeneration < 1 ||
            read.readGeneration > MAX_SHELL_READ_GENERATION
        )
            return null
        const previous = index > 0 ? ordered[index - 1] : undefined
        if (
            previous !== undefined &&
            formatShellSourceIdentity(previous.identity) === formatShellSourceIdentity(read.identity)
        )
            return null
    }
    return ordered
}

const shellRouteUrl = (scope: ShellReadScope, suffix = ""): URL =>
    new URL(
        `${OPERATION_ROUTE_PREFIX}/${encodeURIComponent(scope.workspaceId)}/instances/${encodeURIComponent(scope.instanceId)}${suffix}`,
        CORE_API_URL,
    )

const keyedQuery = (entries: ReadonlyArray<readonly [string, string]>): string =>
    entries.map(([name, value]) => `${name}=${value}`).join("&")

/** A reply that arrived, and the status Core stated it under. */
export interface ShellArrivedReply {
    readonly status: number
    readonly body: unknown
}

/** The method and, for a mutation, the JSON body of one registered request. */
type ShellRequest = { readonly method: "GET" | "POST"; readonly json?: unknown }

/** What one registered request settled as: a reply that arrived, or the failure that stopped it. */
type ShellExchange =
    | { readonly arrived: true; readonly reply: ShellArrivedReply }
    | { readonly arrived: false; readonly failure: Failure }

/** A request this client refuses to send: the scope or the intent is outside the registered grammar. */
const unsupportedRequest = (reason: string): Failure => failed("invalid", { code: "UNSUPPORTED", reason })

/** A reply the registered grammar cannot express; a refusal of this client's own making, not a Core decision. */
const unreadableReply = (status: number, reason = "unreadable-reply"): Failure =>
    failed("unavailable", { status, code: "UNSUPPORTED_REPLY", reason })

/**
 * Send one registered request and classify what came back.
 *
 * `credentials: "omit"` is load-bearing: the refresh cookie is renewal input for the Core session
 * boundary and is never authorization for this route. A body-carrying request keeps its content type.
 * The route states an unauthenticated request as a 401, which is a session outcome; every other
 * status that still carries a JSON body is a reply the caller reads, because the route names its
 * own refusals in the body.
 *
 * @param url - Fully built registered URL; the access token is never part of it.
 * @param accessToken - The volatile Bearer token, or null when the session minted none.
 * @param request - Method and, for a mutation, the JSON body.
 * @returns Whether an envelope arrived, or the closed reason none did. No request is ever repeated.
 */
const sendShellRequest = async (
    url: URL,
    accessToken: string | null,
    request: ShellRequest,
): Promise<ShellExchange> => {
    if (accessToken === null || accessToken.length === 0) {
        return {
            arrived: false,
            failure: failed("refused", {
                code: "UNAUTHENTICATED",
                reason: "No access token is held, so no request left the browser.",
            }),
        }
    }
    const sent = await send({
        url: url.toString(),
        method: request.method,
        credentials: "omit",
        accessToken,
        json: request.json,
    })
    if (sent.ok) return { arrived: true, reply: { status: sent.data.status, body: sent.data.body } }
    if (sent.kind === "refused")
        return {
            arrived: false,
            failure: failed("refused", {
                status: sent.status,
                code: "UNAUTHENTICATED",
                reason: "Core refused the bearer token.",
            }),
        }
    if (sent.status !== null && sent.body !== null)
        return { arrived: true, reply: { status: sent.status, body: sent.body } }
    return { arrived: false, failure: sent }
}

const authoredCoreResult = (value: unknown): ShellCoreResult | null => {
    if (!isRecord(value)) return null
    if (value.availability !== "available" && value.availability !== "unavailable" && value.availability !== "refused")
        return null
    const reason = nullableText(value.reason)
    const workspaceId = nullableText(value.workspaceId)
    const instanceId = nullableText(value.instanceId)
    const name = nullableText(value.name)
    const runtimeGeneration = nullableText(value.runtimeGeneration)
    if (
        reason === undefined ||
        workspaceId === undefined ||
        instanceId === undefined ||
        name === undefined ||
        runtimeGeneration === undefined
    )
        return null
    if (
        value.runtimeAvailability !== "provisioned" &&
        value.runtimeAvailability !== "not_provisioned" &&
        value.runtimeAvailability !== "unavailable"
    )
        return null
    if (value.inventory === null)
        return {
            availability: value.availability,
            reason,
            workspaceId,
            instanceId,
            name,
            runtimeGeneration,
            runtimeAvailability: value.runtimeAvailability,
            inventory: null,
        }
    if (!isRecord(value.inventory)) return null
    const inventory = value.inventory
    if (
        inventory.availability !== "available" &&
        inventory.availability !== "partial" &&
        inventory.availability !== "unavailable"
    )
        return null
    if (inventory.completeness !== "complete" && inventory.completeness !== "partial") return null
    if (!isText(inventory.observedAt) || !Array.isArray(inventory.installations)) return null
    return {
        availability: value.availability,
        reason,
        workspaceId,
        instanceId,
        name,
        runtimeGeneration,
        runtimeAvailability: value.runtimeAvailability,
        inventory: {
            availability: inventory.availability,
            completeness: inventory.completeness,
            observedAt: inventory.observedAt,
            installations: inventory.installations,
        },
    }
}

const authoredEnvelope = (value: unknown, expected: ShellRead): ShellSourceEnvelope | null => {
    if (!isRecord(value)) return null
    const canonical = formatShellSourceIdentity(expected.identity)
    // A reply that re-spells the identity it answers for is not this source's answer, whatever it says.
    if (value.sourceIdentity !== canonical || value.readGeneration !== expected.readGeneration) return null
    if (!isWireAvailability(value.availability) || !isFreshness(value.freshness) || !isCompleteness(value.completeness))
        return null
    const observedAt = nullableText(value.observedAt)
    if (observedAt === undefined) return null
    if (value.payload !== null && !isRecord(value.payload)) return null
    if (value.availability === "refused" && value.payload !== null) return null
    return {
        sourceIdentity: canonical,
        readGeneration: expected.readGeneration,
        availability: value.availability,
        freshness: value.freshness,
        completeness: value.completeness,
        observedAt,
        payload: value.payload === null ? null : (value.payload as Readonly<Record<string, unknown>>),
    }
}

const authoredReceiverObservations = (value: unknown): ReadonlyArray<ShellReceiverObservation> | null => {
    if (!Array.isArray(value)) return null
    const entries: Array<ShellReceiverObservation> = []
    for (const entry of value) {
        if (
            !isRecord(entry) ||
            !isText(entry.observationId) ||
            !isCount(entry.observationVersion) ||
            entry.observationVersion < 1
        )
            return null
        if (typeof entry.kind !== "string" || !OBSERVATION_KINDS.has(entry.kind) || !isText(entry.schemaId)) return null
        const receiverReceiptId = nullableText(entry.receiverReceiptId)
        const payloadDigest = nullableText(entry.payloadDigest)
        const observedAt = nullableText(entry.observedAt)
        if (receiverReceiptId === undefined || payloadDigest === undefined || observedAt === undefined) return null
        entries.push({
            observationId: entry.observationId,
            observationVersion: entry.observationVersion,
            receiverReceiptId,
            kind: entry.kind as ShellReceiverObservation["kind"],
            schemaId: entry.schemaId,
            payloadDigest,
            observedAt,
        })
    }
    return entries
}

const authoredTransportGaps = (value: unknown): ReadonlyArray<ShellLocalTransportGap> | null => {
    if (!Array.isArray(value)) return null
    const entries: Array<ShellLocalTransportGap> = []
    for (const entry of value) {
        if (!isRecord(entry) || !isCount(entry.attempt) || !isText(entry.kind)) return null
        const observedAt = nullableText(entry.observedAt)
        if (observedAt === undefined) return null
        entries.push({ attempt: entry.attempt, kind: entry.kind, observedAt })
    }
    return entries
}

const authoredCommandObservation = (value: unknown): ShellCommandObservation | null => {
    if (!isRecord(value) || !isText(value.commandId) || !isText(value.receiverInstallationId)) return null
    if (typeof value.queueState !== "string" || !QUEUE_STATES.has(value.queueState) || !isCount(value.attempt))
        return null
    const possibleStartAt = nullableText(value.possibleStartAt)
    if (possibleStartAt === undefined) return null
    const observations = authoredReceiverObservations(value.observations)
    const localTransportGaps = authoredTransportGaps(value.localTransportGaps)
    if (observations === null || localTransportGaps === null) return null
    return {
        commandId: value.commandId,
        receiverInstallationId: value.receiverInstallationId,
        queueState: value.queueState as ShellCommandObservation["queueState"],
        attempt: value.attempt,
        possibleStartAt,
        observations,
        localTransportGaps,
    }
}

const authoredObservationProjection = <T>(
    value: unknown,
    narrow: (input: unknown) => T | null,
): ShellObservationProjection<T> | null => {
    if (!isRecord(value) || !isWireAvailability(value.availability)) return null
    if (value.availability === "available") {
        const projection = narrow(value.projection)
        if (projection === null || value.reason !== null) return null
        return { availability: "available", reason: null, projection }
    }
    if (!isText(value.reason) || value.projection !== null) return null
    return { availability: value.availability, reason: value.reason, projection: null }
}

const authoredAuthoritySource = (value: unknown): ShellAuthoritySourceStatus | null => {
    if (!isRecord(value) || !isWireAvailability(value.availability)) return null
    const reason = nullableText(value.reason)
    if (reason === undefined) return null
    return { availability: value.availability, reason, current: value.current ?? null }
}

const authoredAuthorityStatus = (value: unknown): ShellAuthorityStatus | null => {
    if (!isRecord(value) || !isText(value.installationId)) return null
    const grant = authoredAuthoritySource(value.grant)
    const config = authoredAuthoritySource(value.config)
    const setup = authoredAuthoritySource(value.setup)
    const runtime = authoredAuthoritySource(value.runtime)
    if (grant === null || config === null || setup === null || runtime === null) return null
    return { installationId: value.installationId, grant, config, setup, runtime }
}

const authoredLifecycleObservation = (value: unknown): ShellLifecycleObservation | null => {
    if (
        !isRecord(value) ||
        !isText(value.installationId) ||
        !isCount(value.lifecycleRevision) ||
        value.lifecycleRevision < 1
    )
        return null
    if (!isText(value.desiredCandidateGeneration)) return null
    if (
        typeof value.configurationRequirement !== "string" ||
        !CONFIGURATION_REQUIREMENTS.has(value.configurationRequirement)
    )
        return null
    if (typeof value.testState !== "string" || !TEST_STATES.has(value.testState)) return null
    if (typeof value.applicationState !== "string" || !APPLICATION_STATES.has(value.applicationState)) return null
    if (!isCount(value.runtimeFenceGeneration)) return null
    const configurationRevisionId = nullableText(value.configurationRevisionId)
    const testEvidenceId = nullableText(value.testEvidenceId)
    const appliedGeneration = nullableText(value.appliedGeneration)
    const lastObservationAt = nullableText(value.lastObservationAt)
    if (
        configurationRevisionId === undefined ||
        testEvidenceId === undefined ||
        appliedGeneration === undefined ||
        lastObservationAt === undefined
    )
        return null
    return {
        installationId: value.installationId,
        lifecycleRevision: value.lifecycleRevision,
        desiredCandidateGeneration: value.desiredCandidateGeneration,
        configurationRequirement:
            value.configurationRequirement as ShellLifecycleObservation["configurationRequirement"],
        configurationRevisionId,
        testState: value.testState as ShellLifecycleObservation["testState"],
        testEvidenceId,
        applicationState: value.applicationState as ShellLifecycleObservation["applicationState"],
        // A generation observed while the state was unknown is not evidence of what is running now.
        appliedGeneration: value.applicationState === "active" ? appliedGeneration : null,
        runtimeFenceGeneration: value.runtimeFenceGeneration,
        lastObservationAt,
    }
}

const authoredAppliedRecord = (value: unknown): ShellAppliedRecord | null => {
    if (
        !isRecord(value) ||
        !isText(value.installationId) ||
        !isText(value.currentCandidate) ||
        !isCount(value.runtimeFenceGeneration)
    )
        return null
    const appliedGeneration = nullableText(value.appliedGeneration)
    const observedAt = nullableText(value.observedAt)
    if (appliedGeneration === undefined || observedAt === undefined) return null
    return {
        installationId: value.installationId,
        currentCandidate: value.currentCandidate,
        appliedGeneration,
        runtimeFenceGeneration: value.runtimeFenceGeneration,
        observedAt,
        configurationIdentity: value.configurationIdentity ?? null,
    }
}

const authoredAppliedObservation = (value: unknown): ShellAppliedObservation | null => {
    if (!isRecord(value)) return null
    if (value.status === "refused") return isText(value.reason) ? { status: "refused", reason: value.reason } : null
    if (value.status !== "applied" && value.status !== "held") return null
    const record = authoredAppliedRecord(value.record)
    if (record === null) return null
    if (value.status === "applied")
        return value.mismatch === null ? { status: "applied", record, mismatch: null } : null
    if (!isRecord(value.mismatch) || !isText(value.mismatch.currentCandidate)) return null
    if (
        value.mismatch.reason !== "not-applied" &&
        value.mismatch.reason !== "candidate-drift" &&
        value.mismatch.reason !== "configuration-drift"
    )
        return null
    const appliedGeneration = nullableText(value.mismatch.appliedGeneration)
    if (appliedGeneration === undefined) return null
    return {
        status: "held",
        record,
        mismatch: {
            currentCandidate: value.mismatch.currentCandidate,
            appliedGeneration,
            reason: value.mismatch.reason,
        },
    }
}

const authoredReturnContext = (value: unknown, scope: ShellReadScope): ShellReturnContext | null => {
    if (!isRecord(value) || value.routeName !== SHELL_RETURN_ROUTE_NAME) return null
    if (value.workspaceId !== scope.workspaceId || value.instanceId !== scope.instanceId) return null
    const installationId = nullableText(value.installationId)
    if (installationId === undefined) return null
    return {
        routeName: SHELL_RETURN_ROUTE_NAME,
        workspaceId: scope.workspaceId,
        instanceId: scope.instanceId,
        installationId,
    }
}

const authoredDestination = (value: unknown, scope: ShellReadScope): ShellRegisteredDestination | null => {
    if (!isRecord(value) || value.grammarVersion !== SHELL_NAVIGATION_GRAMMAR_VERSION) return null
    if (typeof value.routeName !== "string" || !REGISTERED_VIEWS.has(value.routeName)) return null
    if (!isUuid(value.workspaceId) || !isUuid(value.instanceId) || !isUuid(value.installationId)) return null
    if (value.workspaceId !== scope.workspaceId || value.instanceId !== scope.instanceId) return null
    const opaqueItemId = nullableText(value.opaqueItemId)
    if (opaqueItemId === undefined) return null
    const returnContext = authoredReturnContext(value.returnContext, scope)
    if (returnContext === null) return null
    return {
        grammarVersion: SHELL_NAVIGATION_GRAMMAR_VERSION,
        routeName: value.routeName as ShellRegisteredViewName,
        workspaceId: scope.workspaceId,
        instanceId: scope.instanceId,
        installationId: value.installationId,
        opaqueItemId,
        returnContext,
    }
}

const authoredRefusal = (value: unknown): string | null =>
    isRecord(value) && value.kind === "refused" && isText(value.reason) ? value.reason : null

/** A request-level refusal, carrying the status Core chose beside the contract's reason token. */
const refusalFor = (sent: ShellArrivedReply): Failure | null => {
    const reason = authoredRefusal(sent.body)
    return reason === null
        ? null
        : failed(sent.status >= 400 ? failureKindOfStatus(sent.status) : "forbidden", {
              status: sent.status,
              code: reason,
              reason,
          })
}

/**
 * Read one overview: the requested source envelopes, each self-qualified.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact workspace and instance the reads are for.
 * @param selectionGeneration - The selection token the answer must echo.
 * @param reads - The requested sources and their generations.
 * @returns The closed overview answer, or the closed non-answer.
 */
export const readAgentosShellOverview = async (
    accessToken: string | null,
    scope: ShellReadScope,
    selectionGeneration: string,
    reads: ReadonlyArray<ShellRead>,
): Promise<Outcome<ShellOverviewAnswer>> => {
    const ordered = canonicalShellReads(reads)
    if (ordered === null || selectionGeneration.length === 0) return unsupportedRequest("invalid-read-scope")
    const query = keyedQuery([
        ...ordered.map((read) => ["read", formatShellRead(read.identity, read.readGeneration)] as const),
        ["selectionGeneration", encodeURIComponent(selectionGeneration)],
    ])
    const sent = await sendShellRequest(new URL(`${shellRouteUrl(scope).toString()}?${query}`), accessToken, {
        method: "GET",
    })
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (
        !isRecord(sent.reply.body) ||
        sent.reply.body.kind !== "overview" ||
        sent.reply.body.selectionGeneration !== selectionGeneration
    )
        return unreadableReply(sent.reply.status)
    if (sent.reply.body.core !== null && !isRecord(sent.reply.body.core)) return unreadableReply(sent.reply.status)
    const core = sent.reply.body.core === null ? null : authoredCoreResult(sent.reply.body.core)
    if (sent.reply.body.core !== null && core === null) return unreadableReply(sent.reply.status)
    if (!Array.isArray(sent.reply.body.sources) || sent.reply.body.sources.length !== ordered.length)
        return unreadableReply(sent.reply.status)
    const sources: Array<ShellSourceEnvelope> = []
    for (let index = 0; index < ordered.length; index += 1) {
        const read = ordered[index]
        if (read === undefined) return unreadableReply(sent.reply.status)
        const envelope = authoredEnvelope(sent.reply.body.sources[index], read)
        if (envelope === null) return unreadableReply(sent.reply.status)
        sources.push(envelope)
    }
    return { ok: true, data: { kind: "overview", selectionGeneration, core, sources } }
}

/**
 * Read one receiver's command observation.
 *
 * A status read: it never dispatches, reconciles, cancels or retries the command it reports on, and
 * it preserves every queue meaning rather than reading `settled` as completion.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The command, receiver source identity, generations and selection.
 * @returns The closed command-receipt answer, or the closed non-answer.
 */
export const readAgentosShellCommandReceipt = async (
    accessToken: string | null,
    scope: ShellCommandReceiptScope,
): Promise<Outcome<ShellCommandReceiptAnswer>> => {
    if (
        !isUuid(scope.commandId) ||
        scope.selectionGeneration.length === 0 ||
        !isCount(scope.readGeneration) ||
        scope.readGeneration < 1
    )
        return unsupportedRequest("invalid-read-scope")
    const query = keyedQuery([
        ["sourceIdentity", encodeURIComponent(scope.sourceIdentity)],
        ["readGeneration", String(scope.readGeneration)],
        ["selectionGeneration", encodeURIComponent(scope.selectionGeneration)],
    ])
    const sent = await sendShellRequest(
        shellRouteUrl(scope, `/command-receipts/${encodeURIComponent(scope.commandId)}?${query}`),
        accessToken,
        { method: "GET" },
    )
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (!isRecord(sent.reply.body) || sent.reply.body.kind !== "command_observation")
        return unreadableReply(sent.reply.status)
    // The read identity is echoed in full; a disagreement means this is another read's answer.
    if (
        sent.reply.body.selectionGeneration !== scope.selectionGeneration ||
        sent.reply.body.sourceIdentity !== scope.sourceIdentity ||
        sent.reply.body.readGeneration !== scope.readGeneration
    )
        return unreadableReply(sent.reply.status)
    const core = authoredCoreResult(sent.reply.body.core)
    const commandObservation = authoredObservationProjection(
        sent.reply.body.commandObservation,
        authoredCommandObservation,
    )
    if (core === null || commandObservation === null) return unreadableReply(sent.reply.status)
    return {
        ok: true,
        data: {
            kind: "command_observation",
            selectionGeneration: scope.selectionGeneration,
            sourceIdentity: scope.sourceIdentity,
            readGeneration: scope.readGeneration,
            core,
            commandObservation,
        },
    }
}

/**
 * Read Core's current authority status for one installation.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact installation inside the selected workspace and instance.
 * @returns The closed authority-status answer, or the closed non-answer.
 */
export const readAgentosShellAuthorityStatus = async (
    accessToken: string | null,
    scope: ShellInstallationScope,
): Promise<Outcome<ShellAuthorityStatusAnswer>> => {
    if (!isUuid(scope.installationId)) return unsupportedRequest("invalid-read-scope")
    const sent = await sendShellRequest(
        shellRouteUrl(
            scope,
            `/authority-status?${keyedQuery([["installationId", encodeURIComponent(scope.installationId)]])}`,
        ),
        accessToken,
        { method: "GET" },
    )
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (!isRecord(sent.reply.body) || sent.reply.body.kind !== "authority_status")
        return unreadableReply(sent.reply.status)
    const core = authoredCoreResult(sent.reply.body.core)
    const authorityStatus = authoredAuthorityStatus(sent.reply.body.authorityStatus)
    if (core === null || authorityStatus === null) return unreadableReply(sent.reply.status)
    if (authorityStatus.installationId !== scope.installationId) return unreadableReply(sent.reply.status)
    return { ok: true, data: { kind: "authority_status", core, authorityStatus } }
}

/**
 * Read one installation's actual lifecycle observation.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact installation inside the selected workspace and instance.
 * @returns The closed lifecycle answer, or the closed non-answer. Applied truth is reported apart
 *   from the lifecycle the instance claims, so a recorder that refuses is never read as absence.
 */
export const readAgentosShellLifecycleObservation = async (
    accessToken: string | null,
    scope: ShellInstallationScope,
): Promise<Outcome<ShellLifecycleObservationAnswer>> => {
    if (!isUuid(scope.installationId)) return unsupportedRequest("invalid-read-scope")
    const sent = await sendShellRequest(
        shellRouteUrl(scope, `/lifecycle-observations/${encodeURIComponent(scope.installationId)}`),
        accessToken,
        { method: "GET" },
    )
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (!isRecord(sent.reply.body) || sent.reply.body.kind !== "lifecycle_observation")
        return unreadableReply(sent.reply.status)
    const core = authoredCoreResult(sent.reply.body.core)
    const lifecycleObservation = authoredObservationProjection(
        sent.reply.body.lifecycleObservation,
        authoredLifecycleObservation,
    )
    const appliedObservation = authoredAppliedObservation(sent.reply.body.appliedObservation)
    if (core === null || lifecycleObservation === null || appliedObservation === null)
        return unreadableReply(sent.reply.status)
    return { ok: true, data: { kind: "lifecycle_observation", core, lifecycleObservation, appliedObservation } }
}

/**
 * The failure a navigation reply states instead of a destination, or null when it states one.
 *
 * The three failure kinds are read from their own `kind`; none of them is ever read as a partial
 * destination.
 *
 * @param body - The arrived, record-shaped reply.
 * @param status - The status Core stated the reply under.
 * @returns The failure, or null when the reply states a destination.
 */
const navigationFailure = (body: Record<string, unknown>, status: number): Failure | null => {
    if (body.kind === "unavailable")
        return failed("unavailable", {
            status,
            code: "NAVIGATION_UNAVAILABLE",
            reason: isText(body.reason) ? body.reason : "navigation-unavailable",
        })
    if (body.kind === "unsupported")
        return failed("invalid", {
            status,
            code: "NAVIGATION_UNSUPPORTED",
            reason: isText(body.reason) ? body.reason : "navigation-unsupported",
        })
    if (body.kind === "registered_destination") return null
    return unreadableReply(status, "unreadable-navigation-answer")
}

/**
 * Resolve one registered navigation destination.
 *
 * The only request this client can make that is not a read. It resolves a destination NAME for an
 * already-authorized entry and carries no command, operation or effect field, so it cannot be
 * widened into a mutation; a caller that wants an effect calls the owning module's own operation.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact selection, registered route key and optional opaque item identity.
 * @returns The registered destination, or the failure that says why it may not be opened. A
 *   destination resolved for a selection that is no longer displayed is `OBSOLETE_SELECTION`.
 */
export const resolveAgentosShellNavigation = async (
    accessToken: string | null,
    scope: ShellNavigationScope,
): Promise<Outcome<ShellRegisteredDestination>> => {
    if (!isUuid(scope.installationId) || scope.selectionGeneration.length === 0)
        return unsupportedRequest("invalid-navigation-intent")
    if (
        scope.routeKey !== "module_home" &&
        scope.routeKey !== "attention_item" &&
        scope.routeKey !== "result_item" &&
        scope.routeKey !== "operation_entry"
    )
        return unsupportedRequest("route-key-unsupported")
    const wantsItem = scope.routeKey === "attention_item" || scope.routeKey === "result_item"
    if (wantsItem !== (scope.opaqueItemId !== null)) return unsupportedRequest("invalid-navigation-intent")
    const intent = {
        workspaceId: scope.workspaceId,
        instanceId: scope.instanceId,
        installationId: scope.installationId,
        routeKey: scope.routeKey,
        opaqueItemId: scope.opaqueItemId,
        selectionGeneration: scope.selectionGeneration,
        returnContext: {
            routeName: SHELL_RETURN_ROUTE_NAME,
            workspaceId: scope.workspaceId,
            instanceId: scope.instanceId,
            installationId: scope.installationId,
        },
    }
    const url = shellRouteUrl(scope, `/operations/${encodeURIComponent(AGENTOS_SHELL_NAVIGATION_OPERATION)}`)
    const sent = await sendShellRequest(url, accessToken, { method: "POST", json: intent })
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    const body = sent.reply.body
    if (!isRecord(body)) return unreadableReply(sent.reply.status, "unreadable-navigation-answer")
    const failure = navigationFailure(body, sent.reply.status)
    if (failure !== null) return failure
    // A destination resolved for a selection that is no longer displayed is never opened.
    if (body.selectionGeneration !== scope.selectionGeneration)
        return failed("invalid", {
            status: sent.reply.status,
            code: "OBSOLETE_SELECTION",
            reason: "obsolete-selection",
        })
    const destination = authoredDestination(body.destination, scope)
    if (destination === null) return unreadableReply(sent.reply.status, "unregistered-destination")
    if (destination.installationId !== scope.installationId)
        return unreadableReply(sent.reply.status, "unregistered-destination")
    return { ok: true, data: destination }
}
