import { Button, Checkbox, SurfaceCard, Text, Heading, defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import type { AgentosModuleStudio } from "@/modules/api/console"

/** Exact versioned specification state and acknowledgement action. */
export type AgentOSModuleSpecificationViewProps = {
    readonly studio?: AgentosModuleStudio
    readonly state: "loading" | "refused" | "incomplete" | "ready" | "publishing"
    readonly acknowledged: boolean
    readonly pending: boolean
    readonly labels: { readonly title: string, readonly refused: string, readonly incomplete: string, readonly version: string, readonly acknowledge: string, readonly publish: string, readonly publishing: string, readonly published: string }
    readonly onAcknowledge: (value: boolean) => void
    readonly onPublish: () => void
}

/** Draw immutable review evidence and gate publishing on exact-version acknowledgement. */
export const AgentOSModuleSpecificationBase = ({ studio, state, acknowledged, pending, labels, onAcknowledge, onPublish }: AgentOSModuleSpecificationViewProps) => {
    if (state === "refused") return <SurfaceCard props={{ label: labels.title }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", { note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.refused, size: "sm", tone: "muted" }} />) })} />
    if (state === "incomplete") return <SurfaceCard props={{ label: labels.title }} contract="centred-empty-notice" render={defineContractComponent("centred-empty-notice", { notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: labels.incomplete }} />) })} />
    const loading = state === "loading"
    const version = studio?.specification?.version ?? 0
    const facts = studio?.profileFacts.length ? studio.profileFacts : [{ key: labels.title, value: "" }]
    return <SurfaceCard contract="module-specification-review" render={defineContractComponent("module-specification-review", {
        heading: defineContractComponent("title-with-baseline-fact", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.title, level: 3 }} isLoading={loading} />),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.version.replace("{version}", String(version)), size: "sm", tone: "muted" }} isLoading={loading} />),
        }),
        summary: defineContractComponent("labelled-fact-stack", { fact: facts.map((fact) => defineContractComponent("label-value-row", { label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact.key, size: "sm" }} isLoading={loading} />), value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact.value, size: "sm", weight: "semibold" }} isLoading={loading} />) })) }),
        acknowledgement: defineLeafComponent("checkbox", {}, () => <Checkbox props={{ label: labels.acknowledge.replace("{version}", String(version)), isSelected: acknowledged }} on={{ change: onAcknowledge }} />),
        action: defineLeafComponent("button", {}, () => <Button props={{ label: state === "publishing" ? labels.publishing : labels.publish, variant: "primary", isPending: pending, disabled: !acknowledged || version === 0 }} on={{ press: onPublish }} />),
        ...(studio?.module.installationId === null ? {} : { notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.published, size: "sm", tone: "muted" }} />) }),
    })} isLoading={loading} />
}

/** Source-level tier marker for the pure specification block. */
export const meta = { shape: "block", world: "pure" } as const
