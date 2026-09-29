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

export {
    AGENTOS_SHELL_NAVIGATION_OPERATION,
    MAX_SHELL_READS_PER_REQUEST,
    MAX_SHELL_READ_GENERATION,
    SHELL_NAVIGATION_GRAMMAR_VERSION,
    SHELL_RETURN_ROUTE_NAME,
} from "./types"
export {
    canonicalShellReads,
    compareShellSourceIdentity,
    formatShellRead,
    formatShellSourceIdentity,
} from "./identity"
export {
    readAgentosShellAuthorityStatus,
    readAgentosShellCommandReceipt,
    readAgentosShellLifecycleObservation,
    readAgentosShellOverview,
} from "./reads"
export { resolveAgentosShellNavigation } from "./navigation"
export type {
    ShellAppliedMismatch,
    ShellAppliedObservation,
    ShellAppliedRecord,
    ShellArrivedReply,
    ShellAuthoritySourceStatus,
    ShellAuthorityStatus,
    ShellAuthorityStatusAnswer,
    ShellCommandObservation,
    ShellCommandReceiptAnswer,
    ShellCommandReceiptScope,
    ShellCompleteness,
    ShellCoreResult,
    ShellFreshness,
    ShellInstallationScope,
    ShellInstallationSourceKind,
    ShellLifecycleObservation,
    ShellLifecycleObservationAnswer,
    ShellLocalTransportGap,
    ShellNavigationScope,
    ShellObservationProjection,
    ShellOverviewAnswer,
    ShellRead,
    ShellReadScope,
    ShellReceiverObservation,
    ShellRegisteredDestination,
    ShellRegisteredViewName,
    ShellReturnContext,
    ShellRouteKey,
    ShellSelectionSourceKind,
    ShellSourceEnvelope,
    ShellSourceIdentity,
    ShellWireAvailability,
} from "./types"
