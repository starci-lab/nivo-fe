"use client";

import { useRef, useState, type FormEvent } from "react";
import type { AccountingOperation, AccountingViewerRole } from "@/modules/api/accounting";
import { useQueryAccountingWorkbenchSwr, useQueryAppliedAccountingContextSwr } from "@/hooks/swr/queries/accounting";
import { useMutateApproveAccountingCorrectionSwr, useMutateApproveAccountingDocumentSwr, useMutateCloseAccountingPeriodSwr, useMutateIngestAccountingDocumentSwr, useMutateInitializeAccountingSwr, useMutatePostAccountingDocumentSwr, useMutateReconcileAccountingSwr, useMutateSubmitAccountingCorrectionSwr, useMutateSubmitAccountingDocumentSwr } from "@/hooks/swr/mutations/accounting";
import type { Result } from "@/modules/api/graphql";

type TranslationValues = Readonly<Record<string, string | number | undefined>>;
/** Minimal message formatter accepted by the Accounting controller. */
export type AccountingTranslation = (key: string, values?: TranslationValues) => string;
/** Accessible settled command feedback projected into the pure view. */
export type AccountingNotice = { readonly kind: "success" | "refused"; readonly message: string };
type CommandAnswer = Promise<Result<AccountingOperation>>;
/** Advisory facts used to project safe correction controls. */
export type CorrectionAccessInput = { readonly explicitLedgerVersion: boolean; readonly role?: AccountingViewerRole; readonly canSubmitCorrection?: boolean; readonly canApproveCorrection?: boolean };
/** Project correction controls without treating capabilities as transactional authorization. */
export const accountingCorrectionAccess = ({ explicitLedgerVersion, role, canSubmitCorrection, canApproveCorrection }: CorrectionAccessInput) => ({ submit: !explicitLedgerVersion && role === "owner" && canSubmitCorrection === true, approve: role === "approver" && canApproveCorrection === true });
const requestId = () => globalThis.crypto?.randomUUID?.() ?? `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Own Accounting form state, viewer-scoped reads, idempotent command tokens and server readback. */
export const useAccountingWorkbench = (moduleId: string, t: AccountingTranslation) => {
  const [currency, setCurrency] = useState("VND");
  const [asOfDraft, setAsOfDraft] = useState("");
  const [ledgerVersion, setLedgerVersion] = useState<string>();
  const [notice, setNotice] = useState<AccountingNotice | null>(null);
  const [approverId, setApproverId] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("application/pdf");
  const [contentBase64, setContentBase64] = useState("");
  const [classification, setClassification] = useState("expense");
  const [documentAmount, setDocumentAmount] = useState("");
  const [documentPeriod, setDocumentPeriod] = useState("");
  const [sourceAmount, setSourceAmount] = useState("");
  const [closePeriod, setClosePeriod] = useState("");
  const [sourceEntryId, setSourceEntryId] = useState("");
  const [effectivePeriod, setEffectivePeriod] = useState("");
  const [deltaAmount, setDeltaAmount] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const tokens = useRef<Record<string, { readonly fingerprint: string; readonly token: string }>>({});
  const workbench = useQueryAccountingWorkbenchSwr(moduleId, currency, ledgerVersion);
  const context = useQueryAppliedAccountingContextSwr(moduleId);
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
      setNotice({ kind: "success", message: t("operationAccepted", { operation: answer.data.operation }) });
      await workbench.mutate();
      await context.mutate();
    } catch { setNotice({ kind: "refused", message: t("transportError") }); }
  };
  const answer = workbench.data;
  const model = answer?.ok === true ? answer.data : undefined;
  const role: AccountingViewerRole | undefined = model?.capabilities.viewerRole;
  const isAsOf = ledgerVersion !== undefined;
  const correctionAccess = accountingCorrectionAccess({ explicitLedgerVersion: isAsOf, role, canSubmitCorrection: model?.capabilities.canSubmitCorrection, canApproveCorrection: model?.capabilities.canApproveCorrection });
  const pendingCorrections = model?.corrections.filter(item => item.status === "pending") ?? [];
  const onInitialize = (event: FormEvent) => { event.preventDefault(); void run("initialize", { approverId }, requestToken => initialize.trigger({ approverUserId: approverId, requestToken })); };
  const onIngest = (event: FormEvent) => { event.preventDefault(); const value = { amountMinor: documentAmount, classification, contentBase64, currency, fileName, mimeType, periodKey: documentPeriod }; void run("ingest", value, requestToken => ingest.trigger({ ...value, classification: classification as "income" | "expense" | "receivable" | "payable", requestToken })); };
  const onReconcile = (event: FormEvent) => { event.preventDefault(); const value = { currency, sourceAmountMinor: sourceAmount }; void run("reconcile", value, requestToken => reconcile.trigger({ ...value, requestToken })); };
  const onClose = (event: FormEvent) => { event.preventDefault(); const value = { periodKey: closePeriod }; void run("close", value, requestToken => close.trigger({ ...value, requestToken })); };
  const onCorrection = (event: FormEvent) => { event.preventDefault(); const value = { effectivePeriodKey: effectivePeriod, reason: correctionReason, signedDeltaMinor: deltaAmount, sourceEntryId }; void run("correction-submit", value, requestToken => submitCorrection.trigger({ ...value, requestToken })); };
  const documentCommand = (operation: "submit" | "approve" | "post", documentId: string) => { const command = operation === "submit" ? submitDocument : operation === "approve" ? approveDocument : postDocument; void run(`document-${operation}-${documentId}`, { documentId }, requestToken => command.trigger({ documentId, requestToken })); };
  const approvePendingCorrection = (correctionId: string) => void run(`correction-approve-${correctionId}`, { correctionId }, requestToken => approveCorrection.trigger({ correctionId, requestToken }));
  return { t, currency, setCurrency, asOfDraft, setAsOfDraft, ledgerVersion, setLedgerVersion, notice, approverId, setApproverId, fileName, setFileName, mimeType, setMimeType, contentBase64, setContentBase64, classification, setClassification, documentAmount, setDocumentAmount, documentPeriod, setDocumentPeriod, sourceAmount, setSourceAmount, closePeriod, setClosePeriod, sourceEntryId, setSourceEntryId, effectivePeriod, setEffectivePeriod, deltaAmount, setDeltaAmount, correctionReason, setCorrectionReason, workbench, context, initialize, ingest, submitDocument, approveDocument, postDocument, reconcile, close, submitCorrection, approveCorrection, answer, model, role, isAsOf, correctionSubmitAllowed: correctionAccess.submit, correctionApproveAllowed: correctionAccess.approve, pendingCorrections, onInitialize, onIngest, onReconcile, onClose, onCorrection, documentCommand, approvePendingCorrection };
};
