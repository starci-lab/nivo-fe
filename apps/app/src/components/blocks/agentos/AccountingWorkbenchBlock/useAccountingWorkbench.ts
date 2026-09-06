"use client";

import { useRef, useState, type FormEvent } from "react";
import type { AccountingCorrection, AccountingLedgerEntry, AccountingOperation, AccountingPeriod, AccountingViewerRole } from "@/modules/api/accounting";
import { useQueryAccountingWorkbenchSwr, useQueryAppliedAccountingContextSwr } from "@/hooks/swr/queries/accounting";
import { useQueryMyAgentosModuleRuntimeSwr } from "@/hooks/swr/queries/console";
import { useMutateApproveAccountingCorrectionSwr, useMutateApproveAccountingDocumentSwr, useMutateCloseAccountingPeriodSwr, useMutateIngestAccountingDocumentSwr, useMutateInitializeAccountingSwr, useMutatePostAccountingDocumentSwr, useMutateReconcileAccountingSwr, useMutateSubmitAccountingCorrectionSwr, useMutateSubmitAccountingDocumentSwr } from "@/hooks/swr/mutations/accounting";
import type { Result } from "@/modules/api/graphql";

type TranslationValues = Readonly<Record<string, string | number | undefined>>;
/** Minimal message formatter accepted by the Accounting controller. */
export type AccountingTranslation = (key: string, values?: TranslationValues) => string;
/** Accessible settled command feedback projected into the pure view. */
export type AccountingNotice = { readonly kind: "success" | "refused"; readonly message: string };
/** Refusals interrupt the current task; confirmations remain non-disruptive. */
export const accountingNoticeLive = (kind: AccountingNotice["kind"]): "assertive" | "polite" => kind === "refused" ? "assertive" : "polite";
type CommandAnswer = Promise<Result<AccountingOperation>>;
type CorrectionAccessReason = "allowed" | "historical" | "not-owner" | "not-approver" | "advisory-denied" | "not-pending" | "self-assigned" | "period-not-open";
/** Advisory facts used to project safe correction controls for one exact proposal. */
export type CorrectionAccessInput = {
  readonly explicitLedgerVersion: boolean;
  readonly role?: AccountingViewerRole;
  readonly canSubmitCorrection?: boolean;
  readonly canApproveCorrection?: boolean;
  readonly correction?: Pick<AccountingCorrection, "status" | "effectivePeriodKey" | "submittedByUserId" | "approverUserId">;
  readonly periods?: ReadonlyArray<Pick<AccountingPeriod, "periodKey" | "status">>;
};
/** Closed document-state projection matching the backend lifecycle. */
export const accountingDocumentAction = (status: string, role?: AccountingViewerRole): "submit" | "approve" | "post" | null => {
  if (status === "draft" && role === "owner") return "submit";
  if (status === "submitted" && role === "approver") return "approve";
  if (status === "approved" && role === "owner") return "post";
  return null;
};
/** Project correction controls without treating capabilities as transactional authorization. */
export const accountingCorrectionAccess = ({ explicitLedgerVersion, role, canSubmitCorrection, canApproveCorrection, correction, periods = [] }: CorrectionAccessInput): { readonly submit: boolean; readonly approve: boolean; readonly approvalReason: CorrectionAccessReason } => {
  const submit = !explicitLedgerVersion && role === "owner" && canSubmitCorrection === true;
  if (explicitLedgerVersion) return { submit: false, approve: false, approvalReason: "historical" };
  if (role !== "approver") return { submit, approve: false, approvalReason: role === "owner" ? "not-owner" : "not-approver" };
  if (canApproveCorrection !== true) return { submit, approve: false, approvalReason: "advisory-denied" };
  if (correction === undefined || correction.status !== "pending") return { submit, approve: false, approvalReason: "not-pending" };
  if (correction.approverUserId === correction.submittedByUserId) return { submit, approve: false, approvalReason: "self-assigned" };
  if (!periods.some(period => period.periodKey === correction.effectivePeriodKey && period.status === "open")) return { submit, approve: false, approvalReason: "period-not-open" };
  return { submit, approve: true, approvalReason: "allowed" };
};

const fractionDigits = (currency: string, locale: string) => new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
/** Convert a locale-entered major-unit amount into the backend's exact signed minor-unit string. */
export const currencyAmountToMinor = (value: string, currency: string, locale: string): string | null => {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000.1);
  const group = parts.find(part => part.type === "group")?.value;
  const decimal = parts.find(part => part.type === "decimal")?.value ?? ".";
  let normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "");
  if (group !== undefined) normalized = normalized.split(group).join("");
  normalized = normalized.split(decimal).join(".");
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(normalized);
  if (match === null) return null;
  const digits = fractionDigits(currency, locale);
  const fraction = match[3] ?? "";
  if (fraction.length > digits) return null;
  const absolute = `${match[2]}${(fraction + "0".repeat(digits)).slice(0, digits)}`.replace(/^0+(?=\d)/, "") || "0";
  if (absolute === "0") return "0";
  return `${match[1]}${absolute}`;
};
/** Format a backend minor-unit string as exact localized business currency. */
export const formatMinorCurrency = (value: string, currency: string, locale: string): string => {
  try {
    const match = /^(-?)(\d+)$/.exec(value);
    if (match === null) throw new Error("amount");
    const negative = match[1] === "-" && !/^0+$/.test(match[2]);
    const absolute = match[2].replace(/^0+(?=\d)/, "") || "0";
    const digits = fractionDigits(currency, locale);
    const padded = absolute.padStart(digits + 1, "0");
    const whole = digits === 0 ? padded : padded.slice(0, -digits);
    const fraction = digits === 0 ? "" : padded.slice(-digits);
    const currencyFormat = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits });
    const template = currencyFormat.formatToParts(negative ? -1 : 1);
    const numeric = new Set(["integer", "group", "decimal", "fraction"]);
    const first = template.findIndex(part => numeric.has(part.type));
    let last = first;
    for (let index = first; index < template.length; index += 1) if (numeric.has(template[index].type)) last = index;
    const prefix = template.slice(0, first).map(part => part.value).join("");
    const suffix = template.slice(last + 1).map(part => part.value).join("");
    const group = new Intl.NumberFormat(locale).formatToParts(1000).find(part => part.type === "group")?.value ?? ",";
    const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
    const decimal = template.find(part => part.type === "decimal")?.value ?? ".";
    return `${prefix}${groupedWhole}${digits === 0 ? "" : `${decimal}${fraction}`}${suffix}`;
  } catch {
    return `${value} ${currency}`;
  }
};
/** Convert the business month control value into the canonical backend month key. */
export const canonicalMonthKey = (month: string): string | null => /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? `${month}-01` : null;
/** Convert evidence bytes without asking a person to handle base64. */
export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return globalThis.btoa(binary);
};
/** Keep participant identity recognizable without making the raw id a primary control label. */
export const maskParticipantId = (userId: string): string => userId.length <= 8 ? `${userId.slice(0, 2)}…${userId.slice(-2)}` : `${userId.slice(0, 4)}…${userId.slice(-4)}`;
/** Offer only current ledger tips that do not already have a correction proposal. */
export const eligibleCorrectionSourceEntries = (ledger: ReadonlyArray<AccountingLedgerEntry>, corrections: ReadonlyArray<Pick<AccountingCorrection, "sourceEntryId">>): ReadonlyArray<AccountingLedgerEntry> => {
  const supersededIds = new Set(ledger.flatMap(entry => entry.correctionOfId === null ? [] : [entry.correctionOfId]));
  const proposedIds = new Set(corrections.map(correction => correction.sourceEntryId));
  return ledger.filter(entry => !supersededIds.has(entry.id) && !proposedIds.has(entry.id));
};
const requestId = () => globalThis.crypto?.randomUUID?.() ?? `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Own Accounting form state, viewer-scoped reads, idempotent command tokens and server readback. */
export const useAccountingWorkbench = (moduleId: string, locale: string, t: AccountingTranslation) => {
  const currency = "VND";
  const [asOfDraft, setAsOfDraft] = useState("");
  const [ledgerVersion, setLedgerVersion] = useState<string>();
  const [notice, setNotice] = useState<AccountingNotice | null>(null);
  const [approverId, setApproverId] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [contentBase64, setContentBase64] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [classification, setClassification] = useState("expense");
  const [documentAmount, setDocumentAmount] = useState("");
  const [documentMonth, setDocumentMonth] = useState("");
  const [sourceAmount, setSourceAmount] = useState("");
  const [closeMonth, setCloseMonth] = useState("");
  const [sourceEntryId, setSourceEntryId] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState("");
  const [deltaAmount, setDeltaAmount] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const tokens = useRef<Record<string, { readonly fingerprint: string; readonly token: string }>>({});
  const workbench = useQueryAccountingWorkbenchSwr(moduleId, currency, ledgerVersion);
  const context = useQueryAppliedAccountingContextSwr(moduleId);
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
    if (documentAmountMinor === null || periodKey === null || contentBase64.length === 0) return;
    const value = { amountMinor: documentAmountMinor, classification, contentBase64, currency, fileName, mimeType, periodKey };
    void run("ingest", value, requestToken => ingest.trigger({ ...value, classification: classification as "income" | "expense" | "receivable" | "payable", requestToken }));
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
  return { t, locale, currency, asOfDraft, setAsOfDraft, ledgerVersion, setLedgerVersion, notice, approverId, setApproverId, fileName, fileSize, classification, setClassification, documentAmount, setDocumentAmount, documentMonth, setDocumentMonth, sourceAmount, setSourceAmount, closeMonth, setCloseMonth, sourceEntryId, setSourceEntryId, effectiveMonth, setEffectiveMonth, deltaAmount, setDeltaAmount, correctionReason, setCorrectionReason, workbench, context, runtime, participantUserIds, initialize, ingest, submitDocument, approveDocument, postDocument, reconcile, close, submitCorrection, approveCorrection, answer, model, role, isAsOf, correctionSubmitAllowed, pendingCorrections, eligibleSourceEntries, sourceEntryEligible, documentAmountMinor, sourceAmountMinor, deltaAmountMinor, onFileSelected, onInitialize, onIngest, onReconcile, onClose, onCorrection, documentCommand, correctionAccess, approvePendingCorrection };
};
