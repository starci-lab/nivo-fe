import { NivoUnicornArtwork, nivoIconSource } from "@nivo/ui";
import { SurfaceCard, IconTile, Text } from "@starci/grammar/core";
import {
  OVERVIEW_PULSE_SIGNAL_COLLECTION_CLASS_NAME,
  OVERVIEW_PULSE_SIGNAL_CONTENT_CLASS_NAME,
  OVERVIEW_PULSE_SIGNAL_FACT_CLASS_NAME,
  OVERVIEW_PULSE_SIGNAL_ROW_CLASS_NAME
} from "./classNames";

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
const signalRow = (signal: OverviewPulseSignal) => {
  const isLoading = signal.phase === "pending";
  return <div
    key={signal.id}
    className={OVERVIEW_PULSE_SIGNAL_ROW_CLASS_NAME}
    data-contract="GAP-3 PADDING-3 PADDING-4"
  >
    <IconTile
      source={nivoIconSource(signal.icon, "leading")}
      tone="accent"
      size="sm"
      isSkeleton={isLoading}
    />
    <div
      className={OVERVIEW_PULSE_SIGNAL_CONTENT_CLASS_NAME}
      data-contract="GAP-3"
    >
      <Text size="sm" weight="medium">{signal.label}</Text>
      <div
        className={OVERVIEW_PULSE_SIGNAL_FACT_CLASS_NAME}
        data-contract="GAP-1"
      >
        <Text size="sm" tone={signal.emphasis ?? "default"} isSkeleton={isLoading}>{signal.value}</Text>
        <Text size="xs" tone="muted" isSkeleton={isLoading}>{signal.caption}</Text>
      </div>
    </div>
  </div>;
};

/** Draw four exact signals without fetching or deriving collection totals. */
export const OverviewPulseBase = (props: OverviewPulseProps) => {
  const {
    signals
  }: OverviewPulseProps = props;
  return <SurfaceCard composition="joined">
    <NivoUnicornArtwork props={{
      tone: "brand"
    }} />
    <div
      className={OVERVIEW_PULSE_SIGNAL_COLLECTION_CLASS_NAME}
      data-contract="BOUNDARY-1 BOUNDARY-3 MEASURE-2"
    >
      {signals.map(signalRow)}
    </div>
  </SurfaceCard>;
};

/** Registry identity for the pure overview pulse twin. */
