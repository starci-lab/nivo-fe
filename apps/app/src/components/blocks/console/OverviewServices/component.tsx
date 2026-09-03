import { Badge, Button, SurfaceListCard, Text, TextAction, type BadgeTone } from "@starci/grammar/common";
import {
  OVERVIEW_SERVICES_COPY_CLASS_NAME,
  OVERVIEW_SERVICES_END_CLASS_NAME,
  OVERVIEW_SERVICES_ROW_CLASS_NAME,
  OVERVIEW_SERVICES_ROWS_CLASS_NAME
} from "./classNames";

/** One owned service, closing on its own onward action. */
export type OverviewServicesRow = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly statusLabel: string;
  readonly statusTone: BadgeTone;
  readonly actionLabel: string;
  readonly isDisabled?: boolean;
  readonly onOpen: () => void;
  /** Unresolved carrier: the same row shape at rest, each leaf shown loading. */
  readonly isSkeleton?: boolean;
};
/** Resolved service rows and the card's own label and fact. */
export type OverviewServicesProps = {
  readonly label: string;
  readonly fact?: string;
  readonly isLoading?: boolean;
  readonly rows: ReadonlyArray<OverviewServicesRow>;
};
const row = (item: OverviewServicesRow) => <div
  key={item.id}
  className={OVERVIEW_SERVICES_ROW_CLASS_NAME}
  data-contract="GAP-3 PADDING-4 PADDING-3"
  data-row="true"
>
  <div className={OVERVIEW_SERVICES_COPY_CLASS_NAME} data-contract="GAP-1 FLOW-3" data-copy="true">
    <TextAction size="sm" onPress={item.onOpen} isSkeleton={item.isSkeleton}>{item.name}</TextAction>
    <Text size="xs" tone="muted" isSkeleton={item.isSkeleton}>{item.detail}</Text>
  </div>
  <div className={OVERVIEW_SERVICES_END_CLASS_NAME} data-contract="GAP-3" data-end="true">
    <Badge tone={item.statusTone} isSkeleton={item.isSkeleton}>{item.statusLabel}</Badge>
    <Button size="sm" onPress={item.onOpen} isDisabled={item.isDisabled} isSkeleton={item.isSkeleton}>{item.actionLabel}</Button>
  </div>
</div>;

/** Draw the things this account runs, one row each, every row closing on its own onward action. */
export const OverviewServicesBase = (props: OverviewServicesProps) => {
  const { label, fact, rows, isLoading }: OverviewServicesProps = props;
  return <SurfaceListCard label={label} fact={fact} isLoading={isLoading}>
    <div className={OVERVIEW_SERVICES_ROWS_CLASS_NAME} data-contract="BOUNDARY-3" data-overview-services-rows="true">
      {rows.map(row)}
    </div>
  </SurfaceListCard>;
};

/** Registry identity for the pure overview services twin. */
