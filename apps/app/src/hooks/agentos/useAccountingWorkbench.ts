"use client";

import { useRef, useState, type FormEvent } from "react";
import type { AccountingClassification, AccountingCorrection, AccountingOperation, AccountingViewerRole } from "@/modules/api/accounting";
import type { Result } from "@/modules/api/graphql";
import { useMutateApproveAccountingCorrectionSwr, useMutateApproveAccountingDocumentSwr, useMutateCloseAccountingPeriodSwr, useMutateIngestAccountingDocumentSwr, useMutateInitializeAccountingSwr, useMutatePostAccountingDocumentSwr, useMutateReconcileAccountingSwr, useMutateSubmitAccountingCorrectionSwr, useMutateSubmitAccountingDocumentSwr } from "@/hooks/swr/mutations/accounting";
import { useQueryAccountingWorkbenchSwr, useQueryAppliedAccountingContextSwr } from "@/hooks/swr/queries/accounting";
import { useQueryMyAgentosModuleRuntimeSwr } from "@/hooks/swr/queries/console";
import { ACCOUNTING_CLASSIFICATIONS, accountingCorrectionAccess, accountingIntakePolicy, bytesToBase64, canonicalMonthKey, currencyAmountToMinor, eligibleCorrectionSourceEntries, type AccountingNotice, type AccountingTranslation } from "@/modules/accounting/accounting-workbench";

type CommandAnswer = Promise<Result<AccountingOperation>>;
const requestId = () => globalThis.crypto?.randomUUID?.() ?? `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Own Accounting form state, viewer-scoped reads, idempotent command tokens and server readback. */
export const useAccountingWorkbench = (moduleId: string, locale: string, t: AccountingTranslation) => {
  const [asOfDraft, setAsOfDraft] = useState("");
  const [ledgerVersion, setLedgerVersion] = useState<string>();
  const [notice, setNotice] = useState<AccountingNotice | null>(null);
  const [approverId, setApproverId] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [contentBase64, setContentBase64] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [classificationDraft, setClassificationDraft] = useState<AccountingClassification>("expense");
  const [documentAmount, setDocumentAmount] = useState("");
  const [documentMonth, setDocumentMonth] = useState("");
  const [sourceAmount, setSourceAmount] = useState("");
  const [closeMonth, setCloseMonth] = useState("");
  const [sourceEntryId, setSourceEntryId] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState("");
  const [deltaAmount, setDeltaAmount] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const tokens = useRef<Record<string, { readonly fingerprint: string; readonly token: string }>>({});
  const context = useQueryAppliedAccountingContextSwr(moduleId);
  const intakePolicy = context.data?.ok === true ? accountingIntakePolicy(context.data.data.snapshot) : null;
  const currency = intakePolicy?.currency ?? "VND";
  const classifications = intakePolicy?.classifications ?? [];
  const classification = classifications.includes(classificationDraft) ? classificationDraft : classifications[0] ?? "";
  const intakeReady = intakePolicy !== null;
  const intakeLoading = context.data === undefined && context.error === undefined;
  const setClassification = (value: string) => { if (ACCOUNTING_CLASSIFICATIONS.includes(value as AccountingClassification)) setClassificationDraft(value as AccountingClassification); };
  const workbench = useQueryAccountingWorkbenchSwr(moduleId, intakePolicy?.currency, ledgerVersion);
  const runtime = useQueryMyAgentosModuleRuntimeSwr(moduleId, moduleId, false);
  const initialize = useMutateInitializeAccountingSwr(moduleId, currency);
  const ingest = useMutateIngestAccountingDocumentSwr(moduleId, currency);
  const submitDocument = useMutateSubmitAccountingDocumentSwr(moduleId, currency);
  const approveDocument = useMutateApproveAccountingDocumentSwr(moduleId, currency);
  const postDocument = useMutatePostAccountingDocumentSwr(moduleId, currency);
  const reconcile = useMutateReconcileAccountingSwr(moduleId, currency);
  const close = useMutateCloseAccountingPeriodSwr(moduleId, currency);
  const submitCorrection = useMutateSubmitAccountingCorrectionSwr(moduleId, currency);
  const approveCorrection = useMutateApproveAccountingCorrectionSwr(moduleId, currency);
  const commandToken = (key: string, value: unknown) => {
    const fingerprint = JSON.stringify(value);
    const prior = tokens.current[key];
    if (prior?.fingerprint === fingerprint) return prior.token;
    const token = requestId();
    tokens.current[key] = { fingerprint, token };
    return token;
  };
  const run = async (key: string, value: unknown, command: (requestToken: string) => CommandAnswer) => {
    setNotice(null);
    try {
      const answer = await command(commandToken(key, value));
      if (!answer.ok) { setNotice({ kind: "refused", message: t("operationRefused", { reason: answer.reason }) }); return; }
      delete tokens.current[key];
      const [refreshedWorkbench, refreshedContext] = await Promise.all([workbench.mutate(), context.mutate()]);
      if (refreshedWorkbench?.ok !== true || refreshedContext?.ok !== true) {
        setNotice({ kind: "refused", message: t("transportError") });
        return;
      }
      setNotice({ kind: "success", message: t("operationAccepted", { operation: answer.data.operation }) });
    } catch { setNotice({ kind: "refused", message: t("transportError") }); }
  };
  const answer = workbench.data;
  const model = answer?.ok === true ? answer.data : undefined;
  const role: AccountingViewerRole | undefined = model?.capabilities.viewerRole;
  const isAsOf = ledgerVersion !== undefined;
  const correctionSubmitAllowed = accountingCorrectionAccess({ explicitLedgerVersion: isAsOf, role, canSubmitCorrection: model?.capabilities.canSubmitCorrection }).submit;
  const pendingCorrections = model?.corrections.filter(item => item.status === "pending") ?? [];
  const eligibleSourceEntries = model === undefined ? [] : eligibleCorrectionSourceEntries(model.ledger, model.corrections);
  const sourceEntryEligible = eligibleSourceEntries.some(entry => entry.id === sourceEntryId);
  const participantUserIds = runtime.data?.ok === true ? [...new Set(runtime.data.data.participants.map(participant => participant.userId))] : [];
  const documentAmountMinor = currencyAmountToMinor(documentAmount, currency, locale);
  const sourceAmountMinor = currencyAmountToMinor(sourceAmount, currency, locale);
  const deltaAmountMinor = currencyAmountToMinor(deltaAmount, currency, locale);
  const onFileSelected = async (file: File) => {
    try {
      setFileName(file.name);
      setMimeType(file.type || "application/octet-stream");
      setFileSize(file.size);
      setContentBase64(bytesToBase64(new Uint8Array(await file.arrayBuffer())));
      setNotice(null);
    } catch {
      setFileName(""); setMimeType(""); setFileSize(0); setContentBase64("");
      setNotice({ kind: "refused", message: t("fileReadFailed") });
    }
  };
  const onInitialize = (event: FormEvent) => { event.preventDefault(); if (approverId.length > 0) void run("initialize", { approverId }, requestToken => initialize.trigger({ approverUserId: approverId, requestToken })); };
  const onIngest = (event: FormEvent) => {
    event.preventDefault();
    const periodKey = canonicalMonthKey(documentMonth);
    if (!intakeReady || classification.length === 0 || documentAmountMinor === null || periodKey === null || contentBase64.length === 0) return;
    const value = { amountMinor: documentAmountMinor, classification, contentBase64, currency, fileName, mimeType, periodKey };
    void run("ingest", value, requestToken => ingest.trigger({ ...value, classification, requestToken }));
  };
  const onReconcile = (event: FormEvent) => { event.preventDefault(); if (sourceAmountMinor !== null) { const value = { currency, sourceAmountMinor }; void run("reconcile", value, requestToken => reconcile.trigger({ ...value, requestToken })); } };
  const onClose = (event: FormEvent) => { event.preventDefault(); const periodKey = canonicalMonthKey(closeMonth); if (periodKey !== null) { const value = { periodKey }; void run("close", value, requestToken => close.trigger({ ...value, requestToken })); } };
  const onCorrection = (event: FormEvent) => {
    event.preventDefault();
    const effectivePeriodKey = canonicalMonthKey(effectiveMonth);
    if (effectivePeriodKey === null || deltaAmountMinor === null || deltaAmountMinor === "0" || !sourceEntryEligible) return;
    const value = { effectivePeriodKey, reason: correctionReason, signedDeltaMinor: deltaAmountMinor, sourceEntryId };
    void run("correction-submit", value, requestToken => submitCorrection.trigger({ ...value, requestToken }));
  };
  const documentCommand = (operation: "submit" | "approve" | "post", documentId: string) => { const command = operation === "submit" ? submitDocument : operation === "approve" ? approveDocument : postDocument; void run(`document-${operation}-${documentId}`, { documentId }, requestToken => command.trigger({ documentId, requestToken })); };
  const correctionAccess = (correction: AccountingCorrection) => accountingCorrectionAccess({ explicitLedgerVersion: isAsOf, role, canApproveCorrection: model?.capabilities.canApproveCorrection, correction, periods: model?.periods });
  const approvePendingCorrection = (correctionId: string) => void run(`correction-approve-${correctionId}`, { correctionId }, requestToken => approveCorrection.trigger({ correctionId, requestToken }));
  return { t, locale, currency, classifications, intakeReady, intakeLoading, asOfDraft, setAsOfDraft, ledgerVersion, setLedgerVersion, notice, approverId, setApproverId, fileName, fileSize, classification, setClassification, documentAmount, setDocumentAmount, documentMonth, setDocumentMonth, sourceAmount, setSourceAmount, closeMonth, setCloseMonth, sourceEntryId, setSourceEntryId, effectiveMonth, setEffectiveMonth, deltaAmount, setDeltaAmount, correctionReason, setCorrectionReason, workbench, context, runtime, participantUserIds, initialize, ingest, submitDocument, approveDocument, postDocument, reconcile, close, submitCorrection, approveCorrection, answer, model, role, isAsOf, correctionSubmitAllowed, pendingCorrections, eligibleSourceEntries, sourceEntryEligible, documentAmountMinor, sourceAmountMinor, deltaAmountMinor, onFileSelected, onInitialize, onIngest, onReconcile, onClose, onCorrection, documentCommand, correctionAccess, approvePendingCorrection };
};
