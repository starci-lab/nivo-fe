import { Checkbox } from "@nivo/ui";
import { SurfaceCard, Button, EmptyNotice, Heading, Text } from "@starci/grammar/core";
import type { AgentosModuleStudio } from "@/modules/api/console";

/** Exact versioned specification state and acknowledgement action. */
export type AgentOSModuleSpecificationProps = AgentOSModuleSpecificationViewProps;
/** Public API role for AgentOSModuleSpecificationViewProps. */
export type AgentOSModuleSpecificationViewProps = {
  readonly studio?: AgentosModuleStudio;
  readonly state: "loading" | "refused" | "incomplete" | "ready" | "publishing";
  readonly acknowledged: boolean;
  readonly pending: boolean;
  readonly labels: {
    readonly title: string;
    readonly refused: string;
    readonly incomplete: string;
    readonly version: string;
    readonly acknowledge: string;
    readonly publish: string;
    readonly publishing: string;
    readonly published: string;
  };
  readonly onAcknowledge: (value: boolean) => void;
  readonly onPublish: () => void;
};

/** Draw immutable review evidence and gate publishing on exact-version acknowledgement. */
export const AgentOSModuleSpecificationBase = (props: AgentOSModuleSpecificationProps) => {
  const {
    studio,
    state,
    acknowledged,
    pending,
    labels,
    onAcknowledge,
    onPublish
  }: AgentOSModuleSpecificationViewProps = props;
  if (state === "refused") return <SurfaceCard
    label={labels.title}
  ><div><Text size="sm" tone="muted">{labels.refused}</Text></div></SurfaceCard>;
  if (state === "incomplete") return <SurfaceCard
    label={labels.title}
  ><div><EmptyNotice message={labels.incomplete} /></div></SurfaceCard>;
  const loading = state === "loading";
  const version = studio?.specification?.version ?? 0;
  const facts = studio?.profileFacts.length ? studio.profileFacts : [{
    key: labels.title,
    value: ""
  }];
  return <SurfaceCard><div><div><Heading level={3} isSkeleton={loading}>{labels.title}</Heading><Text size="sm" tone="muted" isSkeleton={loading}>{labels.version.replace("{version}", String(version))}</Text></div><div>{facts.map((fact, index) => <div key={index}><Text size="sm" isSkeleton={loading}>{fact.key}</Text><Text size="sm" weight="semibold" isSkeleton={loading}>{fact.value}</Text></div>)}</div><Checkbox props={{
        label: labels.acknowledge.replace("{version}", String(version)),
        isSelected: acknowledged
      }} on={{
        change: onAcknowledge
      }} /><Button
        variant="primary"
        isPending={pending}
        isDisabled={!acknowledged || version === 0}
        onPress={onPublish}
      >{state === "publishing" ? labels.publishing : labels.publish}</Button></div></SurfaceCard>;
};

