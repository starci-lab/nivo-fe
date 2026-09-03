import { NivoUnicornArtwork, nivoIconSource } from "@nivo/ui";
import { SurfaceCard, IconTile, Text } from "@starci/grammar/core";

/** One independently settled account signal shown before detailed evidence. */
export type OverviewPulseSignal = {
  readonly id: string;
  readonly icon: "apps" | "agentos" | "domains" | "wallet";
  readonly label: string;
  readonly phase: "pending" | "answered" | "failed";
  readonly value: string;
  readonly caption: string;
  readonly emphasis?: "default" | "accent";
};

/** Resolved signal values consumed by the pure overview pulse. */
export type OverviewPulseProps = {
  readonly signals: ReadonlyArray<OverviewPulseSignal>;
};
const signalCard = (signal: OverviewPulseSignal) => {
  const isLoading = signal.phase === "pending";
  return <SurfaceCard><div>{<div>{<IconTile source={nivoIconSource(signal.icon, "leading")} tone="accent" size="sm" isSkeleton={isLoading} />}{<Text size="sm" weight="medium">{signal.label}</Text>}</div>}{<Text size="sm" tone={signal.emphasis ?? "default"} isSkeleton={isLoading}>{signal.value}</Text>}{<Text size="xs" tone="muted" isSkeleton={isLoading}>{signal.caption}</Text>}</div></SurfaceCard>;
};

/** Draw four exact signals without fetching or deriving collection totals. */
export const OverviewPulseBase = (props: OverviewPulseProps) => {
  const {
    signals
  }: OverviewPulseProps = props;
  return <div>


  <NivoUnicornArtwork props={{
      tone: "brand"
    }} />{signals.map(signalCard)}</div>;
};

/** Registry identity for the pure overview pulse twin. */
