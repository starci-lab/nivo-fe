import { useRef, type ChangeEvent, type ReactNode } from "react";
import { Badge, Button, EmptyNotice, Heading, Input, PrimaryRailLayout, SectionHeader, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import type { AccountingCorrection, AccountingDocument } from "@/modules/api/accounting";
import { accountingDocumentAction, accountingNoticeLive, formatMinorCurrency, maskParticipantId, type AccountingNotice, type useAccountingWorkbench } from "./useAccountingWorkbench";
import { ACCOUNTING_ACTION_ROW_CLASS_NAME, ACCOUNTING_FIELD_STACK_CLASS_NAME, ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME, ACCOUNTING_FORM_GRID_CLASS_NAME, ACCOUNTING_NATIVE_CONTROL_CLASS_NAME, ACCOUNTING_NATIVE_FIELD_CLASS_NAME, ACCOUNTING_OPERATIONS_GRID_CLASS_NAME, ACCOUNTING_ROW_CLASS_NAME, ACCOUNTING_SUMMARY_GRID_CLASS_NAME, ACCOUNTING_WORKBENCH_CLASS_NAME } from "./classNames";

const unsignedVersion = /^\d+$/;
type ChildrenProps = { readonly children: ReactNode };
type StatusNoticeProps = { readonly notice: AccountingNotice | null };
/** Settled data and interactions projected by the connected Accounting owner. */
export type AccountingWorkbenchBlockProps = { readonly view: ReturnType<typeof useAccountingWorkbench> };
const StatusNotice = ({ notice }: StatusNoticeProps) => notice === null ? null : <SurfaceCard><Text live={accountingNoticeLive(notice.kind)} tone={notice.kind === "success" ? "accent" : "default"}>{notice.message}</Text></SurfaceCard>;
const FieldStack = ({ children }: ChildrenProps) => <div className={ACCOUNTING_FIELD_STACK_CLASS_NAME} data-contract="GAP-4">{children}</div>;
const Row = ({ children }: ChildrenProps) => <div className={ACCOUNTING_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">{children}</div>;
const ActionRow = ({ children }: ChildrenProps) => <div className={ACCOUNTING_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">{children}</div>;
const documentStatusKey = (status: string) => ({ draft: "documentDraft", submitted: "documentSubmitted", approved: "documentApproved", posted: "documentPosted" } as const)[status as "draft" | "submitted" | "approved" | "posted"] ?? "documentUnknown";
const documentActionKey = (action: "submit" | "approve" | "post") => ({ submit: "submitDocument", approve: "approveDocument", post: "postDocument" } as const)[action];
const approvalReasonKey = (reason: ReturnType<ReturnType<typeof useAccountingWorkbench>["correctionAccess"]>["approvalReason"]) => ({
  allowed: "approvalAvailable",
  historical: "historicalAdvisory",
  "not-owner": "ownerCannotApprove",
  "not-approver": "distinctApproverOnly",
  "advisory-denied": "advisoryApprovalUnavailable",
  "not-pending": "proposalNotPending",
  "self-assigned": "ownerCannotApprove",
  "period-not-open": "approvalPeriodClosed"
} as const)[reason];

/** Render the complete responsive Accounting workbench from a settled controller view. */
export const AccountingWorkbenchBlockBase = (props: AccountingWorkbenchBlockProps) => {
  const { view } = props;
  const fileInput = useRef<HTMLInputElement>(null);
  const { t, locale, currency, classifications, intakeReady, intakeLoading, asOfDraft, setAsOfDraft, ledgerVersion, setLedgerVersion, notice, approverId, setApproverId, fileName, fileSize, classification, setClassification, documentAmount, setDocumentAmount, documentMonth, setDocumentMonth, sourceAmount, setSourceAmount, closeMonth, setCloseMonth, sourceEntryId, setSourceEntryId, effectiveMonth, setEffectiveMonth, deltaAmount, setDeltaAmount, correctionReason, setCorrectionReason, workbench, context, runtime, participantUserIds, initialize, ingest, submitDocument, approveDocument, postDocument, reconcile, close, submitCorrection, approveCorrection, answer, model, role, isAsOf, correctionSubmitAllowed, pendingCorrections, eligibleSourceEntries, sourceEntryEligible, documentAmountMinor, sourceAmountMinor, deltaAmountMinor, onFileSelected, onInitialize, onIngest, onReconcile, onClose, onCorrection, documentCommand, correctionAccess, approvePendingCorrection } = view;
  const formatAmount = (amount: string, rowCurrency = currency) => formatMinorCurrency(amount, rowCurrency, locale);
  const formatMonth = (periodKey: string) => new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${periodKey}T00:00:00Z`));
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file !== undefined) void onFileSelected(file);
    event.currentTarget.value = "";
  };
  const documentRow = (document: AccountingDocument) => {
    const action = accountingDocumentAction(document.status, role);
    const pending = action === "submit" ? submitDocument.isMutating : action === "approve" ? approveDocument.isMutating : action === "post" ? postDocument.isMutating : false;
    return <Row key={document.id}>
      <ActionRow><Text weight="semibold">{document.fileName}</Text><Badge tone={document.status === "posted" ? "success" : "neutral"}>{t(documentStatusKey(document.status))}</Badge></ActionRow>
      <Text size="sm">{formatMonth(document.periodKey)} · {formatAmount(document.amountMinor, document.currency)}</Text>
      {action === null ? null : <Button size="lg" variant={action === "post" ? "primary" : "secondary"} isPending={pending} onPress={() => documentCommand(action, document.id)}>{t(documentActionKey(action))}</Button>}
      <details><summary>{t("auditDetails")}</summary><Text size="xs" tone="muted">{t("documentAudit", { context: document.contextVersionId, digest: document.contextDigest })}</Text></details>
    </Row>;
  };
  const correctionRow = (correction: AccountingCorrection) => {
    const access = correctionAccess(correction);
    return <Row key={correction.id}>
      <ActionRow><Text weight="semibold">{formatAmount(correction.signedDeltaMinor, correction.currency)}</Text><Badge tone="warning">{t("pending")}</Badge></ActionRow>
      <Text size="sm">{formatMonth(correction.effectivePeriodKey)}</Text>
      <Text size="sm">{correction.reason}</Text>
      {access.approve ? <Button size="lg" variant="primary" isPending={approveCorrection.isMutating} onPress={() => approvePendingCorrection(correction.id)}>{t("approveCorrection")}</Button> : <Text size="xs" tone="muted" live="polite">{t(approvalReasonKey(access.approvalReason))}</Text>}
      <details><summary>{t("auditDetails")}</summary><Text size="xs" tone="muted">{t("correctionAudit", { proposal: correction.id, approver: correction.approverUserId, version: correction.version })}</Text></details>
    </Row>;
  };

  const primary = <FieldStack>
    <SectionHeader level={2} title={t("title")} description={t("description")} />
    <SurfaceCard label={t("statementSnapshot")} fact={model === undefined ? undefined : t("ledgerVersion", { version: model.ledgerVersion })}>
      <div className={ACCOUNTING_SUMMARY_GRID_CLASS_NAME}>
        <FieldStack>
          <ActionRow><Badge tone={isAsOf ? "warning" : "neutral"}>{isAsOf ? t("asOfMode", { version: ledgerVersion }) : t("currentMode")}</Badge>{context.data?.ok === true ? <Badge tone="success">{t("appliedSetup")}</Badge> : null}{role === undefined ? null : <Badge tone="neutral">{t(`role.${role}`)}</Badge>}<Badge tone="neutral">{currency}</Badge></ActionRow>
          <Input id="accounting-ledger-version" name="accounting-ledger-version" label={t("asOfVersion")} hint={t("asOfHint")} value={asOfDraft} onValueChange={setAsOfDraft} />
          <ActionRow><Button size="lg" variant="secondary" isDisabled={asOfDraft.length === 0 || !unsignedVersion.test(asOfDraft)} onPress={() => setLedgerVersion(asOfDraft)}>{t("viewAsOf")}</Button><Button size="lg" variant="ghost" isDisabled={!isAsOf} onPress={() => { setLedgerVersion(undefined); setAsOfDraft(""); }}>{t("returnCurrent")}</Button></ActionRow>
          {isAsOf ? <Text tone="accent" live="polite">{t("historicalAdvisory")}</Text> : null}
        </FieldStack>
        <FieldStack><Text size="sm" tone="muted">{t("ledgerBalance")}</Text><Heading level={3}>{model === undefined ? t("loadingAmount") : formatAmount(model.ledgerAmountMinor, model.currency)}</Heading><Text size="xs" tone="muted">{t("immutableBalance")}</Text></FieldStack>
      </div>
    </SurfaceCard>
    {workbench.error !== undefined ? <div role="alert"><EmptyNotice message={t("transportError")} description={t("nothingChanged")} actionLabel={t("retry")} onAction={() => void workbench.mutate()} /></div> : answer?.ok === false ? <div role="alert"><EmptyNotice message={t("readRefused", { reason: answer.reason })} description={t("nothingChanged")} actionLabel={t("retry")} onAction={() => void workbench.mutate()} /></div> : null}
    <SurfaceListCard label={t("ledger")} fact={model === undefined ? undefined : t("rowCount", { count: model.ledger.length })} isLoading={answer === undefined && workbench.error === undefined}>
      {model?.ledger.length === 0 ? <EmptyNotice message={t("emptyLedger")} description={t("emptyLedgerHint")} /> : model?.ledger.map(entry => <Row key={entry.id}><ActionRow><Text weight="semibold">{formatAmount(entry.signedAmountMinor, entry.currency)}</Text><Badge tone={entry.kind === "correction" ? "warning" : "neutral"}>{t(entry.kind === "correction" ? "correctionEntry" : "documentEntry")}</Badge></ActionRow><Text size="sm">{formatMonth(entry.periodKey)} · {t("ledgerVersion", { version: entry.ledgerVersion })}</Text>{entry.reason === null ? null : <Text size="sm">{entry.reason}</Text>}<details><summary>{t("auditDetails")}</summary><Text size="xs" tone="muted">{t("ledgerAudit", { entry: entry.id, document: entry.documentId ?? "—" })}</Text></details></Row>)}
    </SurfaceListCard>
    <SurfaceListCard label={t("documents")} fact={model === undefined ? undefined : t("rowCount", { count: model.documents.length })} isLoading={answer === undefined && workbench.error === undefined}>
      {model?.documents.length === 0 ? <EmptyNotice message={t("emptyDocuments")} description={t("emptyDocumentsHint")} /> : model?.documents.map(documentRow)}
    </SurfaceListCard>
    <SurfaceCard label={t("documentIntake")}><form onSubmit={onIngest}><div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
      <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}><Text size="sm" tone={intakeReady || intakeLoading ? "muted" : "accent"} live={intakeLoading ? "polite" : intakeReady ? "polite" : "assertive"}>{intakeLoading ? t("loadingContext") : intakeReady ? t("intakePolicy", { currency, classifications: classifications.map(item => t(`classification${item[0].toUpperCase()}${item.slice(1)}`)).join(", ") }) : t("intakePolicyUnavailable")}</Text></div>
      <input ref={fileInput} type="file" accept="application/pdf,image/*,.pdf" hidden disabled={!intakeReady || ingest.isMutating} aria-label={t("chooseEvidenceFile")} onChange={chooseFile} />
      <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}><ActionRow><Button size="lg" type="button" variant="secondary" isDisabled={!intakeReady} isPending={ingest.isMutating} onPress={() => fileInput.current?.click()}>{fileName.length === 0 ? t("chooseEvidenceFile") : t("replaceEvidenceFile")}</Button><Text size="sm" tone="muted">{fileName.length === 0 ? t("noFileSelected") : t("selectedFile", { name: fileName, size: fileSize })}</Text></ActionRow></div>
      <label className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME} htmlFor="accounting-classification"><Text size="sm" weight="semibold">{t("classification")}</Text><select className={ACCOUNTING_NATIVE_CONTROL_CLASS_NAME} id="accounting-classification" name="accounting-classification" value={classification} onChange={event => setClassification(event.currentTarget.value)} disabled={!intakeReady} required>{classifications.map(item => <option key={item} value={item}>{t(`classification${item[0].toUpperCase()}${item.slice(1)}`)}</option>)}</select></label>
      <Input id="accounting-document-amount" name="accounting-document-amount" label={t("documentAmount", { currency })} hint={t("currencyAmountHint")} value={documentAmount} onValueChange={setDocumentAmount} isRequired isDisabled={!intakeReady} isError={documentAmount.length > 0 && (documentAmountMinor === null || documentAmountMinor === "0")} errorMessage={t("positiveAmountRequired")} />
      <label className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME} htmlFor="accounting-document-month"><Text size="sm" weight="semibold">{t("documentMonth")}</Text><input className={ACCOUNTING_NATIVE_CONTROL_CLASS_NAME} id="accounting-document-month" name="accounting-document-month" type="month" value={documentMonth} onChange={event => setDocumentMonth(event.currentTarget.value)} disabled={!intakeReady} required /></label>
      <div className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME}><Text size="sm" weight="semibold">{t("intakeAction")}</Text><Button size="lg" type="submit" variant="primary" isPending={ingest.isMutating} isDisabled={!intakeReady || documentAmountMinor === null || documentAmountMinor === "0" || documentMonth.length === 0 || fileName.length === 0}>{t("addDocument")}</Button></div>
    </div></form></SurfaceCard>
    <SurfaceListCard label={t("reconciliationHistory")} fact={model === undefined ? undefined : t("rowCount", { count: model.reconciliations.length })} isLoading={answer === undefined && workbench.error === undefined}>
      {model?.reconciliations.length === 0 ? <EmptyNotice message={t("emptyReconciliations")} description={t("emptyReconciliationsHint")} /> : model?.reconciliations.map(item => <Row key={item.id}><Text weight="semibold">{t("reconciliationDifference", { amount: formatAmount(item.differenceMinor, item.currency) })}</Text><Text size="sm">{t("reconciliationValues", { source: formatAmount(item.sourceAmountMinor, item.currency), ledger: formatAmount(item.ledgerAmountMinor, item.currency), version: item.ledgerVersionH })}</Text></Row>)}
    </SurfaceListCard>
    <div className={ACCOUNTING_OPERATIONS_GRID_CLASS_NAME}>
      <SurfaceCard label={t("reconciliationAndClose")}><form onSubmit={onReconcile}><FieldStack><Input id="accounting-source-amount" name="accounting-source-amount" label={t("sourceAmount", { currency })} hint={t("currencyAmountHintSigned")} value={sourceAmount} onValueChange={setSourceAmount} isRequired isError={sourceAmount.length > 0 && sourceAmountMinor === null} errorMessage={t("validCurrencyRequired")} /><Button size="lg" type="submit" variant="secondary" isPending={reconcile.isMutating} isDisabled={sourceAmountMinor === null}>{t("reconcile")}</Button></FieldStack></form></SurfaceCard>
      <SurfaceCard label={t("closePeriodAction")}><form onSubmit={onClose}><FieldStack><label className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME} htmlFor="accounting-close-month"><Text size="sm" weight="semibold">{t("closeMonth")}</Text><input className={ACCOUNTING_NATIVE_CONTROL_CLASS_NAME} id="accounting-close-month" name="accounting-close-month" type="month" value={closeMonth} onChange={event => setCloseMonth(event.currentTarget.value)} required /></label><Button size="lg" type="submit" variant="secondary" isPending={close.isMutating} isDisabled={closeMonth.length === 0}>{t("closePeriodAction")}</Button></FieldStack></form></SurfaceCard>
    </div>
  </FieldStack>;

  const rail = <FieldStack>
    <SurfaceCard label={t("appliedContext")}>{context.error !== undefined ? <div role="alert"><EmptyNotice message={t("transportError")} description={t("nothingChanged")} actionLabel={t("retry")} onAction={() => void context.mutate()} /></div> : context.data?.ok === false ? <Text live="assertive">{t("readRefused", { reason: context.data.reason })}</Text> : context.data?.ok === true ? <details><summary>{t("auditDetails")}</summary><Text size="xs" tone="muted">{t("contextAudit", { version: context.data.data.versionId, digest: context.data.data.digest })}</Text></details> : <Text size="sm" tone="muted" isSkeleton>{t("loadingContext")}</Text>}</SurfaceCard>
    <SurfaceListCard label={t("pendingCorrections")} fact={t("rowCount", { count: pendingCorrections.length })} isLoading={answer === undefined && workbench.error === undefined}>
      {model !== undefined && pendingCorrections.length === 0 ? <EmptyNotice message={t("emptyCorrections")} description={t("emptyCorrectionsHint")} /> : pendingCorrections.map(correctionRow)}
    </SurfaceListCard>
    <SurfaceCard label={t("proposeCorrection")}><form onSubmit={onCorrection}><FieldStack>
      <label className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME} htmlFor="accounting-source-entry"><Text size="sm" weight="semibold">{t("sourceEntry")}</Text><select className={ACCOUNTING_NATIVE_CONTROL_CLASS_NAME} id="accounting-source-entry" name="accounting-source-entry" value={sourceEntryId} onChange={event => setSourceEntryId(event.currentTarget.value)} disabled={isAsOf || eligibleSourceEntries.length === 0} required><option value="">{t("chooseLedgerEntry")}</option>{eligibleSourceEntries.map(entry => <option key={entry.id} value={entry.id}>{t("ledgerEntryOption", { amount: formatAmount(entry.signedAmountMinor, entry.currency), period: formatMonth(entry.periodKey) })}</option>)}</select></label>
      <label className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME} htmlFor="accounting-effective-month"><Text size="sm" weight="semibold">{t("effectiveMonth")}</Text><input className={ACCOUNTING_NATIVE_CONTROL_CLASS_NAME} id="accounting-effective-month" name="accounting-effective-month" type="month" value={effectiveMonth} onChange={event => setEffectiveMonth(event.currentTarget.value)} disabled={isAsOf} required /></label>
      <Input id="accounting-delta" name="accounting-delta" label={t("correctionAmount", { currency })} hint={t("currencyAmountHintSigned")} value={deltaAmount} onValueChange={setDeltaAmount} isRequired isDisabled={isAsOf} isError={deltaAmount.length > 0 && (deltaAmountMinor === null || deltaAmountMinor === "0")} errorMessage={t("nonZeroAmountRequired")} />
      <Input id="accounting-reason" name="accounting-reason" label={t("reason")} value={correctionReason} onValueChange={setCorrectionReason} isRequired isDisabled={isAsOf} />
      <Text size="xs" tone="muted">{t("advisoryCapabilities")}</Text>
      {!correctionSubmitAllowed ? <Text size="xs" tone="accent" live="polite">{isAsOf ? t("historicalAdvisory") : t("permissionDenied")}</Text> : null}
      <Button size="lg" type="submit" variant="primary" isPending={submitCorrection.isMutating} isDisabled={!correctionSubmitAllowed || !sourceEntryEligible || correctionReason.length === 0 || effectiveMonth.length === 0 || deltaAmountMinor === null || deltaAmountMinor === "0"}>{t("submitCorrection")}</Button>
    </FieldStack></form></SurfaceCard>
    <SurfaceCard label={t("initialize")}>{model !== undefined ? <Text size="sm" tone="muted">{t("initializationComplete")}</Text> : runtime.error !== undefined || runtime.data?.ok === false ? <EmptyNotice message={t("initializationUnavailable")} description={t("participantSourceUnavailable")} actionLabel={t("retry")} onAction={() => void runtime.mutate()} /> : participantUserIds.length === 0 ? <EmptyNotice message={t("initializationUnavailable")} description={t("initializationUnavailableReason")} /> : <form onSubmit={onInitialize}><FieldStack><Text size="xs" tone="muted">{t("participantSuggestionNotice")}</Text><label className={ACCOUNTING_NATIVE_FIELD_CLASS_NAME} htmlFor="accounting-approver"><Text size="sm" weight="semibold">{t("approverCandidate")}</Text><select className={ACCOUNTING_NATIVE_CONTROL_CLASS_NAME} id="accounting-approver" name="accounting-approver" value={approverId} onChange={event => setApproverId(event.currentTarget.value)} required><option value="">{t("chooseApproverCandidate")}</option>{participantUserIds.map(userId => <option key={userId} value={userId}>{t("participantOption", { participant: maskParticipantId(userId) })}</option>)}</select></label>{approverId.length === 0 ? null : <details><summary>{t("auditDetails")}</summary><Text size="xs" tone="muted">{t("selectedParticipantAudit", { id: approverId })}</Text></details>}<Button size="lg" type="submit" variant="secondary" isPending={initialize.isMutating} isDisabled={approverId.length === 0}>{t("initializeAction")}</Button></FieldStack></form>}</SurfaceCard>
  </FieldStack>;
  return <div className={ACCOUNTING_WORKBENCH_CLASS_NAME} data-contract="GAP-5 MEASURE-2" aria-busy={answer === undefined && workbench.error === undefined ? true : undefined}><StatusNotice notice={notice} /><PrimaryRailLayout primary={primary} rail={rail} railWidth="standard" align="start" collapsedOrder="primary-first" /></div>;
};
