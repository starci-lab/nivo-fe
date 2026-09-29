import { describe, expect, it } from "vitest"

import {
    commandSalesClose,
    commandSalesConfigurePolicy,
    readSalesHandoff,
    readSalesOpportunity,
    readSalesReadiness
} from "./index"
import { salesSpec } from "./spec-helpers"
const { INSTALLATION, TOKEN, INTENT, SCOPE, READINESS_REQUEST, OPPORTUNITY_REQUEST, HANDOFF_REQUEST, CONFIGURE_POLICY_REQUEST, CLOSE_REQUEST, answerWith, served } = salesSpec

describe("sales", () => {
    it("hands the receiver's own variant through with the tag the operation registers", async () => {
        answerWith(
            200,
            served("sales.close@1", { status: "won", value: { opportunityId: "opportunity-1", revision: 3 } }),
        )
        expect(await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)).toEqual({
            ok: true,
            data: { opportunityId: "opportunity-1", revision: 3 },
        })
        answerWith(200, served("sales.readiness@1", { status: "pending", value: { ready: false, revision: 1 } }))
        expect(await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)).toEqual({
            ok: true,
            data: { ready: false, revision: 1 },
        })
    })

    it("surfaces DENIED as its own typed failure and keeps the receiver's code", async () => {
        answerWith(200, served("sales.opportunity@1", { status: "denied", code: "SALES_OPPORTUNITY_NOT_FOUND" }))
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "SALES_REFUSED_DENIED",
            operation: "sales.opportunity@1",
            requestId: INTENT,
            reconciles: null,
            reason: "",
            refusal: { reason: "DENIED", code: "SALES_OPPORTUNITY_NOT_FOUND", item: null, currentRevision: null },
        })
    })

    it("surfaces INVALID with the one item the receiver named, and nothing else's item", async () => {
        answerWith(
            200,
            served("sales.configurePolicy@1", {
                status: "denied",
                code: "SALES_POLICY_VALUE_INVALID",
                value: { item: "contact-policy" },
            }),
        )
        expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "SALES_REFUSED_INVALID",
            operation: "sales.configurePolicy@1",
            reconciles: "sales.policy@1",
            refusal: {
                reason: "INVALID",
                code: "SALES_POLICY_VALUE_INVALID",
                item: "contact-policy",
                currentRevision: null,
            },
        })
        answerWith(
            200,
            served("sales.opportunity@1", {
                status: "denied",
                code: "SALES_OPPORTUNITY_NOT_FOUND",
                value: { item: "not-a-policy-item" },
            }),
        )
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            code: "SALES_REFUSED_DENIED",
            refusal: { reason: "DENIED", item: "not-a-policy-item" },
        })
    })

    it("surfaces CONFLICT with the current revision the stored value carries", async () => {
        answerWith(
            200,
            served("sales.configurePolicy@1", {
                status: "conflict",
                code: "SALES_POLICY_REVISION_CONFLICT",
                value: { salesInstallationId: INSTALLATION, revision: 4 },
            }),
        )
        expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "SALES_REFUSED_CONFLICT",
            reconciles: "sales.policy@1",
            refusal: { reason: "CONFLICT", code: "SALES_POLICY_REVISION_CONFLICT", item: null, currentRevision: 4 },
        })
    })

    it("prefers an explicit currentRevision and accepts no re-spelled or non-positive one", async () => {
        answerWith(
            200,
            served("sales.configurePolicy@1", {
                status: "conflict",
                code: "SALES_POLICY_REVISION_CONFLICT",
                value: { currentRevision: 7, revision: 4 },
            }),
        )
        expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
            refusal: { currentRevision: 7 },
        })
        answerWith(
            200,
            served("sales.configurePolicy@1", {
                status: "conflict",
                code: "SALES_POLICY_REVISION_CONFLICT",
                value: { currentRevision: "7" },
            }),
        )
        expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
            refusal: { currentRevision: null },
        })
        answerWith(
            200,
            served("sales.configurePolicy@1", {
                status: "conflict",
                code: "SALES_POLICY_REVISION_CONFLICT",
                value: { revision: 0 },
            }),
        )
        expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
            refusal: { currentRevision: null },
        })
    })

    it("surfaces UNAVAILABLE as its own typed failure", async () => {
        answerWith(200, served("sales.readiness@1", { status: "unavailable", code: "SALES_READINESS_NOT_OBSERVED" }))
        expect(await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "SALES_REFUSED_UNAVAILABLE",
            operation: "sales.readiness@1",
            requestId: INTENT,
            reconciles: null,
            reason: "",
            refusal: { reason: "UNAVAILABLE", code: "SALES_READINESS_NOT_OBSERVED", item: null, currentRevision: null },
        })
    })

    it("fails closed on a refusal status the contract does not declare, and on a refusal with no code", async () => {
        answerWith(200, served("sales.opportunity@1", { status: "someday", code: "SALES_SOMEDAY" }))
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNEXPECTED_RESULT_STATUS",
        })
        answerWith(200, served("sales.opportunity@1", { status: "denied", code: "" }))
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, served("sales.opportunity@1", { status: "denied", code: 42 }))
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
    })

    it("fails closed on a served status the contract does not declare, and reads a lifecycle denial as a variant", async () => {
        answerWith(200, served("sales.opportunity@1", { status: "someday", value: {} }))
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNEXPECTED_RESULT_STATUS",
        })
        // A lifecycle denial is the readiness fact, not a refusal of the read: it carries no code.
        answerWith(200, served("sales.readiness@1", { status: "denied", value: { ready: false, revision: 2 } }))
        expect(await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)).toEqual({
            ok: true,
            data: { ready: false, revision: 2 },
        })
    })

    it("fails closed when the served result is not a result object at all", async () => {
        answerWith(200, served("sales.handoff@1", "not a result"))
        expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, served("sales.handoff@1", { value: { handoffId: "handoff-1" } }))
        expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, served("sales.handoff@1", { status: 7, value: {} }))
        expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, served("sales.handoff@1", { status: "completed" }))
        expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
    })


})
