import { useState, type SetStateAction } from "react"
import { type SalesCloseRequest } from "@/modules/api/sales"
type SalesWorkbenchFormState = {
    readonly cursor: string | null
    readonly opportunityId: string
    readonly commandId: string
    readonly commandRevision: string
    readonly customerRefs: string
    readonly opportunityIds: string
    readonly offerRefs: string
    readonly requestedActions: string
    readonly commandFingerprint: string
    readonly expectedRevisions: string
    readonly clarificationRevision: string
    readonly factKind: "customerRef" | "opportunityId"
    readonly factValue: string
    readonly actionId: string
    readonly attemptGeneration: string
    readonly actionRevision: string
    readonly receiverIntentId: string
    readonly receiverAttemptId: string
    readonly recoveryFingerprint: string
    readonly closeIntentId: string
    readonly closeOutcome: SalesCloseRequest["outcome"]
    readonly closeEvidenceRefs: string
    readonly closeOrderId: string
    readonly closeRevision: string
    readonly policyRevision: string
    readonly policyCadence: string
}

/** Own the editable Sales workbench controls. */
export const useSalesWorkbenchForm = () => {
    const [form, setForm] = useState<SalesWorkbenchFormState>({
        cursor: null,
        opportunityId: "",
        commandId: "",
        commandRevision: "1",
        customerRefs: "",
        opportunityIds: "",
        offerRefs: "",
        requestedActions: "",
        commandFingerprint: "",
        expectedRevisions: "",
        clarificationRevision: "1",
        factKind: "opportunityId",
        factValue: "",
        actionId: "",
        attemptGeneration: "1",
        actionRevision: "1",
        receiverIntentId: "",
        receiverAttemptId: "",
        recoveryFingerprint: "",
        closeIntentId: "",
        closeOutcome: "won",
        closeEvidenceRefs: "",
        closeOrderId: "",
        closeRevision: "1",
        policyRevision: "",
        policyCadence: "",
    })
    const fieldSetter =
        <TField extends keyof SalesWorkbenchFormState>(field: TField) =>
        (action: SetStateAction<SalesWorkbenchFormState[TField]>) =>
            setForm((current) => {
                const value = typeof action === "function" ? action(current[field]) : action
                return { ...current, [field]: value }
            })
    return {
        ...form,
        setCursor: fieldSetter("cursor"),
        setOpportunityId: fieldSetter("opportunityId"),
        setCommandId: fieldSetter("commandId"),
        setCommandRevision: fieldSetter("commandRevision"),
        setCustomerRefs: fieldSetter("customerRefs"),
        setOpportunityIds: fieldSetter("opportunityIds"),
        setOfferRefs: fieldSetter("offerRefs"),
        setRequestedActions: fieldSetter("requestedActions"),
        setCommandFingerprint: fieldSetter("commandFingerprint"),
        setExpectedRevisions: fieldSetter("expectedRevisions"),
        setClarificationRevision: fieldSetter("clarificationRevision"),
        setFactKind: fieldSetter("factKind"),
        setFactValue: fieldSetter("factValue"),
        setActionId: fieldSetter("actionId"),
        setAttemptGeneration: fieldSetter("attemptGeneration"),
        setActionRevision: fieldSetter("actionRevision"),
        setReceiverIntentId: fieldSetter("receiverIntentId"),
        setReceiverAttemptId: fieldSetter("receiverAttemptId"),
        setRecoveryFingerprint: fieldSetter("recoveryFingerprint"),
        setCloseIntentId: fieldSetter("closeIntentId"),
        setCloseOutcome: fieldSetter("closeOutcome"),
        setCloseEvidenceRefs: fieldSetter("closeEvidenceRefs"),
        setCloseOrderId: fieldSetter("closeOrderId"),
        setCloseRevision: fieldSetter("closeRevision"),
        setPolicyRevision: fieldSetter("policyRevision"),
        setPolicyCadence: fieldSetter("policyCadence"),
    }
}
