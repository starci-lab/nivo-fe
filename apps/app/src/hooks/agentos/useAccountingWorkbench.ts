import { useState, type SetStateAction } from "react"
import { useParams } from "next/navigation"
import { useFormatter } from "next-intl"
import type {
    AccountingCorrectedFact,
    AccountingExceptionInput,
    AccountingInstallationScope,
    AccountingOperationAnswer,
    AccountingResult,
    AccountingResultDetailInput,
    AccountingSummaryQueryInput,
} from "@/modules/api/accounting"
import {
    isCommandPayloadState,
    parseAccountingCorrectionReading,
    parseAccountingEvidenceReading,
    parseAccountingExceptionReading,
    parseAccountingResultDetailReading,
    parseAccountingRoutineReading,
    parseAccountingSummaryReading,
} from "@/modules/api/accounting/payload.guards"
import type { AccountingCommandPayloadState } from "@/modules/api/accounting/payload.guards"
import { nivoQueryPayload } from "@/modules/query"
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr"
import {
    accountingMonthPeriod,
    accountingRefusalKey,
    accountingUtcMonth,
    accountingSurfaceStanding,
    formatAccountingInstant,
    formatAccountingMinor,
    formatAccountingPeriod,
    type AccountingAnswerStanding,
    type AccountingSurfaceStanding,
    type AccountingTranslation,
} from "@/modules/accounting/accounting-workbench"
import { useWorkbenchCommand } from "./useWorkbenchCommand"
import { useAccountingWorkbenchCommands } from "./useAccountingWorkbenchCommands"
import { useAccountingWorkbenchReads } from "./useAccountingWorkbenchReads"

/*
 * The connected Accounting workbench (impl.accounting.nivo-fe.workbench-view).
 *
 * THE SCOPE IS RESOLVED, NEVER INVENTED. Every operation address carries a workspace, an instance and
 * an installation. The operate route discloses the workspace and the installation, and the instance
 * comes from the owner-safe workspace control-center read - the same read the module page already
 * makes for the workspace's controller hostname. Until both are known no operation is addressed at
 * all: each read and each command is held by its own `enabled` gate, so a surface can show a
 * standing without a request ever leaving with a half-filled address.
 *
 * NO PRESS CLAIMS AN EFFECT BY ITSELF. A command's answer is either a refusal, which is reported as
 * one, or an unattested outcome, which is only ever resolved by the registered read of the same
 * identity. The success a surface shows is read out of that readback payload, never out of the
 * press: if the readback does not disclose the settled state, the surface says so instead.
 *
 * ONE INTENT, ONE REQUEST ID. Each press mints its request identity once, keyed by the exact input it
 * replays, so an unchanged press re-sent after a transport failure stays one intent rather than two.
 */

const PAGE_SIZE = 20

/** The closed Accounting response the settlement flow receives from a command or readback. */
type CommandAnswer = AccountingOperationAnswer<AccountingResult>

/** What the installation line shows before an address exists: a held read, a refusal, or a true standing. */
const scopeStandingFor = (
    answer: AccountingAnswerStanding | undefined,
    error: unknown,
    hasInstance: boolean,
): AccountingSurfaceStanding => {
    if (answer === undefined && error === undefined) return "loading"
    if (error !== undefined) return "unavailable"
    const standing = accountingSurfaceStanding(answer, hasInstance)
    return standing === "empty" ? "unavailable" : standing
}

/** The receiver's own state spelling inside one settled payload. */
const payloadState = (answer: CommandAnswer): AccountingCommandPayloadState | undefined =>
    answer.ok && isCommandPayloadState(answer.data.payload) ? answer.data.payload : undefined
/** The three states whose catalogue key differs from the receiver's spelling. */
const EVIDENCE_STATE_KEYS = {
    needs_information: "needsInformation",
    likely_duplicate: "likelyDuplicate",
} satisfies Readonly<Partial<Record<string, string>>>
const ROUTINE_STATE_KEYS = {
    "needs-decision": "needsDecision",
    "pending-authority": "pendingAuthority",
    "outcome-unknown": "outcomeUnknown",
} satisfies Readonly<Partial<Record<string, string>>>
const CORRECTION_STATE_KEYS = {
    possible_start: "possibleStart",
    proven_not_applied: "provenNotApplied",
    outcome_unknown: "outcomeUnknown",
} satisfies Readonly<Partial<Record<string, string>>>
const mappedState = (mapping: Readonly<Partial<Record<string, string>>>, state: string): string | undefined =>
    mapping[state]

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

/** Own Accounting form state, the resolved installation scope, idempotent intents and readback-settled feedback. */
export const useAccountingWorkbench = (moduleId: string, locale: string, t: AccountingTranslation) => {
    const format = useFormatter()
    const params = useParams<{ readonly workspaceId?: string; readonly installationId?: string }>()
    const routeWorkspaceId = typeof params?.workspaceId === "string" ? params.workspaceId : ""
    const routeInstallationId = typeof params?.installationId === "string" ? params.installationId : moduleId
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(routeWorkspaceId, routeWorkspaceId.length > 0)
    const instanceId = nivoQueryPayload(controlCenter.data)?.instance?.id ?? ""
    const scope: AccountingInstallationScope | null =
        routeWorkspaceId.length > 0 && instanceId.length > 0
            ? { workspaceId: routeWorkspaceId, instanceId, installationId: routeInstallationId }
            : null
    const scopeStanding = scopeStandingFor(controlCenter.data, controlCenter.error, instanceId.length > 0)
    const addressable = scope ?? { workspaceId: "", instanceId: "", installationId: routeInstallationId }
    const ready = scope !== null

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
    const fieldSetter = <TField extends keyof AccountingWorkbenchFormState>(field: TField) =>
        (action: SetStateAction<AccountingWorkbenchFormState[TField]>) =>
            setForm((current) => {
                const value = typeof action === "function" ? action(current[field]) : action
                return { ...current, [field]: value }
            })
    const {
        periodMonth,
        currency,
        cursor,
        asOfDraft,
        asOf,
        evidenceId,
        sourceKind,
        sourceRef,
        sourceRevision,
        fingerprint,
        intakeRevision,
        intentId,
        itemId,
        policyRevision,
        evidenceIds,
        itemRevision,
        oldAttemptId,
        notStartedProofRef,
        newAttemptId,
        exceptionId,
        choiceCode,
        questionReason,
        questionEvidenceRefs,
        exceptionRevision,
        resultId,
        correctionId,
        predecessorResultId,
        correctedAmount,
        correctedCounterparty,
        correctionReason,
        correctionEvidenceRefs,
        correctionRevision,
        appendAttemptId,
    } = form
    const setPeriodMonth = fieldSetter("periodMonth")
    const setCurrency = fieldSetter("currency")
    const setCursor = fieldSetter("cursor")
    const setAsOfDraft = fieldSetter("asOfDraft")
    const setAsOf = fieldSetter("asOf")
    const setEvidenceId = fieldSetter("evidenceId")
    const setSourceKind = fieldSetter("sourceKind")
    const setSourceRef = fieldSetter("sourceRef")
    const setSourceRevision = fieldSetter("sourceRevision")
    const setFingerprint = fieldSetter("fingerprint")
    const setIntakeRevision = fieldSetter("intakeRevision")
    const setIntentId = fieldSetter("intentId")
    const setItemId = fieldSetter("itemId")
    const setPolicyRevision = fieldSetter("policyRevision")
    const setEvidenceIds = fieldSetter("evidenceIds")
    const setItemRevision = fieldSetter("itemRevision")
    const setOldAttemptId = fieldSetter("oldAttemptId")
    const setNotStartedProofRef = fieldSetter("notStartedProofRef")
    const setNewAttemptId = fieldSetter("newAttemptId")
    const setExceptionId = fieldSetter("exceptionId")
    const setChoiceCode = fieldSetter("choiceCode")
    const setQuestionReason = fieldSetter("questionReason")
    const setQuestionEvidenceRefs = fieldSetter("questionEvidenceRefs")
    const setExceptionRevision = fieldSetter("exceptionRevision")
    const setResultId = fieldSetter("resultId")
    const setCorrectionId = fieldSetter("correctionId")
    const setPredecessorResultId = fieldSetter("predecessorResultId")
    const setCorrectedAmount = fieldSetter("correctedAmount")
    const setCorrectedCounterparty = fieldSetter("correctedCounterparty")
    const setCorrectionReason = fieldSetter("correctionReason")
    const setCorrectionEvidenceRefs = fieldSetter("correctionEvidenceRefs")
    const setCorrectionRevision = fieldSetter("correctionRevision")
    const setAppendAttemptId = fieldSetter("appendAttemptId")
    const workbenchCommand = useWorkbenchCommand({
        refusal: (code, reason) => t(accountingRefusalKey(code), { reason }),
        unsettled: t("refusal.unsettled"),
        unreachable: t("refusal.unreachable"),
        acceptsFailedAnswer: (code) => code === "outcome_unknown",
    })

    /* An unusable month control keeps the last usable period rather than reading a period nobody chose. */
    const period = accountingMonthPeriod(periodMonth) ?? accountingMonthPeriod(accountingUtcMonth(new Date()))
    const chooseMonth = (value: string) => {
        if (accountingMonthPeriod(value) !== null) {
            setPeriodMonth(value)
            setCursor(null)
        }
    }
    const summaryInput: AccountingSummaryQueryInput = {
        periodStart: period?.periodStart ?? "",
        periodEndExclusive: period?.periodEndExclusive ?? "",
        currency,
        pageSize: PAGE_SIZE,
        cursor,
    }
    const detailInput: AccountingResultDetailInput =
        asOf === null ? { action: "current", resultId } : { action: "asOf", itemId, asOf }

    const { summary, evidence, routine, detail } = useAccountingWorkbenchReads({
        addressable,
        summaryInput,
        detailInput,
        ready,
        periodReady: period !== null,
        evidenceId,
        intentId,
        resultId,
        asOf,
        itemId,
    })
    const { admit, routineCommand, exceptionCommand, correction } = useAccountingWorkbenchCommands(addressable, ready)

    const summaryModel = summary.data?.ok === true ? parseAccountingSummaryReading(summary.data.data.payload) : null
    const evidenceModel = evidence.data?.ok === true ? parseAccountingEvidenceReading(evidence.data.data.payload) : null
    const routineModel = routine.data?.ok === true ? parseAccountingRoutineReading(routine.data.data.payload) : null
    const detailModel = detail.data?.ok === true ? parseAccountingResultDetailReading(detail.data.data.payload) : null
    const correctionModel = correction.data?.ok === true ? parseAccountingCorrectionReading(correction.data.data.payload) : null

    const evidenceStateText = (answer: CommandAnswer): string | null => {
        const state = payloadState(answer)?.state
        return state === undefined
            ? null
            : t("intake.settled", { state: t(`evidenceState.${mappedState(EVIDENCE_STATE_KEYS, state) ?? state}`) })
    }
    const routineStateText = (answer: CommandAnswer): string | null => {
        const state = payloadState(answer)?.state
        return state === undefined
            ? null
            : t("routine.settled", { state: t(`routineState.${mappedState(ROUTINE_STATE_KEYS, state) ?? state}`) })
    }
    const correctionStateText = (answer: CommandAnswer): string | null => {
        const payload = payloadState(answer)
        return payload?.state === undefined
            ? null
            : t("correction.settled", {
                  state: t(`correctionState.${mappedState(CORRECTION_STATE_KEYS, payload.state) ?? payload.state}`),
                  result: payload.resultId ?? t("none"),
              })
    }
    const success = (message: string | null) =>
        message === null ? null : { kind: "success" as const, message }

    const onAdmit = () => {
        if (
            !ready ||
            evidenceId.length === 0 ||
            sourceKind.length === 0 ||
            sourceRef.length === 0 ||
            sourceRevision.length === 0 ||
            fingerprint.length === 0
        )
            return
        const value = {
            evidenceId,
            sourceKind,
            sourceRef,
            sourceRevision,
            fingerprint,
            expectedRevision: Number(intakeRevision),
        }
        const key = `admit-${evidenceId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => admit.trigger({ requestId, input: value }),
            readback: () => evidence.mutate(),
            describe: (answer) => success(evidenceStateText(answer)),
        })
    }
    const onCommitRoutine = () => {
        if (!ready || intentId.length === 0 || itemId.length === 0 || policyRevision.length === 0) return
        const value = {
            action: "commit" as const,
            itemId,
            evidenceIds: evidenceIds
                .split(",")
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0),
            intentId,
            policyRevision,
            expectedItemRevision: Number(itemRevision),
        }
        const key = `routine-${intentId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => routineCommand.trigger({ requestId, input: value }),
            readback: () => routine.mutate(),
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    const onRetryRoutine = () => {
        if (
            !ready ||
            intentId.length === 0 ||
            oldAttemptId.length === 0 ||
            notStartedProofRef.length === 0 ||
            newAttemptId.length === 0
        )
            return
        const value = { action: "retry" as const, intentId, oldAttemptId, notStartedProofRef, newAttemptId }
        const key = `routine-retry-${intentId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => routineCommand.trigger({ requestId, input: value }),
            readback: () => routine.mutate(),
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    const questionEvidence = questionEvidenceRefs
        .split(",")
        .map((entry: string): string => entry.trim())
        .filter((entry: string): boolean => entry.length > 0)
    const exceptionAction = (action: "defer" | "reopen" | "escalate" | "dismiss") => {
        if (!ready || exceptionId.length === 0) return
        const value: AccountingExceptionInput = {
            action,
            exceptionId,
            reason: questionReason,
            expectedRevision: Number(exceptionRevision),
        }
        const key = `exception-${action}-${exceptionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => exceptionCommand.trigger({ requestId, input: value }),
            readback: intentId.length > 0 ? () => routine.mutate() : null,
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    const onAnswerQuestion = () => {
        if (!ready || exceptionId.length === 0 || (choiceCode.length === 0 && questionReason.length === 0)) return
        const value: AccountingExceptionInput = {
            action: "answer",
            exceptionId,
            answer: {
                choiceCode: choiceCode.length === 0 ? null : choiceCode,
                suppliedFacts: [],
                reason: questionReason.length === 0 ? null : questionReason,
            },
            answerEvidenceRefs: questionEvidence,
            expectedRevision: Number(exceptionRevision),
        }
        const key = `exception-answer-${exceptionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => exceptionCommand.trigger({ requestId, input: value }),
            readback: intentId.length > 0 ? () => routine.mutate() : null,
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    const onLoadDetail = () => {
        if (ready) void detail.mutate()
    }
    const correctedFacts = (): ReadonlyArray<AccountingCorrectedFact> => {
        const facts: Array<AccountingCorrectedFact> = []
        if (correctedAmount.trim().length > 0) {
            const minor = Number(correctedAmount.trim())
            facts.push({
                field: "amountMinor",
                oldValue:
                    detailModel?.resultId === predecessorResultId &&
                    detailModel.facts.amountMinor !== null &&
                    detailModel.facts.currency !== null
                        ? {
                              kind: "money",
                              amountMinor: detailModel.facts.amountMinor,
                              currency: detailModel.facts.currency,
                          }
                        : null,
                newValue: Number.isInteger(minor)
                    ? { kind: "money", amountMinor: minor, currency: detailModel?.facts.currency ?? currency ?? "" }
                    : null,
                evidenceRefs: correctionEvidenceRefs
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter((entry) => entry.length > 0),
            })
        }
        if (correctedCounterparty.trim().length > 0) {
            const priorCounterparty = detailModel?.facts.counterpartyRef ?? null
            facts.push({
                field: "counterpartyRef",
                oldValue: priorCounterparty === null ? null : { kind: "text", value: priorCounterparty },
                newValue: { kind: "text", value: correctedCounterparty.trim() },
                evidenceRefs: correctionEvidenceRefs
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter((entry) => entry.length > 0),
            })
        }
        return facts
    }
    const onProposeCorrection = () => {
        const facts = correctedFacts()
        if (
            !ready ||
            correctionId.length === 0 ||
            predecessorResultId.length === 0 ||
            facts.length === 0 ||
            correctionReason.length === 0
        )
            return
        const value = {
            action: "propose" as const,
            correctionId,
            predecessorResultId,
            correctedFacts: facts,
            reason: correctionReason,
            evidenceRefs: correctionEvidenceRefs
                .split(",")
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0),
            expectedResultRevision: Number(correctionRevision),
        }
        const key = `correct-${correctionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => correction.trigger({ requestId, input: value }),
            readback: () => detail.mutate(),
            describe: (answer) => success(correctionStateText(answer)),
        })
    }
    const onAppendCorrection = () => {
        if (!ready || correctionId.length === 0 || appendAttemptId.length === 0) return
        const value = {
            action: "append" as const,
            correctionId,
            attemptId: appendAttemptId,
            expectedRevision: Number(correctionRevision),
        }
        const key = `correct-append-${correctionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => correction.trigger({ requestId, input: value }),
            readback: () => detail.mutate(),
            describe: (answer) => success(correctionStateText(answer)),
        })
    }

    const attention =
        summaryModel === null ? [] : [...new Set(summaryModel.items.flatMap((item) => item.attentionCodes))]
    return {
        t,
        locale,
        format: {
            amount: (amountMinor: number, amountCurrency: string) =>
                formatAccountingMinor(amountMinor, amountCurrency, format),
            instant: (value: string) => formatAccountingInstant(value, format),
            period: (value: string) => formatAccountingPeriod(value, format),
        },
        scopeStanding,
        scopeReady: ready,
        periodMonth,
        setPeriodMonth: chooseMonth,
        periodLabel: period?.periodStart ?? periodMonth,
        currency,
        setCurrency,
        asOfDraft,
        setAsOfDraft,
        asOf,
        setAsOf,
        notice: workbenchCommand.notice,
        overview: {
            standing: ready ? accountingSurfaceStanding(summary.data, summaryModel !== null) : scopeStanding,
            model: summaryModel,
            attention,
            nextCursor: summaryModel?.nextCursor ?? null,
            isFetching: summary.isLoading || summary.isValidating,
            retry: () => void summary.mutate(),
            loadMore: () => setCursor(summaryModel?.nextCursor ?? null),
        },
        intake: {
            standing: ready ? accountingSurfaceStanding(evidence.data, evidenceModel !== null) : scopeStanding,
            evidenceId,
            setEvidenceId,
            sourceKind,
            setSourceKind,
            sourceRef,
            setSourceRef,
            sourceRevision,
            setSourceRevision,
            fingerprint,
            setFingerprint,
            intakeRevision,
            setIntakeRevision,
            model: evidenceModel,
            admit,
            isAdmitting: admit.isMutating || workbenchCommand.isPending(`admit-${evidenceId}`),
            onAdmit,
            reload: () => void evidence.mutate(),
        },
        routine: {
            standing: ready ? accountingSurfaceStanding(routine.data, routineModel !== null) : scopeStanding,
            intentId,
            setIntentId,
            itemId,
            setItemId,
            policyRevision,
            setPolicyRevision,
            evidenceIds,
            setEvidenceIds,
            itemRevision,
            setItemRevision,
            oldAttemptId,
            setOldAttemptId,
            notStartedProofRef,
            setNotStartedProofRef,
            newAttemptId,
            setNewAttemptId,
            model: routineModel,
            isCommitting:
                routineCommand.isMutating ||
                workbenchCommand.isPending(`routine-${intentId}`) ||
                workbenchCommand.isPending(`routine-retry-${intentId}`),
            onCommitRoutine,
            onRetryRoutine,
            reload: () => void routine.mutate(),
        },
        question: {
            standing: ready
                ? accountingSurfaceStanding(
                      routine.data,
                      routineModel !== null && routineModel.state === "needs-decision",
                  )
                : scopeStanding,
            exceptionId,
            setExceptionId,
            choiceCode,
            setChoiceCode,
            reason: questionReason,
            setReason: setQuestionReason,
            evidenceRefs: questionEvidenceRefs,
            setEvidenceRefs: setQuestionEvidenceRefs,
            exceptionRevision,
            setExceptionRevision,
            answerState:
                exceptionCommand.data?.ok === true
                    ? parseAccountingExceptionReading(exceptionCommand.data.data.payload)
                    : null,
            isAnswering:
                exceptionCommand.isMutating ||
                workbenchCommand.isPending(`exception-answer-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-defer-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-reopen-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-escalate-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-dismiss-${exceptionId}`),
            onAnswer: onAnswerQuestion,
            onDefer: () => exceptionAction("defer"),
            onReopen: () => exceptionAction("reopen"),
            onEscalate: () => exceptionAction("escalate"),
            onDismiss: () => exceptionAction("dismiss"),
            routineState: routineModel?.state ?? null,
            routineReason: routineModel?.reasonCode ?? null,
            attention,
            itemEvidenceRefs: summaryModel?.items.flatMap((item) => item.sourceEvidenceRefs) ?? [],
            reload: () => void routine.mutate(),
        },
        detail: {
            standing: ready ? accountingSurfaceStanding(detail.data, detailModel !== null) : scopeStanding,
            resultId,
            setResultId,
            itemId,
            setItemId: (value: string) => {
                setItemId(value)
                setAsOf(null)
            },
            asOfInstant: asOf ?? "",
            setAsOfInstant: (value: string) => setAsOf(value.length === 0 ? null : value),
            model: detailModel,
            isFetching: detail.isLoading,
            onLoad: onLoadDetail,
            retry: () => void detail.mutate(),
        },
        correction: {
            standing: ready ? accountingSurfaceStanding(correction.data, correctionModel !== null) : scopeStanding,
            correctionId,
            setCorrectionId,
            predecessorResultId,
            setPredecessorResultId,
            correctedAmount,
            setCorrectedAmount,
            correctedCounterparty,
            setCorrectedCounterparty,
            reason: correctionReason,
            setReason: setCorrectionReason,
            evidenceRefs: correctionEvidenceRefs,
            setEvidenceRefs: setCorrectionEvidenceRefs,
            correctionRevision,
            setCorrectionRevision,
            appendAttemptId,
            setAppendAttemptId,
            model: correctionModel,
            predecessor: detailModel?.resultId === predecessorResultId ? detailModel : null,
            isCorrecting:
                correction.isMutating ||
                workbenchCommand.isPending(`correct-${correctionId}`) ||
                workbenchCommand.isPending(`correct-append-${correctionId}`),
            onPropose: onProposeCorrection,
            onAppend: onAppendCorrection,
            reload: () => void detail.mutate(),
        },
    }
}
