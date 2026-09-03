"use client";
import { SurfaceCard, Button, Text } from "@starci/grammar/core";

import { LifecycleStep, TileIcon, type LifecycleStepData } from "@nivo/ui";

/** Block-owned conditions of the AgentOS order and provisioning continuation. */
export type AgentOSProvisioningProps = AgentOSProvisioningViewProps;
/** Public API role for AgentOSProvisioningBlockState. */
export type AgentOSProvisioningBlockState = "catalog_loading" | "request" | "submitting" | "awaiting_payment" | "accepted" | "preparing" | "ready" | "failed";

/** Every settled tree the AgentOS provisioning block can draw. */
export type AgentOSProvisioningViewProps = {
  readonly state: AgentOSProvisioningBlockState;
  readonly props: {
    readonly progressLabel?: string;
    readonly continuationLabel?: string;
    readonly steps: ReadonlyArray<LifecycleStepData>;
    readonly subject: string;
    readonly detail: string;
    readonly statusTitle: string;
    readonly statusText: string;
    readonly requestActionLabel?: string;
    readonly statusActionLabel?: string;
    readonly statusActionDisabled?: boolean;
    readonly isRequestPending?: boolean;
  };
  readonly on?: {
    readonly request?: () => void;
    readonly statusAction?: () => void;
  };
};
const signalFor = (state: AgentOSProvisioningBlockState) => {
  if (state === "failed") return "attention";
  return state === "ready" ? "active" : "none";
};

/** Draw an AgentOS order beside its exact live workspace status. */
export const AgentOSProvisioningBase = (props: AgentOSProvisioningProps) => {
  const { state, props: viewProps, on }: AgentOSProvisioningViewProps = props;
  const journey = <div>{viewProps.steps.map((step, index) => <LifecycleStep key={index} props={step} isLoading={state === "catalog_loading"} />)}</div>;
  const identity = <div>

    <Text size="md" weight="medium" isSkeleton={state === "catalog_loading"}>{viewProps.subject}</Text>


    <Text size="xs" tone="muted" isSkeleton={state === "catalog_loading"}>{viewProps.detail}</Text></div>;
  const actionLabel = viewProps.requestActionLabel ?? viewProps.statusActionLabel;
  const action = actionLabel === undefined ? undefined : <Button
    variant="primary"
    isPending={viewProps.isRequestPending}
    isDisabled={viewProps.statusActionDisabled}
    onPress={viewProps.requestActionLabel === undefined ? on?.statusAction : on?.request}
  >{actionLabel}</Button>;
  const phaseAction = <div>{identity}

    <Text size="sm">{viewProps.statusTitle}</Text>


    <Text size="sm" tone={state === "failed" ? "accent" : "muted"}>{viewProps.statusText}</Text>{action}</div>;
  const artwork = <div>

    <TileIcon props={{
      icon: "agentos",
      signal: signalFor(state)
    }} isLoading={state === "catalog_loading"} /></div>;
  const continuation = <div>{phaseAction}{artwork}</div>;
  const orderContent = <div>{journey}{continuation}</div>;
  const highlightsContinuation = state === "ready" || state === "awaiting_payment" && viewProps.statusActionDisabled !== true && on?.statusAction !== undefined;
  return <div>{highlightsContinuation ? <SurfaceCard
      label={viewProps.progressLabel ?? viewProps.subject}
      isHighlight
    >{orderContent}</SurfaceCard> : <SurfaceCard
      label={viewProps.progressLabel ?? viewProps.subject}
    >{orderContent}</SurfaceCard>}</div>;
};

