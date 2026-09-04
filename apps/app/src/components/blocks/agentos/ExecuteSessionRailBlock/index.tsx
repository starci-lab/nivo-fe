"use client";



/** Settled display labels and typed formatters supplied by the page owner. */
export type ExecuteSessionRailBlockCopy = {
  readonly "sessions": {
    readonly "archived": string;
    readonly "collapse": string;
    readonly "expand": string;
    readonly "label": string;
    readonly "new": string;
    readonly "title": string;
  };
};




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
  readonly copy: ExecuteSessionRailBlockCopy;
  readonly sessions: ReadonlyArray<ExecuteSession>;
  readonly selectedId: string | null;
  readonly pending?: boolean;
  readonly onSelect: (sessionId: string) => void;
  readonly onCreate: () => void;
};
type SessionSelectionProps = {
  readonly copy: ExecuteSessionRailBlockCopy;
  readonly sessions: ReadonlyArray<ExecuteSession>;
  readonly selectedId: string | null;
  readonly onSelect: (sessionId: string) => void;
  readonly presentation: "expanded" | "compact";
};
const groupsFor = (sessions: ReadonlyArray<ExecuteSession>, copy: ExecuteSessionRailBlockCopy): ReadonlyArray<SelectionListGroup> => [{
  id: "execute-sessions",
  items: sessions.map(session => ({
    id: session.id,
    label: session.title,
    icon: "agentos" as const,
    status: session.status === "archived" ? copy.sessions.archived : session.updatedLabel
  }))
}];
const SessionSelection = ({ copy,
  sessions,
  selectedId,
  presentation,
  onSelect
}: SessionSelectionProps) => {
  
  return (<SelectionList props={{
  label: copy.sessions.label,
  selectedKey: selectedId ?? "",
  presentation,
  groups: groupsFor(sessions, copy)
}} on={{
  activate: onSelect
}} />);
};
const SessionRailBody = (props: ExecuteSessionRailBlockProps) => {
  const { copy } = props;
  return (<div>

  <SessionSelection {...props} presentation="expanded" />

  <Button
    variant="primary"
    isPending={props.pending}
    onPress={props.onCreate}
  >{copy.sessions.new}</Button></div>);
};
const SessionRailToggle = () => <Icon source={nivoIconSource("sidebar", "leading")} usage="leading" />;

/** Navigate multiple Execute conversations through one selected identity at every breakpoint. */
export const ExecuteSessionRailBlock = (props: ExecuteSessionRailBlockProps) => {
  const { copy } = props;
  const {
    sessions,
    selectedId,
    pending,
    onSelect,
    onCreate
  }: ExecuteSessionRailBlockProps = props;
  const railProps = {
    copy,
    sessions,
    selectedId,
    pending,
    onSelect,
    onCreate
  };
  return <div><div>



      <ChoiceTabs props={{
        label: copy.sessions.label,
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
      >{copy.sessions.new}</Button></div>



    <CollapsibleRail ariaLabel={copy.sessions.label} title={copy.sessions.title} rail={SessionRailBody} railProps={railProps} collapsedRail={SessionSelection} collapsedRailProps={{
      ...railProps,
      presentation: "compact"
    }} toggleControl={SessionRailToggle} toggleControlProps={{}} collapseLabel={copy.sessions.collapse} expandLabel={copy.sessions.expand} storageKey="nivo:agentos:execute-sessions" /></div>;
};
