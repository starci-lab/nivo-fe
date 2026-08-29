import { Button, Field, SurfaceCard, Text } from "@nivo/ui";
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
  if (state === "refused") return <SurfaceCard props={{
    label: labels.title
  }}><div><Text props={{
        content: labels.refused,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
  const integrations = state === "loading" ? [{
    id: "loading",
    providerKey: labels.provider,
    maskedHint: "",
    status: "configured" as const
  }] : studio?.integrations ?? [];
  return <SurfaceCard props={{
    label: labels.title
  }}><div>{integrations.map((integration, index) => <div key={index}><div>

          <Text props={{
            content: integration.providerKey,
            size: "sm",
            weight: "semibold"
          }} isLoading={state === "loading"} />
          <Text props={{
            content: integration.maskedHint,
            size: "xs"
          }} isLoading={state === "loading"} /></div>

        <Button props={{
          label: labels.remove,
          size: "sm",
          variant: "ghost",
          disabled: pending
        }} on={{
          press: () => onRemove(integration.providerKey)
        }} isLoading={state === "loading"} /></div>)}
      <Field props={{
        id: "integration-key",
        name: "integrationKey",
        label: labels.field,
        placeholder: labels.placeholder,
        kind: "password",
        revealLabel: labels.reveal,
        hideLabel: labels.hide,
        disabled: pending
      }} on={{
        change: onSecret
      }} />
      <Button props={{
        label: labels.save,
        variant: "secondary",
        isPending: pending,
        disabled: secret.trim().length < 4
      }} on={{
        press: onSave
      }} />
      <Text props={{
        content: labels.writeOnly,
        size: "xs"
      }} /></div></SurfaceCard>;
};

