import { useState, type SetStateAction } from "react"
import { accountingUtcMonth } from "@/modules/accounting/accounting-workbench"
type AccountingWorkbenchFormState = {
    readonly periodMonth: string
    readonly currency: string | null
    readonly cursor: string | null
    readonly asOfDraft: string
    readonly asOf: string | null
    readonly evidenceId: string
    readonly sourceKind: string
    readonly sourceRef: string
    readonly sourceRevision: string
    readonly fingerprint: string
    readonly intakeRevision: string
    readonly intentId: string
    readonly itemId: string
    readonly policyRevision: string
    readonly evidenceIds: string
    readonly itemRevision: string
    readonly oldAttemptId: string
    readonly notStartedProofRef: string
    readonly newAttemptId: string
    readonly exceptionId: string
    readonly choiceCode: string
    readonly questionReason: string
    readonly questionEvidenceRefs: string
    readonly exceptionRevision: string
    readonly resultId: string
    readonly correctionId: string
    readonly predecessorResultId: string
    readonly correctedAmount: string
    readonly correctedCounterparty: string
    readonly correctionReason: string
    readonly correctionEvidenceRefs: string
    readonly correctionRevision: string
    readonly appendAttemptId: string
}

/** Own the editable Accounting workbench controls. */
export const useAccountingWorkbenchForm = () => {
    const [form, setForm] = useState<AccountingWorkbenchFormState>(() => ({
        periodMonth: accountingUtcMonth(new Date()),
        currency: null,
        cursor: null,
        asOfDraft: "",
        asOf: null,
        evidenceId: "",
        sourceKind: "",
        sourceRef: "",
        sourceRevision: "",
        fingerprint: "",
        intakeRevision: "0",
        intentId: "",
        itemId: "",
        policyRevision: "",
        evidenceIds: "",
        itemRevision: "0",
        oldAttemptId: "",
        notStartedProofRef: "",
        newAttemptId: "",
        exceptionId: "",
        choiceCode: "",
        questionReason: "",
        questionEvidenceRefs: "",
        exceptionRevision: "0",
        resultId: "",
        correctionId: "",
        predecessorResultId: "",
        correctedAmount: "",
        correctedCounterparty: "",
        correctionReason: "",
        correctionEvidenceRefs: "",
        correctionRevision: "0",
        appendAttemptId: "",
    }))
    const fieldSetter =
        <TField extends keyof AccountingWorkbenchFormState>(field: TField) =>
        (action: SetStateAction<AccountingWorkbenchFormState[TField]>) =>
            setForm((current) => {
                const value = typeof action === "function" ? action(current[field]) : action
                return { ...current, [field]: value }
            })
    return {
        ...form,
        setPeriodMonth: fieldSetter("periodMonth"),
        setCurrency: fieldSetter("currency"),
        setCursor: fieldSetter("cursor"),
        setAsOfDraft: fieldSetter("asOfDraft"),
        setAsOf: fieldSetter("asOf"),
        setEvidenceId: fieldSetter("evidenceId"),
        setSourceKind: fieldSetter("sourceKind"),
        setSourceRef: fieldSetter("sourceRef"),
        setSourceRevision: fieldSetter("sourceRevision"),
        setFingerprint: fieldSetter("fingerprint"),
        setIntakeRevision: fieldSetter("intakeRevision"),
        setIntentId: fieldSetter("intentId"),
        setItemId: fieldSetter("itemId"),
        setPolicyRevision: fieldSetter("policyRevision"),
        setEvidenceIds: fieldSetter("evidenceIds"),
        setItemRevision: fieldSetter("itemRevision"),
        setOldAttemptId: fieldSetter("oldAttemptId"),
        setNotStartedProofRef: fieldSetter("notStartedProofRef"),
        setNewAttemptId: fieldSetter("newAttemptId"),
        setExceptionId: fieldSetter("exceptionId"),
        setChoiceCode: fieldSetter("choiceCode"),
        setQuestionReason: fieldSetter("questionReason"),
        setQuestionEvidenceRefs: fieldSetter("questionEvidenceRefs"),
        setExceptionRevision: fieldSetter("exceptionRevision"),
        setResultId: fieldSetter("resultId"),
        setCorrectionId: fieldSetter("correctionId"),
        setPredecessorResultId: fieldSetter("predecessorResultId"),
        setCorrectedAmount: fieldSetter("correctedAmount"),
        setCorrectedCounterparty: fieldSetter("correctedCounterparty"),
        setCorrectionReason: fieldSetter("correctionReason"),
        setCorrectionEvidenceRefs: fieldSetter("correctionEvidenceRefs"),
        setCorrectionRevision: fieldSetter("correctionRevision"),
        setAppendAttemptId: fieldSetter("appendAttemptId"),
    }
}
