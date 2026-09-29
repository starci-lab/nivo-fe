import { describe, expect, it, vi } from "vitest"

import {
    canonicalShellReads,
    readAgentosShellOverview
} from "./index"
import { shellSpec } from "./spec-helpers"
const { WORKSPACE, INSTANCE, INSTALLATION, TOKEN, SELECTION, scope, readOf, envelopeFor, coreResult, overviewBody, answerWith, sentUrls, sentUrl, sentInit } = shellSpec

describe("readAgentosShellOverview", () => {
    it("sends every requested read sorted, percent-encoded, under the selection token", async () => {
        const reads = [
            readOf({ kind: "runtime" }, 5),
            readOf({ kind: "core_registry" }, 3),
            readOf({ kind: "attention", installationId: INSTALLATION }, 1),
        ]
        answerWith(200, overviewBody(canonicalShellReads(reads) ?? []))

        await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(sentUrl()).toBe(
            `http://localhost:3068/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}?read=attention%3A%7B${INSTALLATION}%7D:1&read=core_registry:3&read=runtime:5&selectionGeneration=${SELECTION}`,
        )
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
        expect(shellSpec.fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: "omit" })
    })

    it("answers only envelopes that echo the identity and generation this read asked under", async () => {
        const reads = [readOf({ kind: "runtime" }, 4), readOf({ kind: "core_registry" }, 2)]
        const ordered = canonicalShellReads(reads) ?? []
        answerWith(200, overviewBody(ordered))
        const asked = await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(asked.ok).toBe(true)
        if (!asked.ok) return
        expect(asked.data.sources.map((source) => source.sourceIdentity)).toEqual(["core_registry", "runtime"])
        expect(asked.data.core?.name).toBe("Support")

        answerWith(200, {
            ...overviewBody(ordered),
            sources: [envelopeFor(ordered[0]!, { sourceIdentity: "runtime" }), envelopeFor(ordered[1]!)],
        })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })
    })

    it("fails closed on an unknown kind, an unknown version, a malformed envelope and a re-encoded selection", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        answerWith(200, { ...overviewBody(reads), kind: "overview_v2" })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, { ...overviewBody(reads), selectionGeneration: "another-selection" })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, { ...overviewBody(reads), sources: [envelopeFor(reads[0]!, { availability: "ready" })] })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, {
            ...overviewBody(reads),
            sources: [envelopeFor(reads[0]!, { availability: "refused", payload: { secret: true } })],
        })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, "not an envelope")
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })
    })

    it("maps an unauthenticated answer to a session outcome and a refusal to an exact-source refusal", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        answerWith(401, { message: "Authentication required" })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            kind: "refused",
            code: "UNAUTHENTICATED",
        })

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            kind: "forbidden",
            code: "parent-mismatch",
            status: 403,
        })

        answerWith(503, { kind: "refused", reason: "current-authority-unavailable" })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "current-authority-unavailable",
            status: 503,
        })
    })

    it("reports a session outcome without asking when the session minted no token", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        expect(await readAgentosShellOverview(null, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            kind: "refused",
            code: "UNAUTHENTICATED",
        })
        expect(shellSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("never retries a read that did not answer", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        shellSpec.fetchMock.mockRejectedValue(new Error("socket closed"))
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "NETWORK",
        })
        expect(shellSpec.fetchMock).toHaveBeenCalledTimes(1)
    })

    it("refuses to send a read set the registered grammar cannot express", async () => {
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, [])).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "UNSUPPORTED",
        })
        expect(await readAgentosShellOverview(TOKEN, scope, "", [readOf({ kind: "runtime" }, 1)])).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "UNSUPPORTED",
        })
        expect(shellSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("never reaches an operation, so no read can become a module command", async () => {
        const reads = [readOf({ kind: "runtime" }, 1), readOf({ kind: "attention", installationId: INSTALLATION }, 2)]
        answerWith(200, overviewBody(canonicalShellReads(reads) ?? []))

        await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)

        expect(sentUrls().filter((url) => url.includes("/operations/"))).toEqual([])
        expect(sentInit().method).toBe("GET")
        expect(sentInit().body).toBeUndefined()
    })

    it("fails closed when the answer cannot even be read as JSON", async () => {
        shellSpec.fetchMock.mockResolvedValue({
            status: 200,
            json: async () => {
                throw new Error("this is not json")
            },
        })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, [readOf({ kind: "runtime" }, 1)])).toMatchObject(
            { ok: false, kind: "unavailable", code: "MALFORMED" },
        )
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
            { sources: [] },
        ]
        for (const variant of variants) {
            answerWith(200, { ...overviewBody(reads), ...variant })
            expect([variant, await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)]).toEqual([
                variant,
                expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY" }),
            ])
        }

        // A refused or unavailable Core registry is still an answer: the source envelopes stand beside it.
        answerWith(200, { ...overviewBody(reads), core: null })
        const answered = await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)
        expect(answered.ok).toBe(true)
        if (!answered.ok) return
        expect(answered.data.core).toBeNull()
    })

    it("fails closed on an envelope whose own fields cannot be read", async () => {
        const reads = [readOf({ kind: "runtime" }, 1)]
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { sourceIdentity: 7 },
            { observedAt: 7 },
            { freshness: "recent" },
            { completeness: "whole" },
            { payload: 7 },
        ]
        for (const variant of variants) {
            answerWith(200, { ...overviewBody(reads), sources: [envelopeFor(reads[0]!, variant)] })
            expect([variant, await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)]).toEqual([
                variant,
                expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY" }),
            ])
        }

        answerWith(200, { ...overviewBody(reads), sources: ["not-an-envelope"] })
        expect(await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        // A source with nothing to show is an answer with no payload, not an empty object.
        answerWith(200, {
            ...overviewBody(reads),
            sources: [envelopeFor(reads[0]!, { availability: "unavailable", payload: null })],
        })
        const answered = await readAgentosShellOverview(TOKEN, scope, SELECTION, reads)
        expect(answered.ok).toBe(true)
        if (!answered.ok) return
        expect(answered.data.sources[0]?.payload).toBeNull()
    })
})
