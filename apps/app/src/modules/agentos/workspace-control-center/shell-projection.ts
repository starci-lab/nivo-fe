import { isRecord } from "@nivo/api"
import type { ShellSourceIdentity } from "@/modules/api/agentos-shell"
import type { ShellSourceObservation, ShellSourceStanding } from "@/modules/agentos/shell-observation-store"
import type { AgentOSShellFacetStanding, AgentOSShellInstallationView, AgentOSShellOperationStanding, AgentOSShellOperationView, AgentOSShellReading, AgentOSShellView, AgentOSShellViewStatus, AgentOSWorkspaceControlCenterShellLabels } from "./shell-types"

/** The operation list of a view that shows none. */
const NO_OPERATIONS: ReadonlyArray<AgentOSShellOperationView> = []

/** One string field of a source payload, or null when the payload does not carry it. */
const payloadText = (payload: Readonly<Record<string, unknown>> | null, key: string): string | null => {
    const value = payload === null ? null : payload[key]
    return typeof value === "string" && value.length > 0 ? value : null
}

/** The installation rows a payload carries, or null when it carries no row array at all. */
const payloadRows = (
    payload: Readonly<Record<string, unknown>> | null,
): ReadonlyArray<Readonly<Record<string, unknown>>> | null => {
    const value = payload === null ? null : payload.installations
    if (!Array.isArray(value)) return null
    return value.filter(
        (entry): entry is Readonly<Record<string, unknown>> => typeof entry === "object" && entry !== null,
    )
}

/** The three-way configuration identity one configuration payload reports, digests kept separate. */
const configurationOf = (payload: Readonly<Record<string, unknown>> | null) => {
    const identity = payload === null ? null : payload.configurationIdentity
    if (!isRecord(identity)) return null
    const digestOf = (key: string): string | null => {
        const value = identity[key]
        return typeof value === "string" && value.length > 0 ? value : null
    }
    return {
        desiredDigest: digestOf("desiredDigest"),
        testedDigest: digestOf("testedDigest"),
        appliedDigest: digestOf("appliedDigest"),
    }
}

/** How deep a facet's standing is, so several sources can be read as one situation without merging them. */
const standingOf = (observation: ShellSourceObservation | null): AgentOSShellFacetStanding => {
    if (observation === null) return "unresolved"
    if (observation.state === "available" || observation.state === "partial") {
        if (observation.freshness === "stale") return "stale"
        return observation.state === "partial" ? "partial" : "current"
    }
    return observation.state
}

/** One source's own observation, matched by the identity the shell allocated for it. */
const observationOf = (
    sources: ReadonlyArray<ShellSourceObservation>,
    kind: ShellSourceIdentity["kind"],
    installationId?: string,
): ShellSourceObservation | null => {
    for (const observation of sources) {
        const identity: ShellSourceIdentity = observation.identity
        if (identity.kind !== kind) continue
        if (installationId === undefined) return observation
        if ("installationId" in identity && identity.installationId === installationId) return observation
    }
    return null
}

/** Whether this standing still settles nothing of its own, so the view keeps waiting for it. */
const isSettling = (standing: ShellSourceStanding): boolean => standing === "unresolved" || standing === "loading"

/** One receiver observation's operation standing, taken from the receipt's own queue state. */
const operationStandingOf = (observation: ShellSourceObservation): AgentOSShellOperationStanding => {
    const standing = standingOf(observation)
    if (standing !== "current" && standing !== "partial") return standing
    const payload = observation.payload
    const queueState = payloadText(payload, "queueState")
    const entries = payload === null || !Array.isArray(payload.observations) ? [] : payload.observations
    const kinds = entries.map((entry: unknown) => (isRecord(entry) ? entry.kind : null))
    // The receiver's own unknown beats every hopeful reading; an ambiguous queue state is never
    // presented as a confirmed outcome.
    if (
        kinds.includes("outcome_unknown") ||
        queueState === "possible_start" ||
        queueState === "quarantined" ||
        queueState === "cancelled_before_start"
    )
        return "uncertain"
    if (queueState === "settled") return kinds.includes("final") ? "confirmed" : "uncertain"
    if (queueState === "queued" || queueState === "claimed") return "pending"
    return "uncertain"
}

/**
 * Project the connected shell onto one settled view.
 *
 * WHY THE DECISION LIVES HERE. Every source answers for itself, so the surface reading of those
 * answers is one pure function of the observations rather than a comparison each component makes
 * for itself: an owner may see a current inventory beside an unavailable runtime, and only this
 * projection decides that is an evidence limit rather than an empty or all-ready workspace.
 */
export const projectAgentOSShellView = (
    reading: AgentOSShellReading,
    labels: AgentOSWorkspaceControlCenterShellLabels,
): AgentOSShellView => {
    const identity = observationOf(reading.sources, "core_registry")
    const inventory = observationOf(reading.sources, "installation_inventory")
    const runtime = observationOf(reading.sources, "runtime")
    const attention = observationOf(reading.sources, "attention")
    const inventoryStanding = standingOf(inventory)
    const runtimeStanding = standingOf(runtime)
    const attentionStanding = standingOf(attention)
    const rows = payloadRows(inventory === null ? null : inventory.payload)
    const installations: ReadonlyArray<AgentOSShellInstallationView> =
        rows === null
            ? []
            : rows.flatMap((row) => {
                  const installationId = payloadText(row, "installationId")
                  if (installationId === null) return []
                  const configuration = observationOf(reading.sources, "configuration", installationId)
                  const digests = configurationOf(configuration === null ? null : configuration.payload)
                  return [
                      {
                          installationId,
                          moduleKey: payloadText(row, "moduleKey"),
                          displayName: payloadText(row, "displayName") ?? installationId,
                          status: payloadText(row, "status"),
                          configuration:
                              configuration === null
                                  ? null
                                  : {
                                        standing: standingOf(configuration),
                                        observedAt: configuration.observedAt,
                                        desiredDigest: digests === null ? null : digests.desiredDigest,
                                        testedDigest: digests === null ? null : digests.testedDigest,
                                        appliedDigest: digests === null ? null : digests.appliedDigest,
                                    },
                      },
                  ]
              })
    const base = {
        workspaceId: payloadText(identity === null ? null : identity.payload, "workspaceId"),
        instanceId: payloadText(identity === null ? null : identity.payload, "instanceId"),
        // The heading is always renderable: an identity the source did not name falls back to the
        // shell's own copy here rather than making the drawing half choose a word.
        name: payloadText(identity === null ? null : identity.payload, "name") ?? labels.headingFallback,
        identityObservedAt: identity === null ? null : identity.observedAt,
        inventoryStanding,
        inventoryObservedAt: inventory === null ? null : inventory.observedAt,
        inventoryEmpty:
            inventoryStanding === "current" &&
            inventory !== null &&
            inventory.completeness === "complete" &&
            installations.length === 0,
        runtimeStanding,
        runtimeAvailability: payloadText(runtime === null ? null : runtime.payload, "runtimeAvailability"),
        runtimeGeneration: payloadText(runtime === null ? null : runtime.payload, "runtimeGeneration"),
        runtimeObservedAt: runtime === null ? null : runtime.observedAt,
        installations,
        attentionStanding,
        attentionObservedAt: attention === null ? null : attention.observedAt,
        operations: NO_OPERATIONS,
    }
    // 1. No session, or a session nobody has settled yet: nothing about this scope is disclosed.
    if (reading.session === "sign-in-required" || reading.sessionStatus === "anonymous")
        return {
            ...base,
            state: "sign-in-required",
            workspaceId: null,
            instanceId: null,
            name: null,
            identityObservedAt: null,
            installations: [],
            retrying: false,
        }
    if (reading.sessionStatus === "restoring")
        return {
            ...base,
            state: "loading",
            workspaceId: null,
            instanceId: null,
            name: null,
            identityObservedAt: null,
            installations: [],
            retrying: false,
        }
    // 2. A refusal is an authorization judgment: it clears private content and is never a limit.
    if (
        runtimeStanding === "refused" ||
        inventoryStanding === "refused" ||
        attentionStanding === "refused" ||
        (identity !== null && identity.state === "refused")
    )
        return {
            ...base,
            state: "access-denied",
            name: null,
            identityObservedAt: null,
            installations: [],
            retrying: false,
        }
    // 3. A signed-in owner whose access cannot be established: retryable, and it asks for no sign-in.
    if (reading.session === "access-unestablished") return { ...base, state: "access-unverified", retrying: false }
    const operations: ReadonlyArray<AgentOSShellOperationView> = reading.sources.flatMap((source) => {
        const sourceIdentity = source.identity
        if (sourceIdentity.kind !== "receiver") return []
        const receiver = installations.find(
            (installation) => installation.installationId === sourceIdentity.installationId,
        )
        return [
            {
                installationId: sourceIdentity.installationId,
                intentId: sourceIdentity.intentId,
                commandId: payloadText(source.payload, "commandId"),
                receiverName: receiver === undefined ? sourceIdentity.installationId : receiver.displayName,
                standing: operationStandingOf(source),
                observedAt: source.observedAt,
            },
        ]
    })
    const settledView = { ...base, operations }
    const settled = [identity, inventory, runtime].filter(
        (observation) => observation !== null && !isSettling(observation.state),
    ).length
    const settling = [identity, inventory, runtime].some(
        (observation): boolean => observation === null || isSettling(observation.state),
    )
    if (settled === 0)
        return {
            ...settledView,
            state: "loading",
            name: null,
            identityObservedAt: null,
            installations: [],
            operations: [],
            retrying: false,
        }
    // 4. Nothing but an outage: every whole-selection source answered the same way, so this is a
    //    verification failure to retry rather than a permission decision to accept.
    if (
        !settling &&
        identity !== null &&
        inventory !== null &&
        (identity.state === "unavailable" || identity.state === "unsupported") &&
        (inventoryStanding === "unavailable" || inventoryStanding === "unsupported")
    ) {
        return {
            ...settledView,
            state: "access-unverified",
            name: null,
            identityObservedAt: null,
            installations: [],
            operations: [],
            retrying: false,
        }
    }
    const contentState: AgentOSShellViewStatus = (() => {
        // 5. A facet that is still reading while its siblings settled is the retried facet, not a fresh load.
        if (settling) return "retrying"
        // 6. An authorized workspace whose runtime is absent keeps its identity and says so plainly.
        if (base.runtimeAvailability === "not_provisioned") return "no-runtime"
        // 7. Only a current, complete, authorized observation may call the installation list empty.
        if (
            inventoryStanding === "current" &&
            inventory !== null &&
            inventory.completeness === "complete" &&
            installations.length === 0
        )
            return "installed-empty"
        if (installations.length > 0 && (inventoryStanding === "current" || inventoryStanding === "partial")) {
            const limited =
                inventoryStanding !== "current" ||
                runtimeStanding !== "current" ||
                attentionStanding !== "unsupported" ||
                installations.some(
                    (installation) =>
                        installation.configuration !== null && installation.configuration.standing !== "current",
                )
            return limited ? "evidence-limited" : "installed-current"
        }
        // 8. A stale observation is shown as last-known, never as current.
        if (inventoryStanding === "stale") return "last-known"
        return "evidence-limited"
    })()
    // 9. A returned operation owns the situation once the selection settled: its receiver source,
    //    not a sibling facet, decides pending, confirmed or uncertain - and never a success claim.
    const operationState = operations.some((operation) => operation.standing === "uncertain")
        ? "operation-uncertain"
        : operations.some((operation) => operation.standing === "pending")
          ? "operation-pending"
          : operations.length > 0 && operations.every((operation) => operation.standing === "confirmed")
            ? "operation-confirmed"
            : null
    return { ...settledView, state: operationState ?? contentState, retrying: contentState === "retrying" }
}
