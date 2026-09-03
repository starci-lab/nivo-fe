import { nivoIconSource } from "@nivo/ui";
import { SurfaceCard, SurfaceListCard, Button, Button as CoreButton, EmptyNotice, Icon, Text, TextAction, Badge } from "@starci/grammar/core";

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


    <TextAction size="sm" isSkeleton={loading} onPress={() => onOpen(row.id)}>{row.name}</TextAction>
    <Text size="xs" isSkeleton={loading}>{row.detail}</Text></div>

  <Badge tone="neutral" isSkeleton={loading}>{row.kind}</Badge>
  <Badge tone={row.status === "Active" ? "success" : "warning"} isSkeleton={loading}>{row.status}</Badge>
  <Button variant="secondary" size="sm" isSkeleton={loading} onPress={() => onOpen(row.id)}>{row.action}</Button></div>;
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
  if (state === "refused") return <SurfaceCard
    label={title}
    labelEnd={createLabel !== undefined && onCreate !== undefined ? <CoreButton size="sm" variant="primary" onPress={onCreate}>{createLabel}</CoreButton> : null}
  ><div><Text size="sm" tone="muted">{refused}</Text></div></SurfaceCard>;
  if (state === "empty") return <SurfaceCard
    label={title}
  ><div><EmptyNotice
        message={empty}
        actionLabel={createLabel}
        actionStartContent={<Icon source={nivoIconSource("retry", "chip")} usage="chip" />}
        onAction={onCreate}
      /></div></SurfaceCard>;
  const shown = state === "loading" ? [0, 1, 2].map(index => ({
    id: `loading-${index}`,
    name: title,
    detail: "",
    kind: "Custom",
    status: "Draft",
    action: createLabel
  })) : rows;
  const content = customModuleContent(shown, state === "loading", onOpen);
  return <SurfaceListCard
    label={title}
    footer={<Button variant="primary" size="sm" isSkeleton={state === "loading"} onPress={onCreate}>{createLabel}</Button>}
    isLoading={state === "loading"}
  >{content}</SurfaceListCard>;
};

