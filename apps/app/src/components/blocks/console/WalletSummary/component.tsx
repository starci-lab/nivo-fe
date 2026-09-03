import { nivoIconSource } from "@nivo/ui";
import { Icon, SurfaceCard, Button, Text, TextAction } from "@starci/grammar/core";

/** One exact balance or invoice fact displayed by the wallet summary. */
export type WalletSummaryFact = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly emphasis?: boolean;
};
/** Independently settled wallet and invoice states. */
export type WalletSummaryState = {
  readonly phase: "pending";
} | {
  readonly phase: "empty";
  readonly facts: ReadonlyArray<WalletSummaryFact>;
} | {
  readonly phase: "populated";
  readonly facts: ReadonlyArray<WalletSummaryFact>;
} | {
  readonly phase: "failed";
  readonly note: string;
} | {
  readonly phase: "partial";
  readonly facts: ReadonlyArray<WalletSummaryFact>;
  readonly note: string;
};
/** Pure wallet summary input and its legal wallet commands. */
export type WalletSummaryProps = {
  readonly label: string;
  readonly actionLabel?: string;
  readonly secondaryActionLabel?: string;
  readonly state: WalletSummaryState;
  readonly onOpenWallet?: () => void;
  readonly onTopUp?: () => void;
};
const fact = (item: WalletSummaryFact, isLoading = false) => <div>
  <Text size="sm" tone="muted" isSkeleton={isLoading}>{item.label}</Text>
  <Text size="sm" weight={item.emphasis === true ? "semibold" : undefined} isSkeleton={isLoading}>{item.value}</Text></div>;

/** Draw exact balance and invoice evidence with their two legal routes. */
export const WalletSummaryBase = (props: WalletSummaryProps) => {
  const {
    label,
    actionLabel,
    secondaryActionLabel,
    state,
    onOpenWallet,
    onTopUp
  }: WalletSummaryProps = props;
  const isLoading = state.phase === "pending";
  const facts = state.phase === "empty" || state.phase === "populated" || state.phase === "partial" ? state.facts : [];
  const note = state.phase === "failed" || state.phase === "partial" ? state.note : undefined;
  return <SurfaceCard
    label={label}
    labelEnd={actionLabel !== undefined && onOpenWallet !== undefined ? <TextAction appearance="disclosure" size="sm" endContent={<Icon source={nivoIconSource("next")} />} onPress={onOpenWallet}>{actionLabel}</TextAction> : null}
  ><div><div>{isLoading ? [fact({
          id: "pending-balance",
          label: "",
          value: "",
          emphasis: true
        }, true), fact({
          id: "pending-invoice",
          label: "",
          value: ""
        }, true)] : facts.map(item => fact(item))}</div>{secondaryActionLabel !== undefined && onTopUp !== undefined ? <Button
          variant="primary"
          onPress={onTopUp}
        >{secondaryActionLabel}</Button> : null}{note === undefined ? null : <div><Text size="sm" tone="muted">{note}</Text></div>}</div></SurfaceCard>;
};

/** Registry identity for the pure wallet summary twin. */
