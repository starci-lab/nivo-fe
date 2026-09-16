import type { ComponentType } from "react";
import { Badge, EmptyNotice, SurfaceCard, Text } from "@starci/grammar/common";
import { BUSINESS_MODULES_CLASS_NAME, WORKSPACE_IDENTITY_CLASS_NAME } from "./classNames";

/** Copy shared by every settled single-business dashboard state. */
export type BusinessModulesDashboardLabels = {
  readonly workspaceLabel: string;
  readonly workspaceReference: (id: string) => string;
  readonly loading: string;
  readonly empty: string;
  readonly create: string;
  readonly unavailable: string;
  readonly unavailableHint: string;
  readonly retry: string;
};

/** Existing module center contract used after the business workspace has been resolved. */
export type BusinessModuleCenter = ComponentType<{
  readonly workspaceId: string;
  readonly layout: "ledger";
}>;

/** Closed presentation states; ambiguity never falls through to an arbitrary workspace. */
export type BusinessModulesDashboardProps = {
  readonly state: "resting";
  readonly labels: BusinessModulesDashboardLabels;
} | {
  readonly state: "empty";
  readonly labels: BusinessModulesDashboardLabels;
  readonly onCreate: () => void;
} | {
  readonly state: "refused";
  readonly labels: BusinessModulesDashboardLabels;
  readonly onRetry: () => void;
  readonly isRetrying?: boolean;
} | {
  readonly state: "ready";
  readonly labels: BusinessModulesDashboardLabels;
  readonly workspace: {
    readonly id: string;
    readonly name: string;
    readonly status: string;
  };
  readonly moduleCenter: BusinessModuleCenter;
};

/** Draw one business's module dashboard without exposing multi-workspace management. */
export const BusinessModulesDashboardBase = (props: BusinessModulesDashboardProps) => {
  if (props.state === "resting") return <SurfaceCard label={props.labels.workspaceLabel}>
    <Text isSkeleton>{props.labels.loading}</Text>
  </SurfaceCard>;
  if (props.state === "empty") return <SurfaceCard label={props.labels.workspaceLabel}>
    <EmptyNotice message={props.labels.empty} actionLabel={props.labels.create} actionVariant="primary" onAction={props.onCreate} />
  </SurfaceCard>;
  if (props.state === "refused") return <SurfaceCard label={props.labels.workspaceLabel} state="negative">
    <EmptyNotice
      message={props.labels.unavailable}
      description={props.labels.unavailableHint}
      actionLabel={props.labels.retry}
      isActionPending={props.isRetrying}
      onAction={props.onRetry}
    />
  </SurfaceCard>;
  const ModuleCenter = props.moduleCenter;
  return <div className={BUSINESS_MODULES_CLASS_NAME}>
    <SurfaceCard label={props.labels.workspaceLabel} composition="joined">
      <div className={WORKSPACE_IDENTITY_CLASS_NAME}>
        <Text weight="semibold">{props.workspace.name}</Text>
        <Badge tone={props.workspace.status === "active" || props.workspace.status === "ready" ? "success" : "warning"}>{props.workspace.status}</Badge>
        <Text size="xs" tone="muted">{props.labels.workspaceReference(props.workspace.id)}</Text>
      </div>
    </SurfaceCard>
    <ModuleCenter workspaceId={props.workspace.id} layout="ledger" />
  </div>;
};
