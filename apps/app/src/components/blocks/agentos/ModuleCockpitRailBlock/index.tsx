"use client";
import { SurfaceCard, Button, Text } from "@starci/grammar/core";

import { SelectionList, type SelectionListGroup } from "@nivo/ui";

/** One data-only identity rendered in a Module Studio cockpit rail. */
export type ModuleCockpitRailItem = {
  readonly id: string;
  readonly label: string;
  readonly status: string;
};

/** Shared rail input for Setup versions, Test scenarios and diagnostic signals. */
export type ModuleCockpitRailBlockProps = {
  readonly label: string;
  readonly fact?: string;
  readonly summary?: string;
  readonly items: ReadonlyArray<ModuleCockpitRailItem>;
  readonly selectedId: string;
  readonly actionLabel?: string;
  readonly pending?: boolean;
  readonly onSelect: (id: string) => void;
  readonly onAction?: () => void;
};
const groupsFor = (label: string, items: ReadonlyArray<ModuleCockpitRailItem>): ReadonlyArray<SelectionListGroup> => [{
  id: label.toLowerCase().replaceAll(" ", "-"),
  items: items.map(item => ({
    id: item.id,
    label: item.label,
    icon: "agentos" as const,
    status: item.status
  }))
}];

/** Render one compact data rail without accepting arbitrary content or JSX slots. */
export const ModuleCockpitRailBlock = (props: ModuleCockpitRailBlockProps) => {
  const {
    label,
    fact,
    summary,
    items,
    selectedId,
    actionLabel,
    pending = false,
    onSelect,
    onAction
  }: ModuleCockpitRailBlockProps = props;
  return <SurfaceCard
    label={label}
    fact={fact}
  ><div>{summary === undefined ? undefined : <Text size="xs" tone="muted">{summary}</Text>}


    <SelectionList props={{
        label,
        selectedKey: selectedId,
        presentation: "expanded",
        groups: groupsFor(label, items)
      }} on={{
        activate: onSelect
      }} />{actionLabel === undefined || onAction === undefined ? undefined : <Button
        variant="secondary"
        isPending={pending}
        onPress={onAction}
      >{actionLabel}</Button>}</div></SurfaceCard>;
};
