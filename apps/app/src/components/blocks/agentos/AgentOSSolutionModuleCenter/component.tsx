import { ChoiceTabs, nivoIconSource, StatusActionCard } from "@nivo/ui";
import { EmptyNotice, Icon, SurfaceCard, Text, type BadgeTone } from "@starci/grammar/common";

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
};
const loadingCards: ReadonlyArray<AgentOSSolutionModuleCard> = ["module-loading-1", "module-loading-2"].map(id => ({
  id,
  title: "",
  description: "",
  statusLabel: "",
  statusTone: "neutral",
  actionLabel: ""
}));

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
        actionStartContent={<Icon source={nivoIconSource("retry", "chip")} role="chip" />}
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

/** Stable typed root for the module-center block. */
export const AgentOSSolutionModuleCenterBase = (props: AgentOSSolutionModuleCenterProps) => <AgentOSSolutionModuleCenterContent {...props} />;

