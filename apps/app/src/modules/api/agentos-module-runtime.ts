/**
 * The runtime of one installed module: manifest, sessions, messages, tasks, widgets and channel settings.
 *
 * Operation result and input types come from generated documents. JSON manifest and message-tree values are
 * mapped into application views because the backend contract exposes those values as opaque JSON scalars.
 */

import { type Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import { parseModuleRuntime } from "./agentos-module-runtime.guards"
import { parseChannelSetting } from "./agentos-module-runtime-channel.guards"
import type { AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "./agentos-runtime-tree"
import type { AgentosModuleTestContractView } from "./agentos-module-tests"
import {
    ConfigureAgentWorkspaceChannelDocument,
    ManageAgentosModuleRuntimeDocument,
    MyAgentosModuleRuntimeDocument,
} from "./__generated__/core"
import type {
    ConfigureAgentWorkspaceChannelMutation,
    ConfigureAgentWorkspaceChannelMutationVariables,
    ManageAgentosModuleRuntimeMutation,
    ManageAgentosModuleRuntimeMutationVariables,
    MyAgentosModuleRuntimeQuery,
} from "./__generated__/core"

type ConfigureChannelSetting = NonNullable<
    ConfigureAgentWorkspaceChannelMutation["configureAgentWorkspaceChannel"]["data"]
>

/** Closed message-tree view mapped from the backend's opaque JSON messageTree scalar. */
export type AgentosRuntimeMessageTreeView = {
    readonly schemaVersion: 1
    readonly nodes: ReadonlyArray<
        | { readonly type: "markdown"; readonly markdown: string }
        | { readonly type: "widget"; readonly widget: AgentosRuntimeWidgetNode }
        | { readonly type: "attachment"; readonly attachmentId: string; readonly label: string; readonly mediaType: string }
    >
}

/** Runtime-manifest view mapped from the backend's opaque JSON runtimeManifest scalar. */
export type AgentosRuntimeManifestView = {
    readonly schemaVersion: number
    readonly kind: { readonly key: string; readonly version: string }
    readonly workbench: { readonly key: string; readonly version: string }
    readonly test?: AgentosModuleTestContractView
    readonly setup?: {
        readonly schemaVersion: 1
        readonly contract: { readonly key: string; readonly version: string }
        readonly requirements: ReadonlyArray<{
            readonly key: string
            readonly label: string
            readonly validator: { readonly key: string; readonly version: string }
            readonly dependencies: ReadonlyArray<"authority" | "source" | "retrieval">
            readonly citationPolicy: "none" | "attachment-content"
            readonly ownerConfirmation: boolean
            readonly requiredFor: ReadonlyArray<"acceptance" | "apply">
            readonly guidance?: string
            readonly valueSchema?: Readonly<Record<string, AgentosRuntimeValue>>
        }>
        readonly requiredAcceptanceScenarios: ReadonlyArray<string>
    }
    readonly operations?: {
        readonly replyContract: { readonly key: string; readonly version: string }
        readonly taskContract: { readonly key: string; readonly version: string }
        readonly toolSchema: { readonly key: string; readonly version: string }
        readonly proactiveWidget: { readonly key: string; readonly version: string }
        readonly setupFields: ReadonlyArray<string>
    }
    readonly widgets: ReadonlyArray<{
        readonly component: string
        readonly version: string
        readonly allowedProps: ReadonlyArray<string>
        readonly actions: ReadonlyArray<{ readonly key: string; readonly inputKeys: ReadonlyArray<string> }>
    }>
    readonly credentialSlots?: ReadonlyArray<{
        readonly key: string
        readonly label: string
        readonly provider: string
        readonly secret: true
    }>
    readonly config: Readonly<Record<string, AgentosRuntimeValue>>
}

/** Channel setting view with the existing status labels mapped from the generated GraphQL enum. */
export type AgentWorkspaceChannelSettingView = {
    readonly provider: ConfigureChannelSetting["provider"]
    readonly accountId: ConfigureChannelSetting["accountId"]
    readonly state: "NOT_CONFIGURED" | "PENDING" | "APPLIED" | "ERROR"
    readonly displayName: ConfigureChannelSetting["displayName"]
    readonly credentials: ConfigureChannelSetting["credentials"]
}

/** Read one shared Module Studio runtime with progressive diagnostics disclosure. */
export const myAgentosModuleRuntime = (
    installationId: string,
    includeDiagnostics = false,
): Promise<Outcome<NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>>> =>
    graphql(MyAgentosModuleRuntimeDocument, parseModuleRuntime, {
        request: { installationId, includeDiagnostics },
    })

/** Apply one explicit Setup, Execute, widget, or settings command and return the settled runtime. */
export const manageAgentosModuleRuntime = (
    input: ManageAgentosModuleRuntimeMutationVariables["input"],
): Promise<Outcome<NonNullable<ManageAgentosModuleRuntimeMutation["manageAgentosModuleRuntime"]["data"]>>> =>
    graphql(ManageAgentosModuleRuntimeDocument, parseModuleRuntime, { input })

/** Deliver one write-only Telegram credential set to the owning Agent Workspace controller. */
export const configureAgentWorkspaceChannel = (
    input: ConfigureAgentWorkspaceChannelMutationVariables["input"],
): Promise<Outcome<AgentWorkspaceChannelSettingView>> =>
    graphql(ConfigureAgentWorkspaceChannelDocument, parseChannelSetting, { input })
