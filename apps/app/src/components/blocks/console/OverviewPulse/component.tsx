import { nivoIconSource } from "@nivo/ui";
import { Badge, SurfaceCard, IconTile, Text } from "@starci/grammar/common";
import {
  OVERVIEW_PULSE_COLLECTION_CLASS_NAME,
  OVERVIEW_PULSE_SIGNAL_CONTENT_CLASS_NAME,
  OVERVIEW_PULSE_SIGNAL_FACT_CLASS_NAME,
  OVERVIEW_PULSE_SIGNAL_ROW_CLASS_NAME,
  OVERVIEW_PULSE_SUMMARY_CLASS_NAME
} from "./classNames";

/** How much attention one signal's caption asks for. */
export type OverviewPulseTone = "default" | "warning" | "danger";

/** One independently settled account signal shown before detailed evidence. */
export type OverviewPulseSignal = {
  readonly id: string;
  readonly icon: "apps" | "agentos" | "domains" | "wallet";
  readonly label: string;
  readonly phase: "pending" | "answered" | "failed";
  readonly value: string;
  readonly caption: string;
  readonly tone: OverviewPulseTone;
  readonly emphasis?: "default" | "accent";
};

/** Resolved signal values and the card's own label and summary line. */
export type OverviewPulseProps = {
  readonly label: string;
  readonly summary: string;
  readonly signals: ReadonlyArray<OverviewPulseSignal>;
};
const caption = (signal: OverviewPulseSignal, isLoading: boolean) => signal.tone === "default"
  ? <Text size="xs" tone="muted" isSkeleton={isLoading}>{signal.caption}</Text>
  : <Badge tone={signal.tone} isSkeleton={isLoading}>{signal.caption}</Badge>;
const signalRow = (signal: OverviewPulseSignal) => {
  const isLoading = signal.phase === "pending";
  return <div
    key={signal.id}
    className={OVERVIEW_PULSE_SIGNAL_ROW_CLASS_NAME}
  >
    <IconTile
      source={nivoIconSource(signal.icon, "leading")}
      tone="accent"
      size="sm"
      isSkeleton={isLoading}
    />
    <div className={OVERVIEW_PULSE_SIGNAL_CONTENT_CLASS_NAME}>
      <Text size="sm" weight="medium">{signal.label}</Text>
      <div className={OVERVIEW_PULSE_SIGNAL_FACT_CLASS_NAME}>
        <Text size="sm" tone={signal.emphasis ?? "default"} isSkeleton={isLoading}>{signal.value}</Text>
        {caption(signal, isLoading)}
      </div>
    </div>
  </div>;
};

/** Draw the card's own neutral summary band, then four exact signals without fetching or deriving totals. */
export const OverviewPulseBase = (props: OverviewPulseProps) => {
  const {
    label,
    summary,
    signals
  }: OverviewPulseProps = props;
  return <SurfaceCard label={label} composition="joined">
    <div
      className={OVERVIEW_PULSE_SUMMARY_CLASS_NAME}
      data-contract="PADDING-4 PADDING-3"
    >
      <Text size="sm" tone="muted">{summary}</Text>
    </div>
    <div
      className={OVERVIEW_PULSE_COLLECTION_CLASS_NAME}
      data-contract="BOUNDARY-1 BOUNDARY-3"
    >
      {signals.map(signalRow)}
    </div>
  </SurfaceCard>;
};

/** Registry identity for the pure overview pulse twin. */
