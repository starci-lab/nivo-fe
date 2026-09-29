import { describe, expect, it } from "vitest"

import {
    commandSalesClarifyCommand,
    commandSalesClose,
    commandSalesConfigurePolicy,
    commandSalesDecideProposal,
    commandSalesPrepareHandoff,
    commandSalesRecoverAction,
    commandSalesSubmitCommand,
    commandSalesSubmitHandoff,
    readSalesAction,
    readSalesCommand,
    readSalesDecisionRequest,
    readSalesHandoff,
    readSalesOpportunity,
    readSalesPipeline,
    readSalesPolicy,
    readSalesReadiness
} from "./index"
import { salesSpec } from "./spec-helpers"
const { INSTALLATION, TOKEN, INTENT, SCOPE, OPERATIONS_PATH, CORE_ORIGIN, FINGERPRINT, POLICY_REQUEST, READINESS_REQUEST, OPPORTUNITY_REQUEST, PIPELINE_REQUEST, COMMAND_REQUEST, DECISION_REQUEST, ACTION_REQUEST, HANDOFF_REQUEST, CONFIGURE_POLICY_REQUEST, SUBMIT_COMMAND_REQUEST, CLARIFY_COMMAND_REQUEST, DECIDE_PROPOSAL_REQUEST, CLOSE_REQUEST, PREPARE_HANDOFF_REQUEST, SUBMIT_HANDOFF_REQUEST, RETRY_ACTION_REQUEST, STOP_ACTION_REQUEST, answerWith, sentUrls, sentInit, sentBody, served } = salesSpec

describe("sales", () => {
    it("sends each of the eight queries as exactly one bearer POST to its registered name", async () => {
        answerWith(
            200,
            served("sales.policy@1", {
                status: "completed",
                value: {
                    salesInstallationId: INSTALLATION,
                    revision: 1,
                    requestId: null,
                    values: {},
                    unsetItems: [],
                    configuredBy: null,
                    recordedAt: null,
                },
            }),
        )
        await readSalesPolicy(TOKEN, SCOPE, POLICY_REQUEST, INTENT)
        answerWith(200, served("sales.readiness@1", { status: "completed", value: { ready: true } }))
        await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)
        answerWith(
            200,
            served("sales.opportunity@1", { status: "completed", value: { opportunityId: "opportunity-1" } }),
        )
        await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)
        answerWith(200, served("sales.pipeline@1", { status: "completed", value: { items: [] } }))
        await readSalesPipeline(TOKEN, SCOPE, PIPELINE_REQUEST, INTENT)
        answerWith(200, served("sales.command@1", { status: "completed", value: { commandId: "command-1" } }))
        await readSalesCommand(TOKEN, SCOPE, COMMAND_REQUEST, INTENT)
        answerWith(
            200,
            served("sales.decisionRequest@1", { status: "completed", value: { decisionRequestId: "decision-1" } }),
        )
        await readSalesDecisionRequest(TOKEN, SCOPE, DECISION_REQUEST, INTENT)
        answerWith(200, served("sales.action@1", { status: "completed", value: { actionId: "action-1" } }))
        await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)
        answerWith(200, served("sales.handoff@1", { status: "completed", value: { handoffId: "handoff-1" } }))
        await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)

        expect(sentUrls()).toEqual([
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.policy@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.readiness@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.opportunity@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.pipeline@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.command@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.decisionRequest@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.action@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.handoff@1`,
        ])
        for (const index of [0, 1, 2, 3, 4, 5, 6, 7]) {
            expect(sentInit(index).method).toBe("POST")
            expect(sentInit(index).credentials).toBe("omit")
            expect(sentInit(index).headers).toEqual({
                authorization: `Bearer ${TOKEN}`,
                "content-type": "application/json",
            })
            expect(sentBody(index).requestId).toBe(INTENT)
        }
        expect(sentBody(0).input).toEqual({ operation: "policy", salesInstallationId: INSTALLATION, requestId: null })
        expect(sentBody(3).input).toEqual({
            operation: "pipeline",
            scopeFingerprint: FINGERPRINT,
            statusFilter: null,
            after: null,
            limit: 25,
        })
        expect(salesSpec.fetchMock).toHaveBeenCalledTimes(8)
    })

    it("sends each of the eight mutations as exactly one bearer POST under the caller's stable identity", async () => {
        answerWith(200, served("sales.configurePolicy@1", { status: "completed", value: { revision: 2 } }))
        await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)
        answerWith(200, served("sales.submitCommand@1", { status: "completed", value: { commandId: "command-1" } }))
        await commandSalesSubmitCommand(TOKEN, SCOPE, SUBMIT_COMMAND_REQUEST, INTENT)
        answerWith(200, served("sales.clarifyCommand@1", { status: "completed", value: { commandId: "command-1" } }))
        await commandSalesClarifyCommand(TOKEN, SCOPE, CLARIFY_COMMAND_REQUEST, INTENT)
        answerWith(
            200,
            served("sales.decideProposal@1", { status: "completed", value: { decisionRequestId: "decision-1" } }),
        )
        await commandSalesDecideProposal(TOKEN, SCOPE, DECIDE_PROPOSAL_REQUEST, INTENT)
        answerWith(200, served("sales.close@1", { status: "lost", value: { opportunityId: "opportunity-1" } }))
        await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)
        answerWith(200, served("sales.prepareHandoff@1", { status: "completed", value: { handoffId: "handoff-1" } }))
        await commandSalesPrepareHandoff(TOKEN, SCOPE, PREPARE_HANDOFF_REQUEST, INTENT)
        answerWith(200, served("sales.submitHandoff@1", { status: "completed", value: { handoffId: "handoff-1" } }))
        await commandSalesSubmitHandoff(TOKEN, SCOPE, SUBMIT_HANDOFF_REQUEST, INTENT)
        answerWith(200, served("sales.recoverAction@1", { status: "completed", value: { actionId: "action-1" } }))
        await commandSalesRecoverAction(TOKEN, SCOPE, RETRY_ACTION_REQUEST, INTENT)
        answerWith(200, served("sales.recoverAction@1", { status: "completed", value: { actionId: "action-1" } }))
        await commandSalesRecoverAction(TOKEN, SCOPE, STOP_ACTION_REQUEST, INTENT)

        expect(sentUrls()).toEqual([
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.configurePolicy@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.submitCommand@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.clarifyCommand@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.decideProposal@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.close@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.prepareHandoff@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.submitHandoff@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.recoverAction@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.recoverAction@1`,
        ])
        expect(sentBody(1).input).toEqual({ operation: "executeCommand", ...SUBMIT_COMMAND_REQUEST })
        expect(sentBody(3).input).toEqual({ operation: "answerDecision", ...DECIDE_PROPOSAL_REQUEST })
        expect(sentBody(5).input).toEqual({ operation: "prepareHandoff", ...PREPARE_HANDOFF_REQUEST })
        expect(sentBody(6).input).toEqual({ operation: "submitPreparedHandoff", ...SUBMIT_HANDOFF_REQUEST })
        // The one registered name that opens two recovery doors sends the discriminant its own input names.
        expect(sentBody(7).input).toEqual(RETRY_ACTION_REQUEST)
        expect(sentBody(8).input).toEqual(STOP_ACTION_REQUEST)
        // An exact replay of one identity is one press under the same requestId, never a new identity.
        expect(sentBody(7).requestId).toBe(sentBody(8).requestId)
        expect(sentBody(0).input).toEqual({ operation: "configurePolicy", ...CONFIGURE_POLICY_REQUEST })
        expect(salesSpec.fetchMock).toHaveBeenCalledTimes(9)
    })


})
