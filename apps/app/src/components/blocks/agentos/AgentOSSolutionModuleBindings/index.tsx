import { Heading, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleInstallationDetail } from "@/modules/api/console"

/** Runtime bindings and resolved labels consumed by the module bindings block. */
type AgentOSSolutionModuleBindingsLabels = {
    readonly section: string
    readonly agents: string
    readonly channels: string
    readonly sharedKnowledge: string
    readonly knowledgeVersions: string
    readonly empty: string
}

/** Closed pending and answered inputs for the generated binding inventory. */
export type AgentOSSolutionModuleBindingsProps = {
    readonly labels: {
        readonly [K in keyof AgentOSSolutionModuleBindingsLabels]: AgentOSSolutionModuleBindingsLabels[K]
    }
} & (
    | { readonly state: "pending"; readonly installation?: never }
    | { readonly state: "ready"; readonly installation: AgentosModuleInstallationDetail }
)

const displayedBindings = (values: ReadonlyArray<string> | undefined, empty: string, isLoading: boolean): ReadonlyArray<string | undefined> => {
    if (isLoading) return [undefined, undefined]
    if (values?.length === 0) return [empty]
    return values ?? []
}

const bindingGroup = (name: string, values: ReadonlyArray<string> | undefined, empty: string, isLoading: boolean) => defineContractComponent("binding-identity-list", {
    name: defineLeafComponent("heading", {}, () => <Heading props={{ content: name, level: 4 }} />),
    identity: displayedBindings(values, empty, isLoading).map((value) => (
        defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: value, size: "sm" }} isLoading={isLoading} />
        ))
    )),
})

/** Render generated agents, channels and common/private knowledge versions from the live snapshot. */
export const AgentOSSolutionModuleBindings = (input: AgentOSSolutionModuleBindingsProps) => {
    const isLoading = input.state === "pending"
    const installation = input.state === "ready" ? input.installation : undefined
    const { labels } = input

    return (
        <SurfaceCard
            props={{ label: labels.section }}
            contract="module-bindings"
            render={defineContractComponent("module-bindings", {
                group: [
                    bindingGroup(labels.agents, installation?.generatedAgentIds, labels.empty, isLoading),
                    bindingGroup(labels.channels, installation?.channelAccountRefs, labels.empty, isLoading),
                    bindingGroup(labels.sharedKnowledge, installation?.sharedKnowledgeSourceIds, labels.empty, isLoading),
                    bindingGroup(labels.knowledgeVersions, installation === undefined ? undefined : [
                        installation.commonKnowledgeVersion,
                        installation.privateKnowledgeVersion,
                    ], labels.empty, isLoading),
                ],
            })}
        />
    )
}

/** Source-level tier marker for the pure module bindings block. */
export const meta = { shape: "block", world: "pure" } as const
