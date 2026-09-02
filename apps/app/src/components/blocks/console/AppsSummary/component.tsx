import { Avatar } from "@nivo/ui";
import { EmptyNotice, SurfaceCard, SurfaceListCard, Button, Button as CoreButton, Text, TextAction, Badge, type BadgeTone } from "@starci/grammar/common";

/** One exact owned application prepared for the joined summary list. */
export type AppsSummaryItem = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly statusLabel: string;
  readonly statusTone: BadgeTone;
  readonly actionLabel: string;
};
/** Settled states the owned-application collection can render. */
export type AppsSummaryState = {
  readonly phase: "pending";
} | {
  readonly phase: "empty";
  readonly message: string;
} | {
  readonly phase: "populated";
  readonly items: ReadonlyArray<AppsSummaryItem>;
} | {
  readonly phase: "forbidden";
  readonly message: string;
};
/** Pure owned-application list input and its legal navigation commands. */
export type AppsSummaryProps = {
  readonly label: string;
  readonly openAllLabel?: string;
  readonly state: AppsSummaryState;
  readonly onOpenApp: (id: string) => void;
  readonly onOpenAll?: () => void;
};
const rows = (items: ReadonlyArray<AppsSummaryItem>, onOpenApp: AppsSummaryProps["onOpenApp"]) => items.map((item, index) => <div key={index}>
  <Avatar props={{
    name: item.name,
    size: "md"
  }} /><div>

    <TextAction size="sm" onPress={() => onOpenApp(item.id)}>{item.name}</TextAction>
    <Text size="xs" tone="muted">{item.detail}</Text></div>

  <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
  <CoreButton
    size="sm"
    onPress={() => onOpenApp(item.id)}
  >{item.actionLabel}</CoreButton></div>);
const pendingRows = () => Array.from({
  length: 3
}, (_, index) => <div key={index}>
  <Avatar key={index} props={{
    size: "md"
  }} isLoading /><div>

    <TextAction size="sm" isSkeleton>{""}</TextAction>
    <Text isSkeleton>{""}</Text></div>

  <Button isSkeleton>{""}</Button></div>);
const appsListContent = (state: Extract<AppsSummaryState, {
  readonly phase: "pending" | "populated";
}>, onOpenApp: AppsSummaryProps["onOpenApp"]) => <div>{state.phase === "pending" ? pendingRows() : rows(state.items, onOpenApp)}</div>;

/** Draw exact owned applications as one joined collection. */
export const AppsSummaryBase = (props: AppsSummaryProps) => {
  const {
    label,
    openAllLabel,
    state,
    onOpenApp,
    onOpenAll
  }: AppsSummaryProps = props;
  if (state.phase === "empty") return <SurfaceCard
    label={label}
  ><div>
      <EmptyNotice message={state.message} /></div></SurfaceCard>;
  if (state.phase === "forbidden") return <SurfaceCard
    label={label}
  ><div>
      <Text size="sm" tone="muted">{state.message}</Text></div></SurfaceCard>;
  const isLoading = state.phase === "pending";
  const content = appsListContent(state, onOpenApp);
  return <SurfaceListCard
    label={label}
    footer={openAllLabel !== undefined && (isLoading || onOpenAll !== undefined) ? <Button variant="primary" size="sm" isSkeleton={isLoading} onPress={onOpenAll}>{openAllLabel}</Button> : undefined}
    isLoading={isLoading}
  >{content}</SurfaceListCard>;
};

/** Registry identity for the pure Apps summary twin. */
