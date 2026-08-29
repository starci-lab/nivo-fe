import { Badge, Breadcrumbs, Button, DrawerBranch, Field, Heading, HighlightCard, ModalBranch, SurfaceCard, SurfaceListCard, Text, type BadgeTone } from "@nivo/ui";

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
  <Text props={{
    content: row.label,
    size: "sm"
  }} isLoading={isLoading} />
  <Text props={{
    content: row.value,
    size: "sm"
  }} isLoading={isLoading} /></div>;
const sectionLabel = (label: string) => <div>
  <Heading props={{
    content: label,
    level: 3
  }} /></div>;
const noteSection = (label: string, note: string) => <SurfaceCard props={{
  label
}}><div>{<Text props={{
      content: note,
      size: "sm",
      tone: "muted"
    }} />}</div></SurfaceCard>;
const ledgerDetail = (row: WalletLedgerRow) => <div><div>{row.detailFacts.map(fact => factRow(fact))}</div>{row.note === undefined ? undefined : <Text props={{
    content: row.note ?? "",
    size: "sm",
    tone: "muted"
  }} />}</div>;
const ledgerRow = (row: WalletLedgerRow | undefined, isLoading: boolean, closeLabel: string) => {
  const LedgerDetailContent = () => row === undefined ? null : ledgerDetail(row);
  return <div><div>

      <Text props={{
        content: row?.title ?? "",
        size: "sm"
      }} isLoading={isLoading} />
      <Text props={{
        content: row?.caption ?? "",
        size: "xs",
        tone: "muted"
      }} isLoading={isLoading} /></div>

    <Badge props={{
      content: row?.state ?? "",
      tone: row?.tone ?? "neutral"
    }} isLoading={isLoading} />
    <Text props={{
      content: row?.amount ?? "",
      size: "sm",
      weight: "semibold"
    }} isLoading={isLoading} />{row === undefined ? undefined : <DrawerBranch triggerLabel={row.detailLabel} title={row.title} closeLabel={closeLabel} content={LedgerDetailContent} contentProps={{}} />}</div>;
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

  <Field props={{
    id: "wallet-top-up-amount",
    name: "amountVnd",
    label: topUp.amountLabel,
    kind: "text",
    placeholder: topUp.amountPlaceholder,
    disabled: topUp.pending,
    isInvalid: topUp.refusal !== undefined
  }} on={{
    change: on?.changeTopUpAmount
  }} />
  <Text props={{
    content: topUp.hint,
    size: "xs",
    tone: "muted"
  }} />
  <Button props={{
    label: topUp.submitLabel,
    variant: "primary",
    isPending: topUp.pending
  }} on={{
    press: on?.submitTopUp
  }} />{topUp.refusal === undefined ? undefined : <Text props={{
    content: topUp.refusal ?? "",
    size: "sm",
    tone: "muted",
    live: "assertive"
  }} />}</div> : <div>


  <Text props={{
    content: topUp.checkout?.reference ?? "",
    size: "sm"
  }} />
  <Text props={{
    content: topUp.checkout?.amount ?? "",
    size: "sm",
    weight: "semibold"
  }} />
  <Text props={{
    content: topUp.checkout?.note ?? "",
    size: "xs",
    tone: "muted"
  }} /></div>;
type ResultContentProps = {
  readonly result: PaymentResultView;
  readonly on?: WalletControlCenterActions;
};
const ResultContent = ({
  result,
  on
}: ResultContentProps) => <div>
  <Badge props={{
    content: result.state,
    tone: result.tone
  }} />
  <Heading props={{
    content: result.amount,
    level: 2
  }} />{result.reference === undefined ? undefined : <Text props={{
    content: result.reference ?? "",
    size: "sm",
    tone: "muted"
  }} />}
  <Text props={{
    content: result.note,
    size: "sm",
    tone: "muted"
  }} />
  <Button props={{
    label: result.actionLabel,
    variant: "primary"
  }} on={{
    press: on?.closeResult
  }} /></div>;

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
    return <SurfaceCard props={{
      label: balance.label
    }} isLoading={loading}><div>{<div>{facts.map(row => factRow(row, loading))}</div>}{<div>{[<Button key="item-0" props={{
            label: balance.actionLabel,
            variant: "primary"
          }} on={{
            press: on?.topUp
          }} isLoading={loading} />]}</div>}</div></SurfaceCard>;
  };
  const ledgerSection = (ledger: LedgerSectionView, action?: () => void) => {
    if (ledger.phase === "empty" || ledger.phase === "refused") return noteSection(ledger.label, ledger.note);
    const content = walletLedgerContent(ledger, topUp.closeLabel);
    return <SurfaceListCard props={{
      label: ledger.label,
      actionLabel: ledger.phase === "answered" ? ledger.actionLabel : undefined
    }} on={{
      act: action
    }} isLoading={ledger.phase === "resting"}>{content}</SurfaceListCard>;
  };
  const linkedInvoiceSection = (linkedInvoice: LinkedInvoiceSectionView) => {
    if (linkedInvoice.phase === "refused") return noteSection(linkedInvoice.label, linkedInvoice.note);
    const loading = linkedInvoice.phase === "resting";
    const row = linkedInvoice.phase === "answered" ? linkedInvoice.row : undefined;
    const linkedContent = <div><div>

        <Text props={{
          content: row?.title ?? linkedInvoice.orderLabel,
          size: "sm",
          weight: "semibold"
        }} isLoading={loading} />
        <Text props={{
          content: row?.caption ?? "",
          size: "xs",
          tone: "muted"
        }} isLoading={loading} /></div>

      <Badge props={{
        content: row?.state ?? "",
        tone: row?.tone ?? "neutral"
      }} isLoading={loading} />
      <Heading props={{
        content: row?.amount ?? "",
        level: 2
      }} />
      <Text props={{
        content: linkedInvoice.orderLabel,
        size: "xs",
        tone: "muted"
      }} isLoading={loading} />
      <Text props={{
        content: linkedInvoice.phase === "answered" ? linkedInvoice.consequence : "",
        size: "sm",
        tone: "muted"
      }} isLoading={loading} />{linkedInvoice.phase === "answered" ? <Button props={{
        label: linkedInvoice.actionLabel,
        variant: "primary",
        disabled: linkedInvoice.actionDisabled
      }} on={{
        press: linkedInvoice.actionKind === "return" ? on?.returnToOrder : on?.payInvoice
      }} /> : undefined}</div>;
    return <div>{sectionLabel(linkedInvoice.label)}{<HighlightCard isLoading={loading}>{linkedContent}</HighlightCard>}</div>;
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

