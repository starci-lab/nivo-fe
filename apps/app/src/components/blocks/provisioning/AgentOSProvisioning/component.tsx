"use client";
import { CONTENT_CLASS_NAME, ROW_CLASS_NAME } from "./classNames";
import { SectionHeader as DirectionHeader, PrimaryRailLayout as DirectionLayout, SurfaceListCard as DirectionList, Button, SurfaceCard, Text } from "@starci/grammar/common";
import { LifecycleStep, type LifecycleStepData } from "@nivo/ui";
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
/** Draw an AgentOS order beside its exact live workspace status. */
export const AgentOSProvisioningBase = (props: AgentOSProvisioningProps) => {
    const { state, props: view, on } = props;
    const actionLabel = view.requestActionLabel ?? view.statusActionLabel;
    const continuation = <SurfaceCard label={view.continuationLabel ?? view.subject} state={state === "failed" ? "negative" : "neutral"}><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><DirectionHeader level={2} title={<Text isSkeleton={state === "catalog_loading"}>{view.subject}</Text>} description={<Text size="sm" tone="muted" isSkeleton={state === "catalog_loading"}>{view.detail}</Text>}/><Text weight="medium" isSkeleton={state === "catalog_loading"}>{view.statusTitle}</Text><Text size="sm" live="polite" isSkeleton={state === "catalog_loading"}>{view.statusText}</Text>{actionLabel === undefined ? null : <Button variant="primary" type="button" isPending={view.isRequestPending} isDisabled={view.statusActionDisabled} onPress={view.requestActionLabel === undefined ? on?.statusAction : on?.request}>{actionLabel}</Button>}</div></SurfaceCard>;
    const journey = <DirectionList label={view.progressLabel ?? view.subject}>{view.steps.map((step, index) => <div key={index} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><LifecycleStep props={step} isLoading={state === "catalog_loading"}/></div>)}</DirectionList>;
    return <DirectionLayout primary={continuation} rail={journey} railWidth="compact" align="start"/>;
};
