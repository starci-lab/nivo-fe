import { Heading, SurfaceCard, SurfaceListCard, Text, Tree, defineContractComponent, defineLeafComponent, type LeafProps } from "@nivo/ui"
import type { SurfaceListCardActions } from "@nivo/ui/branches/SurfaceListCard"

/** One exact domain fact displayed in infrastructure context. */
export type InfrastructureDomainFact = { readonly id: string, readonly label: string, readonly value: string }
/** Independently settled domain evidence states. */
export type InfrastructureDomainsState =
    | { readonly phase: "pending" }
    | { readonly phase: "empty", readonly note: string }
    | { readonly phase: "populated", readonly facts: ReadonlyArray<InfrastructureDomainFact> }
    | { readonly phase: "failed", readonly note: string }
    | { readonly phase: "partial", readonly facts: ReadonlyArray<InfrastructureDomainFact>, readonly note: string }
/** Pure infrastructure summary input derived from service and domain evidence. */
export type InfrastructureSummaryProps = { readonly label: string, readonly context: string, readonly domains: InfrastructureDomainsState }

const fact = (item: InfrastructureDomainFact, isLoading = false) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.label, size: "sm" }} isLoading={isLoading} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.value, size: "sm" }} isLoading={isLoading} />),
})
const refusal = (note: string) => defineContractComponent("body-with-refusal-note", {
    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
})

const domainEvidenceContent = (renderedFacts: ReadonlyArray<ReturnType<typeof fact>>) => (
    defineContractComponent("domain-evidence-list", (input: LeafProps<{ readonly label: string, readonly description: string }, SurfaceListCardActions>) => (
        <Tree key={`${input.props.label}:${input.props.description}`} contract="domain-evidence-list" render={defineContractComponent("domain-evidence-list", { fact: renderedFacts })} />
    ))
)

/** Draw derived service context beside independently settled domain evidence. */
export const InfrastructureSummaryBase = ({ label, context, domains }: InfrastructureSummaryProps) => {
    const isLoading = domains.phase === "pending"
    const facts = domains.phase === "populated" || domains.phase === "partial" ? domains.facts : []
    const note = domains.phase === "empty" || domains.phase === "failed" || domains.phase === "partial" ? domains.note : undefined
    if (domains.phase === "pending" || domains.phase === "populated" || domains.phase === "partial") {
        const renderedFacts = isLoading ? [fact({ id: "pending-1", label: "", value: "" }, true), fact({ id: "pending-2", label: "", value: "" }, true)] : facts.map((item) => fact(item))
        const content = domainEvidenceContent(renderedFacts)
        return <SurfaceListCard props={{ label, description: note === undefined ? context : `${context} ${note}` }} contract="domain-evidence-list" render={content} isLoading={isLoading} />
    }
    return <SurfaceCard contract="infrastructure-summary" render={defineContractComponent("infrastructure-summary", {
        heading: defineContractComponent("title-with-end-action", { title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level: 3 }} />) }),
        context: defineLeafComponent("text", {}, () => <Text props={{ content: context, size: "sm" }} />),
        ...(facts.length > 0 ? { domains: defineContractComponent("labelled-fact-stack", { fact: facts.map((item) => fact(item)) }) } : {}),
        ...(note === undefined ? {} : { note: refusal(note) }),
    })} />
}

/** Registry identity for the pure infrastructure summary twin. */
export const meta = { shape: "block", world: "pure" } as const
