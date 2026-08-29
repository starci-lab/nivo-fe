import { IconTile, NivoUnicornArtwork, SurfaceCard, Text } from "@nivo/ui";

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
  return <SurfaceCard isLoading={isLoading}><div>{<div>{<IconTile props={{
          icon: signal.icon,
          size: "sm",
          tone: "accent"
        }} isLoading={isLoading} />}{<Text props={{
          content: signal.label,
          size: "sm",
          weight: "medium"
        }} />}</div>}{<Text props={{
        content: signal.value,
        size: "sm",
        tone: signal.emphasis ?? "default"
      }} isLoading={isLoading} />}{<Text props={{
        content: signal.caption,
        size: "xs",
        tone: "muted"
      }} isLoading={isLoading} />}</div></SurfaceCard>;
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
