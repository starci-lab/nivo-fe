import { Button, Text, TextAction, Badge, type BadgeTone } from "@starci/grammar/common";

/**
 * BLOCK - one row of the provisioning fleet, whichever kind of thing it is.
 *
 * WHY THIS KNOWS THE DOMAIN. The tone a status is drawn in is not a styling choice, it is a reading
 * of what the backend means, and getting it wrong is the failure this block exists to prevent.
 * `awaiting_dns` is the sharp one: it LOOKS like a fault and is not one. Its own enum comment in
 * nivo-backend says "Not an error and not retryable by us" - the customer has to add a DNS record.
 * Drawn in the danger tone beside a genuine failure, it invites a retry that cannot work; drawn in
 * the neutral tone it hides the single thing keeping a site off the air. It is `warning`, alone in
 * that tone, and the map below is the only place that decision is made.
 *
 * WHY IT LIVES IN THIS APP RATHER THAN IN `@nivo/ui`. Everything above is the reason: the block
 * knows what a provisioned nivo resource is, and `apps/app` is the provisioning and operations
 * dashboard that owns that feature. In the shared package the same knowledge would be shipped to
 * the landing site and the expert academy, neither of which has a fleet.
 */

/** How far a fleet resource has got. The union is nivo-backend's, not this app's invention. */
export type FleetStatus = "not_provisioned" | "provisioning" | "awaiting_dns" | "ready" | "failed" | "active" | "suspended";

/** Which kind of thing the row is. Two kinds, one row shape. */
export type FleetKind = "site" | "workspace";

/**
 * Status to tone. Written out rather than derived, because the interesting cases are exactly the
 * ones a rule would get wrong.
 */
const STATUS_TONE: Readonly<Record<FleetStatus, BadgeTone>> = {
  not_provisioned: "neutral",
  provisioning: "accent",
  // Not `danger`. See the block comment above; this is the whole reason it is written down.
  awaiting_dns: "warning",
  ready: "success",
  failed: "danger",
  active: "success",
  suspended: "neutral"
};

/** Resolved identity, kind, state and the one action this row currently permits. */
export type FleetRowData = {
  readonly id: string;
  readonly name?: string;
  readonly detail?: string;
  readonly kind: FleetKind;
  readonly kindLabel: string;
  readonly status: FleetStatus;
  readonly statusLabel?: string;
  /**
   * Absent when the row's state permits nothing. A resource mid-provision is the ordinary case:
   * nothing anybody may do to it until the job finishes.
   */
  readonly actionLabel?: string;
  readonly isActionPending?: boolean;
};

/** Product journeys reported by one fleet row. */
export type FleetRowActions = {
  readonly open?: () => void;
  readonly act?: () => void;
};

/** Props for the closed fleet-row composition. */
export type FleetRowProps = {
  readonly props: FleetRowData;
  readonly on?: FleetRowActions;
  readonly isLoading?: boolean;
};

/** Draw one provisioned resource: what it is, what state it is in, and what may be done to it. */
export const FleetRow = (props: FleetRowProps) => {
  const data = props.props;
  const isLoading = props.isLoading;
  const on = props.on;
  const identity = <div>

    <TextAction size="sm" isSkeleton={isLoading} onPress={on?.open}>{data.name ?? ""}</TextAction>


    <Text size="xs" tone="muted" isSkeleton={isLoading}>{data.detail}</Text></div>;
  return <div>{identity}

    <Badge tone="neutral">{data.kindLabel}</Badge>


    <Badge tone={STATUS_TONE[data.status]}>{data.statusLabel}</Badge>{data.actionLabel === undefined ? null : <Button variant="secondary" size="sm" isPending={data.isActionPending} isSkeleton={isLoading} onPress={on?.act}>{data.actionLabel ?? ""}</Button>}</div>;
};
