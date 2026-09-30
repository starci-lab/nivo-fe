import { type SalesClarificationFact, type SalesCloseRequest } from "@/modules/api/sales"
import {
    salesExpectedRevisions,
    salesIdentityList,
    salesNoStartProof,
    salesRecoveryDoor,
    salesRequestedActions,
    salesWriterFence,
} from "@/modules/sales/sales-workbench"
import type { useSalesWorkbenchForm } from "./useSalesWorkbenchForm"
import type { useWorkbenchScope } from "./useWorkbenchScope"
import type { useSalesWorkbenchData } from "./useSalesWorkbenchData"
/** One integer control as a usable revision, or null while it holds none. */
const integerOrNull = (value: string): number | null => (Number.isSafeInteger(Number(value)) ? Number(value) : null)

/** Whether one command press carries everything its registered input requires. */
const commandPressable = (ready: boolean, commandId: string, revision: number | null, fingerprint: string): boolean =>
    ready && commandId.length > 0 && revision !== null && fingerprint.length > 0

/** Whether one clarification carries its pending revision and its one permitted fact. */
const clarifyPressable = (ready: boolean, commandId: string, fact: string, revision: number | null): boolean =>
    ready && commandId.length > 0 && fact.length > 0 && revision !== null

/** Whether one closure carries the intent, the opportunity and the revision it is guarded at. */
const closePressable = (ready: boolean, intentId: string, opportunityId: string, revision: number | null): boolean =>
    ready && intentId.length > 0 && opportunityId.length > 0 && revision !== null

/** One recovery press, as the read and the controls settled it. */
type RecoveryPress = {
    readonly ready: boolean
    readonly actionId: string
    readonly attempt: number | null
    readonly revision: number | null
    readonly door: "retry" | "stop" | "hold"
    readonly proof: string | null
    readonly fence: unknown
    readonly receiverIntentId: string
    readonly receiverAttemptId: string
    readonly fingerprint: string
}

/** Whether one recovery press may leave: only the read's own no-start proof and fence open a door. */
const recoveryPressable = (press: RecoveryPress): boolean =>
    press.ready &&
    press.actionId.length > 0 &&
    press.attempt !== null &&
    press.revision !== null &&
    press.door === "retry" &&
    press.proof !== null &&
    press.fence !== null &&
    press.receiverIntentId.length > 0 &&
    press.receiverAttemptId.length > 0 &&
    press.fingerprint.length > 0

/** The permitted fact one clarification names. */
const permittedFactOf = (kind: "customerRef" | "opportunityId", value: string): SalesClarificationFact =>
    kind === "opportunityId" ? { opportunityId: value } : { customerRef: value }

/** The confirmed order a closure claims, or none at all. */
const confirmedOrderOf = (orderId: string): SalesCloseRequest["confirmedOrder"] =>
    orderId.length === 0 ? null : { orderId }

/** Project the SalesWorkbenchInputs responsibility for one workbench. */
export const useSalesWorkbenchInputs = (
    context: ReturnType<typeof useSalesWorkbenchForm> &
        ReturnType<typeof useWorkbenchScope> &
        ReturnType<typeof useSalesWorkbenchData>,
) => {
    const {
        actionId,
        actionModel,
        actionRevision,
        attemptGeneration,
        clarificationRevision,
        closeEvidenceRefs,
        closeIntentId,
        closeOrderId,
        closeOutcome,
        closeRevision,
        commandFingerprint,
        commandId,
        commandRevision,
        customerRefs,
        expectedRevisions,
        factKind,
        factValue,
        offerRefs,
        opportunityId,
        opportunityIds,
        ready,
        receiverAttemptId,
        receiverIntentId,
        recoveryFingerprint,
        requestedActions,
    } = context
    const commandActions = salesRequestedActions(requestedActions)
    const commandInput = {
        commandId,
        commandRevision: Number(commandRevision),
        scope: {
            customerRefs: salesIdentityList(customerRefs),
            opportunityIds: salesIdentityList(opportunityIds),
            offerRefs: salesIdentityList(offerRefs),
        },
        requestedActions: commandActions,
        fingerprint: commandFingerprint,
        expectedOpportunityRevisions: salesExpectedRevisions(expectedRevisions),
    }
    const commandAddressable = commandPressable(ready, commandId, integerOrNull(commandRevision), commandFingerprint)
    const permittedFact = permittedFactOf(factKind, factValue)
    const clarifyInput = { commandId, clarificationRevision: Number(clarificationRevision), permittedFact }
    const clarifyAddressable = clarifyPressable(ready, commandId, factValue, integerOrNull(clarificationRevision))
    const recoveryDoor = salesRecoveryDoor(actionModel)
    const attestedProof = salesNoStartProof(actionModel)
    const attestedFence = salesWriterFence(actionModel)
    const recoveryAddressable = recoveryPressable({
        ready,
        actionId,
        attempt: integerOrNull(attemptGeneration),
        revision: integerOrNull(actionRevision),
        door: recoveryDoor,
        proof: attestedProof,
        fence: attestedFence,
        receiverIntentId,
        receiverAttemptId,
        fingerprint: recoveryFingerprint,
    })
    const closeInput = {
        intentId: closeIntentId,
        opportunityId,
        outcome: closeOutcome,
        evidenceRefs: salesIdentityList(closeEvidenceRefs),
        confirmedOrder: confirmedOrderOf(closeOrderId),
        expectedRevision: Number(closeRevision),
    }
    const closeAddressable = closePressable(ready, closeIntentId, opportunityId, integerOrNull(closeRevision))

    return {
        attestedFence,
        attestedProof,
        clarifyAddressable,
        clarifyInput,
        closeAddressable,
        closeInput,
        commandActions,
        commandAddressable,
        commandInput,
        permittedFact,
        recoveryAddressable,
        recoveryDoor,
    }
}
