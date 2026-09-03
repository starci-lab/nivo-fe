import { Badge, SurfaceCard, Text } from "@starci/grammar/common";
import { OVERVIEW_SIGNALS_BAND_CLASS_NAME, OVERVIEW_SIGNALS_CELL_CLASS_NAME } from "./classNames";

/** One independently settled account signal, read before any detail. */
export type OverviewSignalsCell = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly status: string;
  readonly emphasis?: "default" | "accent";
  readonly badgeTone?: "warning" | "danger";
  /** Unresolved carrier: the same tree at rest, each leaf shown loading. */
  readonly isSkeleton?: boolean;
};
/** Resolved signal cells and the card's own label and fact. */
export type OverviewSignalsProps = {
  readonly label: string;
  readonly fact?: string;
  readonly cells: ReadonlyArray<OverviewSignalsCell>;
};
const status = (cell: OverviewSignalsCell) => cell.badgeTone === undefined
  ? <Text size="xs" tone="muted" isSkeleton={cell.isSkeleton}>{cell.status}</Text>
  : <Badge tone={cell.badgeTone} isSkeleton={cell.isSkeleton}>{cell.status}</Badge>;

/** Draw the account's four answers as one full-measure band of peer cells. */
export const OverviewSignalsBase = (props: OverviewSignalsProps) => {
  const { label, fact, cells }: OverviewSignalsProps = props;
  return <SurfaceCard label={label} fact={fact} composition="joined">
    <div
      className={OVERVIEW_SIGNALS_BAND_CLASS_NAME}
      data-contract="BOUNDARY-1 BOUNDARY-3 BOUNDARY-4"
      data-overview-signals-band="true"
    >
      {cells.map(cell => <div
        key={cell.id}
        className={OVERVIEW_SIGNALS_CELL_CLASS_NAME}
        data-contract="GAP-2 PADDING-4 PADDING-3 FLOW-3"
        data-cell="true"
      >
        <Text size="xs" tone="muted" isSkeleton={cell.isSkeleton}>{cell.label}</Text>
        <Text size="md" weight="semibold" tone={cell.emphasis ?? "default"} isSkeleton={cell.isSkeleton}>{cell.value}</Text>
        {status(cell)}
      </div>)}
    </div>
  </SurfaceCard>;
};

/** Registry identity for the pure overview signals twin. */
