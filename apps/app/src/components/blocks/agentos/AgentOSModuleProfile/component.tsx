import { LabelledProgressRow, SurfaceCard, Text, defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleStudio } from "@/modules/api/console"

type AgentOSModuleProfileViewProps = { readonly studio?: AgentosModuleStudio, readonly loading: boolean, readonly refused: boolean, readonly labels: { readonly title: string, readonly progress: string, readonly missing: string, readonly refused: string } }

/** Draw backend-owned completeness, accepted facts and unresolved profile fields. */
export const AgentOSModuleProfileBase = ({ studio, loading, refused, labels }: AgentOSModuleProfileViewProps) => {
    if (refused) return <SurfaceCard props={{ label: labels.title }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", { note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.refused, size: "sm", tone: "muted" }} />) })} />
    const facts = loading ? [{ key: labels.title, value: "" }] : (studio?.profileFacts ?? [])
    return <SurfaceCard props={{ label: labels.title }} contract="live-module-profile" render={defineContractComponent("live-module-profile", {
        progress: defineCompositeComponent("labelled-progress-row", {}, () => <LabelledProgressRow props={{ id: "module-progress", title: labels.progress, percent: studio?.module.progress ?? 0, percentText: `${studio?.module.progress ?? 0}%` }} isLoading={loading} />),
        facts: defineContractComponent("labelled-fact-stack", { fact: facts.map((fact) => defineContractComponent("label-value-row", { label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact.key, size: "sm" }} isLoading={loading} />), value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact.value, size: "sm", weight: "semibold" }} isLoading={loading} />) })) }),
        ...(studio?.module.missingFields.length ? { missing: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: labels.missing.replace("{fields}", studio.module.missingFields.join(", ")), size: "xs" }} />) } : {}),
    })} />
}

/** Source-level tier marker for the pure profile block. */
export const meta = { shape: "block", world: "pure" } as const
