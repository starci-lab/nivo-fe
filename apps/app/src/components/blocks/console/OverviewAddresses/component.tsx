import { EmptyNotice, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import {
  OVERVIEW_ADDRESSES_CELL_CLASS_NAME,
  OVERVIEW_ADDRESSES_ROWS_CLASS_NAME,
  OVERVIEW_ADDRESSES_ROW_CLASS_NAME
} from "./classNames";

/** One exact domain fact displayed in the addresses collection. */
export type OverviewAddressesFact = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};
/** Independently settled domain evidence, the same four settled phases the domain read carries. */
export type OverviewAddressesState = {
  readonly phase: "pending";
} | {
  readonly phase: "populated";
  readonly facts: ReadonlyArray<OverviewAddressesFact>;
} | {
  readonly phase: "empty" | "failed";
  readonly message: string;
};
/** Pure addresses input: the domains that back the services, stating their own absence. */
export type OverviewAddressesProps = {
  readonly label: string;
  readonly state: OverviewAddressesState;
};
const PENDING_ROWS: ReadonlyArray<OverviewAddressesFact> = [
  { id: "pending-1", label: "", value: "" },
  { id: "pending-2", label: "", value: "" }
];
const row = (item: OverviewAddressesFact, isSkeleton: boolean) => <div
  key={item.id}
  className={OVERVIEW_ADDRESSES_ROW_CLASS_NAME}
  data-contract="GAP-3 PADDING-4 PADDING-3"
  data-row="true"
>
  <div className={OVERVIEW_ADDRESSES_CELL_CLASS_NAME} data-contract="FLOW-3" data-cell="label">
    <Text size="sm" isSkeleton={isSkeleton}>{item.label}</Text>
  </div>
  <div className={OVERVIEW_ADDRESSES_CELL_CLASS_NAME} data-contract="FLOW-3" data-cell="value">
    <Text size="sm" isSkeleton={isSkeleton}>{item.value}</Text>
  </div>
</div>;

/** Draw the domains that back the services, stating their own absence rather than disappearing. */
export const OverviewAddressesBase = (props: OverviewAddressesProps) => {
  const { label, state }: OverviewAddressesProps = props;
  if (state.phase === "populated" || state.phase === "pending") {
    const isLoading = state.phase === "pending";
    const facts = isLoading ? PENDING_ROWS : state.facts;
    return <SurfaceListCard label={label} isLoading={isLoading}>
      <div className={OVERVIEW_ADDRESSES_ROWS_CLASS_NAME} data-contract="BOUNDARY-3" data-overview-addresses-rows="true">
        {facts.map(item => row(item, isLoading))}
      </div>
    </SurfaceListCard>;
  }
  return <SurfaceCard label={label}>
    <EmptyNotice message={state.message} />
  </SurfaceCard>;
};

/** Registry identity for the pure overview addresses twin. */
