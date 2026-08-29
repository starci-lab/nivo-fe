import { Avatar, Badge, Button, SurfaceCard, SurfaceListCard, Text, TextLink, type BadgeTone } from "@nivo/ui";
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice";

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

    <TextLink props={{
      label: item.name,
      size: "sm"
    }} on={{
      press: () => onOpenApp(item.id)
    }} />
    <Text props={{
      content: item.detail,
      size: "xs",
      tone: "muted"
    }} /></div>

  <Badge props={{
    content: item.statusLabel,
    tone: item.statusTone
  }} />
  <Button props={{
    label: item.actionLabel,
    size: "sm"
  }} on={{
    press: () => onOpenApp(item.id)
  }} /></div>);
const pendingRows = () => Array.from({
  length: 3
}, (_, index) => <div key={index}>
  <Avatar key={index} props={{
    size: "md"
  }} isLoading /><div>

    <TextLink props={{
      label: "",
      size: "sm"
    }} isLoading />
    <Text props={{
      content: ""
    }} isLoading /></div>

  <Button props={{
    label: ""
  }} isLoading /></div>);
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
  if (state.phase === "empty") return <SurfaceCard props={{
    label
  }}><div>
      <EmptyNotice props={{
        message: state.message
      }} /></div></SurfaceCard>;
  if (state.phase === "forbidden") return <SurfaceCard props={{
    label
  }}><div>
      <Text props={{
        content: state.message,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
  const isLoading = state.phase === "pending";
  const content = appsListContent(state, onOpenApp);
  return <SurfaceListCard props={{
    label,
    actionLabel: openAllLabel
  }} on={{
    act: onOpenAll
  }} isLoading={isLoading}>{content}</SurfaceListCard>;
};

/** Registry identity for the pure Apps summary twin. */
