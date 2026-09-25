"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import type {
  AccountingCorrectInput,
  AccountingCorrectedFact,
  AccountingExceptionInput,
  AccountingInstallationScope,
  AccountingResultDetailInput,
  AccountingSummaryQueryInput
} from "@/modules/api/accounting";
import { nivoQueryData } from "@/modules/query";
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr/queries/console";
import { useQueryAccountingEvidenceSwr } from "@/hooks/swr/queries/useQueryAccountingEvidenceSwr";
import { useQueryAccountingResultDetailSwr } from "@/hooks/swr/queries/useQueryAccountingResultDetailSwr";
import { useQueryAccountingRoutineResultSwr } from "@/hooks/swr/queries/useQueryAccountingRoutineResultSwr";
import { useQueryAccountingSummarySwr } from "@/hooks/swr/queries/useQueryAccountingSummarySwr";
import { useMutateAccountingAdmitEvidenceSwr } from "@/hooks/swr/mutations/useMutateAccountingAdmitEvidenceSwr";
import { useMutateAccountingCorrectSwr } from "@/hooks/swr/mutations/useMutateAccountingCorrectSwr";
import { useMutateAccountingExceptionSwr } from "@/hooks/swr/mutations/useMutateAccountingExceptionSwr";
import { useMutateAccountingRoutineSwr } from "@/hooks/swr/mutations/useMutateAccountingRoutineSwr";
import { accountingMonthPeriod, accountingRefusalKey, accountingUtcMonth, accountingSurfaceStanding, type AccountingAnswerStanding, type AccountingNotice, type AccountingSurfaceStanding, type AccountingTranslation } from "@/modules/accounting/accounting-workbench";

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

const requestId = () => globalThis.crypto?.randomUUID?.() ?? `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const PAGE_SIZE = 20;

/** One command answer, as much of it as settlement depends on. */
type CommandAnswer = { readonly ok: boolean; readonly code?: string; readonly reason?: string; readonly data?: unknown };

/** What the installation line shows before an address exists: a held read, a refusal, or a true standing. */
const scopeStandingFor = (answer: AccountingAnswerStanding | undefined, error: unknown, hasInstance: boolean): AccountingSurfaceStanding => {
  if (answer === undefined && error === undefined) return "loading";
  if (error !== undefined) return "unavailable";
  const standing = accountingSurfaceStanding(answer, hasInstance);
  return standing === "empty" ? "unavailable" : standing;
};

/** The receiver's own state spelling inside one settled payload. */
type CommandPayloadState = { readonly state?: string; readonly resultId?: string | null };
const payloadState = (answer: CommandAnswer): CommandPayloadState | undefined => (answer.data as { readonly payload?: CommandPayloadState } | undefined)?.payload;
/** The three states whose catalogue key differs from the receiver's spelling. */
const EVIDENCE_STATE_KEYS: Readonly<Record<string, string>> = { needs_information: "needsInformation", likely_duplicate: "likelyDuplicate" };
const ROUTINE_STATE_KEYS: Readonly<Record<string, string>> = { "needs-decision": "needsDecision", "pending-authority": "pendingAuthority", "outcome-unknown": "outcomeUnknown" };
const CORRECTION_STATE_KEYS: Readonly<Record<string, string>> = { possible_start: "possibleStart", proven_not_applied: "provenNotApplied", outcome_unknown: "outcomeUnknown" };

/** One exact input's stable request identity, kept until that input is delivered. */
type Intent = { readonly fingerprint: string; readonly token: string };

/** Own Accounting form state, the resolved installation scope, idempotent intents and readback-settled feedback. */
export const useAccountingWorkbench = (moduleId: string, locale: string, t: AccountingTranslation) => {
  const params = useParams<{ readonly workspaceId?: string; readonly installationId?: string }>() as { readonly workspaceId?: string; readonly installationId?: string } | null;
  const routeWorkspaceId = typeof params?.workspaceId === "string" ? params.workspaceId : "";
  const routeInstallationId = typeof params?.installationId === "string" ? params.installationId : moduleId;
  const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(routeWorkspaceId, routeWorkspaceId.length > 0);
  const instanceId = nivoQueryData(controlCenter.data)?.instance?.id ?? "";
  const scope: AccountingInstallationScope | null = routeWorkspaceId.length > 0 && instanceId.length > 0
    ? { workspaceId: routeWorkspaceId, instanceId, installationId: routeInstallationId }
    : null;
  const scopeStanding = scopeStandingFor(controlCenter.data, controlCenter.error, instanceId.length > 0);
  const addressable = scope ?? { workspaceId: "", instanceId: "", installationId: routeInstallationId };
  const ready = scope !== null;

  const [notice, setNotice] = useState<AccountingNotice | null>(null);
  const [periodMonth, setPeriodMonth] = useState(() => accountingUtcMonth(new Date()));
  const [currency, setCurrency] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [asOfDraft, setAsOfDraft] = useState("");
  const [asOf, setAsOf] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState("");
  const [sourceKind, setSourceKind] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [sourceRevision, setSourceRevision] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [intakeRevision, setIntakeRevision] = useState("0");
  const [intentId, setIntentId] = useState("");
  const [itemId, setItemId] = useState("");
  const [policyRevision, setPolicyRevision] = useState("");
  const [evidenceIds, setEvidenceIds] = useState("");
  const [itemRevision, setItemRevision] = useState("0");
  const [oldAttemptId, setOldAttemptId] = useState("");
  const [notStartedProofRef, setNotStartedProofRef] = useState("");
  const [newAttemptId, setNewAttemptId] = useState("");
  const [exceptionId, setExceptionId] = useState("");
  const [choiceCode, setChoiceCode] = useState("");
  const [questionReason, setQuestionReason] = useState("");
  const [questionEvidenceRefs, setQuestionEvidenceRefs] = useState("");
  const [exceptionRevision, setExceptionRevision] = useState("0");
  const [resultId, setResultId] = useState("");
  const [correctionId, setCorrectionId] = useState("");
  const [predecessorResultId, setPredecessorResultId] = useState("");
  const [correctedAmount, setCorrectedAmount] = useState("");
  const [correctedCounterparty, setCorrectedCounterparty] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionEvidenceRefs, setCorrectionEvidenceRefs] = useState("");
  const [correctionRevision, setCorrectionRevision] = useState("0");
  const [appendAttemptId, setAppendAttemptId] = useState("");
  const intents = useRef<Record<string, Intent>>({});

  /* An unusable month control keeps the last usable period rather than reading a period nobody chose. */
  const period = accountingMonthPeriod(periodMonth) ?? accountingMonthPeriod(accountingUtcMonth(new Date()));
  const chooseMonth = (value: string) => { if (accountingMonthPeriod(value) !== null) { setPeriodMonth(value); setCursor(null); } };
  const summaryInput: AccountingSummaryQueryInput = { periodStart: period!.periodStart, periodEndExclusive: period!.periodEndExclusive, currency, pageSize: PAGE_SIZE, cursor };
  const detailInput: AccountingResultDetailInput = asOf === null ? { action: "current", resultId } : { action: "asOf", itemId, asOf };

  const summary = useQueryAccountingSummarySwr(addressable, summaryInput, ready);
  const evidence = useQueryAccountingEvidenceSwr(addressable, { evidenceId }, ready && evidenceId.length > 0);
  const routine = useQueryAccountingRoutineResultSwr(addressable, { intentId }, ready && intentId.length > 0);
  const detail = useQueryAccountingResultDetailSwr(addressable, detailInput, ready && (asOf === null ? resultId.length > 0 : itemId.length > 0));
  const admit = useMutateAccountingAdmitEvidenceSwr(addressable, ready);
  const routineCommand = useMutateAccountingRoutineSwr(addressable, ready);
  const exceptionCommand = useMutateAccountingExceptionSwr(addressable, ready);
  const correction = useMutateAccountingCorrectSwr(addressable, ready);

  const summaryModel = summary.data?.ok === true ? summary.data.data.payload : null;
  const evidenceModel = evidence.data?.ok === true ? evidence.data.data.payload : null;
  const routineModel = routine.data?.ok === true ? routine.data.data.payload : null;
  const detailModel = detail.data?.ok === true ? detail.data.data.payload : null;
  const correctionModel = correction.data?.ok === true ? correction.data.data.payload : null;

  const intentFor = (key: string, value: unknown): string => {
    const valueFingerprint = JSON.stringify(value);
    const prior = intents.current[key];
    if (prior?.fingerprint === valueFingerprint) return prior.token;
    const token = requestId();
    intents.current[key] = { fingerprint: valueFingerprint, token };
    return token;
  };
  const settle = async (key: string, command: () => Promise<CommandAnswer>, readback: (() => Promise<CommandAnswer>) | null, describe: (answer: CommandAnswer) => string | null): Promise<void> => {
    setNotice(null);
    try {
      const answer = await command();
      if (!answer.ok && answer.code !== "outcome_unknown") {
        setNotice({ kind: "refused", message: t(accountingRefusalKey(answer.code ?? ""), { reason: answer.reason ?? "" }) });
        return;
      }
      const settled = readback === null ? answer : await readback();
      const confirmed = settled.ok ? describe(settled) : null;
      if (confirmed === null) { setNotice({ kind: "refused", message: t("refusal.unsettled") }); return; }
      delete intents.current[key];
      setNotice({ kind: "success", message: confirmed });
    } catch {
      setNotice({ kind: "refused", message: t("refusal.unreachable") });
    }
  };
  const evidenceStateText = (answer: CommandAnswer): string | null => {
    const state = payloadState(answer)?.state;
    return state === undefined ? null : t("intake.settled", { state: t(`evidenceState.${EVIDENCE_STATE_KEYS[state] ?? state}`) });
  };
  const routineStateText = (answer: CommandAnswer): string | null => {
    const state = payloadState(answer)?.state;
    return state === undefined ? null : t("routine.settled", { state: t(`routineState.${ROUTINE_STATE_KEYS[state] ?? state}`) });
  };
  const correctionStateText = (answer: CommandAnswer): string | null => {
    const payload = payloadState(answer);
    return payload?.state === undefined ? null : t("correction.settled", { state: t(`correctionState.${CORRECTION_STATE_KEYS[payload.state] ?? payload.state}`), result: payload.resultId ?? t("none") });
  };

  const onAdmit = () => {
    if (!ready || evidenceId.length === 0 || sourceKind.length === 0 || sourceRef.length === 0 || sourceRevision.length === 0 || fingerprint.length === 0) return;
    const value = { evidenceId, sourceKind, sourceRef, sourceRevision, fingerprint, expectedRevision: Number(intakeRevision) };
    void settle(`admit-${evidenceId}`, () => admit.trigger({ requestId: intentFor(`admit-${evidenceId}`, value), input: value }) as Promise<CommandAnswer>, () => evidence.mutate() as Promise<CommandAnswer>, evidenceStateText);
  };
  const onCommitRoutine = () => {
    if (!ready || intentId.length === 0 || itemId.length === 0 || policyRevision.length === 0) return;
    const value = { action: "commit" as const, itemId, evidenceIds: evidenceIds.split(",").map(entry => entry.trim()).filter(entry => entry.length > 0), intentId, policyRevision, expectedItemRevision: Number(itemRevision) };
    void settle(`routine-${intentId}`, () => routineCommand.trigger({ requestId: intentFor(`routine-${intentId}`, value), input: value }) as Promise<CommandAnswer>, () => routine.mutate() as Promise<CommandAnswer>, routineStateText);
  };
  const onRetryRoutine = () => {
    if (!ready || intentId.length === 0 || oldAttemptId.length === 0 || notStartedProofRef.length === 0 || newAttemptId.length === 0) return;
    const value = { action: "retry" as const, intentId, oldAttemptId, notStartedProofRef, newAttemptId };
    void settle(`routine-retry-${intentId}`, () => routineCommand.trigger({ requestId: intentFor(`routine-retry-${intentId}`, value), input: value }) as Promise<CommandAnswer>, () => routine.mutate() as Promise<CommandAnswer>, routineStateText);
  };
  const questionEvidence = questionEvidenceRefs.split(",").map((entry: string): string => entry.trim()).filter((entry: string): boolean => entry.length > 0);
  const exceptionAction = (action: "defer" | "reopen" | "escalate" | "dismiss") => {
    if (!ready || exceptionId.length === 0) return;
    const value = { action, exceptionId, reason: questionReason, expectedRevision: Number(exceptionRevision) } as AccountingExceptionInput;
    void settle(`exception-${action}-${exceptionId}`, () => exceptionCommand.trigger({ requestId: intentFor(`exception-${action}-${exceptionId}`, value), input: value }) as Promise<CommandAnswer>, intentId.length > 0 ? () => routine.mutate() as Promise<CommandAnswer> : null, routineStateText);
  };
  const onAnswerQuestion = () => {
    if (!ready || exceptionId.length === 0 || (choiceCode.length === 0 && questionReason.length === 0)) return;
    const value: AccountingExceptionInput = { action: "answer", exceptionId, answer: { choiceCode: choiceCode.length === 0 ? null : choiceCode, suppliedFacts: [], reason: questionReason.length === 0 ? null : questionReason }, answerEvidenceRefs: questionEvidence, expectedRevision: Number(exceptionRevision) };
    void settle(`exception-answer-${exceptionId}`, () => exceptionCommand.trigger({ requestId: intentFor(`exception-answer-${exceptionId}`, value), input: value }) as Promise<CommandAnswer>, intentId.length > 0 ? () => routine.mutate() as Promise<CommandAnswer> : null, routineStateText);
  };
  const onLoadDetail = () => { if (ready) void detail.mutate(); };
  const correctedFacts = (): ReadonlyArray<AccountingCorrectedFact> => {
    const facts: Array<AccountingCorrectedFact> = [];
    if (correctedAmount.trim().length > 0) {
      const minor = Number(correctedAmount.trim());
      facts.push({ field: "amountMinor", oldValue: detailModel?.resultId === predecessorResultId && detailModel.facts.amountMinor !== null && detailModel.facts.currency !== null ? { kind: "money", amountMinor: detailModel.facts.amountMinor, currency: detailModel.facts.currency } : null, newValue: Number.isInteger(minor) ? { kind: "money", amountMinor: minor, currency: detailModel?.facts.currency ?? currency ?? "" } : null, evidenceRefs: correctionEvidenceRefs.split(",").map(entry => entry.trim()).filter(entry => entry.length > 0) });
    }
    if (correctedCounterparty.trim().length > 0) {
      const priorCounterparty = detailModel?.facts.counterpartyRef ?? null;
      facts.push({ field: "counterpartyRef", oldValue: priorCounterparty === null ? null : { kind: "text", value: priorCounterparty }, newValue: { kind: "text", value: correctedCounterparty.trim() }, evidenceRefs: correctionEvidenceRefs.split(",").map(entry => entry.trim()).filter(entry => entry.length > 0) });
    }
    return facts;
  };
  const onProposeCorrection = () => {
    const facts = correctedFacts();
    if (!ready || correctionId.length === 0 || predecessorResultId.length === 0 || facts.length === 0 || correctionReason.length === 0) return;
    const value = { action: "propose" as const, correctionId, predecessorResultId, correctedFacts: facts, reason: correctionReason, evidenceRefs: correctionEvidenceRefs.split(",").map(entry => entry.trim()).filter(entry => entry.length > 0), expectedResultRevision: Number(correctionRevision) };
    void settle(`correct-${correctionId}`, () => correction.trigger({ requestId: intentFor(`correct-${correctionId}`, value), input: value }) as Promise<CommandAnswer>, () => detail.mutate() as Promise<CommandAnswer>, correctionStateText);
  };
  const onAppendCorrection = () => {
    if (!ready || correctionId.length === 0 || appendAttemptId.length === 0) return;
    const value = { action: "append" as const, correctionId, attemptId: appendAttemptId, expectedRevision: Number(correctionRevision) };
    void settle(`correct-append-${correctionId}`, () => correction.trigger({ requestId: intentFor(`correct-append-${correctionId}`, value), input: value as AccountingCorrectInput }) as Promise<CommandAnswer>, () => detail.mutate() as Promise<CommandAnswer>, correctionStateText);
  };

  const attention = summaryModel === null ? [] : [...new Set(summaryModel.items.flatMap(item => item.attentionCodes))];
  return {
    t, locale,
    scopeStanding, scopeReady: ready,
    periodMonth, setPeriodMonth: chooseMonth, periodLabel: period!.periodStart, currency, setCurrency, asOfDraft, setAsOfDraft, asOf, setAsOf,
    notice,
    overview: {
      standing: ready ? accountingSurfaceStanding(summary.data, summaryModel !== null) : scopeStanding,
      model: summaryModel, attention, nextCursor: summaryModel?.nextCursor ?? null,
      isFetching: summary.isLoading || summary.isValidating,
      retry: () => void summary.mutate(), loadMore: () => setCursor(summaryModel?.nextCursor ?? null)
    },
    intake: {
      standing: ready ? accountingSurfaceStanding(evidence.data, evidenceModel !== null) : scopeStanding,
      evidenceId, setEvidenceId, sourceKind, setSourceKind, sourceRef, setSourceRef, sourceRevision, setSourceRevision, fingerprint, setFingerprint, intakeRevision, setIntakeRevision,
      model: evidenceModel, admit, isAdmitting: admit.isMutating, onAdmit, reload: () => void evidence.mutate()
    },
    routine: {
      standing: ready ? accountingSurfaceStanding(routine.data, routineModel !== null) : scopeStanding,
      intentId, setIntentId, itemId, setItemId, policyRevision, setPolicyRevision, evidenceIds, setEvidenceIds, itemRevision, setItemRevision,
      oldAttemptId, setOldAttemptId, notStartedProofRef, setNotStartedProofRef, newAttemptId, setNewAttemptId,
      model: routineModel, isCommitting: routineCommand.isMutating, onCommitRoutine, onRetryRoutine, reload: () => void routine.mutate()
    },
    question: {
      standing: ready ? accountingSurfaceStanding(exceptionCommand.data, exceptionId.length > 0) : scopeStanding,
      exceptionId, setExceptionId, choiceCode, setChoiceCode, reason: questionReason, setReason: setQuestionReason, evidenceRefs: questionEvidenceRefs, setEvidenceRefs: setQuestionEvidenceRefs, exceptionRevision, setExceptionRevision,
      answerState: exceptionCommand.data?.ok === true ? exceptionCommand.data.data.payload : null,
      isAnswering: exceptionCommand.isMutating, onAnswer: onAnswerQuestion, onDefer: () => exceptionAction("defer"), onReopen: () => exceptionAction("reopen"), onEscalate: () => exceptionAction("escalate"), onDismiss: () => exceptionAction("dismiss"),
      routineState: routineModel?.state ?? null, routineReason: routineModel?.reasonCode ?? null, attention, itemEvidenceRefs: summaryModel?.items.flatMap(item => item.sourceEvidenceRefs) ?? [],
      reload: () => void routine.mutate()
    },
    detail: {
      standing: ready ? accountingSurfaceStanding(detail.data, detailModel !== null) : scopeStanding,
      resultId, setResultId, itemId, setItemId: (value: string) => { setItemId(value); setAsOf(null); }, asOfInstant: asOf ?? "", setAsOfInstant: (value: string) => setAsOf(value.length === 0 ? null : value),
      model: detailModel, isFetching: detail.isLoading, onLoad: onLoadDetail, retry: () => void detail.mutate()
    },
    correction: {
      standing: ready ? accountingSurfaceStanding(correction.data, correctionModel !== null) : scopeStanding,
      correctionId, setCorrectionId, predecessorResultId, setPredecessorResultId, correctedAmount, setCorrectedAmount, correctedCounterparty, setCorrectedCounterparty, reason: correctionReason, setReason: setCorrectionReason, evidenceRefs: correctionEvidenceRefs, setEvidenceRefs: setCorrectionEvidenceRefs, correctionRevision, setCorrectionRevision, appendAttemptId, setAppendAttemptId,
      model: correctionModel, predecessor: detailModel?.resultId === predecessorResultId ? detailModel : null,
      isCorrecting: correction.isMutating, onPropose: onProposeCorrection, onAppend: onAppendCorrection, reload: () => void detail.mutate()
    }
  };
};