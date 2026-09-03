import { Badge, Button, EmptyNotice, SurfaceCard, SurfaceListCard, Text, TextAction } from "@starci/grammar/common";
import {
  MODULE_LEDGER_COPY_CLASS_NAME,
  MODULE_LEDGER_ROW_CLASS_NAME,
  MODULE_LEDGER_ROWS_CLASS_NAME,
  MODULE_LEDGER_TRAILING_CLASS_NAME
} from "./classNames";

/** One custom-module identity prepared for the ledger. */
export type AgentOSCustomModuleCollectionProps = AgentOSCustomModuleCollectionViewProps;
/** Public API role for CustomModuleCollectionRow. */
export type CustomModuleCollectionRow = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly kind: string;
  readonly status: string;
  readonly active: boolean;
  readonly action: string;
  readonly href: string;
};

/** Settled collection state and the exact destinations of the pure block. */
export type AgentOSCustomModuleCollectionViewProps = {
  readonly state: "loading" | "refused" | "empty" | "ready";
  readonly title: string;
  readonly refused: string;
  readonly empty: string;
  readonly rows: ReadonlyArray<CustomModuleCollectionRow>;
};

/** Three skeleton rows keep the resolved list's shape while the read is unresolved. */
const restingRows = (title: string): ReadonlyArray<CustomModuleCollectionRow> => [0, 1, 2].map(index => ({
  id: `loading-${index}`,
  name: title,
  detail: "",
  kind: "",
  status: "",
  active: false,
  action: "",
  href: "#"
}));

const rowView = (row: CustomModuleCollectionRow, loading: boolean) => <div key={row.id} className={MODULE_LEDGER_ROW_CLASS_NAME} data-contract="GAP-3 PADDING-4 PADDING-3">
  <div className={MODULE_LEDGER_COPY_CLASS_NAME} data-contract="GAP-1">
    <TextAction size="sm" isSkeleton={loading} href={row.href}>{row.name}</TextAction>
    <Text size="xs" tone="muted" isSkeleton={loading}>{row.detail}</Text>
  </div>
  <div className={MODULE_LEDGER_TRAILING_CLASS_NAME} data-contract="GAP-2">
    <Badge tone="neutral" isSkeleton={loading}>{row.kind}</Badge>
    <Badge tone={row.active ? "success" : "warning"} isSkeleton={loading}>{row.status}</Badge>
    <Button variant="secondary" size="sm" isSkeleton={loading} href={row.href}>{row.action}</Button>
  </div>
</div>;

/** Draw custom drafts and active modules as ledger rows, with local refusal and empty states. */
export const AgentOSCustomModuleCollectionBase = (props: AgentOSCustomModuleCollectionProps) => {
  const {
    state,
    title,
    refused,
    empty,
    rows
  }: AgentOSCustomModuleCollectionViewProps = props;
  if (state === "refused") return <SurfaceCard label={title}><EmptyNotice message={refused} /></SurfaceCard>;
  if (state === "empty") return <SurfaceCard label={title}><EmptyNotice message={empty} /></SurfaceCard>;
  const loading = state === "loading";
  const shown = loading ? restingRows(title) : rows;
  return <SurfaceListCard label={title} isLoading={loading}>
    <div className={MODULE_LEDGER_ROWS_CLASS_NAME} data-contract="BOUNDARY-3">{shown.map(row => rowView(row, loading))}</div>
  </SurfaceListCard>;
};
