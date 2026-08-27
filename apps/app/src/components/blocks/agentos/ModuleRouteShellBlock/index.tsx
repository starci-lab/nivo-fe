"use client"

import type { ComponentType } from "react"
import {
    Badge, Breadcrumbs, ChoiceTabs, Heading, Text, TileIcon, Tree,
    defineContractComponent, defineContractProjection, defineLeafComponent,
} from "@nivo/ui"

/** Stable routed task identities owned by the shared installed-module shell. */
export type AgentOSModuleView = "setup" | "test" | "operate" | "settings" | "diagnostics"

/** Exact Grammar bodies admitted below the persistent module identity and navigation. */
export type AgentOSModuleBodyContract =
    | "agentos-setup-layout" | "agentos-test-layout" | "agentos-operate-layout" | "agentos-settings-layout" | "agentos-diagnostics-layout"

/** Copy and runtime identity shared by every route in one installed module. */
export type ModuleRouteShellData = {
    readonly workspaceLabel: string
    readonly moduleName: string
    readonly moduleKind: string
    readonly lifecycleLabel: string
    readonly contextVersion: string
    readonly channelLabel: string
    readonly controllerLabel: string
    readonly activeView: AgentOSModuleView
}

/** Stable component-type lane used to replace the shell body without accepting prebuilt JSX. */
export type ModuleRouteShellBlockProps<P extends object> = ModuleRouteShellData & {
    readonly bodyContract: AgentOSModuleBodyContract
    readonly content: ComponentType<P>
    readonly contentProps: P
    readonly onBackToModules: () => void
    readonly onNavigate: (view: AgentOSModuleView) => void
}

const ROUTES: ReadonlyArray<{ readonly id: AgentOSModuleView; readonly label: string }> = [
    { id: "setup", label: "Setup" },
    { id: "test", label: "Test" },
    { id: "operate", label: "Operate" },
    { id: "settings", label: "Settings" },
    { id: "diagnostics", label: "Diagnostics" },
]

/** Keep module identity and context continuity stable while one typed task body changes. */
export const ModuleRouteShellBlock = <P extends object>({
    workspaceLabel,
    moduleName,
    moduleKind,
    lifecycleLabel,
    contextVersion,
    channelLabel,
    controllerLabel,
    activeView,
    bodyContract,
    content: Content,
    contentProps,
    onBackToModules,
    onNavigate,
}: ModuleRouteShellBlockProps<P>) => (
    <Tree contract="agentos-module-shell-page" render={defineContractComponent("agentos-module-shell-page", {
        path: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    mode: "trail",
                    label: "AgentOS module path",
                    steps: [
                        { id: "workspace", label: workspaceLabel },
                        { id: "modules", label: "Modules" },
                        { id: "module", label: moduleName, isCurrent: true },
                    ],
                }}
                on={{ activate: (id) => id !== "module" && onBackToModules() }}
            />
        )),
        heading: defineContractComponent("agentos-page-heading", {
            identity: defineContractComponent("agentos-page-identity", {
                mark: defineLeafComponent("tile-icon", {}, () => <TileIcon props={{ icon: "agentos", signal: "attention" }} />),
                copy: defineContractComponent("agentos-page-title-stack", {
                    eyebrow: defineLeafComponent("text", { size: "sm", tone: "accent" }, () => (
                        <Text props={{ content: moduleKind, size: "sm", tone: "accent", weight: "semibold" }} />
                    )),
                    title: defineLeafComponent("heading", { scale: "display" }, () => (
                        <Heading props={{ content: moduleName, level: 1, scale: "display" }} />
                    )),
                    description: defineLeafComponent("text", { size: "md", tone: "muted" }, () => (
                        <Text props={{ content: `Active context ${contextVersion} · ${channelLabel} · ${controllerLabel}`, size: "md", tone: "muted" }} />
                    )),
                    status: defineLeafComponent("badge", {}, () => <Badge props={{ content: lifecycleLabel, tone: "success" }} />),
                }),
            }),
        }),
        navigation: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{ label: "Module sections", selectedKey: activeView, tabs: ROUTES, variant: "secondary" }}
                on={{ select: (key) => onNavigate(key as AgentOSModuleView) }}
            />
        )),
        body: defineContractProjection(bodyContract, () => <Content {...contentProps} />),
    })} />
)

/** Source-level tier marker for the pure shared module shell. */
export const meta = { shape: "block", world: "pure" } as const
