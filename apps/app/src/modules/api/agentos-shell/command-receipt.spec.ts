import { describe, expect, it } from "vitest"

import {
    readAgentosShellCommandReceipt
} from "./index"
import { shellSpec } from "./spec-helpers"
const { INSTALLATION, COMMAND, TOKEN, SELECTION, scope, readOf, coreResult, overviewBody, answerWith, sentUrl, sentInit } = shellSpec

describe("readAgentosShellCommandReceipt", () => {
    const commandScope = {
        ...scope,
        commandId: COMMAND,
        sourceIdentity: `receiver:{${INSTALLATION},intent-1}`,
        readGeneration: 7,
        selectionGeneration: SELECTION,
    }
    const receiptProjection = {
        commandId: COMMAND,
        receiverInstallationId: INSTALLATION,
        queueState: "queued",
        attempt: 1,
        possibleStartAt: null,
        observations: [],
        localTransportGaps: [],
    }
    const receiptBody = (overrides: Record<string, unknown> = {}, availability = "available") => ({
        kind: "command_observation",
        selectionGeneration: SELECTION,
        sourceIdentity: commandScope.sourceIdentity,
        readGeneration: 7,
        core: coreResult(),
        commandObservation:
            availability === "available"
                ? { availability, reason: null, projection: { ...receiptProjection, ...overrides } }
                : { availability, reason: "command-observation-unavailable", projection: null },
    })

    it("preserves every receiver queue meaning instead of promoting one to completion", async () => {
        const states = ["queued", "claimed", "possible_start", "settled", "cancelled_before_start", "quarantined"]
        for (const queueState of states) {
            answerWith(200, receiptBody({ queueState }))
            const answer = await readAgentosShellCommandReceipt(TOKEN, commandScope)
            expect(answer.ok).toBe(true)
            if (!answer.ok) continue
            expect(answer.data.commandObservation.projection?.queueState).toBe(queueState)
        }
    })

    it("keeps each observation's own version and each gap's own attempt", async () => {
        answerWith(
            200,
            receiptBody({
                observations: [
                    {
                        observationId: "obs-1",
                        observationVersion: 2,
                        receiverReceiptId: "receipt-1",
                        kind: "progress",
                        schemaId: "shell.progress@1",
                        payloadDigest: "sha256:abc",
                        observedAt: null,
                    },
                ],
                localTransportGaps: [{ attempt: 3, kind: "connection-reset", observedAt: "2026-09-25T03:00:00.000Z" }],
            }),
        )
        const answer = await readAgentosShellCommandReceipt(TOKEN, commandScope)
        expect(answer.ok).toBe(true)
        if (!answer.ok) return
        expect(answer.data.commandObservation.projection?.observations).toHaveLength(1)
        expect(answer.data.commandObservation.projection?.localTransportGaps).toHaveLength(1)
    })

    it("fails closed on a projection it cannot read field by field", async () => {
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { observations: null },
            { observations: [null] },
            { observations: [{ observationVersion: 1, kind: "progress", schemaId: "shell.progress@1" }] },
            {
                observations: [
                    { observationId: "obs-1", observationVersion: 0, kind: "progress", schemaId: "shell.progress@1" },
                ],
            },
            {
                observations: [
                    { observationId: "obs-1", observationVersion: 1, kind: "chatter", schemaId: "shell.progress@1" },
                ],
            },
            { observations: [{ observationId: "obs-1", observationVersion: 1, kind: "progress", schemaId: "" }] },
            {
                observations: [
                    {
                        observationId: "obs-1",
                        observationVersion: 1,
                        kind: "progress",
                        schemaId: "s",
                        payloadDigest: 7,
                    },
                ],
            },
            {
                observations: [
                    { observationId: "obs-1", observationVersion: 1, kind: "progress", schemaId: "s", observedAt: 7 },
                ],
            },
            { localTransportGaps: null },
            { localTransportGaps: [null] },
            { localTransportGaps: [{ attempt: "3", kind: "connection-reset" }] },
            { localTransportGaps: [{ attempt: 3, kind: "" }] },
            { localTransportGaps: [{ attempt: 3, kind: "connection-reset", observedAt: 7 }] },
            { queueState: "finished" },
            { attempt: -1 },
            { possibleStartAt: 7 },
            { receiverInstallationId: "" },
        ]
        for (const variant of variants) {
            answerWith(200, receiptBody(variant))
            expect([variant, await readAgentosShellCommandReceipt(TOKEN, commandScope)]).toEqual([
                variant,
                expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY" }),
            ])
        }
    })

    it("keeps a refused observation distinct from an empty one and echoes nothing else", async () => {
        answerWith(200, receiptBody({}, "refused"))
        const answer = await readAgentosShellCommandReceipt(TOKEN, commandScope)
        expect(answer).toMatchObject({ ok: true })
        if (!answer.ok) return
        expect(answer.data.commandObservation).toEqual({
            availability: "refused",
            reason: "command-observation-unavailable",
            projection: null,
        })
    })

    it("fails closed when the receipt echoes another read's identity", async () => {
        answerWith(200, { ...receiptBody(), readGeneration: 8 })
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })
    })

    it("reports a session outcome, a refusal, a wrong kind and an unreadable core without inventing a state", async () => {
        answerWith(401, { message: "Authentication required" })
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toMatchObject({ ok: false, kind: "refused" })

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toMatchObject({
            ok: false,
            kind: "forbidden",
            code: "parent-mismatch",
            status: 403,
        })

        answerWith(200, overviewBody([readOf({ kind: "runtime" }, 1)]))
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, { ...receiptBody({}, "unavailable"), core: "not-a-record" })
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        expect(await readAgentosShellCommandReceipt(TOKEN, { ...commandScope, commandId: "not-a-uuid" })).toMatchObject(
            { ok: false, kind: "invalid", code: "UNSUPPORTED" },
        )
        expect(await readAgentosShellCommandReceipt(TOKEN, { ...commandScope, readGeneration: 0 })).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "UNSUPPORTED",
        })
    })

    it("never retries a receipt read that did not answer", async () => {
        shellSpec.fetchMock.mockRejectedValue(new Error("socket closed"))
        expect(await readAgentosShellCommandReceipt(TOKEN, commandScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "NETWORK",
        })
        expect(shellSpec.fetchMock).toHaveBeenCalledTimes(1)
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

