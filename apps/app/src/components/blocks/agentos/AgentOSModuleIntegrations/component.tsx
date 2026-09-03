
import { SurfaceCard, Button, Button as CoreButton, Input, Text } from "@starci/grammar/core";
import type { AgentosModuleStudio } from "@/modules/api/console";
/** Public API role for AgentOSModuleIntegrationsProps. */
export type AgentOSModuleIntegrationsProps = AgentOSModuleIntegrationsViewProps;
type AgentOSModuleIntegrationsViewProps = {
  readonly studio?: AgentosModuleStudio;
  readonly state: "loading" | "refused" | "ready";
  readonly secret: string;
  readonly pending: boolean;
  readonly labels: {
    readonly title: string;
    readonly provider: string;
    readonly field: string;
    readonly placeholder: string;
    readonly save: string;
    readonly remove: string;
    readonly refused: string;
    readonly writeOnly: string;
    readonly reveal: string;
    readonly hide: string;
  };
  readonly onSecret: (value: string) => void;
  readonly onSave: () => void;
  readonly onRemove: (provider: string) => void;
};

/** Draw masked provider status beside the write-only replacement operation. */
export const AgentOSModuleIntegrationsBase = (props: AgentOSModuleIntegrationsProps) => {
  const {
    studio,
    state,
    secret,
    pending,
    labels,
    onSecret,
    onSave,
    onRemove
  }: AgentOSModuleIntegrationsViewProps = props;
  if (state === "refused") return <SurfaceCard
    label={labels.title}
  ><div><Text size="sm" tone="muted">{labels.refused}</Text></div></SurfaceCard>;
  const integrations = state === "loading" ? [{
    id: "loading",
    providerKey: labels.provider,
    maskedHint: "",
    status: "configured" as const
  }] : studio?.integrations ?? [];
  return <SurfaceCard
    label={labels.title}
  ><div>{integrations.map((integration, index) => <div key={index}><div>

          <Text size="sm" weight="semibold" isSkeleton={state === "loading"}>{integration.providerKey}</Text>
          <Text size="xs" isSkeleton={state === "loading"}>{integration.maskedHint}</Text></div>

        <Button variant="ghost" size="sm" isDisabled={pending} isSkeleton={state === "loading"} onPress={() => onRemove(integration.providerKey)}>{labels.remove}</Button></div>)}
      <Input
        id="integration-key"
        name="integrationKey"
        label={labels.field}
        placeholder={labels.placeholder}
        kind="password"
        revealLabel={labels.reveal}
        hideLabel={labels.hide}
        isDisabled={pending}
        variant="secondary"
        onValueChange={onSecret}
      />
      <CoreButton
        variant="secondary"
        isPending={pending}
        isDisabled={secret.trim().length < 4}
        onPress={onSave}
      >{labels.save}</CoreButton>
      <Text size="xs">{labels.writeOnly}</Text></div></SurfaceCard>;
};

