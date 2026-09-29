/**
 * The installation-scoped Sales operation client: the eight Sales queries and the eight Sales
 * mutations registered by contract.sales.public-operations, each one POST to its own registered
 * `name@version` on the Core installation operation route, and the wire types of the sixteen
 * operations, the eight Sales-tagged result variants and `sales_refusal`.
 *
 * ONE OPERATION, ONE ADDRESS. The three installation coordinates and the registered name are the
 * whole address, and the name is written verbatim because the receiver matches its `@1` version
 * separator literally. The closed registered set is the only callable set: there is no generic
 * `request@1` here, and every function below names exactly one registered operation.
 *
 * THE STABLE IDENTITY IS THE `requestId`. The caller mints it once; an exact replay of the same
 * identity is one intent and returns the stored result, so this client never mints an identity and
 * never re-sends under a new one (nfr.sales.r-sales-idempotency).
 *
 * NOTHING IS PROMOTED. A receiver status the contract does not declare fails closed, an
 * `OPERATION_NOT_REGISTERED_FOR_INSTALLATION` stays a route refusal that names no Sales state, and an
 * unknown outcome is never success: it is reported as unknown and names the one registered read of
 * the same identity it can be reconciled by (fr.sales.fr-sales-recovery).
 */
export {
    salesOperationAddress,
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
    readSalesReadiness,
} from "./operations"
export { SALES_MUTATION_NAMES, SALES_QUERY_NAMES, SALES_RECONCILIATIONS } from "./types"
export type {
    SalesActionRequest,
    SalesActionValue,
    SalesAnswer,
    SalesClarificationFact,
    SalesClarifyCommandRequest,
    SalesCloseRequest,
    SalesCommandRequest,
    SalesCommandScope,
    SalesCommandValue,
    SalesConfigurePolicyRequest,
    SalesDecisionRequestRequest,
    SalesDecisionValue,
    SalesDecideProposalRequest,
    SalesFailure,
    SalesFailureDetail,
    SalesHandoffRequest,
    SalesHandoffValue,
    SalesInstallationScope,
    SalesMutationName,
    SalesOpportunityRequest,
    SalesOpportunityValue,
    SalesOperationName,
    SalesPipelineItem,
    SalesPipelineRequest,
    SalesPipelineValue,
    SalesPolicyRequest,
    SalesPolicyValue,
    SalesPolicyValues,
    SalesPrepareHandoffRequest,
    SalesQueryName,
    SalesReadinessRequest,
    SalesReadinessValue,
    SalesRecoverActionRequest,
    SalesRecoverActionRetryRequest,
    SalesRecoverActionStopRequest,
    SalesRefusal,
    SalesRefusalCode,
    SalesRefusalReason,
    SalesRequestedAction,
    SalesSubmitCommandRequest,
    SalesSubmitHandoffRequest,
    SalesWriterFence,
} from "./types"
