"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Checkbox, ChoiceTabs, RouteTabs } from "@nivo/ui";
import { SurfaceCard, Button, Input, Heading, Text, Tabs, PrimaryRailLayout, TextAction } from "@starci/grammar/common";
import { ContextVersionBlock, type ContextDraft } from "@/components/blocks/agentos/ContextVersionBlock";
import { DEFAULT_WIDGET_REGISTRY, ExecuteChatBlock, type ExecuteMessage, type TrustedWidgetComponentProps } from "@/components/blocks/agentos/ExecuteChatBlock";
import { ExecuteSessionRailBlock, type ExecuteSession } from "@/components/blocks/agentos/ExecuteSessionRailBlock";
import { DEFAULT_WORKBENCH_REGISTRY, KindWorkbenchBlock } from "@/components/blocks/agentos/KindWorkbenchBlock";
import { DEFAULT_TEST_WORKBENCH_REGISTRY, KindTestWorkbenchBlock } from "@/components/blocks/agentos/KindTestWorkbenchBlock";
import { ModuleCockpitRailBlock } from "@/components/blocks/agentos/ModuleCockpitRailBlock";
import { ModuleRouteShellBlock, type AgentOSModuleView } from "@/components/blocks/agentos/ModuleRouteShellBlock";
import { PrivateSetupChatBlock, type SetupMessage, type SetupRevision } from "@/components/blocks/agentos/PrivateSetupChatBlock";
import { SupportCustomerChatBlock } from "@/components/blocks/agentos/SupportCustomerChatBlock";
import { SupportCustomerConversationRailBlock } from "@/components/blocks/agentos/SupportCustomerConversationRailBlock";
import { SupportQueueWorkbenchBlock } from "@/components/blocks/agentos/SupportQueueWorkbenchBlock";
import { TestTrustResultBlock } from "@/components/blocks/agentos/TestTrustResultBlock";
import type { AgentosModuleRuntime, AgentosModuleTestContract, AgentosModuleTestSurface, AgentosRuntimeValue } from "@/modules/api/console";
import type { SupportCustomerConversation, SupportCustomerMessage, SupportImportantFact, SupportTicket } from "@/modules/api/workspace-controlplane";
import { AGENTOS_SETUP_SURFACE_CLASS_NAME } from "./classNames";
import { CONTEXT_BAND_CLASS_NAME, CONTEXT_RAISED_BAND_CLASS_NAME } from "@/components/blocks/agentos/ContextVersionBlock/classNames";
/** Public API role for AgentOSSolutionModulePageProps. */
export type AgentOSSolutionModulePageProps = AgentOSSolutionModulePageViewProps;
type AgentOSSolutionModuleSupportInbox = {
  readonly conversations: ReadonlyArray<SupportCustomerConversation>;
  readonly selectedConversationId: string | null;
  readonly messages: ReadonlyArray<SupportCustomerMessage>;
  readonly tickets: ReadonlyArray<SupportTicket>;
  readonly facts: ReadonlyArray<SupportImportantFact>;
  readonly pending: boolean;
  readonly refused: boolean;
};

/** Keep compact pane visibility in Grammar while callers supply only typed ComponentTypes and props. */
export const cockpitPane = <P extends object,>(wideOnly: boolean, Content: ComponentType<P>, contentProps: P) => wideOnly ? <div>

  <Content {...contentProps} /></div> : <div>


  <Content {...contentProps} /></div>;

/** Preserve sticky evidence only in the approved right-hand sidecar. */
export const cockpitSidecarPane = <P extends object,>(wideOnly: boolean, Content: ComponentType<P>, contentProps: P) => wideOnly ? <div>

  <Content {...contentProps} /></div> : <div>


  <Content {...contentProps} /></div>;
type SetupSurfaceProps = {
  readonly messages: ReadonlyArray<SetupMessage>;
  readonly revisions: ReadonlyArray<SetupRevision>;
  readonly selectedRevisionId: string;
  readonly canSend: boolean;
  readonly canStartRevision: boolean;
  readonly activeVersion: number | null;
  readonly draft: ContextDraft | null;
  readonly pending: boolean;
  readonly draftText: string;
  readonly setupSendPending?: boolean;
  readonly setupApplyPending?: boolean;
  readonly setupStartPending?: boolean;
  readonly setupPeerDisabled?: boolean;
  readonly refused: boolean;
  readonly setupSendRefused?: boolean;
  readonly setupApplyRefused?: boolean;
  readonly setupStartRefused?: boolean;
  readonly setupUnconfirmed?: boolean;
  readonly compactPane: "versions" | "conversation" | "context";
  readonly onSelectRevision: (sessionId: string) => void;
  readonly onStartRevision: () => void;
  readonly onSend: (content: string) => void;
  readonly onDraft: (content: string) => void;
  readonly onApply: () => void;
  readonly onSelectPane: (pane: "versions" | "conversation" | "context") => void;
};
const setupVersionsPane = (props: SetupSurfaceProps) => <SurfaceCard ariaLabel="Setup revisions" composition="joined">
  <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
    <Heading level={3}>Setup revisions</Heading>
    <Text size="sm" tone="muted">Select a revision to review its conversation and context. Completed revisions are immutable.</Text>
  </div>
  <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
    <Tabs label="Setup revisions" selectedKey={props.selectedRevisionId} labelVisibility="always" items={props.revisions.map(r => ({ id: r.id, label: "Revision r" + r.revision + " · " + r.status }))} onSelect={props.onSelectRevision} />
    <Text size="sm">Selected revision: {props.selectedRevisionId}</Text>
    <TextAction onPress={() => props.onSelectPane("conversation")}>Open Setup chat</TextAction>
    {props.setupStartRefused ? <Text size="sm" live="assertive">Starting a new Setup revision was refused; the current revision remains selected.</Text> : null}
  </div>
  {props.canStartRevision ? <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
    <Button variant="secondary" isPending={props.setupStartPending} isDisabled={props.setupPeerDisabled || props.setupSendPending || props.setupApplyPending || props.setupStartPending} onPress={props.onStartRevision}>New Setup chat</Button>
  </div> : null}
</SurfaceCard>;
const setupConversationPane = (props: SetupSurfaceProps) => <PrivateSetupChatBlock messages={props.messages} pending={props.pending} ownPending={props.setupSendPending} peerDisabled={props.setupPeerDisabled || props.setupApplyPending || props.setupStartPending} refused={props.setupSendRefused} unconfirmed={props.setupUnconfirmed} revisions={props.revisions} selectedRevisionId={props.selectedRevisionId} canSend={props.canSend} canStartRevision={props.canStartRevision} showRevisionControls={false} draft={props.draftText} onDraft={props.onDraft} onSelectRevision={props.onSelectRevision} onStartRevision={props.onStartRevision} onSend={props.onSend} onOpenVersions={() => props.onSelectPane("versions")} />;
const setupContextPane = (props: SetupSurfaceProps) => <ContextVersionBlock activeVersion={props.activeVersion} draft={props.draft} pending={props.pending} ownPending={props.setupApplyPending} peerDisabled={props.setupPeerDisabled || props.setupSendPending || props.setupStartPending} refused={props.setupApplyRefused ?? false} onApply={props.onApply} />;
const setupSummaryPane = (props: SetupSurfaceProps) => {
  const draft = props.draft;
  return <SurfaceCard label="Business context" composition="joined">
    <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
      <Heading level={4}>{draft === null ? "No Setup draft" : draft.version === null ? `Setup draft r${draft.revision}` : `Context v${draft.version}`}</Heading>
      <Text size="sm" tone="muted">{draft === null ? "No Setup draft" : "Built from this private conversation"}</Text>
    </div>
    <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
      <Text size="sm" weight="semibold">{draft?.summary ?? "Your business context starts here"}</Text>
      <Text size="sm" tone="muted">{draft ? "Review the collected facts and remaining gates before testing this revision." : "Tell Nivo about your priorities, policies, and exceptions. Your active context changes only after Test and Apply."}</Text>
      <TextAction onPress={() => props.onSelectPane("context")}>Review gates</TextAction>
    </div>
    <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
      <Text size="sm">Active context: {props.activeVersion === null ? "not applied" : `v${props.activeVersion}`}</Text>
      <Text size="sm" tone="muted">Setup changes do not rewrite Execute history.</Text>
    </div>
  </SurfaceCard>;
};
const SetupSurface = (props: SetupSurfaceProps) => {
  const { compactPane } = props;
  return <section className={AGENTOS_SETUP_SURFACE_CLASS_NAME} data-contract="MEASURE-2 GAP-4"><Heading level={2}>Set up your module</Heading><Text size="sm" tone="muted">Build the business context in chat, review the gates, then test and apply the exact revision.</Text><Tabs label="Setup views" selectedKey={compactPane} labelVisibility="always" items={[{ id: "conversation", label: "Setup chat" }, { id: "context", label: "Gates" }, { id: "versions", label: "Versions" }]} onSelect={key => props.onSelectPane(key as SetupSurfaceProps["compactPane"])} panelId={key => `setup-panel-${key}`} />{compactPane === "conversation" ? <section id="setup-panel-conversation" role="tabpanel" aria-label="Setup chat"><PrimaryRailLayout primary={setupConversationPane(props)} rail={setupSummaryPane(props)} railWidth="standard" align="start" collapsedOrder="primary-first" /></section> : compactPane === "context" ? <section id="setup-panel-context" role="tabpanel" aria-label="Gates">{setupContextPane(props)}</section> : <section id="setup-panel-versions" role="tabpanel" aria-label="Versions">{setupVersionsPane(props)}</section>}</section>;
};
type TestSurfaceProps = {
  readonly contract: AgentosModuleTestContract;
  readonly targetReady: boolean;
  readonly contextLabel: string;
  readonly testSurface: AgentosModuleTestSurface | null;
  readonly pending: boolean;
  readonly selectedScenarioKey: string;
  readonly compactPane: "scenarios" | "conversation" | "evidence";
  readonly onSelectScenario: (scenarioKey: string) => void;
  readonly onSelectPane: (pane: "scenarios" | "conversation" | "evidence") => void;
  readonly onRun: (scenarioKey: string, scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>) => void;
};
const TestSurface = ({
  contract,
  targetReady,
  contextLabel,
  testSurface,
  pending,
  selectedScenarioKey,
  compactPane,
  onSelectScenario,
  onSelectPane,
  onRun
}: TestSurfaceProps) => <div><div>



    <ChoiceTabs props={{
      label: "Compact Test view",
      selectedKey: compactPane,
      tabs: [{
        id: "conversation",
        label: "Conversation"
      }, {
        id: "scenarios",
        label: "Scenarios"
      }, {
        id: "evidence",
        label: "Evidence"
      }]
    }} on={{
      select: key => onSelectPane(key as TestSurfaceProps["compactPane"])
    }} /></div>{cockpitPane(compactPane !== "scenarios", ModuleCockpitRailBlock, {
    label: "Scenario suite",
    fact: `${contract.scenarios.length} scenarios`,
    summary: "Every run uses fake inputs and is blocked from live channels or credentials.",
    items: contract.scenarios.map(scenario => ({
      id: scenario.key,
      label: scenario.label,
      status: testSurface?.runs.find(run => run.scenarioKey === scenario.key)?.status ?? "Not run"
    })),
    selectedId: selectedScenarioKey,
    onSelect: onSelectScenario
  })}{cockpitPane(compactPane !== "conversation", KindTestWorkbenchBlock, {
    contract,
    contextLabel,
    targetReady,
    pending,
    selectedScenarioKey,
    showScenarioPicker: false,
    registry: DEFAULT_TEST_WORKBENCH_REGISTRY,
    onSelectScenario,
    onRun
  })}{cockpitSidecarPane(compactPane !== "evidence", TestTrustResultBlock, {
    contract,
    run: testSurface?.run ?? null,
    assertions: testSurface?.assertions ?? [],
    contextLabel
  })}</div>;
const TestUnavailableSurface = () => <div><div>



    <ChoiceTabs props={{
      label: "Test unavailable",
      selectedKey: "conversation",
      tabs: [{
        id: "conversation",
        label: "Unavailable"
      }]
    }} /></div><div>




    <ModuleCockpitRailBlock label="Scenario suite" fact="Unavailable" items={[]} selectedId="" onSelect={() => undefined} /></div><div>




    <SurfaceCard
      label="Test contract unavailable"
    ><div>{<div>{[<div key="item-0">{<Text size="sm">{"State"}</Text>}{<Text size="sm">{"No versioned test contract is registered"}</Text>}</div>]}</div>}</div></SurfaceCard>


  </div><div>





    <SurfaceCard
      label="Trust evidence"
      fact="Unavailable"
    ><div>{<div>{[<div key="item-0">{<Text size="sm">{"Safety"}</Text>}{<Text size="sm">{"Failed closed; nothing was executed"}</Text>}</div>]}</div>}</div></SurfaceCard>


  </div></div>;
type OperateSurfaceProps = {
  readonly installationId: string;
  readonly kindKey: string;
  readonly workbenchKey: string;
  readonly workbenchVersion: string;
  readonly sessions: ReadonlyArray<ExecuteSession>;
  readonly selectedSessionId: string | null;
  readonly selectedSessionTitle: string;
  readonly messages: ReadonlyArray<ExecuteMessage>;
  readonly tasks: AgentosModuleRuntime["tasks"];
  readonly events: AgentosModuleRuntime["operationEvents"];
  readonly operationTarget: "customer-chat" | "customer-workbench" | "internal-chat" | "internal-workbench";
  readonly supportInbox: AgentOSSolutionModuleSupportInbox;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly onSelectSession: (sessionId: string) => void;
  readonly onSelectTarget: (target: OperateSurfaceProps["operationTarget"]) => void;
  readonly onCreateSession: () => void;
  readonly onSend: (content: string) => void;
  readonly onWidgetAction: NonNullable<TrustedWidgetComponentProps["onAction"]>;
  readonly onSelectSupportConversation: (conversationId: string) => void;
  readonly onApproveSupportReply: (decisionId: string) => void;
  readonly onSetSupportTakeover: (conversationId: string, takeover: boolean) => void;
  readonly onReconcileSupportDelivery: (outboxId: string, delivered: boolean) => void;
};
const chatPane = (props: OperateSurfaceProps) => <div>{props.operationTarget.startsWith("customer-") ? <SupportCustomerChatBlock conversation={props.supportInbox.conversations.find(item => item.id === props.supportInbox.selectedConversationId) ?? null} messages={props.supportInbox.messages} pending={props.supportInbox.pending} refused={props.supportInbox.refused} onApprove={props.onApproveSupportReply} onTakeover={props.onSetSupportTakeover} onReconcile={props.onReconcileSupportDelivery} /> : <ExecuteChatBlock sessionTitle={props.selectedSessionTitle} messages={props.messages} pending={props.pending} refused={props.refused} registry={DEFAULT_WIDGET_REGISTRY} onSend={props.onSend} onWidgetAction={props.onWidgetAction} />}</div>;
const chatPaneWideOnly = (props: OperateSurfaceProps) => <div>{props.operationTarget.startsWith("customer-") ? <SupportCustomerChatBlock conversation={props.supportInbox.conversations.find(item => item.id === props.supportInbox.selectedConversationId) ?? null} messages={props.supportInbox.messages} pending={props.supportInbox.pending} refused={props.supportInbox.refused} onApprove={props.onApproveSupportReply} onTakeover={props.onSetSupportTakeover} onReconcile={props.onReconcileSupportDelivery} /> : <ExecuteChatBlock sessionTitle={props.selectedSessionTitle} messages={props.messages} pending={props.pending} refused={props.refused} registry={DEFAULT_WIDGET_REGISTRY} onSend={props.onSend} onWidgetAction={props.onWidgetAction} />}</div>;
const workbenchPane = (props: OperateSurfaceProps) => <div>{props.operationTarget.startsWith("customer-") ? <SupportQueueWorkbenchBlock tickets={props.supportInbox.tickets} facts={props.supportInbox.facts} selectedConversationId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} /> : <KindWorkbenchBlock moduleId={props.installationId} kindKey={props.kindKey} workbenchKey={props.workbenchKey} workbenchVersion={props.workbenchVersion} tasks={props.tasks} events={props.events} registry={DEFAULT_WORKBENCH_REGISTRY} />}</div>;
const workbenchPaneWideOnly = (props: OperateSurfaceProps) => <div>{props.operationTarget.startsWith("customer-") ? <SupportQueueWorkbenchBlock tickets={props.supportInbox.tickets} facts={props.supportInbox.facts} selectedConversationId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} /> : <KindWorkbenchBlock moduleId={props.installationId} kindKey={props.kindKey} workbenchKey={props.workbenchKey} workbenchVersion={props.workbenchVersion} tasks={props.tasks} events={props.events} registry={DEFAULT_WORKBENCH_REGISTRY} />}</div>;
const OperateSurface = (props: OperateSurfaceProps) => <div><div>



    <RouteTabs props={{
      label: "Operations view",
      selectedKey: props.operationTarget,
      tabs: props.kindKey === "customer-support" ? [{
        id: "customer-chat",
        label: "Customers"
      }, {
        id: "customer-workbench",
        label: "Customer queue"
      }, {
        id: "internal-chat",
        label: "Internal chat"
      }, {
        id: "internal-workbench",
        label: "Internal workbench"
      }] : [{
        id: "internal-chat",
        label: "Chat"
      }, {
        id: "internal-workbench",
        label: "Workbench"
      }]
    }} on={{
      select: key => props.onSelectTarget(key as OperateSurfaceProps["operationTarget"])
    }} /></div>{props.operationTarget.startsWith("customer-") ? <SupportCustomerConversationRailBlock conversations={props.supportInbox.conversations} selectedId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} onSelect={props.onSelectSupportConversation} /> : <ExecuteSessionRailBlock sessions={props.sessions} selectedId={props.selectedSessionId} pending={props.pending} onSelect={props.onSelectSession} onCreate={props.onCreateSession} />}{props.operationTarget.endsWith("-chat") ? chatPane(props) : chatPaneWideOnly(props)}{props.operationTarget.endsWith("-workbench") ? workbenchPane(props) : workbenchPaneWideOnly(props)}</div>;
type SettingsFormContentProps = {
  readonly currentDisplayName: string;
  readonly currentModelProfile: string;
  readonly currentConfirmation: boolean;
  readonly currentOperatingMode: "assist" | "autopilot";
  readonly currentChannelAccountRef: string;
  readonly liveEnabled: boolean;
  readonly canEnableLive: boolean;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly credentialSlots: ReadonlyArray<{
    readonly key: string;
    readonly label: string;
    readonly provider: string;
  }>;
  readonly credentialStatuses: ReadonlyArray<{
    readonly providerKey: string;
    readonly maskedHint: string;
    readonly status: string;
  }>;
  readonly onSave: (settings: Readonly<Record<string, AgentosRuntimeValue>>, operatingMode: "assist" | "autopilot", channelAccountRef: string) => void;
  readonly onSetLiveEnabled: (enabled: boolean) => void;
  readonly onSaveCredential: (credentialKey: string, credentialValue: string) => void;
  readonly onRemoveCredential: (credentialKey: string) => void;
};
const SettingsFormContent = ({
  currentDisplayName,
  currentModelProfile,
  currentConfirmation,
  currentOperatingMode,
  currentChannelAccountRef,
  liveEnabled,
  canEnableLive,
  pending,
  refused,
  credentialSlots,
  credentialStatuses,
  onSave,
  onSetLiveEnabled,
  onSaveCredential,
  onRemoveCredential
}: SettingsFormContentProps) => {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [modelProfile, setModelProfile] = useState(currentModelProfile);
  const [requireConfirmation, setRequireConfirmation] = useState(currentConfirmation);
  const [operatingMode, setOperatingMode] = useState<"assist" | "autopilot">(currentOperatingMode);
  const [channelAccountRef, setChannelAccountRef] = useState(currentChannelAccountRef);
  const [credentialValues, setCredentialValues] = useState<Readonly<Record<string, string>>>({});
  useEffect(() => {
    setDisplayName(currentDisplayName);
    setModelProfile(currentModelProfile);
    setRequireConfirmation(currentConfirmation);
    setOperatingMode(currentOperatingMode);
    setChannelAccountRef(currentChannelAccountRef);
    setCredentialValues({});
  }, [currentChannelAccountRef, currentConfirmation, currentDisplayName, currentModelProfile, currentOperatingMode]);
  return <div><>



      <Input
        key={`display-${currentDisplayName}`}
        id="agentos-module-display-name"
        name="displayName"
        label="Display name"
        placeholder={currentDisplayName}
        isDisabled={pending}
        variant="secondary"
        onValueChange={setDisplayName}
      />



      <Input
        key={`profile-${currentModelProfile}`}
        id="agentos-module-model-profile"
        name="modelProfile"
        label="Model profile"
        placeholder={currentModelProfile}
        isDisabled={pending}
        variant="secondary"
        onValueChange={setModelProfile}
      />



      <Input
        key={`channel-${currentChannelAccountRef}`}
        id="agentos-module-channel-account-ref"
        name="channelAccountRef"
        label="Telegram channel account reference"
        placeholder={currentChannelAccountRef || "telegram:nivo-support"}
        isDisabled={pending}
        variant="secondary"
        hint="Reference to the Telegram account owned by this Agent Workspace controller."
        onValueChange={setChannelAccountRef}
      /></>




    <ChoiceTabs props={{
      label: "Operating mode",
      selectedKey: operatingMode,
      tabs: [{
        id: "assist",
        label: "Assist"
      }, {
        id: "autopilot",
        label: "Autopilot"
      }]
    }} on={{
      select: key => setOperatingMode(key as "assist" | "autopilot")
    }} />



    <Checkbox props={{
      label: "Require confirmation before external mutations",
      isSelected: requireConfirmation,
      name: "requireConfirmation"
    }} on={{
      change: setRequireConfirmation
    }} /><>




      <Button
        variant="primary"
        isPending={pending}
        isDisabled={channelAccountRef.trim().length < 3}
        onPress={() => onSave({
          displayName,
          modelProfile,
          requireConfirmation
        }, operatingMode, channelAccountRef.trim())}
      >Save settings</Button>



      <Button
        variant="secondary"
        isPending={pending}
        isDisabled={!liveEnabled && !canEnableLive}
        onPress={() => onSetLiveEnabled(!liveEnabled)}
      >{liveEnabled ? "Disable Live" : "Enable Live"}</Button></>{credentialSlots.map(slot => <Input
        key={`${slot.key}-${credentialStatuses.find(row => row.providerKey === slot.key)?.maskedHint ?? "empty"}`}
        id={`agentos-module-credential-${slot.key}`}
        name={slot.key}
        label={slot.label}
        kind="password"
        placeholder={credentialStatuses.find(row => row.providerKey === slot.key)?.maskedHint ?? "Enter credential"}
        isDisabled={pending}
        revealLabel={`Show ${slot.label}`}
        hideLabel={`Hide ${slot.label}`}
        variant="secondary"
        hint={`${slot.provider} · encrypted at rest; only the masked suffix is returned`}
        onValueChange={value => setCredentialValues(current => ({
        ...current,
        [slot.key]: value
      }))}
      />)}{credentialSlots.length === 0 ? undefined : <Text size="sm" tone="muted" live="polite">{credentialStatuses.length === 0 ? "No credential configured" : credentialStatuses.map(row => `${row.providerKey}: ${row.maskedHint} · ${row.status}`).join(" · ")}</Text>}{credentialSlots.flatMap(slot => {
      const configured = credentialStatuses.some(row => row.providerKey === slot.key);
      const value = credentialValues[slot.key]?.trim() ?? "";
      return [<Button
        key="item-0"
        variant="secondary"
        isDisabled={value.length === 0}
        isPending={pending}
        onPress={() => value.length > 0 && onSaveCredential(slot.key, value)}
      >{`Save ${slot.label}`}</Button>, ...(configured ? [<Button
        key="item-0"
        variant="ghost"
        isDisabled={pending}
        onPress={() => onRemoveCredential(slot.key)}
      >{`Remove ${slot.label}`}</Button>] : [])];
    })}{refused ? <Text size="sm" tone="muted" live="assertive">{"Settings were refused and the prior version remains active."}</Text> : <Text size="sm" tone="muted" live="polite">{liveEnabled ? "Live is enabled for the currently applied context. Applying another version disables Live." : canEnableLive ? "Live is ready to enable. Assist remains the safer starting mode." : "Live requires an applied context, a Telegram account reference, and a configured Telegram bot token."}</Text>}</div>;
};
type SettingsSurfaceProps = SettingsFormContentProps & {
  readonly activeVersion: number | null;
};
const SettingsSurface = ({
  activeVersion,
  currentDisplayName,
  currentModelProfile,
  currentConfirmation,
  currentOperatingMode,
  currentChannelAccountRef,
  liveEnabled,
  canEnableLive,
  pending,
  refused,
  credentialSlots,
  credentialStatuses,
  onSave,
  onSetLiveEnabled,
  onSaveCredential,
  onRemoveCredential
}: SettingsSurfaceProps) => <div>


  <SurfaceCard
    label="Module settings"
  >
    <SettingsFormContent currentDisplayName={currentDisplayName} currentModelProfile={currentModelProfile} currentConfirmation={currentConfirmation} currentOperatingMode={currentOperatingMode} currentChannelAccountRef={currentChannelAccountRef} liveEnabled={liveEnabled} canEnableLive={canEnableLive} pending={pending} refused={refused} credentialSlots={credentialSlots} credentialStatuses={credentialStatuses} onSave={onSave} onSetLiveEnabled={onSetLiveEnabled} onSaveCredential={onSaveCredential} onRemoveCredential={onRemoveCredential} />
  </SurfaceCard>



  <SurfaceCard
    label="Authority & safeguards"
    fact={activeVersion === null ? "Context required" : `v${activeVersion} active`}
  ><div>{<div>{[["External sends", currentConfirmation ? "Require confirmation" : `Allowed by ${currentOperatingMode} policy`], ["Refund / legal promise", "Human approval required"], ["Prompt cache", activeVersion === null ? "Inactive until Apply" : `Stable Nivo knowledge + context v${activeVersion}`], ["Cache invalidation", "Automatic on context Apply"], ["Execute history", "Original context binding retained"]].map(([ label, value], index) => <div key={index}>{<Text size="sm">{label}</Text>}{<Text size="sm" weight="semibold">{value}</Text>}</div>)}</div>}</div></SurfaceCard>

</div>;
type DiagnosticsSurfaceProps = {
  readonly installationId: string;
  readonly kindKey: string;
  readonly workbenchKey: string;
  readonly diagnostics: Readonly<Record<string, AgentosRuntimeValue>>;
  readonly events: AgentosModuleRuntime["operationEvents"];
  readonly selectedSignal: "all" | "channel" | "ai";
  readonly compactPane: "signals" | "readiness" | "evidence";
  readonly onSelectSignal: (signal: "all" | "channel" | "ai") => void;
  readonly onSelectPane: (pane: "signals" | "readiness" | "evidence") => void;
};
const safeValue = (value: AgentosRuntimeValue): string => {
  if (value === null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};
const diagnosticEntries = (diagnostics: Readonly<Record<string, AgentosRuntimeValue>>, selectedSignal: DiagnosticsSurfaceProps["selectedSignal"]) => {
  const entries = Object.entries(diagnostics);
  if (selectedSignal === "all") return entries;
  const filtered = entries.filter(([key]) => {
    const normalized = key.toLowerCase();
    return selectedSignal === "channel" ? ["telegram", "channel", "webhook"].some(token => normalized.includes(token)) : ["ai", "cache", "prompt", "controller", "model"].some(token => normalized.includes(token));
  });
  return filtered.length > 0 ? filtered : entries;
};
const diagnosticFacts = (entries: ReadonlyArray<readonly [string, AgentosRuntimeValue]>) => entries.map(([ key, value], index) => <div key={index}>

  <Text size="sm">{key}</Text>
  <Text size="sm" weight="semibold">{safeValue(value)}</Text></div>);
type DiagnosticsHealthCardProps = Pick<DiagnosticsSurfaceProps, "diagnostics" | "selectedSignal">;
const diagnosticHealthFact = (selectedSignal: DiagnosticsSurfaceProps["selectedSignal"]): string => {
  if (selectedSignal === "all") return "All systems";
  return selectedSignal === "channel" ? "Channel ingress" : "AI controller";
};
const DiagnosticsHealthCard = ({
  diagnostics,
  selectedSignal
}: DiagnosticsHealthCardProps) => <SurfaceCard
  label="Runtime health"
  fact={diagnosticHealthFact(selectedSignal)}
><div><div>{diagnosticFacts(diagnosticEntries(diagnostics, selectedSignal))}</div>

    <Text size="sm" tone="muted">{"Only owner-safe runtime checks are disclosed; secrets and raw configuration remain server-side."}</Text></div></SurfaceCard>;
type DiagnosticsTraceCardProps = Pick<DiagnosticsSurfaceProps, "installationId" | "kindKey" | "workbenchKey" | "events">;
const DiagnosticsTraceCard = ({
  installationId,
  kindKey,
  workbenchKey,
  events
}: DiagnosticsTraceCardProps) => {
  const facts: ReadonlyArray<readonly [string, string]> = [["Installation", installationId], ["Kind", kindKey], ["Workbench", workbenchKey], ...events.slice(-5).reverse().map(event => [event.eventType, `${event.source} · ${new Date(event.observedAt).toLocaleString()}`] as const)];
  return <SurfaceCard
    label="Event trace"
    fact={events.length === 0 ? "No events" : `${events.length} accepted`}
  ><div><div>{facts.map(([ label, value], index) => <div key={index}>
            <Text size="sm">{label}</Text>
            <Text size="sm" weight="semibold">{value}</Text></div>)}</div></div></SurfaceCard>;
};
const DiagnosticsSurface = ({
  installationId,
  kindKey,
  workbenchKey,
  diagnostics,
  events,
  selectedSignal,
  compactPane,
  onSelectSignal,
  onSelectPane
}: DiagnosticsSurfaceProps) => <div><div>



    <ChoiceTabs props={{
      label: "Compact Diagnostics view",
      selectedKey: compactPane,
      tabs: [{
        id: "readiness",
        label: "Health"
      }, {
        id: "signals",
        label: "Signals"
      }, {
        id: "evidence",
        label: "Trace"
      }]
    }} on={{
      select: key => onSelectPane(key as DiagnosticsSurfaceProps["compactPane"])
    }} /></div>{cockpitPane(compactPane !== "signals", ModuleCockpitRailBlock, {
    label: "Signals",
    fact: `${events.length} events`,
    summary: "Filter the safe health projection without exposing raw configuration or credentials.",
    items: [{
      id: "all",
      label: "All systems",
      status: `${Object.keys(diagnostics).length} checks`
    }, {
      id: "channel",
      label: "Channel ingress",
      status: `${events.filter(event => event.source.toLowerCase().includes("telegram")).length} Telegram events`
    }, {
      id: "ai",
      label: "AI controller",
      status: `${events.filter(event => event.replyContractKey.length > 0).length} bound replies`
    }],
    selectedId: selectedSignal,
    onSelect: (key: string) => onSelectSignal(key as DiagnosticsSurfaceProps["selectedSignal"])
  })}{cockpitPane(compactPane !== "readiness", DiagnosticsHealthCard, {
    diagnostics,
    selectedSignal
  })}{cockpitSidecarPane(compactPane !== "evidence", DiagnosticsTraceCard, {
    installationId,
    kindKey,
    workbenchKey,
    events
  })}</div>;

/** One exact Setup Test result whose revision and digest still match the draft on screen. */
export const exactTestSurfaceFor = (testSurface: AgentosModuleTestSurface | null, draft: ContextDraft | null): AgentosModuleTestSurface | null => {
  if (draft?.digest === null || draft === null || testSurface?.run === null || testSurface === null) return null;
  return testSurface.run.setupSessionId === draft.setupSessionId && testSurface.run.draftDigest === draft.digest ? testSurface : null;
};
type AgentOSSolutionModuleShellProps = {
  readonly workspaceLabel: string;
  readonly moduleName: string;
  readonly moduleKind: string;
  readonly lifecycleLabel: string;
  readonly contextVersion: string;
  readonly channelLabel: string;
  readonly controllerLabel: string;
  readonly activeView: AgentOSModuleView;
  readonly onBackToModules: () => void;
  readonly onNavigate: (view: AgentOSModuleView) => void;
};

/** Closed pure screen states produced by the connected Module Studio page. */
export type AgentOSSolutionModuleScreen = {
  readonly view: "setup";
  readonly contentProps: SetupSurfaceProps;
} | {
  readonly view: "test";
  readonly contentProps: TestSurfaceProps;
} | {
  readonly view: "test-unavailable";
} | {
  readonly view: "operate";
  readonly contentProps: OperateSurfaceProps;
} | {
  readonly view: "settings";
  readonly contentProps: SettingsSurfaceProps;
} | {
  readonly view: "diagnostics";
  readonly contentProps: DiagnosticsSurfaceProps;
};

/** Complete world-free contract for the persistent module shell and selected screen. */
export type AgentOSSolutionModulePageViewProps = {
  readonly shell: AgentOSSolutionModuleShellProps;
  readonly screen: AgentOSSolutionModuleScreen;
};

/** Draw the selected Module Studio surface from resolved state, data and actions only. */
export const AgentOSSolutionModulePageBase = (props: AgentOSSolutionModulePageProps) => {
  const {
    shell,
    screen
  }: AgentOSSolutionModulePageViewProps = props;
  if (screen.view === "setup") return <ModuleRouteShellBlock {...shell} content={SetupSurface} contentProps={screen.contentProps} />;
  if (screen.view === "operate") return <ModuleRouteShellBlock {...shell} content={OperateSurface} contentProps={screen.contentProps} />;
  if (screen.view === "test-unavailable") return <ModuleRouteShellBlock {...shell} content={TestUnavailableSurface} contentProps={{}} />;
  if (screen.view === "test") return <ModuleRouteShellBlock {...shell} content={TestSurface} contentProps={screen.contentProps} />;
  if (screen.view === "settings") return <ModuleRouteShellBlock {...shell} content={SettingsSurface} contentProps={screen.contentProps} />;
  return <ModuleRouteShellBlock {...shell} content={DiagnosticsSurface} contentProps={screen.contentProps} />;
};

/** State accepted by the typed runtime-loading page. */
export type AgentOSSolutionModuleStateProps = {
  readonly refused: boolean;
};

/** Draw a typed load or refusal state while no runtime projection is available. */
export const AgentOSSolutionModuleState = (props: AgentOSSolutionModuleStateProps) => {
  const {
    refused
  }: AgentOSSolutionModuleStateProps = props;
  return <div><div>


    <Heading level={1}>{"Module Studio"}</Heading></div><>


    <SurfaceCard
      label={refused ? "Runtime unavailable" : "Loading runtime"}
    ><div>{<div>{[<div key="item-0">{<Text size="sm">{"State"}</Text>}{<Text size="sm">{refused ? "The server refused this installation or workspace identity." : "Reading sessions, context, widgets, and registry…"}</Text>}</div>]}</div>}</div></SurfaceCard></></div>;
};
