"use client"

import { useEffect, useState, type ComponentType } from "react"
import {
    Button,
    Checkbox,
    ChoiceTabs,
    Field,
    Heading,
    SurfaceCard,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { ContextVersionBlock, type ContextDraft } from "@/components/blocks/agentos/ContextVersionBlock"
import {
    DEFAULT_WIDGET_REGISTRY,
    ExecuteChatBlock,
    type ExecuteMessage,
    type TrustedWidgetComponentProps,
} from "@/components/blocks/agentos/ExecuteChatBlock"
import { ExecuteSessionRailBlock, type ExecuteSession } from "@/components/blocks/agentos/ExecuteSessionRailBlock"
import { DEFAULT_WORKBENCH_REGISTRY, KindWorkbenchBlock } from "@/components/blocks/agentos/KindWorkbenchBlock"
import { DEFAULT_TEST_WORKBENCH_REGISTRY, KindTestWorkbenchBlock } from "@/components/blocks/agentos/KindTestWorkbenchBlock"
import { ModuleCockpitRailBlock } from "@/components/blocks/agentos/ModuleCockpitRailBlock"
import { ModuleRouteShellBlock, type AgentOSModuleView } from "@/components/blocks/agentos/ModuleRouteShellBlock"
import { PrivateSetupChatBlock, type SetupMessage, type SetupRevision } from "@/components/blocks/agentos/PrivateSetupChatBlock"
import { SupportCustomerChatBlock } from "@/components/blocks/agentos/SupportCustomerChatBlock"
import { SupportCustomerConversationRailBlock } from "@/components/blocks/agentos/SupportCustomerConversationRailBlock"
import { SupportQueueWorkbenchBlock } from "@/components/blocks/agentos/SupportQueueWorkbenchBlock"
import { TestTrustResultBlock } from "@/components/blocks/agentos/TestTrustResultBlock"
import type { AgentosModuleRuntime, AgentosModuleTestContract, AgentosModuleTestSurface, AgentosRuntimeValue } from "@/modules/api/console"
import type {
    SupportCustomerConversation,
    SupportCustomerMessage,
    SupportImportantFact,
    SupportTicket,
} from "@/modules/api/workspace-controlplane"

type AgentOSSolutionModuleSupportInbox = {
    readonly conversations: ReadonlyArray<SupportCustomerConversation>
    readonly selectedConversationId: string | null
    readonly messages: ReadonlyArray<SupportCustomerMessage>
    readonly tickets: ReadonlyArray<SupportTicket>
    readonly facts: ReadonlyArray<SupportImportantFact>
    readonly pending: boolean
    readonly refused: boolean
}

/** Keep compact pane visibility in Grammar while callers supply only typed ComponentTypes and props. */
export const cockpitPane = <P extends object>(wideOnly: boolean, Content: ComponentType<P>, contentProps: P) => wideOnly
    ? defineContractComponent("agentos-cockpit-pane-wide-only", {
        body: defineContractProjection("label-row-over-card", () => <Content {...contentProps} />),
    })
    : defineContractComponent("agentos-cockpit-pane", {
        body: defineContractProjection("label-row-over-card", () => <Content {...contentProps} />),
    })

/** Preserve sticky evidence only in the approved right-hand sidecar. */
export const cockpitSidecarPane = <P extends object>(wideOnly: boolean, Content: ComponentType<P>, contentProps: P) => wideOnly
    ? defineContractComponent("agentos-cockpit-sidecar-pane-wide-only", {
        body: defineContractProjection("label-row-over-card", () => <Content {...contentProps} />),
    })
    : defineContractComponent("agentos-cockpit-sidecar-pane", {
        body: defineContractProjection("label-row-over-card", () => <Content {...contentProps} />),
    })

type SetupSurfaceProps = {
    readonly messages: ReadonlyArray<SetupMessage>
    readonly revisions: ReadonlyArray<SetupRevision>
    readonly selectedRevisionId: string
    readonly canSend: boolean
    readonly canStartRevision: boolean
    readonly activeVersion: number | null
    readonly draft: ContextDraft | null
    readonly pending: boolean
    readonly refused: boolean
    readonly compactPane: "versions" | "conversation" | "context"
    readonly onSelectRevision: (sessionId: string) => void
    readonly onStartRevision: () => void
    readonly onSend: (content: string) => void
    readonly onApply: () => void
    readonly onSelectPane: (pane: "versions" | "conversation" | "context") => void
}

const setupVersionsPane = (props: SetupSurfaceProps, wideOnly: boolean) => cockpitPane(wideOnly, ModuleCockpitRailBlock, {
    label: "Setup revisions",
    fact: `${props.revisions.length} total`,
    summary: "Each completed revision produces an immutable context candidate; applying a newer version never rewrites Execute history.",
    items: props.revisions.map((revision) => ({
        id: revision.id,
        label: `Revision r${revision.revision}`,
        status: revision.id === props.selectedRevisionId ? `${revision.status} · selected` : revision.status,
    })),
    selectedId: props.selectedRevisionId,
    actionLabel: props.canStartRevision ? "New Setup chat" : undefined,
    pending: props.pending,
    onSelect: props.onSelectRevision,
    onAction: props.canStartRevision ? props.onStartRevision : undefined,
})

const setupConversationPane = (props: SetupSurfaceProps, wideOnly: boolean) => cockpitPane(wideOnly, PrivateSetupChatBlock, {
    messages: props.messages,
    pending: props.pending,
    refused: props.refused,
    revisions: props.revisions,
    selectedRevisionId: props.selectedRevisionId,
    canSend: props.canSend,
    canStartRevision: props.canStartRevision,
    showRevisionControls: false,
    onSelectRevision: props.onSelectRevision,
    onStartRevision: props.onStartRevision,
    onSend: props.onSend,
})

const setupContextPane = (props: SetupSurfaceProps, wideOnly: boolean) => cockpitPane(wideOnly, ContextVersionBlock, {
    activeVersion: props.activeVersion,
    draft: props.draft,
    pending: props.pending,
    refused: props.refused,
    onApply: props.onApply,
})

const SetupSurface = ({
    messages, revisions, selectedRevisionId, canSend, canStartRevision, activeVersion, draft, pending, refused, compactPane,
    onSelectRevision, onStartRevision, onSend, onApply, onSelectPane,
}: SetupSurfaceProps) => {
    const props = {
        messages, revisions, selectedRevisionId, canSend, canStartRevision, activeVersion, draft, pending, refused, compactPane,
        onSelectRevision, onStartRevision, onSend, onApply, onSelectPane,
    }
    return (
    <Tree contract="agentos-setup-layout" render={defineContractComponent("agentos-setup-layout", {
        mode: defineContractComponent("agentos-cockpit-mode-compact", {
            navigation: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: "Compact Setup view",
                        selectedKey: compactPane,
                        tabs: [
                            { id: "conversation", label: "Setup chat" },
                            { id: "context", label: "Gates" },
                            { id: "versions", label: "Versions" },
                        ],
                    }}
                    on={{ select: (key) => onSelectPane(key as SetupSurfaceProps["compactPane"]) }}
                />
            )),
        }),
        versions: setupVersionsPane(props, compactPane !== "versions"),
        conversation: setupConversationPane(props, compactPane !== "conversation"),
        context: setupContextPane(props, compactPane !== "context"),
    })} />
    )
}

type TestSurfaceProps = {
    readonly contract: AgentosModuleTestContract
    readonly targetReady: boolean
    readonly contextLabel: string
    readonly testSurface: AgentosModuleTestSurface | null
    readonly pending: boolean
    readonly selectedScenarioKey: string
    readonly compactPane: "scenarios" | "conversation" | "evidence"
    readonly onSelectScenario: (scenarioKey: string) => void
    readonly onSelectPane: (pane: "scenarios" | "conversation" | "evidence") => void
    readonly onRun: (scenarioKey: string, scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>) => void
}

const TestSurface = ({
    contract, targetReady, contextLabel, testSurface, pending, selectedScenarioKey, compactPane,
    onSelectScenario, onSelectPane, onRun,
}: TestSurfaceProps) => (
    <Tree contract="agentos-test-layout" render={defineContractComponent("agentos-test-layout", {
        mode: defineContractComponent("agentos-cockpit-mode-compact", {
            navigation: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: "Compact Test view",
                        selectedKey: compactPane,
                        tabs: [
                            { id: "conversation", label: "Conversation" },
                            { id: "scenarios", label: "Scenarios" },
                            { id: "evidence", label: "Evidence" },
                        ],
                    }}
                    on={{ select: (key) => onSelectPane(key as TestSurfaceProps["compactPane"]) }}
                />
            )),
        }),
        scenarios: cockpitPane(compactPane !== "scenarios", ModuleCockpitRailBlock, {
            label: "Scenario suite",
            fact: `${contract.scenarios.length} scenarios`,
            summary: "Every run uses fake inputs and is blocked from live channels or credentials.",
            items: contract.scenarios.map((scenario) => ({
                id: scenario.key,
                label: scenario.label,
                status: testSurface?.runs.find((run) => run.scenarioKey === scenario.key)?.status ?? "Not run",
            })),
            selectedId: selectedScenarioKey,
            onSelect: onSelectScenario,
        }),
        conversation: cockpitPane(compactPane !== "conversation", KindTestWorkbenchBlock, {
            contract,
            contextLabel,
            targetReady,
            pending,
            selectedScenarioKey,
            showScenarioPicker: false,
            registry: DEFAULT_TEST_WORKBENCH_REGISTRY,
            onSelectScenario,
            onRun,
        }),
        evidence: cockpitSidecarPane(compactPane !== "evidence", TestTrustResultBlock, {
            contract,
            run: testSurface?.run ?? null,
            assertions: testSurface?.assertions ?? [],
            contextLabel,
        }),
    })} />
)

const TestUnavailableSurface = () => (
    <Tree contract="agentos-test-layout" render={defineContractComponent("agentos-test-layout", {
        mode: defineContractComponent("agentos-cockpit-mode-compact", {
            navigation: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs props={{ label: "Test unavailable", selectedKey: "conversation", tabs: [{ id: "conversation", label: "Unavailable" }] }} />
            )),
        }),
        scenarios: defineContractComponent("agentos-cockpit-pane-wide-only", {
            body: defineContractProjection("label-row-over-card", () => (
                <ModuleCockpitRailBlock label="Scenario suite" fact="Unavailable" items={[]} selectedId="" onSelect={() => undefined} />
            )),
        }),
        conversation: defineContractComponent("agentos-cockpit-pane", {
            body: defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: "Test contract unavailable" }}
                contract="agentos-diagnostics-body"
                render={defineContractComponent("agentos-diagnostics-body", {
                    facts: defineContractComponent("labelled-fact-stack", {
                        fact: [defineContractComponent("label-value-row", {
                            label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "State", size: "sm" }} />),
                            value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "No versioned test contract is registered", size: "sm" }} />),
                        })],
                    }),
                })}
            />
            )),
        }),
        evidence: defineContractComponent("agentos-cockpit-sidecar-pane-wide-only", {
            body: defineContractProjection("label-row-over-card", () => (
                <SurfaceCard
                    props={{ label: "Trust evidence", fact: "Unavailable" }}
                    contract="agentos-diagnostics-body"
                    render={defineContractComponent("agentos-diagnostics-body", {
                        facts: defineContractComponent("labelled-fact-stack", {
                            fact: [defineContractComponent("label-value-row", {
                                label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Safety", size: "sm" }} />),
                                value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Failed closed; nothing was executed", size: "sm" }} />),
                            })],
                        }),
                    })}
                />
            )),
        }),
    })} />
)

type OperateSurfaceProps = {
    readonly installationId: string
    readonly kindKey: string
    readonly workbenchKey: string
    readonly workbenchVersion: string
    readonly sessions: ReadonlyArray<ExecuteSession>
    readonly selectedSessionId: string | null
    readonly selectedSessionTitle: string
    readonly messages: ReadonlyArray<ExecuteMessage>
    readonly tasks: AgentosModuleRuntime["tasks"]
    readonly events: AgentosModuleRuntime["operationEvents"]
    readonly operationTarget: "customer-chat" | "customer-workbench" | "internal-chat" | "internal-workbench"
    readonly supportInbox: AgentOSSolutionModuleSupportInbox
    readonly pending: boolean
    readonly refused: boolean
    readonly onSelectSession: (sessionId: string) => void
    readonly onSelectTarget: (target: OperateSurfaceProps["operationTarget"]) => void
    readonly onCreateSession: () => void
    readonly onSend: (content: string) => void
    readonly onWidgetAction: NonNullable<TrustedWidgetComponentProps["onAction"]>
    readonly onSelectSupportConversation: (conversationId: string) => void
    readonly onApproveSupportReply: (decisionId: string) => void
    readonly onSetSupportTakeover: (conversationId: string, takeover: boolean) => void
    readonly onReconcileSupportDelivery: (outboxId: string, delivered: boolean) => void
}

const chatPane = (props: OperateSurfaceProps) => defineContractComponent("agentos-cockpit-pane", {
    body: defineContractProjection("label-row-over-card", () => (
        props.operationTarget.startsWith("customer-")
            ? <SupportCustomerChatBlock
                conversation={props.supportInbox.conversations.find((item) => item.id === props.supportInbox.selectedConversationId) ?? null}
                messages={props.supportInbox.messages}
                pending={props.supportInbox.pending}
                refused={props.supportInbox.refused}
                onApprove={props.onApproveSupportReply}
                onTakeover={props.onSetSupportTakeover}
                onReconcile={props.onReconcileSupportDelivery}
            />
            : <ExecuteChatBlock
                sessionTitle={props.selectedSessionTitle}
                messages={props.messages}
                pending={props.pending}
                refused={props.refused}
                registry={DEFAULT_WIDGET_REGISTRY}
                onSend={props.onSend}
                onWidgetAction={props.onWidgetAction}
            />
    )),
})

const chatPaneWideOnly = (props: OperateSurfaceProps) => defineContractComponent("agentos-cockpit-pane-wide-only", {
    body: defineContractProjection("label-row-over-card", () => (
        props.operationTarget.startsWith("customer-")
            ? <SupportCustomerChatBlock
                conversation={props.supportInbox.conversations.find((item) => item.id === props.supportInbox.selectedConversationId) ?? null}
                messages={props.supportInbox.messages}
                pending={props.supportInbox.pending}
                refused={props.supportInbox.refused}
                onApprove={props.onApproveSupportReply}
                onTakeover={props.onSetSupportTakeover}
                onReconcile={props.onReconcileSupportDelivery}
            />
            : <ExecuteChatBlock
                sessionTitle={props.selectedSessionTitle}
                messages={props.messages}
                pending={props.pending}
                refused={props.refused}
                registry={DEFAULT_WIDGET_REGISTRY}
                onSend={props.onSend}
                onWidgetAction={props.onWidgetAction}
            />
    )),
})

const workbenchPane = (props: OperateSurfaceProps) => defineContractComponent("agentos-cockpit-pane", {
    body: defineContractProjection("label-row-over-card", () => (
        props.operationTarget.startsWith("customer-")
            ? <SupportQueueWorkbenchBlock tickets={props.supportInbox.tickets} facts={props.supportInbox.facts} selectedConversationId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} />
            : <KindWorkbenchBlock
                moduleId={props.installationId}
                kindKey={props.kindKey}
                workbenchKey={props.workbenchKey}
                workbenchVersion={props.workbenchVersion}
                tasks={props.tasks}
                events={props.events}
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />
    )),
})

const workbenchPaneWideOnly = (props: OperateSurfaceProps) => defineContractComponent("agentos-cockpit-pane-wide-only", {
    body: defineContractProjection("label-row-over-card", () => (
        props.operationTarget.startsWith("customer-")
            ? <SupportQueueWorkbenchBlock tickets={props.supportInbox.tickets} facts={props.supportInbox.facts} selectedConversationId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} />
            : <KindWorkbenchBlock
                moduleId={props.installationId}
                kindKey={props.kindKey}
                workbenchKey={props.workbenchKey}
                workbenchVersion={props.workbenchVersion}
                tasks={props.tasks}
                events={props.events}
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />
    )),
})

const OperateSurface = (props: OperateSurfaceProps) => (
    <Tree contract="agentos-operate-layout" render={defineContractComponent("agentos-operate-layout", {
        mode: defineContractComponent("agentos-cockpit-mode-compact", {
            navigation: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: "Operations view",
                        selectedKey: props.operationTarget,
                        tabs: props.kindKey === "customer-support" ? [
                            { id: "customer-chat", label: "Customers" },
                            { id: "customer-workbench", label: "Customer queue" },
                            { id: "internal-chat", label: "Internal chat" },
                            { id: "internal-workbench", label: "Internal workbench" },
                        ] : [
                            { id: "internal-chat", label: "Chat" },
                            { id: "internal-workbench", label: "Workbench" },
                        ],
                    }}
                    on={{ select: (key) => props.onSelectTarget(key as OperateSurfaceProps["operationTarget"]) }}
                />
            )),
        }),
        sessions: defineContractProjection("agentos-session-rail-responsive", () => (
            props.operationTarget.startsWith("customer-")
                ? <SupportCustomerConversationRailBlock
                    conversations={props.supportInbox.conversations}
                    selectedId={props.supportInbox.selectedConversationId}
                    pending={props.supportInbox.pending}
                    onSelect={props.onSelectSupportConversation}
                />
                : <ExecuteSessionRailBlock
                    sessions={props.sessions}
                    selectedId={props.selectedSessionId}
                    pending={props.pending}
                    onSelect={props.onSelectSession}
                    onCreate={props.onCreateSession}
                />
        )),
        chat: props.operationTarget.endsWith("-chat") ? chatPane(props) : chatPaneWideOnly(props),
        workbench: props.operationTarget.endsWith("-workbench") ? workbenchPane(props) : workbenchPaneWideOnly(props),
    })} />
)

type SettingsFormContentProps = {
    readonly currentDisplayName: string
    readonly currentModelProfile: string
    readonly currentConfirmation: boolean
    readonly currentOperatingMode: "assist" | "autopilot"
    readonly currentChannelAccountRef: string
    readonly liveEnabled: boolean
    readonly canEnableLive: boolean
    readonly pending: boolean
    readonly refused: boolean
    readonly credentialSlots: ReadonlyArray<{ readonly key: string; readonly label: string; readonly provider: string }>
    readonly credentialStatuses: ReadonlyArray<{ readonly providerKey: string; readonly maskedHint: string; readonly status: string }>
    readonly onSave: (
        settings: Readonly<Record<string, AgentosRuntimeValue>>,
        operatingMode: "assist" | "autopilot",
        channelAccountRef: string,
    ) => void
    readonly onSetLiveEnabled: (enabled: boolean) => void
    readonly onSaveCredential: (credentialKey: string, credentialValue: string) => void
    readonly onRemoveCredential: (credentialKey: string) => void
}

const SettingsFormContent = ({
    currentDisplayName, currentModelProfile, currentConfirmation, currentOperatingMode, currentChannelAccountRef,
    liveEnabled, canEnableLive, pending, refused, credentialSlots, credentialStatuses,
    onSave, onSetLiveEnabled, onSaveCredential, onRemoveCredential,
}: SettingsFormContentProps) => {
    const [displayName, setDisplayName] = useState(currentDisplayName)
    const [modelProfile, setModelProfile] = useState(currentModelProfile)
    const [requireConfirmation, setRequireConfirmation] = useState(currentConfirmation)
    const [operatingMode, setOperatingMode] = useState<"assist" | "autopilot">(currentOperatingMode)
    const [channelAccountRef, setChannelAccountRef] = useState(currentChannelAccountRef)
    const [credentialValues, setCredentialValues] = useState<Readonly<Record<string, string>>>({})

    useEffect(() => {
        setDisplayName(currentDisplayName)
        setModelProfile(currentModelProfile)
        setRequireConfirmation(currentConfirmation)
        setOperatingMode(currentOperatingMode)
        setChannelAccountRef(currentChannelAccountRef)
        setCredentialValues({})
    }, [currentChannelAccountRef, currentConfirmation, currentDisplayName, currentModelProfile, currentOperatingMode])

    return (
        <Tree contract="agentos-settings-form" render={defineContractComponent("agentos-settings-form", {
            field: [
                defineContractProjection("label-field-hint", () => (
                    <Field
                        key={`display-${currentDisplayName}`}
                        props={{
                            id: "agentos-module-display-name",
                            name: "displayName",
                            label: "Display name",
                            placeholder: currentDisplayName,
                            disabled: pending,
                        }}
                        on={{ change: setDisplayName }}
                    />
                )),
                defineContractProjection("label-field-hint", () => (
                    <Field
                        key={`profile-${currentModelProfile}`}
                        props={{
                            id: "agentos-module-model-profile",
                            name: "modelProfile",
                            label: "Model profile",
                            placeholder: currentModelProfile,
                            disabled: pending,
                        }}
                        on={{ change: setModelProfile }}
                    />
                )),
                defineContractProjection("label-field-hint", () => (
                    <Field
                        key={`channel-${currentChannelAccountRef}`}
                        props={{
                            id: "agentos-module-channel-account-ref",
                            name: "channelAccountRef",
                            label: "Telegram channel account reference",
                            placeholder: currentChannelAccountRef || "telegram:nivo-support",
                            hint: "Reference to the Telegram account owned by this Agent Workspace controller.",
                            disabled: pending,
                        }}
                        on={{ change: setChannelAccountRef }}
                    />
                )),
            ],
            mode: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: "Operating mode",
                        selectedKey: operatingMode,
                        tabs: [{ id: "assist", label: "Assist" }, { id: "autopilot", label: "Autopilot" }],
                    }}
                    on={{ select: (key) => setOperatingMode(key as "assist" | "autopilot") }}
                />
            )),
            confirmation: defineLeafComponent("checkbox", {}, () => (
                <Checkbox
                    props={{ label: "Require confirmation before external mutations", isSelected: requireConfirmation, name: "requireConfirmation" }}
                    on={{ change: setRequireConfirmation }}
                />
            )),
            action: [
                defineLeafComponent("button", {}, () => (
                    <Button
                        props={{ label: "Save settings", variant: "primary", isPending: pending, disabled: channelAccountRef.trim().length < 3 }}
                        on={{ press: () => onSave({ displayName, modelProfile, requireConfirmation }, operatingMode, channelAccountRef.trim()) }}
                    />
                )),
                defineLeafComponent("button", {}, () => (
                    <Button
                        props={{
                            label: liveEnabled ? "Disable Live" : "Enable Live",
                            variant: "secondary",
                            isPending: pending,
                            disabled: !liveEnabled && !canEnableLive,
                        }}
                        on={{ press: () => onSetLiveEnabled(!liveEnabled) }}
                    />
                )),
            ],
            credentialField: credentialSlots.map((slot) => defineContractProjection("label-field-hint", () => (
                <Field
                    key={`${slot.key}-${credentialStatuses.find((row) => row.providerKey === slot.key)?.maskedHint ?? "empty"}`}
                    props={{
                        id: `agentos-module-credential-${slot.key}`,
                        name: slot.key,
                        label: slot.label,
                        kind: "password",
                        placeholder: credentialStatuses.find((row) => row.providerKey === slot.key)?.maskedHint ?? "Enter credential",
                        hint: `${slot.provider} · encrypted at rest; only the masked suffix is returned`,
                        disabled: pending,
                        revealLabel: `Show ${slot.label}`,
                        hideLabel: `Hide ${slot.label}`,
                    }}
                    on={{ change: (value) => setCredentialValues((current) => ({ ...current, [slot.key]: value })) }}
                />
            ))),
            credentialStatus: credentialSlots.length === 0
                ? undefined
                : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{
                            content: credentialStatuses.length === 0
                                ? "No credential configured"
                                : credentialStatuses.map((row) => `${row.providerKey}: ${row.maskedHint} · ${row.status}`).join(" · "),
                            size: "sm",
                            tone: "muted",
                            live: "polite",
                        }}
                    />
                )),
            credentialAction: credentialSlots.flatMap((slot) => {
                const configured = credentialStatuses.some((row) => row.providerKey === slot.key)
                const value = credentialValues[slot.key]?.trim() ?? ""
                return [
                    defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: `Save ${slot.label}`, variant: "secondary", disabled: value.length === 0, isPending: pending }}
                            on={{ press: () => value.length > 0 && onSaveCredential(slot.key, value) }}
                        />
                    )),
                    ...(configured ? [defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: `Remove ${slot.label}`, variant: "ghost", disabled: pending }}
                            on={{ press: () => onRemoveCredential(slot.key) }}
                        />
                    ))] : []),
                ]
            }),
            notice: refused
                ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: "Settings were refused and the prior version remains active.", size: "sm", tone: "muted", live: "assertive" }} />
                ))
                : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{
                            content: liveEnabled
                                ? "Live is enabled for the currently applied context. Applying another version disables Live."
                                : canEnableLive
                                    ? "Live is ready to enable. Assist remains the safer starting mode."
                                    : "Live requires an applied context, a Telegram account reference, and a configured Telegram bot token.",
                            size: "sm",
                            tone: "muted",
                            live: "polite",
                        }}
                    />
                )),
        })} />
    )
}

const SETTINGS_FORM_CONTENT = defineContractComponent("agentos-settings-form", SettingsFormContent)

type SettingsSurfaceProps = SettingsFormContentProps & { readonly activeVersion: number | null }

const SettingsSurface = ({
    activeVersion, currentDisplayName, currentModelProfile, currentConfirmation, currentOperatingMode,
    currentChannelAccountRef, liveEnabled, canEnableLive, pending, refused,
    credentialSlots, credentialStatuses, onSave, onSetLiveEnabled, onSaveCredential, onRemoveCredential,
}: SettingsSurfaceProps) => (
    <Tree contract="agentos-settings-layout" render={defineContractComponent("agentos-settings-layout", {
        settings: defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: "Module settings" }}
                contract="agentos-settings-form"
                render={SETTINGS_FORM_CONTENT}
                contentProps={{
                    currentDisplayName, currentModelProfile, currentConfirmation, currentOperatingMode,
                    currentChannelAccountRef, liveEnabled, canEnableLive, pending, refused,
                    credentialSlots, credentialStatuses, onSave, onSetLiveEnabled, onSaveCredential, onRemoveCredential,
                }}
            />
        )),
        context: defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: "Authority & safeguards", fact: activeVersion === null ? "Context required" : `v${activeVersion} active` }}
                contract="agentos-diagnostics-body"
                render={defineContractComponent("agentos-diagnostics-body", {
                    facts: defineContractComponent("labelled-fact-stack", {
                        fact: [
                            ["External sends", currentConfirmation ? "Require confirmation" : `Allowed by ${currentOperatingMode} policy`],
                            ["Refund / legal promise", "Human approval required"],
                            ["Prompt cache", activeVersion === null ? "Inactive until Apply" : `Stable Nivo knowledge + context v${activeVersion}`],
                            ["Cache invalidation", "Automatic on context Apply"],
                            ["Execute history", "Original context binding retained"],
                        ].map(([label, value]) => defineContractComponent("label-value-row", {
                            label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
                            value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm", weight: "semibold" }} />),
                        })),
                    }),
                })}
            />
        )),
    })} />
)

type DiagnosticsSurfaceProps = {
    readonly installationId: string
    readonly kindKey: string
    readonly workbenchKey: string
    readonly diagnostics: Readonly<Record<string, AgentosRuntimeValue>>
    readonly events: AgentosModuleRuntime["operationEvents"]
    readonly selectedSignal: "all" | "channel" | "ai"
    readonly compactPane: "signals" | "readiness" | "evidence"
    readonly onSelectSignal: (signal: "all" | "channel" | "ai") => void
    readonly onSelectPane: (pane: "signals" | "readiness" | "evidence") => void
}

const safeValue = (value: AgentosRuntimeValue): string => {
    if (value === null) return "—"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
    return JSON.stringify(value)
}

const diagnosticEntries = (
    diagnostics: Readonly<Record<string, AgentosRuntimeValue>>,
    selectedSignal: DiagnosticsSurfaceProps["selectedSignal"],
) => {
    const entries = Object.entries(diagnostics)
    if (selectedSignal === "all") return entries
    const filtered = entries.filter(([key]) => {
        const normalized = key.toLowerCase()
        return selectedSignal === "channel"
            ? ["telegram", "channel", "webhook"].some((token) => normalized.includes(token))
            : ["ai", "cache", "prompt", "controller", "model"].some((token) => normalized.includes(token))
    })
    return filtered.length > 0 ? filtered : entries
}

const diagnosticFacts = (entries: ReadonlyArray<readonly [string, AgentosRuntimeValue]>) => entries.map(([key, value]) => (
    defineContractComponent("label-value-row", {
        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: key, size: "sm" }} />),
        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: safeValue(value), size: "sm", weight: "semibold" }} />),
    })
))

type DiagnosticsHealthCardProps = Pick<DiagnosticsSurfaceProps, "diagnostics" | "selectedSignal">

const DiagnosticsHealthCard = ({ diagnostics, selectedSignal }: DiagnosticsHealthCardProps) => (
    <SurfaceCard
        props={{ label: "Runtime health", fact: selectedSignal === "all" ? "All systems" : selectedSignal === "channel" ? "Channel ingress" : "AI controller" }}
        contract="agentos-diagnostics-body"
        render={defineContractComponent("agentos-diagnostics-body", {
            facts: defineContractComponent("labelled-fact-stack", { fact: diagnosticFacts(diagnosticEntries(diagnostics, selectedSignal)) }),
            notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: "Only owner-safe runtime checks are disclosed; secrets and raw configuration remain server-side.", size: "sm", tone: "muted" }} />
            )),
        })}
    />
)

type DiagnosticsTraceCardProps = Pick<DiagnosticsSurfaceProps, "installationId" | "kindKey" | "workbenchKey" | "events">

const DiagnosticsTraceCard = ({ installationId, kindKey, workbenchKey, events }: DiagnosticsTraceCardProps) => {
    const facts: ReadonlyArray<readonly [string, string]> = [
        ["Installation", installationId],
        ["Kind", kindKey],
        ["Workbench", workbenchKey],
        ...events.slice(-5).reverse().map((event) => [event.eventType, `${event.source} · ${new Date(event.observedAt).toLocaleString()}`] as const),
    ]
    return (
        <SurfaceCard
            props={{ label: "Event trace", fact: events.length === 0 ? "No events" : `${events.length} accepted` }}
            contract="agentos-diagnostics-body"
            render={defineContractComponent("agentos-diagnostics-body", {
                facts: defineContractComponent("labelled-fact-stack", {
                    fact: facts.map(([label, value]) => defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm", weight: "semibold" }} />),
                    })),
                }),
            })}
        />
    )
}

const DiagnosticsSurface = ({
    installationId, kindKey, workbenchKey, diagnostics, events, selectedSignal, compactPane, onSelectSignal, onSelectPane,
}: DiagnosticsSurfaceProps) => (
    <Tree contract="agentos-diagnostics-layout" render={defineContractComponent("agentos-diagnostics-layout", {
        mode: defineContractComponent("agentos-cockpit-mode-compact", {
            navigation: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: "Compact Diagnostics view",
                        selectedKey: compactPane,
                        tabs: [
                            { id: "readiness", label: "Health" },
                            { id: "signals", label: "Signals" },
                            { id: "evidence", label: "Trace" },
                        ],
                    }}
                    on={{ select: (key) => onSelectPane(key as DiagnosticsSurfaceProps["compactPane"]) }}
                />
            )),
        }),
        signals: cockpitPane(compactPane !== "signals", ModuleCockpitRailBlock, {
            label: "Signals",
            fact: `${events.length} events`,
            summary: "Filter the safe health projection without exposing raw configuration or credentials.",
            items: [
                { id: "all", label: "All systems", status: `${Object.keys(diagnostics).length} checks` },
                { id: "channel", label: "Channel ingress", status: `${events.filter((event) => event.source.toLowerCase().includes("telegram")).length} Telegram events` },
                { id: "ai", label: "AI controller", status: `${events.filter((event) => event.replyContractKey.length > 0).length} bound replies` },
            ],
            selectedId: selectedSignal,
            onSelect: (key: string) => onSelectSignal(key as DiagnosticsSurfaceProps["selectedSignal"]),
        }),
        readiness: cockpitPane(compactPane !== "readiness", DiagnosticsHealthCard, { diagnostics, selectedSignal }),
        evidence: cockpitSidecarPane(compactPane !== "evidence", DiagnosticsTraceCard, { installationId, kindKey, workbenchKey, events }),
    })} />
)


/** One exact Setup Test result whose revision and digest still match the draft on screen. */
export const exactTestSurfaceFor = (
    testSurface: AgentosModuleTestSurface | null,
    draft: ContextDraft | null,
): AgentosModuleTestSurface | null => {
    if (draft?.digest === null || draft === null || testSurface?.run === null || testSurface === null) return null
    return testSurface.run.setupSessionId === draft.setupSessionId && testSurface.run.draftDigest === draft.digest
        ? testSurface
        : null
}

type AgentOSSolutionModuleShellProps = {
    readonly workspaceLabel: string
    readonly moduleName: string
    readonly moduleKind: string
    readonly lifecycleLabel: string
    readonly contextVersion: string
    readonly channelLabel: string
    readonly controllerLabel: string
    readonly activeView: AgentOSModuleView
    readonly onBackToModules: () => void
    readonly onNavigate: (view: AgentOSModuleView) => void
}

/** Closed pure screen states produced by the connected Module Studio page. */
export type AgentOSSolutionModuleScreen =
    | { readonly view: "setup"; readonly contentProps: SetupSurfaceProps }
    | { readonly view: "test"; readonly contentProps: TestSurfaceProps }
    | { readonly view: "test-unavailable" }
    | { readonly view: "operate"; readonly contentProps: OperateSurfaceProps }
    | { readonly view: "settings"; readonly contentProps: SettingsSurfaceProps }
    | { readonly view: "diagnostics"; readonly contentProps: DiagnosticsSurfaceProps }

/** Complete world-free contract for the persistent module shell and selected screen. */
export type AgentOSSolutionModulePageViewProps = {
    readonly shell: AgentOSSolutionModuleShellProps
    readonly screen: AgentOSSolutionModuleScreen
}

/** Draw the selected Module Studio surface from resolved state, data and actions only. */
export const AgentOSSolutionModulePageBase = ({ shell, screen }: AgentOSSolutionModulePageViewProps) => {
    if (screen.view === "setup") return (
        <ModuleRouteShellBlock {...shell} bodyContract="agentos-setup-layout" content={SetupSurface} contentProps={screen.contentProps} />
    )
    if (screen.view === "operate") return (
        <ModuleRouteShellBlock {...shell} bodyContract="agentos-operate-layout" content={OperateSurface} contentProps={screen.contentProps} />
    )
    if (screen.view === "test-unavailable") return (
        <ModuleRouteShellBlock {...shell} bodyContract="agentos-test-layout" content={TestUnavailableSurface} contentProps={{}} />
    )
    if (screen.view === "test") return (
        <ModuleRouteShellBlock {...shell} bodyContract="agentos-test-layout" content={TestSurface} contentProps={screen.contentProps} />
    )
    if (screen.view === "settings") return (
        <ModuleRouteShellBlock {...shell} bodyContract="agentos-settings-layout" content={SettingsSurface} contentProps={screen.contentProps} />
    )
    return (
        <ModuleRouteShellBlock {...shell} bodyContract="agentos-diagnostics-layout" content={DiagnosticsSurface} contentProps={screen.contentProps} />
    )
}

/** State accepted by the typed runtime-loading page. */
export type AgentOSSolutionModuleStateProps = { readonly refused: boolean }

/** Draw a typed load or refusal state while no runtime projection is available. */
export const AgentOSSolutionModuleState = ({ refused }: AgentOSSolutionModuleStateProps) => (
    <Tree contract="agentos-route-page" render={defineContractComponent("agentos-route-page", {
        heading: defineContractComponent("title-with-end-action", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Module Studio", level: 1 }} />),
        }),
        section: [defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: refused ? "Runtime unavailable" : "Loading runtime" }}
                contract="agentos-diagnostics-body"
                render={defineContractComponent("agentos-diagnostics-body", {
                    facts: defineContractComponent("labelled-fact-stack", {
                        fact: [defineContractComponent("label-value-row", {
                            label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "State", size: "sm" }} />),
                            value: defineLeafComponent("text", { size: "sm" }, () => (
                                <Text props={{ content: refused ? "The server refused this installation or workspace identity." : "Reading sessions, context, widgets, and registry…", size: "sm" }} />
                            )),
                        })],
                    }),
                })}
                isLoading={!refused}
            />
        ))],
    })} />
)

/** Source-level tier marker for the pure module page compositor. */
export const meta = { shape: "page", world: "pure" } as const
