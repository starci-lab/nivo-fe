"use client";
import { Button, Icon } from "@starci/grammar/common";

import { ChoiceTabs, CollapsibleRail, SelectionList, type SelectionListGroup, nivoIconSource } from "@nivo/ui";

/** One collaborative Execute conversation listed outside the private Setup session. */
export type ExecuteSession = {
  readonly id: string;
  readonly title: string;
  readonly updatedLabel: string;
  readonly status: "active" | "archived";
};

/** Session navigation commands owned by the responsive rail adapter. */
export type ExecuteSessionRailBlockProps = {
  readonly sessions: ReadonlyArray<ExecuteSession>;
  readonly selectedId: string | null;
  readonly pending?: boolean;
  readonly onSelect: (sessionId: string) => void;
  readonly onCreate: () => void;
};
type SessionSelectionProps = {
  readonly sessions: ReadonlyArray<ExecuteSession>;
  readonly selectedId: string | null;
  readonly onSelect: (sessionId: string) => void;
  readonly presentation: "expanded" | "compact";
};
const groupsFor = (sessions: ReadonlyArray<ExecuteSession>): ReadonlyArray<SelectionListGroup> => [{
  id: "execute-sessions",
  items: sessions.map(session => ({
    id: session.id,
    label: session.title,
    icon: "agentos" as const,
    status: session.status === "archived" ? "Archived" : session.updatedLabel
  }))
}];
const SessionSelection = ({
  sessions,
  selectedId,
  presentation,
  onSelect
}: SessionSelectionProps) => <SelectionList props={{
  label: "Execute sessions",
  selectedKey: selectedId ?? "",
  presentation,
  groups: groupsFor(sessions)
}} on={{
  activate: onSelect
}} />;
const SessionRailBody = (props: ExecuteSessionRailBlockProps) => <div>

  <SessionSelection {...props} presentation="expanded" />

  <Button
    variant="primary"
    isPending={props.pending}
    onPress={props.onCreate}
  >New session</Button></div>;
const SessionRailToggle = () => <Icon source={nivoIconSource("sidebar", "leading")} usage="leading" />;

/** Navigate multiple Execute conversations through one selected identity at every breakpoint. */
export const ExecuteSessionRailBlock = (props: ExecuteSessionRailBlockProps) => {
  const {
    sessions,
    selectedId,
    pending,
    onSelect,
    onCreate
  }: ExecuteSessionRailBlockProps = props;
  const railProps = {
    sessions,
    selectedId,
    pending,
    onSelect,
    onCreate
  };
  return <div><div>



      <ChoiceTabs props={{
        label: "Execute sessions",
        selectedKey: selectedId ?? "",
        tabs: sessions.map(session => ({
          id: session.id,
          label: session.title
        }))
      }} on={{
        select: onSelect
      }} />



      <Button
        variant="secondary"
        isPending={pending}
        onPress={onCreate}
      >New session</Button></div>



    <CollapsibleRail ariaLabel="Execute sessions" title="Sessions" rail={SessionRailBody} railProps={railProps} collapsedRail={SessionSelection} collapsedRailProps={{
      ...railProps,
      presentation: "compact"
    }} toggleControl={SessionRailToggle} toggleControlProps={{}} collapseLabel="Collapse session rail" expandLabel="Expand session rail" storageKey="nivo:agentos:execute-sessions" /></div>;
};
