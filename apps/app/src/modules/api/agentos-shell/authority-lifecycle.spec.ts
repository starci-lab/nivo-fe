import { describe, expect, it } from "vitest"

import {
    readAgentosShellAuthorityStatus,
    readAgentosShellLifecycleObservation
} from "./index"
import { shellSpec } from "./spec-helpers"
const { INSTALLATION, COMMAND, TOKEN, scope, readOf, coreResult, overviewBody, answerWith } = shellSpec

describe("readAgentosShellAuthorityStatus", () => {
    const authoritySource = { availability: "available", reason: null, current: null }
    const authorityStatusOf = (overrides: Record<string, unknown> = {}) => ({
        installationId: INSTALLATION,
        grant: { availability: "unavailable", reason: "no-core-store", current: null },
        config: { availability: "available", reason: null, current: { revision: 2 } },
        setup: { availability: "partial", reason: "setup-incomplete", current: null },
        runtime: { availability: "available", reason: null, current: { generation: "generation-1" } },
        ...overrides,
    })
    const authorityBody = (status: unknown) => ({
        kind: "authority_status",
        core: coreResult(),
        authorityStatus: status,
    })

    it("keeps each authority source self-qualified", async () => {
        answerWith(200, authorityBody(authorityStatusOf()))
        const answer = await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.ok).toBe(true)
        if (!answer.ok) return
        expect(answer.data.authorityStatus.grant.availability).toBe("unavailable")
        expect(answer.data.authorityStatus.config.availability).toBe("available")
    })

    it("fails closed on an authority answer for another installation", async () => {
        answerWith(200, authorityBody(authorityStatusOf({ installationId: COMMAND })))
        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })
    })

    it("fails closed on an authority status it cannot read field by field", async () => {
        const variants: ReadonlyArray<unknown> = [
            "not-a-record",
            authorityStatusOf({ grant: null }),
            authorityStatusOf({ grant: { ...authoritySource, availability: "ready" } }),
            authorityStatusOf({ grant: { ...authoritySource, reason: 7 } }),
            authorityStatusOf({ runtime: { ...authoritySource, availability: "ready" } }),
        ]
        for (const variant of variants) {
            answerWith(200, authorityBody(variant))
            expect([
                variant,
                await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION }),
            ]).toEqual([variant, expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY" })])
        }
    })

    it("reports a session outcome, a refusal and a wrong kind, and refuses a scope that is not an installation", async () => {
        answerWith(401, { message: "Authentication required" })
        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).toMatchObject({
            ok: false,
            kind: "refused",
        })

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).toMatchObject({
            ok: false,
            kind: "forbidden",
        })

        answerWith(200, overviewBody([readOf({ kind: "runtime" }, 1)]))
        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, { ...authorityBody(authorityStatusOf()), core: "not-a-record" })
        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: INSTALLATION })).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        expect(await readAgentosShellAuthorityStatus(TOKEN, { ...scope, installationId: "not-a-uuid" })).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "UNSUPPORTED",
        })
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
        lastObservationAt: "2026-09-25T03:00:00.000Z",
    }
    const lifecycleBody = (
        overrides: Record<string, unknown> = {},
        applied: unknown = { status: "refused", reason: "no-observation" },
    ) => ({
        kind: "lifecycle_observation",
        core: coreResult(),
        lifecycleObservation: {
            availability: "available",
            reason: null,
            projection: { ...lifecycleProjection, ...overrides },
        },
        appliedObservation: applied,
    })
    const heldRecord = {
        installationId: INSTALLATION,
        currentCandidate: "candidate-2",
        appliedGeneration: "candidate-1",
        runtimeFenceGeneration: 4,
        observedAt: null,
        configurationIdentity: null,
    }
    const heldMismatch = {
        currentCandidate: "candidate-2",
        appliedGeneration: "candidate-1",
        reason: "candidate-drift",
    }

    it("reports applied truth apart from the lifecycle the instance claims", async () => {
        answerWith(200, lifecycleBody())
        const answer = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.ok).toBe(true)
        if (!answer.ok) return
        expect(answer.data.lifecycleObservation.projection?.applicationState).toBe("applying")
        // A generation observed while the state was not active is not evidence of what is running.
        expect(answer.data.lifecycleObservation.projection?.appliedGeneration).toBeNull()
        expect(answer.data.appliedObservation).toEqual({ status: "refused", reason: "no-observation" })
    })

    it("keeps an active generation as applied truth", async () => {
        answerWith(200, lifecycleBody({ applicationState: "active" }))
        const answer = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.ok).toBe(true)
        if (!answer.ok) return
        expect(answer.data.lifecycleObservation.projection?.appliedGeneration).toBe("candidate-1")
    })

    it("keeps a held mismatch distinct from an applied record", async () => {
        answerWith(200, lifecycleBody({}, { status: "held", record: heldRecord, mismatch: heldMismatch }))
        const answer = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(answer.ok).toBe(true)
        if (!answer.ok) return
        expect(answer.data.appliedObservation).toMatchObject({ status: "held" })

        answerWith(200, lifecycleBody({}, { status: "applied", record: heldRecord, mismatch: null }))
        const applied = await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION })
        expect(applied).toMatchObject({ ok: true })
        if (!applied.ok) return
        expect(applied.data.appliedObservation).toEqual({ status: "applied", record: heldRecord, mismatch: null })
    })

    it("fails closed on an application state the grammar does not register", async () => {
        answerWith(200, lifecycleBody({ applicationState: "running" }))
        expect(
            await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
        ).toMatchObject({ ok: false, code: expect.stringMatching(/^UNSUPPORTED/) })
    })

    it("fails closed on a lifecycle it cannot read field by field", async () => {
        const variants: ReadonlyArray<Record<string, unknown>> = [
            { lifecycleRevision: 0 },
            { desiredCandidateGeneration: 7 },
            { configurationRequirement: "optional" },
            { testState: "unknown" },
            { runtimeFenceGeneration: -1 },
            { testEvidenceId: 7 },
        ]
        for (const variant of variants) {
            answerWith(200, lifecycleBody(variant))
            expect([
                variant,
                await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
            ]).toEqual([variant, expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY" })])
        }
        answerWith(200, { ...lifecycleBody(), lifecycleObservation: "not-a-projection" })
        expect(
            await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
        ).toMatchObject({ ok: false, code: expect.stringMatching(/^UNSUPPORTED/) })
    })

    it("fails closed on an applied observation it cannot read field by field", async () => {
        const variants: ReadonlyArray<unknown> = [
            { status: "refused" },
            { status: "finished" },
            { status: "applied", record: null, mismatch: null },
            { status: "applied", record: heldRecord, mismatch: heldMismatch },
            { status: "held", record: { ...heldRecord, runtimeFenceGeneration: -1 }, mismatch: heldMismatch },
            { status: "held", record: { ...heldRecord, observedAt: 7 }, mismatch: heldMismatch },
            {
                status: "held",
                record: heldRecord,
                mismatch: { currentCandidate: "", appliedGeneration: null, reason: "candidate-drift" },
            },
            {
                status: "held",
                record: heldRecord,
                mismatch: { currentCandidate: "candidate-2", appliedGeneration: null, reason: "drifted" },
            },
            {
                status: "held",
                record: heldRecord,
                mismatch: { currentCandidate: "candidate-2", appliedGeneration: 7, reason: "candidate-drift" },
            },
        ]
        for (const variant of variants) {
            answerWith(200, lifecycleBody({}, variant))
            expect([
                variant,
                await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
            ]).toEqual([variant, expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY" })])
        }
    })

    it("reports a session outcome, a refusal, a wrong kind and a scope that is not an installation", async () => {
        answerWith(401, { message: "Authentication required" })
        expect(
            await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
        ).toMatchObject({ ok: false, kind: "refused" })

        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: null })
        expect(
            await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
        ).toMatchObject({ ok: false, kind: "forbidden" })

        answerWith(200, overviewBody([readOf({ kind: "runtime" }, 1)]))
        expect(
            await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: INSTALLATION }),
        ).toMatchObject({ ok: false, code: expect.stringMatching(/^UNSUPPORTED/) })

        expect(
            await readAgentosShellLifecycleObservation(TOKEN, { ...scope, installationId: "not-a-uuid" }),
        ).toMatchObject({ ok: false, kind: "invalid", code: "UNSUPPORTED" })
    })
})

