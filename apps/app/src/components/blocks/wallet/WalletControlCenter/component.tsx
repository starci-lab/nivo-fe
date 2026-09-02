import { Breadcrumbs, DrawerBranch, ModalBranch } from "@nivo/ui";
import { SurfaceCard, SurfaceListCard, Button, Button as CoreButton, Input, Heading, Text, Badge, type BadgeTone } from "@starci/grammar/common";

/** One already-formatted label and value used by wallet evidence surfaces. */
export type WalletControlCenterProps = WalletControlCenterViewProps;
/** Public API role for WalletFactRow. */
export type WalletFactRow = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};
/** Settled presentation state of the balance surface. */
export type BalanceSectionView = {
  readonly phase: "resting";
  readonly label: string;
  readonly actionLabel: string;
} | {
  readonly phase: "answered" | "empty";
  readonly label: string;
  readonly actionLabel: string;
  readonly facts: ReadonlyArray<WalletFactRow>;
} | {
  readonly phase: "refused";
  readonly label: string;
  readonly note: string;
};
/** One movement or invoice row with the complete evidence its detail drawer reveals. */
export type WalletLedgerRow = {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly amount: string;
  readonly state: string;
  readonly tone: BadgeTone;
  readonly detailLabel: string;
  readonly detailFacts: ReadonlyArray<WalletFactRow>;
  readonly note?: string;
};
/** Settled presentation state of one joined wallet ledger. */
export type LedgerSectionView = {
  readonly phase: "resting";
  readonly label: string;
} | {
  readonly phase: "empty" | "refused";
  readonly label: string;
  readonly note: string;
} | {
  readonly phase: "answered";
  readonly label: string;
  readonly rows: ReadonlyArray<WalletLedgerRow>;
  readonly actionLabel?: string;
};
/** Exact AgentOS invoice singled out from the ordinary Wallet ledger. */
export type LinkedInvoiceSectionView = {
  readonly phase: "resting";
  readonly label: string;
  readonly orderLabel: string;
} | {
  readonly phase: "refused";
  readonly label: string;
  readonly note: string;
} | {
  readonly phase: "answered";
  readonly label: string;
  readonly orderLabel: string;
  readonly row: WalletLedgerRow;
  readonly actionLabel: string;
  readonly actionKind: "pay" | "return";
  readonly actionDisabled: boolean;
  readonly consequence: string;
};
/** Path context shown only while Wallet is the waypoint of one exact AgentOS order. */
export type WalletBreadcrumbView = {
  readonly label: string;
  readonly backLabel: string;
};
/** Controlled state and copy for the top-up modal. */
export type TopUpView = {
  readonly overlayState: "closed" | "open";
  readonly title: string;
  readonly closeLabel: string;
  readonly amountLabel: string;
  readonly amountPlaceholder: string;
  readonly hint: string;
  readonly submitLabel: string;
  readonly amount: string;
  readonly pending: boolean;
  readonly refusal?: string;
  readonly checkout?: {
    readonly reference: string;
    readonly amount: string;
    readonly note: string;
  };
};
/** Honest provider-return state shown after balance reconciliation. */
export type PaymentResultView = {
  readonly overlayState: "closed" | "open";
  readonly title: string;
  readonly closeLabel: string;
  readonly state: string;
  readonly tone: BadgeTone;
  readonly amount: string;
  readonly reference?: string;
  readonly note: string;
  readonly actionLabel: string;
};
/** User outcomes reported from the pure wallet drawing. */
export type WalletControlCenterActions = {
  readonly topUp?: () => void;
  readonly closeTopUp?: () => void;
  readonly changeTopUpAmount?: (value: string) => void;
  readonly submitTopUp?: () => void;
  readonly closeResult?: () => void;
  readonly payInvoice?: () => void;
  readonly openOrder?: () => void;
  readonly returnToOrder?: () => void;
};
type WalletPageSharedViewProps = {
  readonly title: string;
  readonly balance: BalanceSectionView;
  readonly transactions: LedgerSectionView;
  readonly invoices: LedgerSectionView;
  readonly topUp: TopUpView;
  readonly result: PaymentResultView;
  readonly on?: WalletControlCenterActions;
};
/** Architectural state of the complete Wallet page. */
export type WalletPageState = "ordinary" | "waypoint";
/** Complete pure input for the accepted wallet/payment flow. */
export type WalletControlCenterViewProps = WalletPageSharedViewProps & {
  readonly state: "ordinary";
  readonly breadcrumb?: never;
  readonly linkedInvoice?: never;
} | WalletPageSharedViewProps & {
  readonly state: "waypoint";
  readonly breadcrumb?: WalletBreadcrumbView;
  readonly linkedInvoice: LinkedInvoiceSectionView;
};
const RESTING_FACTS: ReadonlyArray<WalletFactRow> = [{
  id: "resting-1",
  label: "",
  value: ""
}, {
  id: "resting-2",
  label: "",
  value: ""
}];
const factRow = (row: WalletFactRow, isLoading = false) => <div>
  <Text size="sm" isSkeleton={isLoading}>{row.label}</Text>
  <Text size="sm" isSkeleton={isLoading}>{row.value}</Text></div>;
const sectionLabel = (label: string) => <div>
  <Heading level={3}>{label}</Heading></div>;
const noteSection = (label: string, note: string) => <SurfaceCard
  label={label}
><div>{<Text size="sm" tone="muted">{note}</Text>}</div></SurfaceCard>;
const ledgerDetail = (row: WalletLedgerRow) => <div><div>{row.detailFacts.map(fact => factRow(fact))}</div>{row.note === undefined ? undefined : <Text size="sm" tone="muted">{row.note ?? ""}</Text>}</div>;
const ledgerRow = (row: WalletLedgerRow | undefined, isLoading: boolean, closeLabel: string) => {
  const LedgerDetailContent = () => row === undefined ? null : ledgerDetail(row);
  return <div><div>

      <Text size="sm" isSkeleton={isLoading}>{row?.title ?? ""}</Text>
      <Text size="xs" tone="muted" isSkeleton={isLoading}>{row?.caption ?? ""}</Text></div>

    <Badge tone={row?.tone ?? "neutral"} isSkeleton={isLoading}>{row?.state ?? ""}</Badge>
    <Text size="sm" weight="semibold" isSkeleton={isLoading}>{row?.amount ?? ""}</Text>{row === undefined ? undefined : <DrawerBranch triggerLabel={row.detailLabel} title={row.title} closeLabel={closeLabel} content={LedgerDetailContent} contentProps={{}} />}</div>;
};
const walletLedgerContent = (ledger: LedgerSectionView, closeLabel: string) => {
  const isLoading = ledger.phase === "resting";
  const rows: ReadonlyArray<WalletLedgerRow> = ledger.phase === "answered" ? ledger.rows : [];
  const entries: ReadonlyArray<WalletLedgerRow | undefined> = isLoading ? [undefined, undefined, undefined] : rows;
  return <div>{entries.map(row => ledgerRow(row, isLoading, closeLabel))}</div>;
};
type TopUpContentProps = {
  readonly topUp: TopUpView;
  readonly on?: WalletControlCenterActions;
};
const TopUpContent = ({
  topUp,
  on
}: TopUpContentProps) => topUp.checkout === undefined ? <div>

  <Input
    id="wallet-top-up-amount"
    name="amountVnd"
    label={topUp.amountLabel}
    kind="text"
    placeholder={topUp.amountPlaceholder}
    isDisabled={topUp.pending}
    variant="secondary"
    isError={topUp.refusal !== undefined}
    onValueChange={on?.changeTopUpAmount}
  />
  <Text size="xs" tone="muted">{topUp.hint}</Text>
  <CoreButton
    variant="primary"
    isPending={topUp.pending}
    onPress={on?.submitTopUp}
  >{topUp.submitLabel}</CoreButton>{topUp.refusal === undefined ? undefined : <Text size="sm" tone="muted" live="assertive">{topUp.refusal ?? ""}</Text>}</div> : <div>


  <Text size="sm">{topUp.checkout?.reference ?? ""}</Text>
  <Text size="sm" weight="semibold">{topUp.checkout?.amount ?? ""}</Text>
  <Text size="xs" tone="muted">{topUp.checkout?.note ?? ""}</Text></div>;
type ResultContentProps = {
  readonly result: PaymentResultView;
  readonly on?: WalletControlCenterActions;
};
const ResultContent = ({
  result,
  on
}: ResultContentProps) => <div>
  <Badge tone={result.tone}>{result.state}</Badge>
  <Heading level={2}>{result.amount}</Heading>{result.reference === undefined ? undefined : <Text size="sm" tone="muted">{result.reference ?? ""}</Text>}
  <Text size="sm" tone="muted">{result.note}</Text>
  <CoreButton
    variant="primary"
    onPress={on?.closeResult}
  >{result.actionLabel}</CoreButton></div>;

/** Pure drawing half of the accepted wallet and payment flow. */
const WalletControlCenterContent = (view: WalletControlCenterViewProps) => {
  const {
    title,
    balance,
    transactions,
    invoices,
    topUp,
    result,
    on
  } = view;
  const balanceSection = () => {
    if (balance.phase === "refused") return noteSection(balance.label, balance.note);
    const loading = balance.phase === "resting";
    const facts = loading ? RESTING_FACTS : balance.facts;
    return <SurfaceCard
      label={balance.label}
    ><div>{<div>{facts.map(row => factRow(row, loading))}</div>}{<div>{[<Button key="item-0" variant="primary" isSkeleton={loading} onPress={on?.topUp}>{balance.actionLabel}</Button>]}</div>}</div></SurfaceCard>;
  };
  const ledgerSection = (ledger: LedgerSectionView, action?: () => void) => {
    if (ledger.phase === "empty" || ledger.phase === "refused") return noteSection(ledger.label, ledger.note);
    const content = walletLedgerContent(ledger, topUp.closeLabel);
    const actionLabel = ledger.phase === "answered" ? ledger.actionLabel : undefined;
    const isLoading = ledger.phase === "resting";
    return <SurfaceListCard
      label={ledger.label}
      footer={actionLabel !== undefined && (isLoading || action !== undefined) ? <Button variant="primary" size="sm" isSkeleton={isLoading} onPress={action}>{actionLabel}</Button> : undefined}
      isLoading={isLoading}
    >{content}</SurfaceListCard>;
  };
  const linkedInvoiceSection = (linkedInvoice: LinkedInvoiceSectionView) => {
    if (linkedInvoice.phase === "refused") return noteSection(linkedInvoice.label, linkedInvoice.note);
    const loading = linkedInvoice.phase === "resting";
    const row = linkedInvoice.phase === "answered" ? linkedInvoice.row : undefined;
    const linkedContent = <div><div>

        <Text size="sm" weight="semibold" isSkeleton={loading}>{row?.title ?? linkedInvoice.orderLabel}</Text>
        <Text size="xs" tone="muted" isSkeleton={loading}>{row?.caption ?? ""}</Text></div>

      <Badge tone={row?.tone ?? "neutral"} isSkeleton={loading}>{row?.state ?? ""}</Badge>
      <Heading level={2}>{row?.amount ?? ""}</Heading>
      <Text size="xs" tone="muted" isSkeleton={loading}>{linkedInvoice.orderLabel}</Text>
      <Text size="sm" tone="muted" isSkeleton={loading}>{linkedInvoice.phase === "answered" ? linkedInvoice.consequence : ""}</Text>{linkedInvoice.phase === "answered" ? <CoreButton
        variant="primary"
        isDisabled={linkedInvoice.actionDisabled}
        onPress={linkedInvoice.actionKind === "return" ? on?.returnToOrder : on?.payInvoice}
      >{linkedInvoice.actionLabel}</CoreButton> : undefined}</div>;
    return <div>{sectionLabel(linkedInvoice.label)}{<SurfaceCard isHighlight state={loading ? "pending" : "neutral"}>{linkedContent}</SurfaceCard>}</div>;
  };
  const breadcrumb = view.state === "waypoint" ? view.breadcrumb : undefined;
  const path = breadcrumb === undefined ? undefined : <Breadcrumbs props={{
    mode: "back",
    label: breadcrumb.label,
    backLabel: breadcrumb.backLabel
  }} on={{
    back: on?.openOrder
  }} />;
  const ordinarySections = [balanceSection(), ledgerSection(transactions), ledgerSection(invoices, on?.payInvoice)];
  const page = view.state === "ordinary" ? <div>{sectionLabel(title)}{ordinarySections}</div> : <div>{path}{sectionLabel(title)}<>{balanceSection()}{linkedInvoiceSection(view.linkedInvoice)}{ledgerSection(transactions)}{ledgerSection(invoices, on?.payInvoice)}</></div>;
  return <>
        {page}
        <ModalBranch isOpen={topUp.overlayState === "open"} title={topUp.title} closeLabel={topUp.closeLabel} content={TopUpContent} contentProps={{
      topUp,
      on
    }} onDismiss={() => on?.closeTopUp?.()} />
        <ModalBranch isOpen={result.overlayState === "open"} title={result.title} closeLabel={result.closeLabel} content={ResultContent} contentProps={{
      result,
      on
    }} onDismiss={() => on?.closeResult?.()} />
    </>;
};

/** Stable typed root for the wallet control-center block. */
export const WalletControlCenterBase = (props: WalletControlCenterProps) => <WalletControlCenterContent {...props} />;

