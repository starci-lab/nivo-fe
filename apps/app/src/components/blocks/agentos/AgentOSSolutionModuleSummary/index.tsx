
import { SurfaceCard, Text, Badge, type BadgeTone } from "@starci/grammar/core";
import type { AgentosModuleInstallationDetail } from "@/modules/api/console";

/** Canonical installation snapshot and resolved labels consumed by the summary block. */
type AgentOSSolutionModuleSummaryLabels = {
  readonly section: string;
  readonly module: string;
  readonly version: string;
  readonly status: string;
  readonly failure: string;
  readonly modelProfile: string;
  readonly manifest: string;
  readonly empty: string;
};

/** Closed pending and answered inputs for the immutable installation summary. */
export type AgentOSSolutionModuleSummaryProps = {
  readonly labels: { readonly [K in keyof AgentOSSolutionModuleSummaryLabels]: AgentOSSolutionModuleSummaryLabels[K] };
} & ({
  readonly state: "pending";
  readonly installation?: never;
} | {
  readonly state: "ready";
  readonly installation: AgentosModuleInstallationDetail;
});
const fact = (label: string, value?: string, isLoading = false) => <div>
  <Text size="sm">{label}</Text>
  <Text size="sm" isSkeleton={isLoading}>{value}</Text></div>;
const statusTone = (status: AgentosModuleInstallationDetail["status"]): BadgeTone => {
  if (status === "ready") return "success";
  if (status === "failed") return "danger";
  return "accent";
};

/** Render package identity and lifecycle separately from generated runtime bindings. */
export const AgentOSSolutionModuleSummary = (props: AgentOSSolutionModuleSummaryProps) => {
  const isLoading = props.state === "pending";
  const installation = props.state === "ready" ? props.installation : undefined;
  const {
    labels
  } = props;
  return <SurfaceCard
    label={labels.section}
  ><div>



        <Text size="md" weight="semibold" isSkeleton={isLoading}>{installation?.moduleKey}</Text>



        <Badge tone={installation === undefined ? "neutral" : statusTone(installation.status)} isSkeleton={isLoading}>{installation?.status}</Badge><div><>{fact(labels.module, installation?.moduleKey, isLoading)}{fact(labels.version, installation?.moduleVersion, isLoading)}{fact(labels.status, installation?.status, isLoading)}{fact(labels.modelProfile, installation?.modelProfileRef, isLoading)}{fact(labels.manifest, installation?.manifestDigest, isLoading)}{fact(labels.failure, installation?.failureCode ?? (isLoading ? undefined : labels.empty), isLoading)}</></div></div></SurfaceCard>;
};
