import { Button, Field, SurfaceCard, Text, defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleStudio } from "@/modules/api/console"

type AgentOSModuleIntegrationsViewProps = { readonly studio?: AgentosModuleStudio, readonly state: "loading" | "refused" | "ready", readonly secret: string, readonly pending: boolean, readonly labels: { readonly title: string, readonly provider: string, readonly field: string, readonly placeholder: string, readonly save: string, readonly remove: string, readonly refused: string, readonly writeOnly: string, readonly reveal: string, readonly hide: string }, readonly onSecret: (value: string) => void, readonly onSave: () => void, readonly onRemove: (provider: string) => void }

/** Draw masked provider status beside the write-only replacement operation. */
export const AgentOSModuleIntegrationsBase = ({ studio, state, secret, pending, labels, onSecret, onSave, onRemove }: AgentOSModuleIntegrationsViewProps) => {
    if (state === "refused") return <SurfaceCard props={{ label: labels.title }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", { note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.refused, size: "sm", tone: "muted" }} />) })} />
    const integrations = state === "loading" ? [{ id: "loading", providerKey: labels.provider, maskedHint: "", status: "configured" as const }] : (studio?.integrations ?? [])
    return <SurfaceCard props={{ label: labels.title }} contract="module-integration-list" render={defineContractComponent("module-integration-list", {
        integration: integrations.map((integration) => defineContractComponent("subject-over-muted-caption-with-action", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", {}, () => <Text props={{ content: integration.providerKey, size: "sm", weight: "semibold" }} isLoading={state === "loading"} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: integration.maskedHint, size: "xs" }} isLoading={state === "loading"} />),
            }),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.remove, size: "sm", variant: "ghost", disabled: pending }} on={{ press: () => onRemove(integration.providerKey) }} isLoading={state === "loading"} />),
        })),
        key: defineCompositeComponent("field", {}, () => <Field props={{ id: "integration-key", name: "integrationKey", label: labels.field, placeholder: labels.placeholder, kind: "password", revealLabel: labels.reveal, hideLabel: labels.hide, disabled: pending }} on={{ change: onSecret }} />),
        action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.save, variant: "secondary", isPending: pending, disabled: secret.trim().length < 4 }} on={{ press: onSave }} />),
        notice: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: labels.writeOnly, size: "xs" }} />),
    })} />
}

/** Source-level tier marker for the pure integrations block. */
export const meta = { shape: "block", world: "pure" } as const
