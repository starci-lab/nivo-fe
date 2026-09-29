import { operationAddress, sendOperation } from "../operation-route"
import { failure, narrowSalesAnswer } from "./payload"
import {
    parseSalesActionValue,
    parseSalesCommandValue,
    parseSalesDecisionValue,
    parseSalesHandoffValue,
    parseSalesOpportunityValue,
    parseSalesPipelineValue,
    parseSalesPolicyValue,
    parseSalesReadinessValue,
} from "./payload.guards"
import type {
    SalesActionRequest, SalesActionValue, SalesAnswer, SalesClarifyCommandRequest, SalesCloseRequest,
    SalesCommandRequest, SalesCommandValue, SalesConfigurePolicyRequest, SalesDecisionRequestRequest,
    SalesDecisionValue, SalesDecideProposalRequest, SalesHandoffRequest, SalesHandoffValue,
    SalesInstallationScope, SalesOpportunityRequest, SalesOpportunityValue, SalesOperationName,
    SalesPipelineRequest, SalesPipelineValue, SalesPolicyRequest, SalesPolicyValue,
    SalesReadinessRequest, SalesReadinessValue, SalesRecoverActionRequest, SalesPrepareHandoffRequest,
    SalesSubmitCommandRequest,
    SalesSubmitHandoffRequest,
} from "./types"

/** Build the one address of one registered operation. */
export const salesOperationAddress = (scope: SalesInstallationScope, operation: SalesOperationName): string =>
    operationAddress(scope, operation)

/**
 * Send exactly one Sales operation request, and nothing else.
 *
 * One call is one request: no loop, no timer and no re-send. The caller replays the SAME stable
 * identity if it decides to try again, which is what keeps a replay one intent.
 */
const sendSalesOperation = async <TValue>(
    accessToken: string | null,
    scope: SalesInstallationScope,
    operation: SalesOperationName,
    request: Readonly<Record<string, unknown>>,
    requestId: string,
    parse: (input: unknown) => TValue | null,
): Promise<SalesAnswer<TValue>> => {
    const exchange = await sendOperation(accessToken, salesOperationAddress(scope, operation), requestId, request)
    if (!exchange.arrived) return failure(operation, exchange.code, exchange.reason, exchange.requestId)
    return narrowSalesAnswer<TValue>(operation, requestId, exchange.body, parse)
}

/** Read one installation's operating policy, or the revision one configure request stored. */
export const readSalesPolicy = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesPolicyRequest,
    requestId: string,
): Promise<SalesAnswer<SalesPolicyValue>> =>
    sendSalesOperation<SalesPolicyValue>(
        accessToken,
        scope,
        "sales.policy@1",
        { operation: "policy", ...request },
        requestId,
        parseSalesPolicyValue,
    )

/** Read one installation's observed readiness. */
export const readSalesReadiness = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesReadinessRequest,
    requestId: string,
): Promise<SalesAnswer<SalesReadinessValue>> =>
    sendSalesOperation<SalesReadinessValue>(
        accessToken,
        scope,
        "sales.readiness@1",
        { operation: "readiness", ...request },
        requestId,
        parseSalesReadinessValue,
    )

/** Read one opportunity's committed state, the read a close is reconciled by. */
export const readSalesOpportunity = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesOpportunityRequest,
    requestId: string,
): Promise<SalesAnswer<SalesOpportunityValue>> =>
    sendSalesOperation<SalesOpportunityValue>(
        accessToken,
        scope,
        "sales.opportunity@1",
        { operation: "opportunity", ...request },
        requestId,
        parseSalesOpportunityValue,
    )

/** Read one bounded live page of the current pipeline. */
export const readSalesPipeline = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesPipelineRequest,
    requestId: string,
): Promise<SalesAnswer<SalesPipelineValue>> =>
    sendSalesOperation<SalesPipelineValue>(
        accessToken,
        scope,
        "sales.pipeline@1",
        { operation: "pipeline", ...request },
        requestId,
        parseSalesPipelineValue,
    )

/** Read one command plan's committed state, the read a command and its clarification are reconciled by. */
export const readSalesCommand = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesCommandRequest,
    requestId: string,
): Promise<SalesAnswer<SalesCommandValue>> =>
    sendSalesOperation<SalesCommandValue>(
        accessToken,
        scope,
        "sales.command@1",
        { operation: "command", ...request },
        requestId,
        parseSalesCommandValue,
    )

/** Read one decision request's committed state, the read a decision is reconciled by. */
export const readSalesDecisionRequest = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesDecisionRequestRequest,
    requestId: string,
): Promise<SalesAnswer<SalesDecisionValue>> =>
    sendSalesOperation<SalesDecisionValue>(
        accessToken,
        scope,
        "sales.decisionRequest@1",
        { operation: "decisionRequest", ...request },
        requestId,
        parseSalesDecisionValue,
    )

/** Read one Sales action's stored state, the read any recovery attempt is reconciled by. */
export const readSalesAction = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesActionRequest,
    requestId: string,
): Promise<SalesAnswer<SalesActionValue>> =>
    sendSalesOperation<SalesActionValue>(
        accessToken,
        scope,
        "sales.action@1",
        { operation: "action", ...request },
        requestId,
        parseSalesActionValue,
    )

/** Read one Accounting handoff's sender-side state, the read a handoff is reconciled by. */
export const readSalesHandoff = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesHandoffRequest,
    requestId: string,
): Promise<SalesAnswer<SalesHandoffValue>> =>
    sendSalesOperation<SalesHandoffValue>(
        accessToken,
        scope,
        "sales.handoff@1",
        { operation: "handoff", ...request },
        requestId,
        parseSalesHandoffValue,
    )

/** Record one complete operating-policy revision; an exact replay returns the revision it stored. */
export const commandSalesConfigurePolicy = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesConfigurePolicyRequest,
    requestId: string,
): Promise<SalesAnswer<SalesPolicyValue>> =>
    sendSalesOperation<SalesPolicyValue>(
        accessToken,
        scope,
        "sales.configurePolicy@1",
        { operation: "configurePolicy", ...request },
        requestId,
        parseSalesPolicyValue,
    )

/** Submit one bounded command plan under its own command identity and fingerprint. */
export const commandSalesSubmitCommand = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesSubmitCommandRequest,
    requestId: string,
): Promise<SalesAnswer<SalesCommandValue>> =>
    sendSalesOperation<SalesCommandValue>(
        accessToken,
        scope,
        "sales.submitCommand@1",
        { operation: "executeCommand", ...request },
        requestId,
        parseSalesCommandValue,
    )

/** Refine one awaiting-clarification command plan, admitted under its own pending revision. */
export const commandSalesClarifyCommand = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesClarifyCommandRequest,
    requestId: string,
): Promise<SalesAnswer<SalesCommandValue>> =>
    sendSalesOperation<SalesCommandValue>(
        accessToken,
        scope,
        "sales.clarifyCommand@1",
        { operation: "clarifyCommand", ...request },
        requestId,
        parseSalesCommandValue,
    )

/** Answer one immutable proposal once, against its exact version and fingerprint. */
export const commandSalesDecideProposal = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesDecideProposalRequest,
    requestId: string,
): Promise<SalesAnswer<SalesDecisionValue>> =>
    sendSalesOperation<SalesDecisionValue>(
        accessToken,
        scope,
        "sales.decideProposal@1",
        { operation: "answerDecision", ...request },
        requestId,
        parseSalesDecisionValue,
    )

/** Close or hold one opportunity at its expected revision, reporting the committed status. */
export const commandSalesClose = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesCloseRequest,
    requestId: string,
): Promise<SalesAnswer<SalesOpportunityValue>> =>
    sendSalesOperation<SalesOpportunityValue>(
        accessToken,
        scope,
        "sales.close@1",
        { operation: "close", ...request },
        requestId,
        parseSalesOpportunityValue,
    )

/** Prepare one confirmed-order handoff without contacting Accounting. */
export const commandSalesPrepareHandoff = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesPrepareHandoffRequest,
    requestId: string,
): Promise<SalesAnswer<SalesHandoffValue>> =>
    sendSalesOperation<SalesHandoffValue>(
        accessToken,
        scope,
        "sales.prepareHandoff@1",
        { operation: "prepareHandoff", ...request },
        requestId,
        parseSalesHandoffValue,
    )

/** Admit one prepared handoff into the Sales external-action queue. */
export const commandSalesSubmitHandoff = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesSubmitHandoffRequest,
    requestId: string,
): Promise<SalesAnswer<SalesHandoffValue>> =>
    sendSalesOperation<SalesHandoffValue>(
        accessToken,
        scope,
        "sales.submitHandoff@1",
        { operation: "submitPreparedHandoff", ...request },
        requestId,
        parseSalesHandoffValue,
    )

/** Retry after proven no-start, or stop: the one registered name that opens two recovery doors. */
export const commandSalesRecoverAction = async (
    accessToken: string | null,
    scope: SalesInstallationScope,
    request: SalesRecoverActionRequest,
    requestId: string,
): Promise<SalesAnswer<SalesActionValue>> =>
    sendSalesOperation<SalesActionValue>(accessToken, scope, "sales.recoverAction@1", { ...request }, requestId, parseSalesActionValue)
