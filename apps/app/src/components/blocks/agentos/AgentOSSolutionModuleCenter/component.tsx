import { ChoiceTabs, nivoIconSource, StatusActionCard } from "@nivo/ui";
import { Badge, Button, EmptyNotice, Icon, SurfaceCard, SurfaceListCard, Text, TextAction, type BadgeTone } from "@starci/grammar/common";
import {
  SOLUTION_CATALOG_GRID_CLASS_NAME,
  SOLUTION_LEDGER_COPY_CLASS_NAME,
  SOLUTION_LEDGER_ROW_CLASS_NAME,
  SOLUTION_LEDGER_ROWS_CLASS_NAME,
  SOLUTION_LEDGER_TRAILING_CLASS_NAME
} from "./classNames";

/** One resolved catalog or installation card visible in the module center. */
export type AgentOSSolutionModuleCenterProps = AgentOSSolutionModuleCenterViewProps;
/** Public API role for AgentOSSolutionModuleCard. */
export type AgentOSSolutionModuleCard = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly statusTone: BadgeTone;
  readonly detail?: string;
  readonly actionLabel: string;
  readonly disabled?: boolean;
  readonly actionHref?: string;
};

/** One installed solution prepared as a ledger row whose name and action lead to its workspace. */
export type AgentOSSolutionLedgerRow = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly kind: string;
  readonly status: string;
  readonly statusTone: BadgeTone;
  readonly action: string;
  readonly href: string;
};

/** Closed pure state for the solution-module catalog and installation fleet. */
export type AgentOSSolutionModuleCenterViewProps = {
  readonly state: "resting" | "refused" | "answered";
  readonly mode: "catalog" | "installed";
  readonly sectionLabel: string;
  readonly modesLabel: string;
  readonly modes: ReadonlyArray<{
    readonly id: "catalog" | "installed";
    readonly label: string;
  }>;
  readonly refusedLabel: string;
  readonly emptyLabel: string;
  readonly emptyActionLabel: string;
  readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>;
  readonly pendingId?: string;
  readonly outcome?: string;
  readonly onSelectMode: (mode: "catalog" | "installed") => void;
  readonly onPressCard: (id: string) => void;
  /** `ledger` lists the installed solutions above the catalogue on one surface; `tabs` keeps the mode switch. */
  readonly layout?: "tabs" | "ledger";
  readonly installedLabel?: string;
  readonly catalogLabel?: string;
  readonly installedRows?: ReadonlyArray<AgentOSSolutionLedgerRow>;
};
const loadingCards: ReadonlyArray<AgentOSSolutionModuleCard> = ["module-loading-1", "module-loading-2"].map(id => ({
  id,
  title: "",
  description: "",
  statusLabel: "",
  statusTone: "neutral",
  actionLabel: ""
}));
const restingRows: ReadonlyArray<AgentOSSolutionLedgerRow> = ["installed-loading-1", "installed-loading-2"].map(id => ({
  id,
  name: "",
  detail: "",
  kind: "",
  status: "",
  statusTone: "neutral",
  action: "",
  href: "#"
}));

const ledgerRow = (row: AgentOSSolutionLedgerRow, loading: boolean) => <div key={row.id} className={SOLUTION_LEDGER_ROW_CLASS_NAME} data-contract="GAP-3 PADDING-4 PADDING-3">
  <div className={SOLUTION_LEDGER_COPY_CLASS_NAME} data-contract="GAP-1">
    <TextAction size="sm" isSkeleton={loading} href={row.href}>{row.name}</TextAction>
    <Text size="xs" tone="muted" isSkeleton={loading}>{row.detail}</Text>
  </div>
  <div className={SOLUTION_LEDGER_TRAILING_CLASS_NAME} data-contract="GAP-2">
    <Badge tone="neutral" isSkeleton={loading}>{row.kind}</Badge>
    <Badge tone={row.statusTone} isSkeleton={loading}>{row.status}</Badge>
    <Button variant="secondary" size="sm" isSkeleton={loading} href={row.href}>{row.action}</Button>
  </div>
</div>;

const catalogGrid = (cards: ReadonlyArray<AgentOSSolutionModuleCard>, loading: boolean, pendingId: string | undefined, onPressCard: (id: string) => void) => <div className={SOLUTION_CATALOG_GRID_CLASS_NAME} data-contract="GAP-4">{(loading ? loadingCards : cards).map(card => <StatusActionCard key={card.id} props={{
  ...card,
  isPending: pendingId === card.id,
  disabled: card.disabled === true || pendingId !== undefined,
  actionTarget: card.actionHref === undefined ? undefined : "_self"
}} on={{
  press: () => onPressCard(card.id)
}} isLoading={loading} />)}</div>;

/** The ledger form: installed solutions listed first, the catalogue beneath, no mode switch and no second accent. */
const AgentOSSolutionModuleLedger = ({
  state,
  refusedLabel,
  emptyLabel,
  cards,
  pendingId,
  outcome,
  onPressCard,
  installedLabel = "",
  catalogLabel = "",
  installedRows = []
}: AgentOSSolutionModuleCenterViewProps) => {
  const installed = () => {
    if (state === "refused") return <SurfaceCard label={installedLabel}><EmptyNotice message={refusedLabel} /></SurfaceCard>;
    if (state === "answered" && installedRows.length === 0) return <SurfaceCard label={installedLabel}><EmptyNotice message={emptyLabel} /></SurfaceCard>;
    const loading = state === "resting";
    return <SurfaceListCard label={installedLabel} isLoading={loading}>
      <div className={SOLUTION_LEDGER_ROWS_CLASS_NAME} data-contract="BOUNDARY-3">{(loading ? restingRows : installedRows).map(row => ledgerRow(row, loading))}</div>
    </SurfaceListCard>;
  };
  return <>
    {installed()}
    <SurfaceCard label={catalogLabel}>{state === "refused" ? <EmptyNotice message={refusedLabel} /> : catalogGrid(cards, state === "resting", pendingId, onPressCard)}</SurfaceCard>
    {outcome === undefined ? null : <Text size="sm" tone="muted" live="polite">{outcome}</Text>}
  </>;
};

/** Render the selected solution mode from already-resolved card projections. */
const AgentOSSolutionModuleCenterContent = ({
  state,
  mode,
  sectionLabel,
  modesLabel,
  modes,
  refusedLabel,
  emptyLabel,
  emptyActionLabel,
  cards,
  pendingId,
  outcome,
  onSelectMode,
  onPressCard
}: AgentOSSolutionModuleCenterViewProps) => {
  // The three situations under the tabs, read in order: a refusal, an answer with nothing in it,
  // and otherwise the grid - which draws the resting placeholders when the answer has not landed.
  const body = () => {
    if (state === "refused") {
      return <SurfaceCard
        label={sectionLabel}
      ><div>


            <Text size="sm" tone="muted">{refusedLabel}</Text></div></SurfaceCard>;
    }
    if (state === "answered" && cards.length === 0) {
      return <EmptyNotice
        message={emptyLabel}
        actionLabel={emptyActionLabel}
        actionStartContent={<Icon source={nivoIconSource("retry", "chip")} usage="chip" />}
        onAction={() => onSelectMode("catalog")}
      />;
    }
    return <SurfaceCard
      label={sectionLabel}
      frame="frameless"
    ><div>{(state === "resting" ? loadingCards : cards).map(card => <StatusActionCard key={card.id} props={{
          ...card,
          isPending: pendingId === card.id,
          disabled: card.disabled === true || pendingId !== undefined,
          actionTarget: card.actionHref === undefined ? undefined : "_self"
        }} on={{
          press: () => onPressCard(card.id)
        }} isLoading={state === "resting"} />)}</div></SurfaceCard>;
  };
  return <>
            <ChoiceTabs props={{
      label: modesLabel,
      selectedKey: mode,
      tabs: modes
    }} on={{
      select: key => onSelectMode(key as "catalog" | "installed")
    }} />
            {body()}
            {outcome === undefined ? null : <Text size="sm" tone="muted" live="polite">{outcome}</Text>}
        </>;
};

/** Stable typed root for the module-center block: the tabs form by default, the ledger form on the module route. */
export const AgentOSSolutionModuleCenterBase = (props: AgentOSSolutionModuleCenterProps) => props.layout === "ledger" ? <AgentOSSolutionModuleLedger {...props} /> : <AgentOSSolutionModuleCenterContent {...props} />;
