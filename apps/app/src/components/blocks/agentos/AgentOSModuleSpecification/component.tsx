import { Button, Checkbox, SurfaceCard, Text, Heading } from "@nivo/ui";
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice";
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
  if (state === "refused") return <SurfaceCard props={{
    label: labels.title
  }}><div><Text props={{
        content: labels.refused,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
  if (state === "incomplete") return <SurfaceCard props={{
    label: labels.title
  }}><div><EmptyNotice props={{
        message: labels.incomplete
      }} /></div></SurfaceCard>;
  const loading = state === "loading";
  const version = studio?.specification?.version ?? 0;
  const facts = studio?.profileFacts.length ? studio.profileFacts : [{
    key: labels.title,
    value: ""
  }];
  return <SurfaceCard isLoading={loading}><div><div><Heading props={{
          content: labels.title,
          level: 3
        }} isLoading={loading} /><Text props={{
          content: labels.version.replace("{version}", String(version)),
          size: "sm",
          tone: "muted"
        }} isLoading={loading} /></div><div>{facts.map((fact, index) => <div key={index}><Text props={{
            content: fact.key,
            size: "sm"
          }} isLoading={loading} /><Text props={{
            content: fact.value,
            size: "sm",
            weight: "semibold"
          }} isLoading={loading} /></div>)}</div><Checkbox props={{
        label: labels.acknowledge.replace("{version}", String(version)),
        isSelected: acknowledged
      }} on={{
        change: onAcknowledge
      }} /><Button props={{
        label: state === "publishing" ? labels.publishing : labels.publish,
        variant: "primary",
        isPending: pending,
        disabled: !acknowledged || version === 0
      }} on={{
        press: onPublish
      }} /></div></SurfaceCard>;
};

