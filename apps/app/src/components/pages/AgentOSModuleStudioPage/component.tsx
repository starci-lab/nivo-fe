"use client"

import { createContext, useContext, type ComponentType } from "react"
import { Breadcrumbs, Heading, Text, TileIcon, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleStudio } from "@/modules/api/console"
import { AgentOSModuleAttachments } from "@/components/blocks/agentos/AgentOSModuleAttachments"
import { AgentOSModuleIntegrations } from "@/components/blocks/agentos/AgentOSModuleIntegrations"
import { AgentOSModuleInterview } from "@/components/blocks/agentos/AgentOSModuleInterview"
import { AgentOSModuleProfile } from "@/components/blocks/agentos/AgentOSModuleProfile"
import { AgentOSModuleSpecification } from "@/components/blocks/agentos/AgentOSModuleSpecification"

type AgentOSModuleStudioPageViewProps = { readonly workspaceId: string, readonly moduleId: string, readonly labels: { readonly path: string, readonly modules: string, readonly title: string, readonly description: string, readonly eyebrow: string, readonly sections: string }, readonly onBack: () => void }

type AgentOSModuleStudioProjection = {
    readonly studio: AgentosModuleStudio | null | undefined
    readonly refresh: () => Promise<void>
}

type AgentOSModuleStudioProjectionProviderProps<P extends object> = {
    readonly value: AgentOSModuleStudioProjection
    readonly render: ComponentType<P>
    readonly renderProps: P
}

const AgentOSModuleStudioProjectionContext = createContext<AgentOSModuleStudioProjection | null>(null)

/** Share one page-owned studio read while child blocks keep their own mutation and pending state. */
export const AgentOSModuleStudioProjectionProvider = <P extends object>({ value, render: Content, renderProps }: AgentOSModuleStudioProjectionProviderProps<P>) => (
    <AgentOSModuleStudioProjectionContext.Provider value={value}><Content {...renderProps} /></AgentOSModuleStudioProjectionContext.Provider>
)

/** Read the page-owned projection without repeating the module-studio request in sibling blocks. */
export const useAgentOSModuleStudioProjection = () => {
    const projection = useContext(AgentOSModuleStudioProjectionContext)
    if (projection === null) throw new Error("AgentOSModuleStudioProjectionProvider is required")
    return projection
}

/** Compose independently-owned interview, profile, file, integration and review sections. */
export const AgentOSModuleStudioPageBase = ({ workspaceId, moduleId, labels, onBack }: AgentOSModuleStudioPageViewProps) => (
    <Tree contract="agentos-route-page" render={defineContractComponent("agentos-route-page", {
        path: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ mode: "back", label: labels.path, backLabel: labels.modules }} on={{ back: onBack }} />),
        heading: defineContractComponent("agentos-page-heading", { identity: defineContractComponent("agentos-page-identity", {
            mark: defineLeafComponent("tile-icon", {}, () => <TileIcon props={{ icon: "agentos", signal: "attention" }} />),
            copy: defineContractComponent("agentos-page-title-stack", {
                eyebrow: defineLeafComponent("text", { size: "sm", tone: "accent" }, () => <Text props={{ content: labels.eyebrow, size: "sm", tone: "accent", weight: "semibold" }} />),
                title: defineLeafComponent("heading", { scale: "display" }, () => <Heading props={{ content: labels.title, level: 1, scale: "display" }} />),
                description: defineLeafComponent("text", { size: "md", tone: "muted" }, () => <Text props={{ content: labels.description, size: "md", tone: "muted" }} />),
            }),
        }) }),
        sectionHeading: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.sections, level: 2 }} />),
        section: [defineContractProjection("label-row-over-card", () => <Tree contract="console-primary-aside" render={defineContractComponent("console-primary-aside", {
            primary: defineContractComponent("console-section-stack", { section: [
                defineContractProjection("label-row-over-card", () => <AgentOSModuleInterview workspaceId={workspaceId} moduleId={moduleId} />),
                defineContractProjection("label-row-over-card", () => <AgentOSModuleSpecification workspaceId={workspaceId} moduleId={moduleId} />),
            ] }),
            aside: defineContractComponent("console-section-stack", { section: [defineContractProjection("label-row-over-card", () => <AgentOSModuleProfile workspaceId={workspaceId} moduleId={moduleId} />), defineContractProjection("label-row-over-card", () => <AgentOSModuleAttachments workspaceId={workspaceId} moduleId={moduleId} />), defineContractProjection("label-row-over-card", () => <AgentOSModuleIntegrations workspaceId={workspaceId} moduleId={moduleId} />)] }),
        })} />)],
    })} />
)

/** Source-level tier marker for the pure module studio page. */
export const meta = { shape: "page", world: "pure" } as const
