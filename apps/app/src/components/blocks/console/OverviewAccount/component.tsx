import { nivoIconSource } from "@nivo/ui";
import { Badge, Button, Icon, SurfaceCard, Text, TextAction, type BadgeTone, type PresentationState } from "@starci/grammar/common";
import {
  OVERVIEW_ACCOUNT_COPY_CLASS_NAME,
  OVERVIEW_ACCOUNT_END_CLASS_NAME,
  OVERVIEW_ACCOUNT_FACTS_CLASS_NAME,
  OVERVIEW_ACCOUNT_FACT_CELL_CLASS_NAME,
  OVERVIEW_ACCOUNT_ROWS_CLASS_NAME,
  OVERVIEW_ACCOUNT_ROW_CLASS_NAME
} from "./classNames";

/** One account fact: a value bound to its own label. */
export type OverviewAccountFact = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  /** Unresolved carrier: the same tree at rest, each leaf shown loading. */
  readonly isSkeleton?: boolean;
};
/** The one invoice that owes the account's own next step. */
export type OverviewAccountInvoiceRow = {
  readonly name: string;
  readonly detail: string;
  readonly statusLabel: string;
  readonly badgeTone: BadgeTone;
  readonly actionLabel: string;
  readonly onTopUp: () => void;
  readonly isSkeleton?: boolean;
};
/** Resolved account facts, its one invoice row, and its legal commands. */
export type OverviewAccountProps = {
  readonly label: string;
  readonly actionLabel?: string;
  readonly onOpenWallet?: () => void;
  readonly isHighlight?: boolean;
  readonly state?: PresentationState;
  readonly facts: ReadonlyArray<OverviewAccountFact>;
  readonly invoiceRow?: OverviewAccountInvoiceRow;
};

/** Draw money held and owed as a two-cell band, closing on the one invoice row that owes the next step. */
export const OverviewAccountBase = (props: OverviewAccountProps) => {
  const { label, actionLabel, onOpenWallet, isHighlight, state, facts, invoiceRow }: OverviewAccountProps = props;
  return <SurfaceCard
    label={label}
    composition="joined"
    state={state}
    isHighlight={isHighlight}
    labelEnd={actionLabel === undefined || onOpenWallet === undefined ? undefined : <TextAction appearance="disclosure" size="sm" endContent={<Icon source={nivoIconSource("next")} />} onPress={onOpenWallet}>{actionLabel}</TextAction>}
  >
    <div
      className={OVERVIEW_ACCOUNT_FACTS_CLASS_NAME}
      data-contract="BOUNDARY-1 BOUNDARY-4"
      data-overview-account-facts="true"
    >
      {facts.map(item => <div
        key={item.id}
        className={OVERVIEW_ACCOUNT_FACT_CELL_CLASS_NAME}
        data-contract="GAP-1 PADDING-4 PADDING-3"
        data-cell="true"
      >
        <Text size="xs" tone="muted" isSkeleton={item.isSkeleton}>{item.label}</Text>
        <Text size="sm" weight="semibold" isSkeleton={item.isSkeleton}>{item.value}</Text>
      </div>)}
    </div>
    {invoiceRow === undefined ? null : <div
      className={OVERVIEW_ACCOUNT_ROWS_CLASS_NAME}
      data-contract="BOUNDARY-1 BOUNDARY-3"
      data-overview-account-rows="true"
    >
      <div className={OVERVIEW_ACCOUNT_ROW_CLASS_NAME} data-contract="GAP-3 PADDING-4 PADDING-3" data-row="true">
        <div className={OVERVIEW_ACCOUNT_COPY_CLASS_NAME} data-contract="GAP-1 FLOW-3" data-copy="true">
          <Text size="sm" weight="medium" isSkeleton={invoiceRow.isSkeleton}>{invoiceRow.name}</Text>
          <Text size="xs" tone="muted" isSkeleton={invoiceRow.isSkeleton}>{invoiceRow.detail}</Text>
        </div>
        <div className={OVERVIEW_ACCOUNT_END_CLASS_NAME} data-contract="GAP-3" data-end="true">
          <Badge tone={invoiceRow.badgeTone} isSkeleton={invoiceRow.isSkeleton}>{invoiceRow.statusLabel}</Badge>
          <Button size="sm" onPress={invoiceRow.onTopUp} isSkeleton={invoiceRow.isSkeleton}>{invoiceRow.actionLabel}</Button>
        </div>
      </div>
    </div>}
  </SurfaceCard>;
};

/** Registry identity for the pure overview account twin. */
