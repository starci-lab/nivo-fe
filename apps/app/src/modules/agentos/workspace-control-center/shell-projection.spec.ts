import { describe, expect, it } from "vitest"
import type { ShellSourceIdentity } from "@/modules/api/agentos-shell"
import type { ShellSourceObservation, ShellSourceStanding } from "@/modules/agentos/shell-observation-store"
import type { AgentOSShellReading, AgentOSWorkspaceControlCenterShellLabels } from "./shell-types"
import { projectAgentOSShellView } from "./shell-projection"

const labels: AgentOSWorkspaceControlCenterShellLabels = {
    headingFallback: "AgentOS workspace",
    eyebrow: "AgentOS",
    description: "The actual installed modules.",
    signInRequired: "Sign in to view this workspace.",
    signInAction: "Sign in",
    accessDenied: "Current access is not permitted.",
    accessUnverified: "Access could not be verified.",
    retry: "Retry",
    loading: "Reading the latest status.",
    sourceTime: "Observed at",
    identityInstance: "instance",
    inventorySection: "Installed modules",
    inventoryEmpty: "No module is installed.",
    inventoryEmptyDescription: "The observation is complete and authorized.",
    inventoryLimitPartial: "The module list was only observed in part.",
    inventoryLimitStale: "The module list is last-known.",
    inventoryLimitUnavailable: "The module list source is not answering.",
    inventoryLimitUnsupported: "This source does not support the module list.",
    inventoryLimitRefused: "The module list source refused.",
    inventoryLimitLoading: "Reading the module list.",
    lastKnown: "Last known",
    retrying: "Retrying",
    runtimeSection: "Runtime",
    runtimeProvisioned: "Runtime is provisioned.",
    runtimeNotProvisioned: "Runtime is not provisioned.",
    runtimeUnavailable: "Runtime is currently unavailable.",
    runtimeUnknown: "The runtime standing could not be established.",
    configurationSection: "Configuration",
    configurationAbsent: "No configuration observation exists.",
    configurationUnsupported: "This source does not support configuration.",
    attentionSection: "Needs attention",
    attentionUnsupported: "This source does not support attention.",
    resultSection: "Latest result",
    resultUnavailable: "No result has been observed.",
    resultPending: "The receiver accepted the operation and its result is still pending.",
    resultConfirmed: "The receiver confirmed the operation result.",
    resultUncertain: "The receiver has not clearly confirmed the operation result.",
    resultRecheck: "Read the result again",
    installEntry: "Install module",
}

const sourceObservation = (
    identity: ShellSourceIdentity,
    state: ShellSourceStanding,
    extra: Partial<ShellSourceObservation> = {},
): ShellSourceObservation => ({
    identity,
    readGeneration: 1,
    state,
    availability: state === "available" || state === "partial" ? "available" : null,
    freshness: state === "available" || state === "partial" ? "current" : null,
    completeness: state === "available" || state === "partial" ? "complete" : null,
    observedAt: "2026-09-26T03:00:00.000Z",
    payload: null,
    ...extra,
})

const reading = (
    sources: ReadonlyArray<ShellSourceObservation>,
    session: AgentOSShellReading["session"] = "established",
): AgentOSShellReading => ({ session, sessionStatus: "signed-in", sources })

const identity = sourceObservation({ kind: "core_registry" }, "available", {
    payload: { workspaceId: "ws-1", instanceId: "inst-1", name: "Acme AgentOS", runtimeAvailability: "provisioned" },
})
const runtime = sourceObservation({ kind: "runtime" }, "available", {
    payload: { runtimeGeneration: "gen-1", runtimeAvailability: "provisioned" },
})
const attention = sourceObservation({ kind: "attention", installationId: "installation-1" }, "unsupported")
const inventoryOf = (
    rows: ReadonlyArray<Readonly<Record<string, unknown>>>,
    extra: Partial<ShellSourceObservation> = {},
) => sourceObservation({ kind: "installation_inventory" }, "available", { payload: { installations: rows }, ...extra })
const row = (installationId: string, moduleKey: string, displayName: string, status: string) => ({
    installationId,
    moduleKey,
    displayName,
    status,
})

describe("projectAgentOSShellView", () => {
    it("keeps every installation of one package as its own entry with exact identity and purpose", () => {
        const view = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([
                    row("installation-1", "sales-copilot", "Sales Copilot", "installed"),
                    row("installation-2", "sales-copilot", "Sales Copilot EU", "installed"),
                ]),
            ]),
            labels,
        )
        expect(view.state).toBe("installed-current")
        expect(view.installations.map((installation) => installation.installationId)).toEqual([
            "installation-1",
            "installation-2",
        ])
        expect(view.installations.map((installation) => installation.moduleKey)).toEqual([
            "sales-copilot",
            "sales-copilot",
        ])
        expect(view.name).toBe("Acme AgentOS")
    })

    it("never labels an absent package installed or ready", () => {
        const view = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
            ]),
            labels,
        )
        expect(JSON.stringify(view.installations)).not.toContain("accounting")
    })

    it("calls the list empty only for a current complete authorized zero count", () => {
        const view = projectAgentOSShellView(reading([identity, runtime, attention, inventoryOf([])]), labels)
        expect(view.state).toBe("installed-empty")
        const partial = projectAgentOSShellView(
            reading([identity, runtime, attention, inventoryOf([], { state: "partial", completeness: "partial" })]),
            labels,
        )
        expect(partial.state).toBe("evidence-limited")
        const unavailable = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                sourceObservation({ kind: "installation_inventory" }, "unavailable"),
            ]),
            labels,
        )
        expect(unavailable.state).toBe("evidence-limited")
        expect(unavailable.installations).toEqual([])
    })

    it("shows a stale observation as last-known and never as current", () => {
        const view = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")], {
                    freshness: "stale",
                }),
            ]),
            labels,
        )
        expect(view.inventoryStanding).toBe("stale")
        expect(view.state).toBe("last-known")
    })

    it("clears every scope on a refusal and asks for no sign-in on an unverified access", () => {
        const refused = projectAgentOSShellView(
            reading([identity, sourceObservation({ kind: "installation_inventory" }, "refused")]),
            labels,
        )
        expect(refused.state).toBe("access-denied")
        expect(refused.name).toBeNull()
        expect(refused.installations).toEqual([])
        const unverified = projectAgentOSShellView(
            reading([
                sourceObservation({ kind: "core_registry" }, "unavailable"),
                sourceObservation({ kind: "installation_inventory" }, "unavailable"),
                sourceObservation({ kind: "runtime" }, "unavailable"),
            ]),
            labels,
        )
        expect(unverified.state).toBe("access-unverified")
    })

    it("discloses nothing at all before a session is settled", () => {
        const view = projectAgentOSShellView(
            {
                session: "sign-in-required",
                sessionStatus: "anonymous",
                sources: [
                    identity,
                    inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
                ],
            },
            labels,
        )
        expect(view.state).toBe("sign-in-required")
        expect(view.name).toBeNull()
        expect(view.installations).toEqual([])
        expect(JSON.stringify(view)).not.toContain("Acme AgentOS")
    })

    it("keeps the identity visible when the runtime is absent", () => {
        const view = projectAgentOSShellView(
            reading([
                identity,
                sourceObservation({ kind: "runtime" }, "available", {
                    payload: { runtimeGeneration: null, runtimeAvailability: "not_provisioned" },
                }),
                inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
            ]),
            labels,
        )
        expect(view.state).toBe("no-runtime")
        expect(view.name).toBe("Acme AgentOS")
    })

    it("reports a still-reading facet beside settled siblings as the retried facet", () => {
        const view = projectAgentOSShellView(
            reading([identity, runtime, sourceObservation({ kind: "installation_inventory" }, "loading")]),
            labels,
        )
        expect(view.state).toBe("retrying")
        expect(view.retrying).toBe(true)
    })

    const receipt = (queueState: string, kinds: ReadonlyArray<string> = []) =>
        sourceObservation({ kind: "receiver", installationId: "installation-1", intentId: "intent-1" }, "available", {
            payload: {
                commandId: "c-1",
                receiverInstallationId: "installation-1",
                queueState,
                attempt: 1,
                possibleStartAt: null,
                observations: kinds.map((kind, index) => ({
                    observationId: `o-${index}`,
                    observationVersion: 1,
                    receiverReceiptId: null,
                    kind,
                    schemaId: "s",
                    payloadDigest: null,
                    observedAt: "2026-09-26T03:0" + index + ":00.000Z",
                })),
                localTransportGaps: [],
            },
        })

    it("shows an accepted but unfinished receiver command as pending, never as confirmed", () => {
        const pending = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
                receipt("claimed", ["progress"]),
            ]),
            labels,
        )
        expect(pending.state).toBe("operation-pending")
        expect(pending.operations).toHaveLength(1)
        expect(pending.operations[0]).toMatchObject({
            installationId: "installation-1",
            intentId: "intent-1",
            commandId: "c-1",
            receiverName: "Sales Copilot",
            standing: "pending",
        })
        // The separate installation and runtime state stays its own answer beside the receipt.
        expect(pending.installations).toHaveLength(1)
        expect(pending.runtimeAvailability).toBe("provisioned")
    })

    it("shows a receiver's final observation on a settled queue as confirmed with its source time", () => {
        const confirmed = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
                receipt("settled", ["progress", "final"]),
            ]),
            labels,
        )
        expect(confirmed.state).toBe("operation-confirmed")
        expect(confirmed.operations[0]?.standing).toBe("confirmed")
        expect(confirmed.operations[0]?.observedAt).toBe("2026-09-26T03:00:00.000Z")
    })

    it("never reads an ambiguous queue state or the receiver's own unknown as a confirmed result", () => {
        for (const queueState of ["possible_start", "quarantined", "cancelled_before_start", "settled"]) {
            const view = projectAgentOSShellView(
                reading([
                    identity,
                    runtime,
                    attention,
                    inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
                    receipt(queueState, queueState === "settled" ? ["outcome_unknown"] : []),
                ]),
                labels,
            )
            expect([queueState, view.state]).toEqual([queueState, "operation-uncertain"])
        }
    })

    it("keeps an unread or refused receipt as its own source standing rather than an operation state", () => {
        const reading2 = reading([
            identity,
            runtime,
            attention,
            inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
            sourceObservation({ kind: "receiver", installationId: "installation-1", intentId: "intent-1" }, "loading"),
        ])
        const pendingRead = projectAgentOSShellView(reading2, labels)
        expect(pendingRead.state).toBe("installed-current")
        expect(pendingRead.operations[0]?.standing).toBe("loading")
        const refusedReceipt = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]),
                sourceObservation(
                    { kind: "receiver", installationId: "installation-1", intentId: "intent-1" },
                    "refused",
                ),
            ]),
            labels,
        )
        expect(refusedReceipt.state).toBe("installed-current")
        expect(refusedReceipt.operations[0]?.standing).toBe("refused")
    })

    it("clears operation identities together with the rest of the scope on a refused access", () => {
        const denied = projectAgentOSShellView(
            reading([
                identity,
                sourceObservation({ kind: "installation_inventory" }, "refused"),
                receipt("claimed", ["progress"]),
            ]),
            labels,
        )
        expect(denied.state).toBe("access-denied")
        expect(denied.operations).toEqual([])
    })
})
