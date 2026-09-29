import { describe, expect, it } from "vitest"

import {
    SALES_RECONCILIATIONS,
    commandSalesClarifyCommand,
    commandSalesClose,
    commandSalesPrepareHandoff,
    commandSalesRecoverAction,
    commandSalesSubmitHandoff,
    readSalesPipeline,
    readSalesReadiness
} from "./index"
import { salesSpec } from "./spec-helpers"
const { TOKEN, INTENT, SCOPE, READINESS_REQUEST, PIPELINE_REQUEST, CLARIFY_COMMAND_REQUEST, CLOSE_REQUEST, PREPARE_HANDOFF_REQUEST, SUBMIT_HANDOFF_REQUEST, STOP_ACTION_REQUEST, answerWith } = salesSpec

describe("sales", () => {
    it("keeps an unknown outcome unknown, names the one read of the same identity, and never re-sends", async () => {
        answerWith(200, { kind: "outcome_unknown", operation: "sales.close@1", requestId: INTENT })
        expect(await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "outcome_unknown",
            operation: "sales.close@1",
            requestId: INTENT,
            reconciles: "sales.opportunity@1",
            refusal: null,
            reason: "",
        })
        expect(salesSpec.fetchMock).toHaveBeenCalledTimes(1)
    })

    it("keeps a deadline a refusal that still names the read of the same identity", async () => {
        answerWith(200, { kind: "DEADLINE_EXCEEDED", reason: "receiver-deadline" })
        expect(await commandSalesSubmitHandoff(TOKEN, SCOPE, SUBMIT_HANDOFF_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "DEADLINE_EXCEEDED",
            operation: "sales.submitHandoff@1",
            requestId: INTENT,
            reconciles: "sales.handoff@1",
            refusal: null,
            reason: "receiver-deadline",
        })
        answerWith(200, { kind: "DEADLINE_EXCEEDED" })
        expect(await readSalesPipeline(TOKEN, SCOPE, PIPELINE_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "DEADLINE_EXCEEDED",
            reconciles: null,
            reason: "",
        })
        expect(salesSpec.fetchMock).toHaveBeenCalledTimes(2)
    })

    it("binds every mutation to exactly the one read the contract registers", async () => {
        expect(SALES_RECONCILIATIONS).toEqual({
            "sales.configurePolicy@1": "sales.policy@1",
            "sales.submitCommand@1": "sales.command@1",
            "sales.clarifyCommand@1": "sales.command@1",
            "sales.decideProposal@1": "sales.decisionRequest@1",
            "sales.close@1": "sales.opportunity@1",
            "sales.prepareHandoff@1": "sales.handoff@1",
            "sales.submitHandoff@1": "sales.handoff@1",
            "sales.recoverAction@1": "sales.action@1",
        })
        answerWith(200, { kind: "outcome_unknown", operation: "sales.prepareHandoff@1", requestId: INTENT })
        expect(await commandSalesPrepareHandoff(TOKEN, SCOPE, PREPARE_HANDOFF_REQUEST, INTENT)).toMatchObject({
            reconciles: "sales.handoff@1",
        })
        answerWith(200, { kind: "outcome_unknown", operation: "sales.recoverAction@1", requestId: INTENT })
        expect(await commandSalesRecoverAction(TOKEN, SCOPE, STOP_ACTION_REQUEST, INTENT)).toMatchObject({
            reconciles: "sales.action@1",
        })
        answerWith(200, { kind: "outcome_unknown", operation: "sales.clarifyCommand@1", requestId: INTENT })
        expect(await commandSalesClarifyCommand(TOKEN, SCOPE, CLARIFY_COMMAND_REQUEST, INTENT)).toMatchObject({
            reconciles: "sales.command@1",
        })
    })

    it("never translates OPERATION_NOT_REGISTERED_FOR_INSTALLATION into a Sales state", async () => {
        answerWith(200, {
            kind: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION",
            reason: "installation-serves-no-such-package",
        })
        const answer = await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)
        expect(answer).toMatchObject({
            ok: false,
            code: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION",
            operation: "sales.readiness@1",
            requestId: INTENT,
            reconciles: null,
            refusal: null,
            reason: "installation-serves-no-such-package",
        })
        expect(answer).not.toHaveProperty("value")
    })


})
