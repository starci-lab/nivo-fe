import { Badge, Button, SurfaceCard, SurfaceListCard, Text, TextLink } from "@nivo/ui";
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice";

/** One custom-module identity prepared for the joined management list. */
export type AgentOSCustomModuleCollectionProps = AgentOSCustomModuleCollectionViewProps;
/** Public API role for CustomModuleCollectionRow. */
export type CustomModuleCollectionRow = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly kind: string;
  readonly status: string;
  readonly action: string;
};

/** Settled collection state and exact navigation actions for the pure block. */
export type AgentOSCustomModuleCollectionViewProps = {
  readonly state: "loading" | "refused" | "empty" | "ready";
  readonly title: string;
  readonly refused: string;
  readonly empty: string;
  readonly createLabel: string;
  readonly rows: ReadonlyArray<CustomModuleCollectionRow>;
  readonly onOpen: (id: string) => void;
  readonly onCreate: () => void;
};
const rowView = (row: CustomModuleCollectionRow, loading: boolean, onOpen: (id: string) => void) => <div><div>


    <TextLink props={{
      label: row.name,
      size: "sm"
    }} on={{
      press: () => onOpen(row.id)
    }} />
    <Text props={{
      content: row.detail,
      size: "xs"
    }} isLoading={loading} /></div>

  <Badge props={{
    content: row.kind,
    tone: "neutral"
  }} isLoading={loading} />
  <Badge props={{
    content: row.status,
    tone: row.status === "Active" ? "success" : "warning"
  }} isLoading={loading} />
  <Button props={{
    label: row.action,
    size: "sm",
    variant: "secondary"
  }} on={{
    press: () => onOpen(row.id)
  }} isLoading={loading} /></div>;
const customModuleContent = (shown: ReadonlyArray<CustomModuleCollectionRow>, loading: boolean, onOpen: (id: string) => void) => <div>{shown.map(row => rowView(row, loading, onOpen))}</div>;

/** Draw custom drafts and active modules with local refusal and empty states. */
export const AgentOSCustomModuleCollectionBase = (props: AgentOSCustomModuleCollectionProps) => {
  const {
    state,
    title,
    refused,
    empty,
    createLabel,
    rows,
    onOpen,
    onCreate
  }: AgentOSCustomModuleCollectionViewProps = props;
  if (state === "refused") return <SurfaceCard props={{
    label: title,
    actionLabel: createLabel
  }} on={{
    act: onCreate
  }}><div><Text props={{
        content: refused,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
  if (state === "empty") return <SurfaceCard props={{
    label: title
  }}><div><EmptyNotice props={{
        message: empty,
        actionLabel: createLabel
      }} on={{
        act: onCreate
      }} /></div></SurfaceCard>;
  const shown = state === "loading" ? [0, 1, 2].map(index => ({
    id: `loading-${index}`,
    name: title,
    detail: "",
    kind: "Custom",
    status: "Draft",
    action: createLabel
  })) : rows;
  const content = customModuleContent(shown, state === "loading", onOpen);
  return <SurfaceListCard props={{
    label: title,
    actionLabel: createLabel
  }} on={{
    act: onCreate
  }} isLoading={state === "loading"}>{content}</SurfaceListCard>;
};

