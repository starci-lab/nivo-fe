"use client";

import { Button, HighlightCard, LifecycleStep, SurfaceCard, Text, TileIcon, type LifecycleStepData } from "@nivo/ui";

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

    <Text props={{
      content: viewProps.subject,
      size: "md",
      weight: "medium"
    }} isLoading={state === "catalog_loading"} />


    <Text props={{
      content: viewProps.detail,
      size: "xs",
      tone: "muted"
    }} isLoading={state === "catalog_loading"} /></div>;
  const actionLabel = viewProps.requestActionLabel ?? viewProps.statusActionLabel;
  const action = actionLabel === undefined ? undefined : <Button props={{
    label: actionLabel,
    variant: "primary",
    isPending: viewProps.isRequestPending,
    disabled: viewProps.statusActionDisabled
  }} on={{
    press: viewProps.requestActionLabel === undefined ? on?.statusAction : on?.request
  }} />;
  const phaseAction = <div>{identity}

    <Text props={{
      content: viewProps.statusTitle,
      size: "sm"
    }} />


    <Text props={{
      content: viewProps.statusText,
      size: "sm",
      tone: state === "failed" ? "accent" : "muted"
    }} />{action}</div>;
  const artwork = <div>

    <TileIcon props={{
      icon: "agentos",
      signal: signalFor(state)
    }} isLoading={state === "catalog_loading"} /></div>;
  const continuation = <div>{phaseAction}{artwork}</div>;
  const orderContent = <div>{journey}{continuation}</div>;
  const highlightsContinuation = state === "ready" || state === "awaiting_payment" && viewProps.statusActionDisabled !== true && on?.statusAction !== undefined;
  return <div>{highlightsContinuation ? <HighlightCard props={{
      label: viewProps.progressLabel ?? viewProps.subject
    }}>{orderContent}</HighlightCard> : <SurfaceCard props={{
      label: viewProps.progressLabel ?? viewProps.subject
    }} isLoading={state === "catalog_loading"}>{orderContent}</SurfaceCard>}</div>;
};

