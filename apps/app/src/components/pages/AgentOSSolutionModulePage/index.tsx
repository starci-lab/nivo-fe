"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { ContextDraft } from "@/components/blocks/agentos/ContextVersionBlock";
import type { ExecuteMessage } from "@/components/blocks/agentos/ExecuteChatBlock";
import type { ExecuteSession } from "@/components/blocks/agentos/ExecuteSessionRailBlock";
import type { AgentOSModuleView } from "@/components/blocks/agentos/ModuleRouteShellBlock";
import type { SetupMessage, SetupRevision } from "@/components/blocks/agentos/PrivateSetupChatBlock";
import { nivoQueryData, type NivoQueryAnswer, useQueryMyAgentosModuleRuntimeSwr, useQueryMyAgentosModuleTestSurfaceSwr, useQueryMyAgentWorkspaceControlCenterSwr, useQuerySupportCustomerConversationsSwr, useQuerySupportCustomerMessagesSwr, useQuerySupportImportantFactsSwr, useQuerySupportTicketsSwr, useReadMyAgentosModuleTestRun, useMutateApproveSupportReplySwr, useMutateConfigureAgentWorkspaceChannelSwr, useMutateManageAgentosModuleRuntimeSwr, useMutateReconcileSupportDeliverySwr, useMutateRunAgentosModuleTestSwr, useMutateSetSupportTakeoverSwr } from "@/hooks";
import { type AgentosModuleRuntime, type AgentosRuntimeValue, type ManageAgentosModuleRuntimeInput } from "@/modules/api/console";
import { AgentOSSolutionModulePageBase, AgentOSSolutionModuleState, exactTestSurfaceFor, type AgentOSSolutionModulePageViewProps, type AgentOSSolutionModuleScreen } from "./component";

/** Exact workspace and installation route identities connected by the page. */
export type AgentOSSolutionModulePageProps = {
  readonly workspaceId: string;
  readonly installationId: string;
  readonly view?: AgentOSModuleView;
};
const idempotencyKey = (): string => globalThis.crypto.randomUUID();
const POLL_INTERVAL_MS = 1000;
// Controller AI turns may legitimately use the 75-second provider budget.
const POLL_ATTEMPTS = 90;
const wait = (duration: number): Promise<void> => new Promise(resolve => globalThis.setTimeout(resolve, duration));
const telegramAccountIdFromToken = (token: string): string | null => {
  const separator = token.indexOf(":");
  const accountId = separator > 0 ? token.slice(0, separator) : "";
  return /^\d{5,20}$/u.test(accountId) ? accountId : null;
};
type AgentosModuleTestTarget = {
  readonly contextVersionId?: string;
  readonly setupSessionId?: string;
};
type OperationTarget = Extract<AgentOSSolutionModuleScreen, {
  readonly view: "operate";
}>["contentProps"]["operationTarget"];
type SetupPane = Extract<AgentOSSolutionModuleScreen, {
  readonly view: "setup";
}>["contentProps"]["compactPane"];
type TestPane = Extract<AgentOSSolutionModuleScreen, {
  readonly view: "test";
}>["contentProps"]["compactPane"];
type DiagnosticsPane = Extract<AgentOSSolutionModuleScreen, {
  readonly view: "diagnostics";
}>["contentProps"]["compactPane"];
type DiagnosticSignal = Extract<AgentOSSolutionModuleScreen, {
  readonly view: "diagnostics";
}>["contentProps"]["selectedSignal"];
const stringSetting = (value: AgentosRuntimeValue | undefined, fallback: string): string => typeof value === "string" && value.trim().length > 0 ? value : fallback;
const runtimeValueText = (value: AgentosRuntimeValue): string => {
  if (value === null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};
const SETUP_GATE_LABELS: Readonly<Record<string, string>> = {
  businessIdentity: "Business identity",
  productsServices: "Products and services",
  supportScope: "Support scope",
  customerSegments: "Customer segments",
  channels: "Channels",
  hoursAndSla: "Hours and SLA",
  escalationAndHandoff: "Escalation and handoff",
  prohibitedCommitments: "Prohibited commitments",
  privacyAndSensitiveData: "Privacy and sensitive data",
  toneAndLanguage: "Tone and language",
  automationPolicy: "Automation policy",
  readinessOwnership: "Readiness ownership",
  accountingScope: "Accounting scope",
  currencyAndLocale: "Currency and locale",
  sourceSystems: "Source systems",
  approvalPolicy: "Approval policy",
  approvalThresholds: "Approval thresholds",
  evidenceRequirements: "Evidence requirements",
  prohibitedActions: "Prohibited actions",
  schedulingScope: "Scheduling scope",
  timeZone: "Time zone",
  calendarSources: "Calendar sources",
  participantRules: "Participant rules",
  availabilityRules: "Availability rules",
  conflictPolicy: "Conflict policy",
  confirmationPolicy: "Confirmation policy",
  reminderPolicy: "Reminder policy",
  researchScope: "Research scope",
  sourcePolicy: "Source policy",
  citationPolicy: "Citation policy",
  confidencePolicy: "Confidence policy",
  prohibitedClaims: "Prohibited claims",
  freshnessPolicy: "Freshness policy"
};
const readableGate = (key: string): string => SETUP_GATE_LABELS[key] ?? key.replace(/([a-z])([A-Z])/gu, "$1 $2").replace(/^./u, value => value.toUpperCase());
const setupGatesFor = (session: AgentosModuleRuntime["setupSession"], fields: ReadonlyArray<string>): ContextDraft["gates"] => {
  const rawGates = session?.gateEvidence?.gates;
  const evidence = Array.isArray(rawGates) ? rawGates : [];
  const evidenceKeys = evidence.flatMap(candidate => candidate !== null && typeof candidate === "object" && !Array.isArray(candidate) && typeof candidate.key === "string" ? [candidate.key] : []);
  return (fields.length > 0 ? fields : evidenceKeys).map(key => {
    const row = evidence.find(candidate => candidate !== null && typeof candidate === "object" && !Array.isArray(candidate) && candidate.key === key);
    return {
      key,
      label: readableGate(key),
      passed: row !== undefined && row.passed === true
    };
  });
};
const draftFactsFor = (snapshot: Readonly<Record<string, AgentosRuntimeValue>> | null): ReadonlyArray<string> => {
  if (snapshot === null) return [];
  const rawFacts = snapshot.facts;
  if (Array.isArray(rawFacts)) return rawFacts.filter((value): value is string => typeof value === "string");
  return Object.entries(snapshot).filter(([key]) => key !== "summary").slice(0, 4).map(([key, value]) => `${key}: ${runtimeValueText(value)}`);
};
const exactTestPassedFor = (testSurface: ReturnType<typeof exactTestSurfaceFor>, sessionId: string, digest: string | null): boolean => {
  if (digest === null) return false;
  return (testSurface?.runs ?? []).some(run => (run.status === "passed" || run.status === "warning") && run.setupSessionId === sessionId && run.draftDigest === digest);
};
const contextDraftFor = (runtime: AgentosModuleRuntime, setup: AgentosModuleRuntime["setupSession"], testSurface: ReturnType<typeof exactTestSurfaceFor>): ContextDraft | null => {
  if (setup?.setupRevision === null || setup?.setupRevision === undefined || setup.setupStatus === null) return null;
  const context = runtime.contextVersions.find(candidate => candidate.sourceSetupSessionId === setup.id) ?? null;
  const snapshot = context?.snapshot ?? setup.draftSnapshot;
  const summary = snapshot === null ? "Nivo is waiting for the owner to describe the business." : stringSetting(snapshot.summary, stringSetting(snapshot.businessIdentity, `Business context from Setup revision ${setup.setupRevision}`));
  return {
    contextId: context?.id ?? null,
    setupSessionId: setup.id,
    revision: setup.setupRevision,
    status: setup.setupStatus,
    version: context?.version ?? null,
    digest: setup.draftDigest,
    summary,
    facts: draftFactsFor(snapshot),
    gates: setupGatesFor(setup, runtime.installation.runtimeManifest.operations?.setupFields ?? []),
    exactTestPassed: exactTestPassedFor(testSurface, setup.id, setup.draftDigest),
    isActive: context?.id === runtime.installation.activeContextVersionId
  };
};
const activeVersionFor = (runtime: AgentosModuleRuntime): number | null => runtime.contextVersions.find(context => context.id === runtime.installation.activeContextVersionId)?.version ?? null;
const testContextLabelFor = (draft: ContextDraft | null): string => {
  if (draft?.digest === null || draft?.digest === undefined) return "Complete enough Setup chat to create a testable draft";
  const version = draft.version === null ? "draft" : `context v${draft.version}`;
  return `Setup r${draft.revision} · ${version} · digest ${draft.digest.slice(0, 8)}`;
};
const executeSessionTitleFor = (title: string, index: number): string => title === "New Execute session" ? `Conversation ${index + 1}` : title;
const primarySessionFor = (runtime: AgentosModuleRuntime): string | null => {
  const primaryId = runtime.installation.primaryOpsSessionId;
  return primaryId !== null && runtime.executeSessions.some(session => session.id === primaryId) ? primaryId : runtime.executeSessions[0]?.id ?? null;
};
const channelLabelFor = (channelAccountRef: string | null): string => {
  if (channelAccountRef === null) return "Channel not connected";
  return channelAccountRef.toLowerCase().includes("telegram") ? "Telegram connected" : "Channel connected";
};
const selectedSessionTitleFor = (selectedSession: AgentosModuleRuntime["executeSessions"][number] | null, runtime: AgentosModuleRuntime): string => {
  if (selectedSession === null) return "No Execute session";
  if (selectedSession.id === runtime.installation.primaryOpsSessionId) return "Primary Operations";
  return executeSessionTitleFor(selectedSession.title, runtime.executeSessions.indexOf(selectedSession));
};
const runtimeForWorkspace = (answer: NivoQueryAnswer<AgentosModuleRuntime> | undefined, workspaceId: string): AgentosModuleRuntime | null => {
  const candidate = nivoQueryData(answer);
  return candidate?.installation.agentWorkspaceId === workspaceId ? candidate : null;
};
const controllerHostnameForWorkspace = (answer: NivoQueryAnswer<{
  readonly workspace: {
    readonly id: string;
  };
  readonly instance: {
    readonly hostname: string;
  };
}> | undefined, workspaceId: string): string | null => {
  const candidate = nivoQueryData(answer);
  return candidate?.workspace.id === workspaceId ? candidate.instance.hostname : null;
};
const queryNodes = <T,>(answer: NivoQueryAnswer<{
  readonly nodes: ReadonlyArray<T>;
}> | undefined): ReadonlyArray<T> => nivoQueryData(answer)?.nodes ?? [];
const selectedIdentity = <T extends {
  readonly id: string;
},>(rows: ReadonlyArray<T>, selectedId: string | null): string | null => rows.some(row => row.id === selectedId) ? selectedId : rows[0]?.id ?? null;
const moduleQueriesRefused = (runtimeAnswer: NivoQueryAnswer<AgentosModuleRuntime> | undefined, runtime: AgentosModuleRuntime | null, testAnswer: NivoQueryAnswer<unknown> | undefined): boolean => runtimeAnswer?.ok === false || runtimeAnswer !== undefined && runtime === null || testAnswer?.ok === false;
const anyQueryRefused = (answers: ReadonlyArray<NivoQueryAnswer<unknown> | undefined>): boolean => answers.some(answer => answer?.ok === false);

/** Connect one stable module shell to its persistent backend runtime and separate task URLs. */
export const AgentOSSolutionModulePage = (props: AgentOSSolutionModulePageProps) => {
  const {
    workspaceId,
    installationId,
    view = "setup"
  }: AgentOSSolutionModulePageProps = props;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [actionRefused, setActionRefused] = useState(false);
  const [selectedSupportConversationId, setSelectedSupportConversationId] = useState<string | null>(null);
  const [supportActionPending, setSupportActionPending] = useState(false);
  const [supportActionRefused, setSupportActionRefused] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSetupSessionId, setSelectedSetupSessionId] = useState<string | null>(null);
  const [selectedOperationTarget, setSelectedOperationTarget] = useState<OperationTarget | null>(null);
  const [setupPane, setSetupPane] = useState<SetupPane>("conversation");
  const [testPane, setTestPane] = useState<TestPane>("conversation");
  const [diagnosticsPane, setDiagnosticsPane] = useState<DiagnosticsPane>("readiness");
  const [diagnosticSignal, setDiagnosticSignal] = useState<DiagnosticSignal>("all");
  const [selectedTestScenarioKey, setSelectedTestScenarioKey] = useState("");
  const moduleRoot = `/agentos/workspaces/${workspaceId}/modules/${installationId}`;
  const runtimeQuery = useQueryMyAgentosModuleRuntimeSwr(workspaceId, installationId, view === "diagnostics");
  const runtimeMutation = useMutateManageAgentosModuleRuntimeSwr(installationId);
  const testMutation = useMutateRunAgentosModuleTestSwr(installationId);
  const channelMutation = useMutateConfigureAgentWorkspaceChannelSwr(workspaceId);
  const mutateRuntime = runtimeMutation.trigger;
  const mutateTest = testMutation.trigger;
  const mutateChannel = channelMutation.trigger;
  const runtime = runtimeForWorkspace(runtimeQuery.data, workspaceId);
  const testSurfaceQuery = useQueryMyAgentosModuleTestSurfaceSwr(installationId, view === "test" || view === "setup");
  const testSurface = nivoQueryData(testSurfaceQuery.data) ?? null;
  const refused = actionRefused || moduleQueriesRefused(runtimeQuery.data, runtime, testSurfaceQuery.data);
  const supportEnabled = view === "operate" && runtime?.installation.kindKey === "customer-support";
  const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId, supportEnabled);
  const controllerHostname = controllerHostnameForWorkspace(controlCenter.data, workspaceId);
  const supportIdentity = {
    hostname: controllerHostname,
    workspaceId,
    installationId,
    enabled: supportEnabled
  };
  const conversationsQuery = useQuerySupportCustomerConversationsSwr(supportIdentity);
  const ticketsQuery = useQuerySupportTicketsSwr(supportIdentity);
  const factsQuery = useQuerySupportImportantFactsSwr(supportIdentity);
  const supportMutationIdentity = {
    ...supportIdentity,
    conversationId: selectedSupportConversationId
  };
  const approveSupportMutation = useMutateApproveSupportReplySwr(supportMutationIdentity);
  const takeoverMutation = useMutateSetSupportTakeoverSwr(supportMutationIdentity);
  const deliveryMutation = useMutateReconcileSupportDeliverySwr(supportMutationIdentity);
  const readTestRun = useReadMyAgentosModuleTestRun(installationId);
  const supportConversations = queryNodes(conversationsQuery.data);
  const effectiveSupportConversationId = selectedIdentity(supportConversations, selectedSupportConversationId);
  const messagesQuery = useQuerySupportCustomerMessagesSwr(supportIdentity, effectiveSupportConversationId);
  const supportMessages = queryNodes(messagesQuery.data);
  const supportTicketsState = queryNodes(ticketsQuery.data);
  const supportFacts = queryNodes(factsQuery.data);
  const supportPending = supportActionPending || [conversationsQuery, ticketsQuery, factsQuery, messagesQuery].some(query => query.isLoading);
  const supportRefused = supportActionRefused || anyQueryRefused([controlCenter.data, conversationsQuery.data, ticketsQuery.data, factsQuery.data, messagesQuery.data]);
  useEffect(() => {
    if (runtime === null) return;
    if (selectedSessionId !== null && runtime.executeSessions.some(item => item.id === selectedSessionId)) return;
    setSelectedSessionId(primarySessionFor(runtime));
  }, [runtime, selectedSessionId]);
  useEffect(() => {
    if (runtime === null) return;
    const selected = runtime.setupSessions.find(item => item.id === selectedSetupSessionId);
    if (selected !== undefined && (runtime.setupSession?.id === selected.id || selected.setupStatus === "open" || selected.setupStatus === "ready")) return;
    setSelectedSetupSessionId(runtime.setupSession?.id ?? runtime.setupSessions.at(-1)?.id ?? null);
  }, [runtime, selectedSetupSessionId]);
  const testContract = testSurface?.contract ?? runtime?.installation.runtimeManifest.test;
  useEffect(() => {
    if (testContract === undefined) return;
    if (testContract.scenarios.some(scenario => scenario.key === selectedTestScenarioKey)) return;
    setSelectedTestScenarioKey(testContract.scenarios[0]?.key ?? "");
  }, [selectedTestScenarioKey, testContract]);
  const runtimeMessages = runtime?.messages;
  const runtimeSetupSessions = runtime?.setupSessions;
  const runtimeExecuteSessions = runtime?.executeSessions;
  const runtimeDisplayName = runtime?.installation.displayName;
  const perform = useCallback(async (input: ManageAgentosModuleRuntimeInput): Promise<AgentosModuleRuntime | null> => {
    setPending(true);
    setActionRefused(false);
    const result = await mutateRuntime(input);
    setPending(false);
    if (!result.ok || result.data.installation.agentWorkspaceId !== workspaceId) {
      setActionRefused(true);
      return null;
    }
    await runtimeQuery.mutate(result, {
      revalidate: false
    });
    return result.data;
  }, [mutateRuntime, runtimeQuery, workspaceId]);
  const pollRuntimeUntil = useCallback(async (settled: (candidate: AgentosModuleRuntime) => boolean): Promise<AgentosModuleRuntime | null> => {
    setPending(true);
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_INTERVAL_MS);
      const result = await runtimeQuery.mutate();
      if (result === undefined) {
        setPending(false);
        setActionRefused(true);
        return null;
      }
      if (!result.ok || result.data.installation.agentWorkspaceId !== workspaceId) {
        setPending(false);
        setActionRefused(true);
        return null;
      }
      if (settled(result.data)) {
        setPending(false);
        return result.data;
      }
    }
    setPending(false);
    setActionRefused(true);
    return null;
  }, [runtimeQuery, workspaceId]);
  const startSetupRevision = useCallback(() => {
    void perform({
      action: "START_SETUP_REVISION",
      installationId,
      idempotencyKey: idempotencyKey(),
      title: "Setup revision"
    });
  }, [installationId, perform]);
  const sendSetupMessage = useCallback(async (sessionId: string, content: string) => {
    const assistantCount = runtimeMessages?.filter(message => message.sessionId === sessionId && message.role === "assistant").length ?? 0;
    const priorDigest = runtimeSetupSessions?.find(session => session.id === sessionId)?.draftDigest ?? null;
    const appended = await perform({
      action: "APPEND_SETUP_MESSAGE",
      installationId,
      idempotencyKey: idempotencyKey(),
      sessionId,
      content
    });
    if (appended === null) return;
    await pollRuntimeUntil(candidate => {
      const nextAssistantCount = candidate.messages.filter(message => message.sessionId === sessionId && message.role === "assistant").length;
      const setup = candidate.setupSessions.find(session => session.id === sessionId);
      return nextAssistantCount > assistantCount || setup?.draftDigest !== priorDigest || setup?.setupStatus === "completed";
    });
  }, [installationId, perform, pollRuntimeUntil, runtimeMessages, runtimeSetupSessions]);
  const applySetupRevision = useCallback((sessionId: string) => {
    void perform({
      action: "APPLY_SETUP_REVISION",
      installationId,
      idempotencyKey: idempotencyKey(),
      sessionId
    });
  }, [installationId, perform]);
  const createExecuteSession = useCallback(async (): Promise<string | null> => {
    const existingIds = new Set(runtimeExecuteSessions?.map(session => session.id) ?? []);
    const nextRuntime = await perform({
      action: "CREATE_EXECUTE_SESSION",
      installationId,
      idempotencyKey: idempotencyKey(),
      title: `Conversation ${(runtimeExecuteSessions?.length ?? 0) + 1}`
    });
    return nextRuntime?.executeSessions.find(session => !existingIds.has(session.id))?.id ?? null;
  }, [installationId, perform, runtimeExecuteSessions]);
  const sendExecuteMessage = useCallback(async (sessionId: string, content: string) => {
    const assistantCount = runtimeMessages?.filter(message => message.sessionId === sessionId && message.role === "assistant").length ?? 0;
    const appended = await perform({
      action: "APPEND_EXECUTE_MESSAGE",
      installationId,
      sessionId,
      idempotencyKey: idempotencyKey(),
      content
    });
    if (appended === null) return;
    await pollRuntimeUntil(candidate => candidate.messages.filter(message => message.sessionId === sessionId && message.role === "assistant").length > assistantCount);
  }, [installationId, perform, pollRuntimeUntil, runtimeMessages]);
  const saveSettings = useCallback((settings: Readonly<Record<string, AgentosRuntimeValue>>, operatingMode: "assist" | "autopilot", channelAccountRef: string) => {
    void perform({
      action: "UPDATE_SETTINGS",
      installationId,
      idempotencyKey: idempotencyKey(),
      settings,
      operatingMode,
      channelAccountRef
    });
  }, [installationId, perform]);
  const setLiveEnabled = useCallback((enabled: boolean) => {
    void perform({
      action: enabled ? "ENABLE_LIVE" : "DISABLE_LIVE",
      installationId,
      idempotencyKey: idempotencyKey()
    });
  }, [installationId, perform]);
  const saveCredential = useCallback(async (credentialKey: string, credentialValue: string) => {
    if (credentialKey === "telegram-bot-token") {
      const accountId = telegramAccountIdFromToken(credentialValue);
      if (accountId === null) {
        setActionRefused(true);
        return;
      }
      setPending(true);
      setActionRefused(false);
      const channel = await mutateChannel({
        agentWorkspaceId: workspaceId,
        provider: "Telegram",
        accountId,
        displayName: runtimeDisplayName ?? "Support Desk Telegram",
        credentials: [{
          key: "TELEGRAM_BOT_TOKEN",
          value: credentialValue
        }]
      });
      setPending(false);
      if (!channel.ok || channel.data.state !== "APPLIED") {
        setActionRefused(true);
        return;
      }
      const saved = await perform({
        action: "SAVE_MODULE_CREDENTIAL",
        installationId,
        idempotencyKey: idempotencyKey(),
        credentialKey,
        credentialValue
      });
      if (saved === null) return;
      await perform({
        action: "UPDATE_SETTINGS",
        installationId,
        idempotencyKey: idempotencyKey(),
        settings: saved.settings ?? {},
        operatingMode: saved.installation.operatingMode,
        channelAccountRef: `TELEGRAM:${accountId}`
      });
      return;
    }
    await perform({
      action: "SAVE_MODULE_CREDENTIAL",
      installationId,
      idempotencyKey: idempotencyKey(),
      credentialKey,
      credentialValue
    });
  }, [installationId, mutateChannel, perform, runtimeDisplayName, workspaceId]);
  const removeCredential = useCallback((credentialKey: string) => {
    void perform({
      action: "REMOVE_MODULE_CREDENTIAL",
      installationId,
      idempotencyKey: idempotencyKey(),
      credentialKey
    });
  }, [installationId, perform]);
  const invokeWidgetAction = useCallback((widgetId: string, widgetAction: string, widgetInput: Readonly<Record<string, AgentosRuntimeValue>>, taskExpectedVersion?: number) => {
    void perform({
      action: "INVOKE_WIDGET_ACTION",
      installationId,
      idempotencyKey: idempotencyKey(),
      widgetId,
      widgetAction,
      widgetInput,
      taskExpectedVersion
    });
  }, [installationId, perform]);
  const runSupportAction = useCallback(async (action: () => Promise<{
    readonly ok: boolean;
  }>) => {
    setSupportActionPending(true);
    const result = await action();
    setSupportActionPending(false);
    setSupportActionRefused(!result.ok);
  }, []);
  const approveSupportReply = useCallback((decisionId: string) => {
    void runSupportAction(() => approveSupportMutation.trigger(decisionId));
  }, [approveSupportMutation, runSupportAction]);
  const setSupportTakeover = useCallback((conversationId: string, takeover: boolean) => {
    void runSupportAction(() => takeoverMutation.trigger({
      conversationId,
      takeover
    }));
  }, [runSupportAction, takeoverMutation]);
  const reconcileSupportDelivery = useCallback((outboxId: string, delivered: boolean) => {
    void runSupportAction(() => deliveryMutation.trigger({
      outboxId,
      delivered
    }));
  }, [deliveryMutation, runSupportAction]);
  const runTest = useCallback(async (target: AgentosModuleTestTarget, scenarioKey: string, scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>) => {
    setPending(true);
    setActionRefused(false);
    const result = await mutateTest({
      installationId,
      ...target,
      scenarioKey,
      scenarioInput,
      idempotencyKey: idempotencyKey()
    });
    if (!result.ok) {
      setPending(false);
      setActionRefused(true);
      return;
    }
    await testSurfaceQuery.mutate(result, {
      revalidate: false
    });
    const runId = result.data.run?.id;
    if (runId === undefined || result.data.run?.status !== "running") {
      setPending(false);
      return;
    }
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_INTERVAL_MS);
      const next = await readTestRun(runId);
      if (!next.ok) {
        setPending(false);
        setActionRefused(true);
        return;
      }
      await testSurfaceQuery.mutate(next, {
        revalidate: false
      });
      if (next.data.run?.status !== "running") {
        setPending(false);
        return;
      }
    }
    setPending(false);
    setActionRefused(true);
  }, [installationId, mutateTest, readTestRun, testSurfaceQuery]);
  if (runtime === null) return <AgentOSSolutionModuleState refused={refused} />;
  const activeVersion = activeVersionFor(runtime);
  const selectedSetup = runtime.setupSessions.find(item => item.id === selectedSetupSessionId) ?? runtime.setupSession;
  const draft = contextDraftFor(runtime, selectedSetup, testSurface);
  const exactTestSurface = exactTestSurfaceFor(testSurface, draft);
  const setupMessages: ReadonlyArray<SetupMessage> = selectedSetup === null ? [] : runtime.messages.filter(message => message.sessionId === selectedSetup.id).map(({
    id,
    role,
    content
  }) => ({
    id,
    role,
    content
  }));
  const setupRevisions: ReadonlyArray<SetupRevision> = runtime.setupSessions.filter((item): item is typeof item & {
    setupRevision: number;
    setupStatus: NonNullable<typeof item.setupStatus>;
  } => item.setupRevision !== null && item.setupStatus !== null).map(item => ({
    id: item.id,
    revision: item.setupRevision,
    status: item.setupStatus
  }));
  const setupOpen = runtime.setupSessions.some(item => item.setupStatus === "open" || item.setupStatus === "ready");
  const sessions: ReadonlyArray<ExecuteSession> = runtime.executeSessions.map((item, index) => ({
    id: item.id,
    title: item.id === runtime.installation.primaryOpsSessionId ? "Primary Operations" : executeSessionTitleFor(item.title, index),
    updatedLabel: new Date(item.updatedAt).toLocaleDateString(),
    status: item.isArchived ? "archived" : "active"
  }));
  const selectedSession = runtime.executeSessions.find(item => item.id === selectedSessionId) ?? null;
  const contextById = new Map(runtime.contextVersions.map(context => [context.id, context.version]));
  const widgetByMessage = new Map(runtime.widgets.map(widget => [widget.messageId, widget]));
  const taskById = new Map((runtime.tasks ?? []).map(task => [task.id, task]));
  const executeMessages: ReadonlyArray<ExecuteMessage> = selectedSession === null ? [] : runtime.messages.filter(message => message.sessionId === selectedSession.id).map(message => {
    const widget = widgetByMessage.get(message.id);
    const registration = widget === undefined ? undefined : runtime.installation.runtimeManifest.widgets.find(candidate => candidate.component === widget.rootComponent && candidate.version === widget.rootVersion);
    const contextVersion = message.contextVersionId === null ? undefined : contextById.get(message.contextVersionId);
    const task = message.taskId === null ? undefined : taskById.get(message.taskId);
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      messageTree: message.messageTree,
      contextLabel: contextVersion === undefined ? "No context applied" : `Bound to context v${contextVersion}`,
      widget: widget === undefined ? undefined : {
        id: widget.id,
        node: task === undefined ? widget.tree : {
          ...widget.tree,
          props: {
            ...widget.tree.props,
            expectedVersion: task.expectedVersion
          }
        },
        actions: registration?.actions ?? []
      }
    };
  });
  const settings = runtime.settings ?? {};
  const displayName = stringSetting(settings.displayName, runtime.installation.moduleKey);
  const modelProfile = stringSetting(settings.modelProfile, "nivo-default");
  const requireConfirmation = typeof settings.requireConfirmation === "boolean" ? settings.requireConfirmation : true;
  const hasTelegramCredential = runtime.credentials.some(credential => credential.providerKey === "telegram-bot-token" && credential.status === "configured");
  const channelAccountRef = runtime.installation.channelAccountRef ?? null;
  const canEnableLive = activeVersion !== null && channelAccountRef !== null && hasTelegramCredential;
  const supportInbox = {
    conversations: supportConversations,
    selectedConversationId: effectiveSupportConversationId,
    messages: supportMessages,
    tickets: supportTicketsState,
    facts: supportFacts,
    pending: supportPending,
    refused: supportRefused
  };
  const operationTarget = selectedOperationTarget ?? (runtime.installation.kindKey === "customer-support" ? "customer-chat" : "internal-chat");
  const shell: AgentOSSolutionModulePageViewProps["shell"] = {
    workspaceLabel: `Workspace ${workspaceId.slice(0, 8)}`,
    moduleName: displayName,
    moduleKind: runtime.installation.kindKey,
    lifecycleLabel: runtime.installation.liveEnabled ? "live" : runtime.installation.status,
    contextVersion: activeVersion === null ? "not applied" : `v${activeVersion}`,
    channelLabel: channelLabelFor(channelAccountRef),
    controllerLabel: runtime.diagnostics.controllerHealthy === false || runtime.diagnostics.controllerStatus === "degraded" ? "Controller needs attention" : "Controller healthy",
    activeView: view,
    onBackToModules: () => router.push(`/agentos/workspaces/${workspaceId}/modules`),
    onNavigate: nextView => router.push(`${moduleRoot}/${nextView}`)
  };
  const screen = ((): AgentOSSolutionModuleScreen => {
    let resolvedScreen: AgentOSSolutionModuleScreen;
    if (view === "setup") {
      resolvedScreen = {
        view: "setup",
        contentProps: {
          messages: setupMessages,
          revisions: setupRevisions,
          selectedRevisionId: selectedSetup?.id ?? "",
          canSend: selectedSetup?.setupStatus === "open" || selectedSetup?.setupStatus === "ready",
          canStartRevision: !setupOpen,
          activeVersion,
          draft,
          pending,
          refused,
          compactPane: setupPane,
          onSelectRevision: setSelectedSetupSessionId,
          onStartRevision: startSetupRevision,
          onSend: content => selectedSetup !== null && void sendSetupMessage(selectedSetup.id, content),
          onApply: () => draft !== null && applySetupRevision(draft.setupSessionId),
          onSelectPane: setSetupPane
        }
      };
    } else if (view === "operate") {
      resolvedScreen = {
        view: "operate",
        contentProps: {
          installationId: runtime.installation.id,
          kindKey: runtime.installation.kindKey,
          workbenchKey: runtime.installation.workbenchKey,
          workbenchVersion: runtime.installation.workbenchVersion,
          sessions,
          selectedSessionId,
          selectedSessionTitle: selectedSessionTitleFor(selectedSession, runtime),
          messages: executeMessages,
          tasks: runtime.tasks,
          events: runtime.operationEvents,
          operationTarget,
          supportInbox,
          pending,
          refused,
          onSelectSession: setSelectedSessionId,
          onSelectTarget: setSelectedOperationTarget,
          onCreateSession: () => {
            void createExecuteSession().then(sessionId => {
              if (sessionId !== null) setSelectedSessionId(sessionId);
            });
          },
          onSend: content => selectedSessionId !== null && void sendExecuteMessage(selectedSessionId, content),
          onWidgetAction: (widgetId, actionKey, input, taskExpectedVersion) => {
            invokeWidgetAction(widgetId, actionKey, input, taskExpectedVersion);
            if (actionKey === "open-task") setSelectedOperationTarget("internal-workbench");
          },
          onSelectSupportConversation: setSelectedSupportConversationId,
          onApproveSupportReply: approveSupportReply,
          onSetSupportTakeover: setSupportTakeover,
          onReconcileSupportDelivery: reconcileSupportDelivery
        }
      };
    } else if (view === "test" && testContract === undefined) {
      resolvedScreen = {
        view: "test-unavailable"
      };
    } else if (view === "test" && testContract !== undefined) {
      resolvedScreen = {
        view: "test",
        contentProps: {
          contract: testContract,
          targetReady: draft !== null && draft.digest !== null,
          contextLabel: testContextLabelFor(draft),
          testSurface: exactTestSurface,
          pending,
          selectedScenarioKey: selectedTestScenarioKey,
          compactPane: testPane,
          onSelectScenario: setSelectedTestScenarioKey,
          onSelectPane: setTestPane,
          onRun: (scenarioKey, scenarioInput) => {
            if (draft !== null && draft.digest !== null) {
              void runTest({
                setupSessionId: draft.setupSessionId
              }, scenarioKey, scenarioInput);
            }
          }
        }
      };
    } else if (view === "settings") {
      resolvedScreen = {
        view: "settings",
        contentProps: {
          currentDisplayName: displayName,
          currentModelProfile: modelProfile,
          currentConfirmation: requireConfirmation,
          currentOperatingMode: runtime.installation.operatingMode,
          currentChannelAccountRef: runtime.installation.channelAccountRef ?? "",
          liveEnabled: runtime.installation.liveEnabled,
          canEnableLive,
          credentialSlots: runtime.installation.runtimeManifest.credentialSlots ?? [],
          credentialStatuses: runtime.credentials,
          activeVersion,
          pending,
          refused,
          onSave: saveSettings,
          onSetLiveEnabled: setLiveEnabled,
          onSaveCredential: (key, value) => void saveCredential(key, value),
          onRemoveCredential: removeCredential
        }
      };
    } else {
      resolvedScreen = {
        view: "diagnostics",
        contentProps: {
          installationId: runtime.installation.id,
          kindKey: runtime.installation.kindKey,
          workbenchKey: runtime.installation.workbenchKey,
          diagnostics: runtime.diagnostics,
          events: runtime.operationEvents,
          selectedSignal: diagnosticSignal,
          compactPane: diagnosticsPane,
          onSelectSignal: setDiagnosticSignal,
          onSelectPane: setDiagnosticsPane
        }
      };
    }
    return resolvedScreen;
  })();
  return <AgentOSSolutionModulePageBase shell={shell} screen={screen} />;
};
