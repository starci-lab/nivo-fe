import type { AccountingClassification, AccountingCorrection, AccountingLedgerEntry, AccountingPeriod, AccountingViewerRole } from "@/modules/api/accounting";

type TranslationValues = Readonly<Record<string, string | number | undefined>>;
/** Accounting classifications accepted by the setup projection and intake controller. */
export const ACCOUNTING_CLASSIFICATIONS = ["income", "expense", "receivable", "payable"] as const;
type AccountingIntakePolicy = { readonly currency: string; readonly classifications: ReadonlyArray<AccountingClassification> };
/** Minimal message formatter accepted by the Accounting controller. */
export type AccountingTranslation = (key: string, values?: TranslationValues) => string;
/** Accessible settled command feedback projected into the pure view. */
export type AccountingNotice = { readonly kind: "success" | "refused"; readonly message: string };
/** Refusals interrupt the current task; confirmations remain non-disruptive. */
export const accountingNoticeLive = (kind: AccountingNotice["kind"]): "assertive" | "polite" => kind === "refused" ? "assertive" : "polite";
/** Narrow only the Setup facts that authorize document intake; every command remains server-authorized. */
export const accountingIntakePolicy = (snapshot: unknown): AccountingIntakePolicy | null => {
  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)) return null;
  const record = snapshot as Readonly<Record<string, unknown>>;
  const scope = record.accountingScope;
  const currencyAndLocale = record.currencyAndLocale;
  if (scope === null || typeof scope !== "object" || Array.isArray(scope) || currencyAndLocale === null || typeof currencyAndLocale !== "object" || Array.isArray(currencyAndLocale)) return null;
  const rawClassifications = (scope as Readonly<Record<string, unknown>>).classifications;
  const currency = (currencyAndLocale as Readonly<Record<string, unknown>>).functionalCurrency;
  if (!Array.isArray(rawClassifications) || rawClassifications.length === 0 || typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency) || currency === "XXX" || currency === "XTS") return null;
  if (!rawClassifications.every(value => typeof value === "string" && ACCOUNTING_CLASSIFICATIONS.includes(value as AccountingClassification))) return null;
  const classifications = [...new Set(rawClassifications)] as Array<AccountingClassification>;
  if (classifications.length !== rawClassifications.length) return null;
  return { currency, classifications };
};
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
