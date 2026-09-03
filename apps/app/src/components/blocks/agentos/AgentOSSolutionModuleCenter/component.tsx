import { useCallback, useRef } from "react";
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

/** What one ledger section holds: nothing yet, a refused read, resting content, or rows. */
export type AgentOSSolutionLedgerSectionState = "resting" | "refused" | "empty" | "ready";

/** Everything the ledger form draws: its own section props plus the catalogue projection it shares with the tabs form. */
type AgentOSSolutionModuleLedgerViewProps = {
  readonly ledger: AgentOSSolutionModuleLedgerProps;
  readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>;
  readonly pendingId?: string;
  readonly outcome?: string;
  readonly onPressCard: (id: string) => void;
};

/** The ledger form's own copy, per-section state and recovery, kept apart from the tabs form. */
export type AgentOSSolutionModuleLedgerProps = {
  readonly installedLabel: string;
  readonly catalogLabel: string;
  readonly installedState: AgentOSSolutionLedgerSectionState;
  readonly catalogueState: AgentOSSolutionLedgerSectionState;
  readonly installedRows: ReadonlyArray<AgentOSSolutionLedgerRow>;
  readonly installedEmptyTitle: string;
  readonly installedEmpty: string;
  readonly installedRefusedTitle: string;
  readonly installedRefused: string;
  readonly catalogueEmptyTitle: string;
  readonly catalogueEmpty: string;
  readonly catalogueRefusedTitle: string;
  readonly catalogueRefused: string;
  readonly retry: string;
  /** The action that ends the installed section’s own emptiness: it moves the reader to the catalogue beneath. */
  readonly installedEmptyAction: string;
  readonly retryingInstalled: boolean;
  readonly retryingCatalogue: boolean;
  readonly onRetryInstalled: () => void;
  readonly onRetryCatalogue: () => void;
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
  /** `ledger` lists installed solutions above the catalogue on one surface; the default keeps the mode switch. */
  readonly layout?: "tabs" | "ledger";
  readonly ledger?: AgentOSSolutionModuleLedgerProps;
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

/** One refused section: what failed, what remains, and the retry that re-reads this section alone. */
const refusal = (label: string, title: string, description: string, retry: string, pending: boolean, onRetry: () => void) => <SurfaceCard label={label}>
  <EmptyNotice
    message={title}
    description={description}
    actionLabel={retry}
    actionVariant="secondary"
    isActionPending={pending}
    onAction={onRetry}
  />
</SurfaceCard>;

/** The ledger form: installed solutions listed first, the catalogue beneath, every state stated in place. */
const AgentOSSolutionModuleLedger = ({
  ledger,
  cards,
  pendingId,
  outcome,
  onPressCard
}: AgentOSSolutionModuleLedgerViewProps) => {
  const installed = () => {
    if (ledger.installedState === "refused") return refusal(ledger.installedLabel, ledger.installedRefusedTitle, ledger.installedRefused, ledger.retry, ledger.retryingInstalled, ledger.onRetryInstalled);
    if (ledger.installedState === "empty") return <SurfaceCard label={ledger.installedLabel}>
      <EmptyNotice
        message={ledger.installedEmptyTitle}
        description={ledger.installedEmpty}
        actionLabel={ledger.installedEmptyAction}
        actionVariant="secondary"
        onAction={browseCatalogue}
      />
    </SurfaceCard>;
    const loading = ledger.installedState === "resting";
    return <SurfaceListCard label={ledger.installedLabel} isLoading={loading}>
      <div className={SOLUTION_LEDGER_ROWS_CLASS_NAME} data-contract="BOUNDARY-3">{(loading ? restingRows : ledger.installedRows).map(row => ledgerRow(row, loading))}</div>
    </SurfaceListCard>;
  };
  const catalogueRef = useRef<HTMLDivElement>(null);
  // The installed notice sends the reader to the catalogue rather than to another page: the region
  // marker below is the only node this adds, and it carries no presentation of its own.
  const browseCatalogue = useCallback(() => {
    const node = catalogueRef.current;
    if (node === null) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    node.focus();
  }, []);
  const catalogue = () => {
    if (ledger.catalogueState === "refused") return refusal(ledger.catalogLabel, ledger.catalogueRefusedTitle, ledger.catalogueRefused, ledger.retry, ledger.retryingCatalogue, ledger.onRetryCatalogue);
    if (ledger.catalogueState === "empty") return <SurfaceCard label={ledger.catalogLabel}>
      <EmptyNotice message={ledger.catalogueEmptyTitle} description={ledger.catalogueEmpty} />
    </SurfaceCard>;
    return <SurfaceCard label={ledger.catalogLabel}>{catalogGrid(cards, ledger.catalogueState === "resting", pendingId, onPressCard)}</SurfaceCard>;
  };
  return <>
    {installed()}
    <div ref={catalogueRef} tabIndex={-1} data-region="module-catalogue">{catalogue()}</div>
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

/** Stable typed root for the module-center block: the tabs form by default, the ledger on the module route. */
export const AgentOSSolutionModuleCenterBase = (props: AgentOSSolutionModuleCenterProps) => props.layout === "ledger" && props.ledger !== undefined
  ? <AgentOSSolutionModuleLedger ledger={props.ledger} cards={props.cards} pendingId={props.pendingId} outcome={props.outcome} onPressCard={props.onPressCard} />
  : <AgentOSSolutionModuleCenterContent {...props} />;
