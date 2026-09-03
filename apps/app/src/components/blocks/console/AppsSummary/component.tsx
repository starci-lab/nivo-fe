import { Avatar } from "@nivo/ui";
import { EmptyNotice, SurfaceListCard, Button, Text, TextAction, Badge, type BadgeTone } from "@starci/grammar/common";
import {
  APPS_SUMMARY_ACTION_CLASS_NAME,
  APPS_SUMMARY_ACTION_CONTEXT_CLASS_NAME,
  APPS_SUMMARY_COLLECTION_CLASS_NAME,
  APPS_SUMMARY_COPY_CLASS_NAME,
  APPS_SUMMARY_ROW_CLASS_NAME,
  APPS_SUMMARY_STATUS_CLASS_NAME
} from "./classNames";

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
const rows = (items: ReadonlyArray<AppsSummaryItem>, onOpenApp: AppsSummaryProps["onOpenApp"]) => items.map(item => <div
  key={item.id}
  className={APPS_SUMMARY_ROW_CLASS_NAME}
>
  <Avatar props={{
    name: item.name,
    size: "md"
  }} />
  <div className={APPS_SUMMARY_COPY_CLASS_NAME}>
    <TextAction size="sm" onPress={() => onOpenApp(item.id)}>{item.name}</TextAction>
    <Text size="xs" tone="muted">{item.detail}</Text>
  </div>
  <div className={APPS_SUMMARY_STATUS_CLASS_NAME}>
    <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
  </div>
  <div className={APPS_SUMMARY_ACTION_CLASS_NAME}>
    <Button size="sm" onPress={() => onOpenApp(item.id)}>
      <span>{item.actionLabel}</span>{" "}
      <span className={APPS_SUMMARY_ACTION_CONTEXT_CLASS_NAME}>{item.name}</span>
    </Button>
  </div>
</div>);
const pendingRows = () => Array.from({
  length: 3
}, (_, index) => <div
  key={index}
  className={APPS_SUMMARY_ROW_CLASS_NAME}
>
  <Avatar props={{
    size: "md"
  }} isLoading />
  <div className={APPS_SUMMARY_COPY_CLASS_NAME}>
    <TextAction size="sm" isSkeleton>{""}</TextAction>
    <Text isSkeleton>{""}</Text>
  </div>
  <div className={APPS_SUMMARY_STATUS_CLASS_NAME}>
    <Badge tone="neutral" isSkeleton />
  </div>
  <div className={APPS_SUMMARY_ACTION_CLASS_NAME}>
    <Button size="sm" isSkeleton>{""}</Button>
  </div>
</div>);
const appsListContent = (state: Extract<AppsSummaryState, {
  readonly phase: "pending" | "populated";
}>, onOpenApp: AppsSummaryProps["onOpenApp"]) => <div className={APPS_SUMMARY_COLLECTION_CLASS_NAME}>{state.phase === "pending" ? pendingRows() : rows(state.items, onOpenApp)}</div>;

/** Draw exact owned applications as one joined collection. */
export const AppsSummaryBase = (props: AppsSummaryProps) => {
  const {
    label,
    openAllLabel,
    state,
    onOpenApp,
    onOpenAll
  }: AppsSummaryProps = props;
  if (state.phase === "empty") return <SurfaceListCard
    label={label}
    footer={openAllLabel !== undefined && onOpenAll !== undefined ? <Button variant="secondary" size="sm" onPress={onOpenAll}>{openAllLabel}</Button> : undefined}
  >
    <EmptyNotice message={state.message} />
  </SurfaceListCard>;
  if (state.phase === "forbidden") return <SurfaceListCard
    label={label}
    footer={openAllLabel !== undefined && onOpenAll !== undefined ? <Button variant="secondary" size="sm" onPress={onOpenAll}>{openAllLabel}</Button> : undefined}
  >
    <Text size="sm" tone="muted">{state.message}</Text>
  </SurfaceListCard>;
  const isLoading = state.phase === "pending";
  const content = appsListContent(state, onOpenApp);
  return <SurfaceListCard
    label={label}
    footer={openAllLabel !== undefined && (isLoading || onOpenAll !== undefined) ? <Button variant="secondary" size="sm" isSkeleton={isLoading} onPress={onOpenAll}>{openAllLabel}</Button> : undefined}
    isLoading={isLoading}
  >{content}</SurfaceListCard>;
};

/** Registry identity for the pure Apps summary twin. */
