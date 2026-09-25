import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
    AGENTOS_SHELL_NAVIGATION_OPERATION,
    MAX_SHELL_READS_PER_REQUEST,
    canonicalShellReads,
    compareShellSourceIdentity,
    formatShellRead,
    formatShellSourceIdentity,
    readAgentosShellAuthorityStatus,
    readAgentosShellCommandReceipt,
    readAgentosShellLifecycleObservation,
    readAgentosShellOverview,
    resolveAgentosShellNavigation
} from "./agentos-shell"
import type { ShellRead, ShellSourceIdentity } from "./agentos-shell"

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"
const COMMAND = "44444444-4444-4444-8444-444444444444"
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature"
const SELECTION = "shell-selection-1"

const scope = { workspaceId: WORKSPACE, instanceId: INSTANCE }
const readOf = (identity: ShellSourceIdentity, readGeneration: number): ShellRead => ({ identity, readGeneration })

const envelopeFor = (read: ShellRead, overrides: Record<string, unknown> = {}) => ({
    sourceIdentity: formatShellSourceIdentity(read.identity),
    readGeneration: read.readGeneration,
    availability: "available",
    freshness: "current",
    completeness: "complete",
    observedAt: "2026-09-25T03:00:00.000Z",
    payload: { installations: [] },
    ...overrides
})

const coreResult = () => ({
    availability: "available",
    reason: null,
    workspaceId: WORKSPACE,
    instanceId: INSTANCE,
    name: "Support",
    runtimeGeneration: "generation-1",
    runtimeAvailability: "provisioned",
    inventory: { availability: "available", completeness: "complete", observedAt: "2026-09-25T03:00:00.000Z", installations: [] }
})

const overviewBody = (reads: ReadonlyArray<ShellRead>) => ({
    kind: "overview",
    selectionGeneration: SELECTION,
    core: coreResult(),
    sources: reads.map(read => envelopeFor(read))
})

let fetchMock: ReturnType<typeof vi.fn>

const answerWith = (status: number, body: unknown): void => {
    fetchMock.mockResolvedValue({ status, json: async () => body })
}

const sentUrls = (): Array<string> => fetchMock.mock.calls.map(call => String(call[0]))
const sentUrl = (index = 0): string => sentUrls()[index] ?? ""
const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] as RequestInit

beforeEach(() => {
    vi.restoreAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("canonicalShellReads", () => {
    it("orders a read set by source identity code point rather than by locale collation", () => {
        const ordered = canonicalShellReads([
            readOf({ kind: "runtime" }, 1),
            readOf({ kind: "core_registry" }, 2),
            readOf({ kind: "attention", installationId: INSTALLATION }, 3)
        ])
        expect(ordered?.map(read => formatShellSourceIdentity(read.identity))).toEqual([
            `attention:{${INSTALLATION}}`,
            "core_registry",
            "runtime"
        ])
    })

    it("refuses a set that repeats one source instead of quietly de-duplicating it", () => {
        expect(canonicalShellReads([readOf({ kind: "runtime" }, 1), readOf({ kind: "runtime" }, 2)])).toBeNull()
    })

    it("refuses an unallocated generation and an unbounded set", () => {
        expect(canonicalShellReads([readOf({ kind: "runtime" }, 0)])).toBeNull()
        expect(canonicalShellReads(Array.from({ length: MAX_SHELL_READS_PER_REQUEST + 1 }, (_, index) => readOf({ kind: "attention", installationId: `installation-${index}` }, 1)))).toBeNull()
    })
})

describe("compareShellSourceIdentity", () => {
    it("orders by code point, so a client reproduces the server's order", () => {
        expect(compareShellSourceIdentity("a", "B")).toBeGreaterThan(0)
        expect(compareShellSourceIdentity("capability:{a}", "core_registry")).toBeLessThan(0)
        expect(compareShellSourceIdentity("runtime", "runtime")).toBe(0)
    })
})

describe("readAgentosShellOverview", () => {
    it("sends every requested read sorted, percent-encoded, under the selection token", async () => {
        const reads = [
            readOf({ kind: "runtime" }, 5),
            readOf({ kind: "core_registry" }, 3),
            readOf({ kind: "attention", installationId: INSTALLATION }, 1)
        ]
        answerWith(200, overviewBody(canonicalShellReads(reads) ?? []))

        await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(sentUrl()).toBe(`http://localhost:3068/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}?read=attention%3A%7B${INSTALLATION}%7D:1&read=core_registry:3&read=runtime:5&selectionGeneration=${SELECTION}`)
        expect(sentInit().method).toBe("GET")
    })

    it("carries the bearer token only in the authorization header", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        answerWith(200, overviewBody(reads))
        const storageSet = vi.spyOn(Storage.prototype, "setItem")

        await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(new Headers(sentInit().headers).get("Authorization")).toBe(`Bearer ${TOKEN}`)
        expect(sentUrl()).not.toContain(TOKEN)
        expect(sentUrl()).not.toContain("token")
        expect(storageSet).not.toHaveBeenCalled()
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: "omit" })
    })

    it("answers only envelopes that echo the identity and generation this read asked under", async () => {
        const reads = [readOf({ kind: "runtime" }, 4), readOf({ kind: "core_registry" }, 2)]
        const ordered = canonicalShellReads(reads) ?? []
        answerWith(200, overviewBody(ordered))
        const asked = await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(asked.state).toBe("answered")
        if (asked.state !== "answered") return
        expect(asked.answer.sources.map(source => source.sourceIdentity)).toEqual(["core_registry", "runtime"])
        expect(asked.answer.core?.name).toBe("Support")

        answerWith(200, { ...overviewBody(ordered), sources: [envelopeFor(ordered[0], { sourceIdentity: "runtime" }), envelopeFor(ordered[1])] })
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")
    })

    it("fails closed on an unknown kind, an unknown version, a malformed envelope and a re-encoded selection", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        answerWith(200, { ...overviewBody(reads), kind: "overview_v2" })
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")

        answerWith(200, { ...overviewBody(reads), selectionGeneration: "another-selection" })
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")

        answerWith(200, { ...overviewBody(reads), sources: [envelopeFor(reads[0], { availability: "ready" })] })
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")

        answerWith(200, { ...overviewBody(reads), sources: [envelopeFor(reads[0], { availability: "refused", payload: { secret: true } })] })
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")

        answerWith(200, "not an envelope")
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")
    })

    it("maps an unauthenticated answer to a session outcome and a refusal to an exact-source refusal", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        answerWith(401, { message: "Authentication required" })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toEqual({ state: "unauthenticated" })

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toEqual({ state: "refused", reason: "parent-mismatch", status: 403 })

        answerWith(503, { kind: "refused", reason: "current-authority-unavailable" })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toEqual({ state: "refused", reason: "current-authority-unavailable", status: 503 })
    })

    it("reports a session outcome without asking when the session minted no token", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        expect(await readAgentosShellOverview(null, scope, SELECTION, reads)).toEqual({ state: "unauthenticated" })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("never retries a read that did not answer", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        fetchMock.mockRejectedValue(new Error("socket closed"))
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toEqual({ state: "unreachable" })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("refuses to send a read set the registered grammar cannot express", async () => {
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, [])).toEqual({ state: "unsupported" })
        expect(await readAgentosShellOverview(TOKEN, scope, "", [readOf({ kind: "runtime" }, 1)])).toEqual({ state: "unsupported" })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("never reaches an operation, so no read can become a module command", async () => {
        const reads = [readOf({ kind: "runtime" }, 1), readOf({ kind: "attention", installationId: INSTALLATION }, 2)]
        answerWith(200, overviewBody(canonicalShellReads(reads) ?? []))

        await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(sentUrls().filter(url => url.includes("/operations/"))).toEqual([])
        expect(sentInit().method).toBe("GET")
        expect(sentInit().body).toBeUndefined()
    })

    it("fails closed when the answer cannot even be read as JSON", async () => {
        fetchMock.mockResolvedValue({ status: 200, json: async () => { throw new Error("this is not json") } })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, [readOf({ kind: "runtime" }, 1)])).toEqual({ state: "unsupported" })
    })

    it("fails closed on a core standing it cannot read and on a source list that does not match", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        const inventory = coreResult().inventory
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { core: "not-a-record" },
            { core: { ...coreResult(), availability: "ready" } },
            { core: { ...coreResult(), name: 7 } },
            { core: { ...coreResult(), runtimeAvailability: "running" } },
            { core: { ...coreResult(), inventory: "not-a-record" } },
            { core: { ...coreResult(), inventory: { ...inventory, availability: "ready" } } },
            { core: { ...coreResult(), inventory: { ...inventory, completeness: "whole" } } },
            { core: { ...coreResult(), inventory: { ...inventory, observedAt: null } } },
            { core: { ...coreResult(), inventory: { ...inventory, installations: null } } },
            { sources: "not-an-array" },
            { sources: [] }
        ]
        for (const variant of variants) {
            answerWith(200, { ...overviewBody(reads), ...variant })
            expect([variant, (await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state]).toEqual([variant, "unsupported"])
        }

        // A refused or unavailable Core registry is still an answer: the source envelopes stand beside it.
        answerWith(200, { ...overviewBody(reads), core: null })
        const answered = await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)
        expect(answered.state).toBe("answered")
        if (answered.state !== "answered") return
        expect(answered.answer.core).toBeNull()
    })

    it("fails closed on an envelope whose own fields cannot be read", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { sourceIdentity: 7 },
            { observedAt: 7 },
            { freshness: "recent" },
            { completeness: "whole" },
            { payload: 7 }
        ]
        for (const variant of variants) {
            answerWith(200, { ...overviewBody(reads), sources: [envelopeFor(reads[0], variant)] })
            expect([variant, (await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state]).toEqual([variant, "unsupported"])
        }

        answerWith(200, { ...overviewBody(reads), sources: ["not-an-envelope"] })
        expect((await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).state).toBe("unsupported")

        // A source with nothing to show is an answer with no payload, not an empty object.
        answerWith(200, { ...overviewBody(reads), sources: [envelopeFor(reads[0], { availability: "unavailable", payload: null })] })
        const answered = await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)
        expect(answered.state).toBe("answered")
        if (answered.state !== "answered") return
        expect(answered.answer.sources[0]?.payload).toBeNull()
    })
})

describe("readAgentosShellCommandReceipt", () => {
    const commandScope = { ...scope, commandId: COMMAND, sourceIdentity: `receiver:{${INSTALLATION},intent-1}`, readGeneration: 7, selectionGeneration: SELECTION }
    const receiptProjection = {
        commandId: COMMAND,
        receiverInstallationId: INSTALLATION,
        queueState: "queued",
        attempt: 1,
        possibleStartAt: null,
        observations: [],
        localTransportGaps: []
    }
    const receiptBody = (overrides: Record<string, unknown> = {}, availability = "available") => ({
        kind: "command_observation",
        selectionGeneration: SELECTION,
        sourceIdentity: commandScope.sourceIdentity,
        readGeneration: 7,
        core: coreResult(),
        commandObservation: availability === "available"
            ? { availability, reason: null, projection: { ...receiptProjection, ...overrides } }
            : { availability, reason: "command-observation-unavailable", projection: null }
    })

    it("preserves every receiver queue meaning instead of promoting one to completion", async () => {
        const states = ["queued", "claimed", "possible_start", "settled", "cancelled_before_start", "quarantined"]
        for (const queueState of states) {
            answerWith(200, receiptBody({ queueState }))
            const answer = await readAgentosShellCommandReceipt(TOKEN, commandScope)
            expect(answer.state).toBe("answered")
            if (answer.state !== "answered") continue
            expect(answer.answer.commandObservation.projection?.queueState).toBe(queueState)
        }
    })

    it("keeps each observation's own version and each gap's own attempt", async () => {
        answerWith(200, receiptBody({
            observations: [{ observationId: "obs-1", observationVersion: 2, receiverReceiptId: "receipt-1", kind: "progress", schemaId: "shell.progress@1", payloadDigest: "sha256:abc", observedAt: null }],
            localTransportGaps: [{ attempt: 3, kind: "connection-reset", observedAt: "2026-09-25T03:00:00.000Z" }]
        }))
        const answer = await readAgentosShellCommandReceipt(TOKEN, commandScope)
        expect(answer.state).toBe("answered")
        if (answer.state !== "answered") return
        expect(answer.answer.commandObservation.projection?.observations).toHaveLength(1)
        expect(answer.answer.commandObservation.projection?.localTransportGaps).toHaveLength(1)
    })

    it("fails closed on a projection it cannot read field by field", async () => {
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { observations: null },
            { observations: [null] },
            { observations: [{ observationVersion: 1, kind: "progress", schemaId: "shell.progress@1" }] },
            { observations: [{ observationId: "obs-1", observationVersion: 0, kind: "progress", schemaId: "shell.progress@1" }] },
            { observations: [{ observationId: "obs-1", observationVersion: 1, kind: "chatter", schemaId: "shell.progress@1" }] },
            { observations: [{ observationId: "obs-1", observationVersion: 1, kind: "progress", schemaId: "" }] },
            { observations: [{ observationId: "obs-1", observationVersion: 1, kind: "progress", schemaId: "s", payloadDigest: 7 }] },
            { observations: [{ observationId: "obs-1", observationVersion: 1, kind: "progress", schemaId: "s", observedAt: 7 }] },
            { localTransportGaps: null },
            { localTransportGaps: [null] },
            { localTransportGaps: [{ attempt: "3", kind: "connection-reset" }] },
            { localTransportGaps: [{ attempt: 3, kind: "" }] },
            { localTransportGaps: [{ attempt: 3, kind: "connection-reset", observedAt: 7 }] },
            { queueState: "finished" },
            { attempt: -1 },
            { possibleStartAt: 7 },
            { receiverInstallationId: "" }
        ]
        for (const variant of variants) {
            answerWith(200, receiptBody(variant))
            expect([variant, (await readAgentosShellCommandReceipt(TOKEN, commandScope)).state]).toEqual([variant, "unsupported"])
        }
    })

    it("keeps a refused observation distinct from an empty one and echoes nothing else", async () => {
        answerWith(200, receiptBody({}, "refused"))
        const answer = await readAgentosShellCommandReceipt(TOKEN, commandScope)
        expect(answer).toMatchObject({ state: "answered" })
        if (answer.state !== "answered") return
        expect(answer.answer.commandObservation).toEqual({ availability: "refused", reason: "command-observation-unavailable", projection: null })
    })

    it("fails closed when the receipt echoes another read's identity", async () => {
        answerWith(200, { ...receiptBody(), readGeneration: 8 })
        expect((await readAgentosShellCommandReceipt(TOKEN, commandScope)).state).toBe("unsupported")
    })

    it("reports a session outcome, a refusal, a wrong kind and an unreadable core without inventing a state", async () => {
        answerWith(401, { message: "Authentication required" })
        expect((await readAgentosShellCommandReceipt(TOKEN, commandScope)).state).toBe("unauthenticated")

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toEqual({ state: "refused", reason: "parent-mismatch", status: 403 })

        answerWith(200, overviewBody([readOf({ kind: "runtime" }, 1)]))
        expect((await readAgentosShellCommandReceipt(TOKEN, commandScope)).state).toBe("unsupported")

        answerWith(200, { ...receiptBody({}, "unavailable"), core: "not-a-record" })
        expect((await readAgentosShellCommandReceipt(TOKEN, commandScope)).state).toBe("unsupported")

        expect(await readAgentosShellCommandReceipt(TOKEN, { ...commandScope, commandId: "not-a-uuid" })).toEqual({ state: "unsupported" })
        expect(await readAgentosShellCommandReceipt(TOKEN, { ...commandScope, readGeneration: 0 })).toEqual({ state: "unsupported" })
    })

    it("never retries a receipt read that did not answer", async () => {
        fetchMock.mockRejectedValue(new Error("socket closed"))
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toEqual({ state: "unreachable" })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("sends only a status read for a receipt", async () => {
        answerWith(200, { kind: "refused", reason: "not-found-non-disclosing", selectionGeneration: null })
        await readAgentosShellCommandReceipt(TOKEN, commandScope)
        expect(sentInit().method).toBe("GET")
        expect(sentUrl()).toContain(`command-receipts/${COMMAND}`)
        expect(sentUrl()).toContain(`sourceIdentity=receiver%3A%7B${INSTALLATION}%2Cintent-1%7D`)
        expect(sentUrl()).toContain("readGeneration=7")
    })
})

describe("readAgentosShellAuthorityStatus", () => {
    const authoritySource = { availability: "available", reason: null, current: null }
    const authorityStatusOf = (overrides: Record<string, unknown> = {}) => ({
        installationId: INSTALLATION,
        grant: { availability: "unavailable", reason: "no-core-store", current: null },
        config: { availability: "available", reason: null, current: { revision: 2 } },
        setup: { availability: "partial", reason: "setup-incomplete", current: null },
        runtime: { availability: "available", reason: null, current: { generation: "generation-1" } },
        ...overrides
    })
    const authorityBody = (status: unknown) => ({ kind: "authority_status", core: coreResult(), authorityStatus: status })

    it("keeps each authority source self-qualified", async () => {
        answerWith(200, authorityBody(authorityStatusOf()))
        const answer = await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.state).toBe("answered")
        if (answer.state !== "answered") return
        expect(answer.answer.authorityStatus.grant.availability).toBe("unavailable")
        expect(answer.answer.authorityStatus.config.availability).toBe("available")
    })

    it("fails closed on an authority answer for another installation", async () => {
        answerWith(200, authorityBody(authorityStatusOf({ installationId: COMMAND })))
        expect((await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unsupported")
    })

    it("fails closed on an authority status it cannot read field by field", async () => {
        const variants: ReadonlyArray<unknown> = [
            "not-a-record",
            authorityStatusOf({ grant: null }),
            authorityStatusOf({ grant: { ...authoritySource, availability: "ready" } }),
            authorityStatusOf({ grant: { ...authoritySource, reason: 7 } }),
            authorityStatusOf({ runtime: { ...authoritySource, availability: "ready" } })
        ]
        for (const variant of variants) {
            answerWith(200, authorityBody(variant))
            expect([variant, (await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).state]).toEqual([variant, "unsupported"])
        }
    })

    it("reports a session outcome, a refusal and a wrong kind, and refuses a scope that is not an installation", async () => {
        answerWith(401, { message: "Authentication required" })
        expect((await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unauthenticated")

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect((await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("refused")

        answerWith(200, overviewBody([readOf({ kind: "runtime" }, 1)]))
        expect((await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unsupported")

        answerWith(200, { ...authorityBody(authorityStatusOf()), core: "not-a-record" })
        expect((await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unsupported")

        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: "not-a-uuid" })).toEqual({ state: "unsupported" })
    })
})

describe("readAgentosShellLifecycleObservation", () => {
    const lifecycleProjection = {
        installationId: INSTALLATION,
        lifecycleRevision: 3,
        desiredCandidateGeneration: "candidate-2",
        configurationRequirement: "required",
        configurationRevisionId: null,
        testState: "passed",
        testEvidenceId: null,
        applicationState: "applying",
        appliedGeneration: "candidate-1",
        runtimeFenceGeneration: 4,
        lastObservationAt: "2026-09-25T03:00:00.000Z"
    }
    const lifecycleBody = (overrides: Record<string, unknown> = {}, applied: unknown = { status: "refused", reason: "no-observation" }) => ({
        kind: "lifecycle_observation",
        core: coreResult(),
        lifecycleObservation: { availability: "available", reason: null, projection: { ...lifecycleProjection, ...overrides } },
        appliedObservation: applied
    })
    const heldRecord = { installationId: INSTALLATION, currentCandidate: "candidate-2", appliedGeneration: "candidate-1", runtimeFenceGeneration: 4, observedAt: null, configurationIdentity: null }
    const heldMismatch = { currentCandidate: "candidate-2", appliedGeneration: "candidate-1", reason: "candidate-drift" }

    it("reports applied truth apart from the lifecycle the instance claims", async () => {
        answerWith(200, lifecycleBody())
        const answer = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.state).toBe("answered")
        if (answer.state !== "answered") return
        expect(answer.answer.lifecycleObservation.projection?.applicationState).toBe("applying")
        // A generation observed while the state was not active is not evidence of what is running.
        expect(answer.answer.lifecycleObservation.projection?.appliedGeneration).toBeNull()
        expect(answer.answer.appliedObservation).toEqual({ status: "refused", reason: "no-observation" })
    })

    it("keeps an active generation as applied truth", async () => {
        answerWith(200, lifecycleBody({ applicationState: "active" }))
        const answer = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.state).toBe("answered")
        if (answer.state !== "answered") return
        expect(answer.answer.lifecycleObservation.projection?.appliedGeneration).toBe("candidate-1")
    })

    it("keeps a held mismatch distinct from an applied record", async () => {
        answerWith(200, lifecycleBody({}, { status: "held", record: heldRecord, mismatch: heldMismatch }))
        const answer = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.state).toBe("answered")
        if (answer.state !== "answered") return
        expect(answer.answer.appliedObservation).toMatchObject({ status: "held" })

        answerWith(200, lifecycleBody({}, { status: "applied", record: heldRecord, mismatch: null }))
        const applied = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(applied).toMatchObject({ state: "answered" })
        if (applied.state !== "answered") return
        expect(applied.answer.appliedObservation).toEqual({ status: "applied", record: heldRecord, mismatch: null })
    })

    it("fails closed on an application state the grammar does not register", async () => {
        answerWith(200, lifecycleBody({ applicationState: "running" }))
        expect((await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unsupported")
    })

    it("fails closed on a lifecycle it cannot read field by field", async () => {
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { lifecycleRevision: 0 },
            { desiredCandidateGeneration: 7 },
            { configurationRequirement: "optional" },
            { testState: "unknown" },
            { runtimeFenceGeneration: -1 },
            { testEvidenceId: 7 }
        ]
        for (const variant of variants) {
            answerWith(200, lifecycleBody(variant))
            expect([variant, (await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state]).toEqual([variant, "unsupported"])
        }
        answerWith(200, { ...lifecycleBody(), lifecycleObservation: "not-a-projection" })
        expect((await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unsupported")
    })

    it("fails closed on an applied observation it cannot read field by field", async () => {
        const variants: ReadonlyArray<unknown> = [
            { status: "refused" },
            { status: "finished" },
            { status: "applied", record: null, mismatch: null },
            { status: "applied", record: heldRecord, mismatch: heldMismatch },
            { status: "held", record: { ...heldRecord, runtimeFenceGeneration: -1 }, mismatch: heldMismatch },
            { status: "held", record: { ...heldRecord, observedAt: 7 }, mismatch: heldMismatch },
            { status: "held", record: heldRecord, mismatch: { currentCandidate: "", appliedGeneration: null, reason: "candidate-drift" } },
            { status: "held", record: heldRecord, mismatch: { currentCandidate: "candidate-2", appliedGeneration: null, reason: "drifted" } },
            { status: "held", record: heldRecord, mismatch: { currentCandidate: "candidate-2", appliedGeneration: 7, reason: "candidate-drift" } }
        ]
        for (const variant of variants) {
            answerWith(200, lifecycleBody({}, variant))
            expect([variant, (await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state]).toEqual([variant, "unsupported"])
        }
    })

    it("reports a session outcome, a refusal, a wrong kind and a scope that is not an installation", async () => {
        answerWith(401, { message: "Authentication required" })
        expect((await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unauthenticated")

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect((await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("refused")

        answerWith(200, overviewBody([readOf({ kind: "runtime" }, 1)]))
        expect((await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })).state).toBe("unsupported")

        expect(await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: "not-a-uuid" })).toEqual({ state: "unsupported" })
    })
})

describe("resolveAgentosShellNavigation", () => {
    const navigationScope = { ...scope, installationId: INSTALLATION, routeKey: "module_home" as const, opaqueItemId: null, selectionGeneration: SELECTION }
    const destination = {
        grammarVersion: 1,
        routeName: "module-home",
        workspaceId: WORKSPACE,
        instanceId: INSTANCE,
        installationId: INSTALLATION,
        opaqueItemId: null,
        returnContext: { routeName: "purchased_agentos", workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION }
    }

    it("resolves a registered destination and carries no command or url", async () => {
        answerWith(200, { kind: "registered_destination", destination, selectionGeneration: SELECTION })
        const outcome = await resolveAgentosShellNavigation(TOKEN, navigationScope)

        expect(outcome).toEqual({ state: "resolved", destination })
        expect(sentInit().method).toBe("POST")
        expect(sentUrl()).toBe(`http://localhost:3068/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}/operations/${encodeURIComponent(AGENTOS_SHELL_NAVIGATION_OPERATION)}`)
        const body = JSON.parse(String(sentInit().body)) as Record<string, unknown>
        expect(Object.keys(body).sort()).toEqual(["installationId", "instanceId", "opaqueItemId", "returnContext", "routeKey", "selectionGeneration", "workspaceId"])
        expect(JSON.stringify(body)).not.toContain("command")
    })

    it("reports a destination resolved for another selection as obsolete", async () => {
        answerWith(200, { kind: "registered_destination", destination, selectionGeneration: "showing-something-else" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "obsolete" })
    })

    it("fails closed on an unknown grammar version, an unregistered view and another installation", async () => {
        answerWith(200, { kind: "registered_destination", destination: { ...destination, grammarVersion: 2 }, selectionGeneration: SELECTION })
        expect((await resolveAgentosShellNavigation(TOKEN, navigationScope)).state).toBe("unsupported")

        answerWith(200, { kind: "registered_destination", destination: { ...destination, routeName: "sales-dashboard" }, selectionGeneration: SELECTION })
        expect((await resolveAgentosShellNavigation(TOKEN, navigationScope)).state).toBe("unsupported")

        answerWith(200, { kind: "registered_destination", destination: { ...destination, installationId: COMMAND }, selectionGeneration: SELECTION })
        expect((await resolveAgentosShellNavigation(TOKEN, navigationScope)).state).toBe("unsupported")
    })

    it("keeps a refusal, an unavailability and an unsupported grammar apart", async () => {
        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: SELECTION })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "refused", reason: "parent-mismatch" })

        answerWith(503, { kind: "unavailable", reason: "deadline-exceeded", selectionGeneration: SELECTION })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unavailable", reason: "deadline-exceeded" })

        answerWith(400, { kind: "unsupported", reason: "route-key-unsupported", selectionGeneration: SELECTION })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unsupported", reason: "route-key-unsupported" })

        answerWith(400, { kind: "refused", reason: "unsupported-operation-version", selectionGeneration: null })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "refused", reason: "unsupported-operation-version" })
    })

    it("refuses an item entry without its opaque item and a plain entry carrying one", async () => {
        expect(await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, routeKey: "attention_item" })).toEqual({ state: "unsupported", reason: "invalid-navigation-intent" })
        expect(await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, opaqueItemId: "item-1" })).toEqual({ state: "unsupported", reason: "invalid-navigation-intent" })
        expect(await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, routeKey: "sales_entry" as "module_home" })).toEqual({ state: "unsupported", reason: "route-key-unsupported" })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("reports a session outcome rather than resolving for an ended session", async () => {
        expect(await resolveAgentosShellNavigation(null, navigationScope)).toEqual({ state: "unauthenticated" })
        answerWith(401, { message: "Authentication required" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unauthenticated" })
    })

    it("opens nothing when the reply cannot be read at all", async () => {
        fetchMock.mockResolvedValue({ status: 200, json: async () => { throw new Error("this is not json") } })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unsupported", reason: "unreadable-navigation-answer" })

        answerWith(200, "not-an-envelope")
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unsupported", reason: "unreadable-navigation-answer" })

        // An answer of another kind is not a destination this shell may open either.
        answerWith(200, { kind: "overview" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unsupported", reason: "unreadable-navigation-answer" })

        // Core states an unavailability and an unsupported grammar by kind; both keep a reason even
        // when Core sent none, so a caller always has something to show.
        answerWith(503, { kind: "unavailable" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unavailable", reason: "navigation-unavailable" })

        answerWith(400, { kind: "unsupported" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unsupported", reason: "navigation-unsupported" })

        fetchMock.mockRejectedValue(new Error("socket closed"))
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toEqual({ state: "unreachable" })

        expect(await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, installationId: "not-a-uuid" })).toEqual({ state: "unsupported", reason: "invalid-navigation-intent" })
    })

    it("fails closed on a destination it cannot read field by field", async () => {
        const variants: ReadonlyArray<unknown> = [
            "not-a-destination",
            { ...destination, returnContext: null },
            { ...destination, returnContext: { ...destination.returnContext, routeName: "somewhere_else" } },
            { ...destination, returnContext: { ...destination.returnContext, workspaceId: COMMAND } },
            { ...destination, returnContext: { ...destination.returnContext, installationId: 7 } },
            { ...destination, workspaceId: "not-a-uuid" },
            { ...destination, workspaceId: COMMAND },
            { ...destination, opaqueItemId: 7 }
        ]
        for (const variant of variants) {
            answerWith(200, { kind: "registered_destination", destination: variant, selectionGeneration: SELECTION })
            expect([variant, await resolveAgentosShellNavigation(TOKEN, navigationScope)]).toEqual([variant, { state: "unsupported", reason: "unregistered-destination" }])
        }
    })
})

describe("formatShellSourceIdentity", () => {
    it("formats each selection-scoped and receiver-scoped identity in its registered spelling", () => {
        expect(formatShellSourceIdentity({ kind: "core_registry" })).toBe("core_registry")
        expect(formatShellSourceIdentity({ kind: "attention", installationId: INSTALLATION })).toBe(`attention:{${INSTALLATION}}`)
        expect(formatShellSourceIdentity({ kind: "receiver", installationId: INSTALLATION, intentId: "intent-1" })).toBe(`receiver:{${INSTALLATION},intent-1}`)
    })
})

describe("formatShellRead", () => {
    it("spells one read as its percent-encoded identity and its generation", () => {
        expect(formatShellRead({ kind: "runtime" }, 9)).toBe("runtime:9")
        expect(formatShellRead({ kind: "attention", installationId: INSTALLATION }, 3)).toBe(`attention%3A%7B${INSTALLATION}%7D:3`)
        expect(formatShellRead({ kind: "receiver", installationId: INSTALLATION, intentId: "intent-1" }, 1)).toBe(`receiver%3A%7B${INSTALLATION}%2Cintent-1%7D:1`)
    })
})