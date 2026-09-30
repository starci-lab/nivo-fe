import { MAX_SHELL_READ_GENERATION, MAX_SHELL_READS_PER_REQUEST } from "./types"
import type {
    ShellCommandObservation,
    ShellCompleteness,
    ShellFreshness,
    ShellLifecycleObservation,
    ShellRead,
    ShellReceiverObservation,
    ShellRegisteredViewName,
    ShellSourceIdentity,
    ShellWireAvailability,
} from "./types"

/** Availability states that may cross the shell wire. */
export const WIRE_AVAILABILITIES: ReadonlySet<string> = new Set([
    "available",
    "partial",
    "unavailable",
    "unsupported",
    "refused",
])
/** Freshness states that may cross the shell wire. */
export const FRESHNESSES: ReadonlySet<string> = new Set(["current", "stale", "unknown"])
/** Completeness states that may cross the shell wire. */
export const COMPLETENESSES: ReadonlySet<string> = new Set(["complete", "partial", "unknown"])
/** Queue states the shell may report for a command observation. */
export const QUEUE_STATES: ReadonlySet<string> = new Set([
    "queued",
    "claimed",
    "possible_start",
    "settled",
    "cancelled_before_start",
    "quarantined",
])
/** Receiver-authored observation kinds accepted by the registered grammar. */
export const OBSERVATION_KINDS: ReadonlySet<string> = new Set(["progress", "question", "final", "outcome_unknown"])
/** Configuration requirements accepted for one lifecycle observation. */
export const CONFIGURATION_REQUIREMENTS: ReadonlySet<string> = new Set(["required", "server_established_not_applicable"])
/** Test states accepted for one lifecycle observation. */
export const TEST_STATES: ReadonlySet<string> = new Set(["not_tested", "testing", "passed", "rejected"])
/** Application states accepted for one lifecycle observation. */
export const APPLICATION_STATES: ReadonlySet<string> = new Set([
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
/** Destination names Core may register for navigation. */
export const REGISTERED_VIEWS: ReadonlySet<string> = new Set([
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

/** Recognize non-empty wire text. */
export const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0
/** Recognize a non-negative safe integer count. */
export const isCount = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
/** Recognize the UUID spelling accepted for shell identities. */
export const isUuid = (value: unknown): value is string =>
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value)
/** Distinguish nullable text from a malformed value while narrowing a wire answer. */
export const nullableText = (value: unknown): string | null | undefined => {
    if (value === null) return null
    return isText(value) ? value : undefined
}
/** Membership in the registered availability set, as a narrowing the compiler can follow. */
export const isWireAvailability = (value: unknown): value is ShellWireAvailability =>
    typeof value === "string" && WIRE_AVAILABILITIES.has(value)
/** Membership in the registered freshness set, as a narrowing the compiler can follow. */
export const isFreshness = (value: unknown): value is ShellFreshness => typeof value === "string" && FRESHNESSES.has(value)
/** Membership in the registered completeness set, as a narrowing the compiler can follow. */
export const isCompleteness = (value: unknown): value is ShellCompleteness =>
    typeof value === "string" && COMPLETENESSES.has(value)
/** Membership in the registered observation-kind set, as a narrowing the compiler can follow. */
export const isObservationKind = (value: unknown): value is ShellReceiverObservation["kind"] =>
    typeof value === "string" && OBSERVATION_KINDS.has(value)
/** Membership in the registered queue-state set, as a narrowing the compiler can follow. */
export const isQueueState = (value: unknown): value is ShellCommandObservation["queueState"] =>
    typeof value === "string" && QUEUE_STATES.has(value)
/** Membership in the registered configuration-requirement set, as a narrowing the compiler can follow. */
export const isConfigurationRequirement = (
    value: unknown,
): value is ShellLifecycleObservation["configurationRequirement"] =>
    typeof value === "string" && CONFIGURATION_REQUIREMENTS.has(value)
/** Membership in the registered test-state set, as a narrowing the compiler can follow. */
export const isTestState = (value: unknown): value is ShellLifecycleObservation["testState"] =>
    typeof value === "string" && TEST_STATES.has(value)
/** Membership in the registered application-state set, as a narrowing the compiler can follow. */
export const isApplicationState = (value: unknown): value is ShellLifecycleObservation["applicationState"] =>
    typeof value === "string" && APPLICATION_STATES.has(value)
/** Membership in the registered navigation-view set, as a narrowing the compiler can follow. */
export const isRegisteredViewName = (value: unknown): value is ShellRegisteredViewName =>
    typeof value === "string" && REGISTERED_VIEWS.has(value)

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
