import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    initialShellObservationSnapshot,
    isShellReadBlocked,
    reduceShellObservation,
    shellOperationIdentities,
    shellSelectionIdentities,
    shellSourceObservation,
    type ShellObservationEvent,
    type ShellObservationSnapshot,
    type ShellSelection,
    type ShellSourceOutcome
} from "./shell-observation-store"
import type { ShellSourceIdentity } from "@/modules/api/agentos-shell"

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const OTHER_INSTANCE = "55555555-5555-4555-8555-555555555555"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"

const selection: ShellSelection = { workspaceId: WORKSPACE, instanceId: INSTANCE }
const otherSelection: ShellSelection = { workspaceId: WORKSPACE, instanceId: OTHER_INSTANCE }
const registry: ShellSourceIdentity = { kind: "core_registry" }
const runtime: ShellSourceIdentity = { kind: "runtime" }
const attention: ShellSourceIdentity = { kind: "attention", installationId: INSTALLATION }

const available: Extract<ShellSourceOutcome, { readonly kind: "observation" }> = {
    kind: "observation",
    availability: "available",
    freshness: "current",
    completeness: "complete",
    observedAt: "2026-09-25T03:00:00.000Z",
    payload: { installations: [] }
}

const state = (): ShellObservationSnapshot => initialShellObservationSnapshot(selection, 1)

/** Where a read claims to have come from; a case overrides it to simulate an obsolete answer. */
interface ReadOrigin {
    readonly sessionEpoch?: number;
    readonly selection?: ShellSelection;
}

const begin = (identity: ShellSourceIdentity, readGeneration: number, origin: ReadOrigin = {}): ShellObservationEvent => ({
    type: "begin-read",
    sessionEpoch: origin.sessionEpoch ?? 1,
    selection: origin.selection ?? selection,
    identity,
    readGeneration
})

const settle = (identity: ShellSourceIdentity, readGeneration: number, outcome: ShellSourceOutcome, origin: ReadOrigin = {}): ShellObservationEvent => ({
    type: "apply-outcome",
    sessionEpoch: origin.sessionEpoch ?? 1,
    selection: origin.selection ?? selection,
    identity,
    readGeneration,
    outcome
})

/** Read one source and settle it, so a case can start from a store that already holds content. */
const readSource = (current: ShellObservationSnapshot, identity: ShellSourceIdentity, generation: number, outcome: ShellSourceOutcome = available): ShellObservationSnapshot =>
    reduceShellObservation(reduceShellObservation(current, begin(identity, generation)).state, settle(identity, generation, outcome)).state

beforeEach(() => {
    vi.restoreAllMocks()
})

describe("shellSelectionIdentities", () => {
    it("gives every known installation its own capability, attention and configuration sources", () => {
        const identities = shellSelectionIdentities([INSTALLATION, OTHER_INSTANCE]).map(identity => identity.kind)
        expect(identities).toEqual([
            "attention", "attention", "capability", "capability", "configuration", "configuration",
            "core_registry", "installation_inventory", "runtime"
        ])
        expect(shellSelectionIdentities([])).toHaveLength(3)
    })
})

describe("shellOperationIdentities", () => {
    it("gives each returned operation its own receiver source and never duplicates one", () => {
        const operations = [
            { installationId: INSTALLATION, intentId: "intent-1", commandId: "command-1" },
            { installationId: INSTALLATION, intentId: "intent-2", commandId: "command-2" },
            { installationId: OTHER_INSTANCE, intentId: "intent-1", commandId: "command-3" },
            { installationId: INSTALLATION, intentId: "intent-1", commandId: "command-4" }
        ]
        const identities = shellOperationIdentities(operations)
        expect(identities).toEqual([
            { kind: "receiver", installationId: INSTALLATION, intentId: "intent-1" },
            { kind: "receiver", installationId: INSTALLATION, intentId: "intent-2" },
            { kind: "receiver", installationId: OTHER_INSTANCE, intentId: "intent-1" }
        ])
        expect(shellOperationIdentities([])).toEqual([])
    })

    it("lets a receiver source run through the same identity-bound begin/apply cycle", () => {
        const receiver: ShellSourceIdentity = { kind: "receiver", installationId: INSTALLATION, intentId: "intent-1" }
        const current = readSource(state(), registry, 1)
        const begun = reduceShellObservation(current, begin(receiver, 1))
        expect(begun.transition).toBe("begin-read")
        const settled = reduceShellObservation(begun.state, settle(receiver, 1, { ...available, payload: { queueState: "claimed" } }))
        expect(settled.transition).toBe("apply-current")
        expect(shellSourceObservation(settled.state, receiver)?.state).toBe("available")
        // An answer from an ended session of the same receiver source changes nothing.
        const late = reduceShellObservation(settled.state, settle(receiver, 1, { kind: "unavailable" }, { sessionEpoch: 0 }))
        expect(late.transition).toBe("none")
        expect(shellSourceObservation(late.state, receiver)?.state).toBe("available")
    })
})

describe("reduceShellObservation", () => {
    it("moves a source from unresolved to loading to available under the published names", () => {
        const begun = reduceShellObservation(state(), begin(registry, 1))
        expect(begun.transition).toBe("begin-read")
        expect(shellSourceObservation(begun.state, registry)?.state).toBe("loading")

        const settled = reduceShellObservation(begun.state, settle(registry, 1, available))
        expect(settled.transition).toBe("apply-current")
        expect(shellSourceObservation(settled.state, registry)).toMatchObject({ state: "available", readGeneration: 1 })
    })

    it("maps each current classification to its own named state and transition", () => {
        const cases: ReadonlyArray<readonly [ShellSourceOutcome, string, string]> = [
            [available, "apply-current", "available"],
            [{ ...available, availability: "partial", completeness: "partial" }, "apply-limited", "partial"],
            [{ ...available, availability: "unavailable", freshness: "unknown", completeness: "unknown", observedAt: null, payload: null }, "apply-unavailable", "unavailable"],
            [{ ...available, availability: "unsupported", freshness: "unknown", completeness: "unknown", observedAt: null, payload: null }, "apply-unavailable", "unsupported"],
            [{ kind: "unavailable" }, "apply-unavailable", "unavailable"],
            [{ kind: "unsupported" }, "apply-unavailable", "unsupported"],
            [{ kind: "refused" }, "clear-denied", "refused"]
        ]
        for (const [outcome, transition, settled] of cases) {
            const begun = reduceShellObservation(state(), begin(registry, 1)).state
            const applied = reduceShellObservation(begun, settle(registry, 1, outcome))
            expect([applied.transition, shellSourceObservation(applied.state, registry)?.state]).toEqual([transition, settled])
        }
    })

    it("never promotes a stale, partial or unavailable answer into available or zero", () => {
        const stale = readSource(state(), runtime, 1, { ...available, freshness: "stale" })
        expect(shellSourceObservation(stale, runtime)?.state).toBe("stale")

        const unavailable = readSource(state(), runtime, 1, { kind: "unavailable" })
        expect(shellSourceObservation(unavailable, runtime)).toMatchObject({ state: "unavailable", payload: null })

        const unsupported = readSource(state(), runtime, 1, { kind: "unsupported" })
        expect(shellSourceObservation(unsupported, runtime)).toMatchObject({ state: "unsupported", payload: null })
    })

    it("clears a refusal's payload even when the envelope claimed to carry one", () => {
        const refused = readSource(state(), registry, 1, { kind: "refused" })
        expect(shellSourceObservation(refused, registry)).toMatchObject({ state: "refused", payload: null })
    })

    it("keeps an outcome that answers a generation the store is not waiting for at zero transition", () => {
        const current = readSource(state(), registry, 2)
        const late = reduceShellObservation(current, settle(registry, 1, { kind: "unavailable" }))
        expect(late.transition).toBe("none")
        expect(late.state).toBe(current)
        expect(shellSourceObservation(late.state, registry)?.state).toBe("available")
    })

    it("keeps an outcome from a former selection and an older session epoch at zero transition", () => {
        const current = readSource(state(), registry, 1)
        const former = reduceShellObservation(current, settle(registry, 2, { kind: "unavailable" }, { selection: otherSelection }))
        expect(former.transition).toBe("none")
        expect(former.state).toBe(current)

        const older = reduceShellObservation(current, settle(registry, 2, { kind: "unavailable" }, { sessionEpoch: 0 }))
        expect(older.transition).toBe("none")
        expect(older.state).toBe(current)
    })

    it("refuses a begin-read that does not move the source's generation forward", () => {
        const current = readSource(state(), registry, 3)
        const replay = reduceShellObservation(current, begin(registry, 3))
        expect(replay.transition).toBe("none")
        expect(replay.state).toBe(current)
        expect(reduceShellObservation(current, begin(registry, 4)).transition).toBe("begin-read")
    })

    it("keeps each source's generation independent, so one source's retry cannot move another's", () => {
        const current = readSource(readSource(state(), registry, 4), attention, 2)
        const retried = reduceShellObservation(current, begin(attention, 3))
        expect(retried.transition).toBe("begin-read")
        expect(shellSourceObservation(retried.state, attention)?.readGeneration).toBe(3)
        expect(shellSourceObservation(retried.state, registry)?.readGeneration).toBe(4)
    })

    it("clears only the denied source and keeps its siblings", () => {
        const current = readSource(readSource(state(), registry, 1), attention, 1)
        const refused = reduceShellObservation(current, settle(attention, 1, { kind: "refused" }))
        expect(refused.transition).toBe("clear-denied")
        expect(shellSourceObservation(refused.state, attention)).toMatchObject({ state: "refused", payload: null })
        expect(shellSourceObservation(refused.state, registry)?.state).toBe("available")
    })

    it("discards every former payload on a selection change before any new read", () => {
        const current = readSource(readSource(state(), registry, 1), attention, 1)
        const changed = reduceShellObservation(current, { type: "change-selection", selection: otherSelection })
        expect(changed.transition).toBe("change-selection")
        expect(changed.state.selection).toEqual(otherSelection)
        expect(changed.state.sources).toEqual([])
        expect(shellSourceObservation(changed.state, registry)).toBeNull()
    })

    it("clears the whole selection at once for a session outcome and blocks reads until a fresh check", () => {
        const current = readSource(readSource(state(), registry, 1), attention, 1)

        const signedOut = reduceShellObservation(current, { type: "require-sign-in", sessionEpoch: 2 })
        expect(signedOut.transition).toBe("require-sign-in")
        expect(signedOut.state.session).toBe("sign-in-required")
        expect(signedOut.state.sources).toEqual([])
        expect(isShellReadBlocked(signedOut.state)).toBe(true)
        expect(reduceShellObservation(signedOut.state, begin(runtime, 1, { sessionEpoch: 2 })).transition).toBe("none")

        const unreachable = reduceShellObservation(current, { type: "session-unestablished", sessionEpoch: 2 })
        expect(unreachable.transition).toBe("session-unestablished")
        expect(unreachable.state.session).toBe("access-unestablished")
        expect(unreachable.state.sources).toEqual([])
        expect(reduceShellObservation(unreachable.state, begin(runtime, 1, { sessionEpoch: 2 })).transition).toBe("none")

        const reestablished = reduceShellObservation(unreachable.state, { type: "session-reestablished", sessionEpoch: 3 })
        expect(reestablished.transition).toBe("session-reestablished")
        expect(reestablished.state.session).toBe("established")
        expect(reestablished.state.sources).toEqual([])
        expect(isShellReadBlocked(reestablished.state)).toBe(false)
    })

    it("ignores a session outcome that carries an older epoch", () => {
        const current = readSource(state(), registry, 1)
        const stale = reduceShellObservation(current, { type: "require-sign-in", sessionEpoch: 1 })
        expect(stale.transition).toBe("none")
        expect(stale.state).toBe(current)
    })

    it("ignores a selection change while the session is blocked", () => {
        const blocked = reduceShellObservation(readSource(state(), registry, 1), { type: "require-sign-in", sessionEpoch: 2 }).state
        const changed = reduceShellObservation(blocked, { type: "change-selection", selection: otherSelection })
        expect(changed.transition).toBe("none")
        expect(changed.state).toBe(blocked)
    })

    it("holds only what a read can rebuild, and writes nothing to browser storage", () => {
        const storageSet = vi.spyOn(Storage.prototype, "setItem")
        const current = readSource(state(), registry, 1)
        expect(storageSet).not.toHaveBeenCalled()
        expect(Object.keys(current).sort()).toEqual(["selection", "session", "sessionEpoch", "sources"])
    })
})