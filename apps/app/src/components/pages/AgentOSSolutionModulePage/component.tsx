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
import { AGENTOS_SETUP_SURFACE_CLASS_NAME, CONTEXT_BAND_CLASS_NAME, CONTEXT_RAISED_BAND_CLASS_NAME } from "./classNames";
/** Catalog keys resolved only by the connected owner or a real-provider fixture. */
export type ModulePageMessageKey =
  | "runtime.conversations.synced"
  | "runtime.conversations.syncing"
  | "runtime.conversations.takeover"
  | "runtime.conversations.title"
  | "runtime.conversations.unread"
  | "runtime.credentialStatus.configured"
  | "runtime.credentialStatus.invalid"
  | "runtime.customerChat.ai"
  | "runtime.customerChat.approval"
  | "runtime.customerChat.approvalNotice"
  | "runtime.customerChat.approve"
  | "runtime.customerChat.context"
  | "runtime.customerChat.customer"
  | "runtime.customerChat.empty"
  | "runtime.customerChat.evidence"
  | "runtime.customerChat.historyNotice"
  | "runtime.customerChat.loading"
  | "runtime.customerChat.markFailed"
  | "runtime.customerChat.markSent"
  | "runtime.customerChat.operator"
  | "runtime.customerChat.reconciliation"
  | "runtime.customerChat.reconciliationNotice"
  | "runtime.customerChat.refused"
  | "runtime.customerChat.return"
  | "runtime.customerChat.select"
  | "runtime.customerChat.takeover"
  | "runtime.customerChat.title"
  | "runtime.deliveryStatus.ambiguous"
  | "runtime.deliveryStatus.approval_required"
  | "runtime.deliveryStatus.received"
  | "runtime.diagnostics.accepted"
  | "runtime.diagnostics.ai"
  | "runtime.diagnostics.all"
  | "runtime.diagnostics.boundReplies"
  | "runtime.diagnostics.channel"
  | "runtime.diagnostics.checks"
  | "runtime.diagnostics.compact"
  | "runtime.diagnostics.events"
  | "runtime.diagnostics.filterNotice"
  | "runtime.diagnostics.health"
  | "runtime.diagnostics.healthTab"
  | "runtime.diagnostics.installation"
  | "runtime.diagnostics.kind"
  | "runtime.diagnostics.noEvents"
  | "runtime.diagnostics.safeNotice"
  | "runtime.diagnostics.signals"
  | "runtime.diagnostics.telegramEvents"
  | "runtime.diagnostics.trace"
  | "runtime.diagnostics.traceTab"
  | "runtime.diagnostics.workbench"
  | "runtime.executeChat.acceptTask"
  | "runtime.executeChat.ai"
  | "runtime.executeChat.attachment"
  | "runtime.executeChat.messageLabel"
  | "runtime.executeChat.openWorkbench"
  | "runtime.executeChat.placeholder"
  | "runtime.executeChat.refused"
  | "runtime.executeChat.schema"
  | "runtime.executeChat.send"
  | "runtime.executeChat.system"
  | "runtime.executeChat.title"
  | "runtime.executeChat.typedInput"
  | "runtime.executeChat.widgetRefused"
  | "runtime.executeChat.you"
  | "runtime.fields.amount"
  | "runtime.fields.approvalState"
  | "runtime.fields.citations"
  | "runtime.fields.confidence"
  | "runtime.fields.conflicts"
  | "runtime.fields.currency"
  | "runtime.fields.dateTime"
  | "runtime.fields.options"
  | "runtime.fields.priority"
  | "runtime.fields.sla"
  | "runtime.fields.status"
  | "runtime.fields.summary"
  | "runtime.fields.timeZone"
  | "runtime.fields.title"
  | "runtime.kindTest.accounting"
  | "runtime.kindTest.boundary"
  | "runtime.kindTest.boundaryDetail"
  | "runtime.kindTest.calendar"
  | "runtime.kindTest.citation"
  | "runtime.kindTest.closed"
  | "runtime.kindTest.cockpit"
  | "runtime.kindTest.context"
  | "runtime.kindTest.conversation"
  | "runtime.kindTest.default"
  | "runtime.kindTest.fakeHint"
  | "runtime.kindTest.generic"
  | "runtime.kindTest.local"
  | "runtime.kindTest.noRegistration"
  | "runtime.kindTest.pending"
  | "runtime.kindTest.ready"
  | "runtime.kindTest.refused"
  | "runtime.kindTest.run"
  | "runtime.kindTest.runUnavailable"
  | "runtime.kindTest.safety"
  | "runtime.kindTest.sandbox"
  | "runtime.kindTest.scenario"
  | "runtime.kindTest.state"
  | "runtime.kindTest.unavailable"
  | "runtime.labels.action"
  | "runtime.labels.field"
  | "runtime.labels.policy"
  | "runtime.labels.priority"
  | "runtime.operate.chat"
  | "runtime.operate.customerQueue"
  | "runtime.operate.customers"
  | "runtime.operate.internalChat"
  | "runtime.operate.internalWorkbench"
  | "runtime.operate.view"
  | "runtime.operate.workbench"
  | "runtime.pageTest.closed"
  | "runtime.pageTest.compact"
  | "runtime.pageTest.contractUnavailable"
  | "runtime.pageTest.conversation"
  | "runtime.pageTest.count"
  | "runtime.pageTest.evidence"
  | "runtime.pageTest.noContract"
  | "runtime.pageTest.notRun"
  | "runtime.pageTest.safety"
  | "runtime.pageTest.scenarios"
  | "runtime.pageTest.state"
  | "runtime.pageTest.suite"
  | "runtime.pageTest.summary"
  | "runtime.pageTest.trust"
  | "runtime.pageTest.unavailable"
  | "runtime.pageTest.unavailableView"
  | "runtime.priority.high"
  | "runtime.priority.low"
  | "runtime.priority.normal"
  | "runtime.priority.urgent"
  | "runtime.queue.customerQueue"
  | "runtime.queue.factValue"
  | "runtime.queue.factsCount"
  | "runtime.queue.information"
  | "runtime.queue.itemsCount"
  | "runtime.queue.loadingFacts"
  | "runtime.queue.loadingTasks"
  | "runtime.queue.noFacts"
  | "runtime.queue.noTasks"
  | "runtime.queue.notice"
  | "runtime.queue.tasks"
  | "runtime.queue.tasksCount"
  | "runtime.queue.ticketValue"
  | "runtime.queue.title"
  | "runtime.sessions.archived"
  | "runtime.sessions.collapse"
  | "runtime.sessions.expand"
  | "runtime.sessions.label"
  | "runtime.sessions.new"
  | "runtime.sessions.title"
  | "runtime.settings.activeVersion"
  | "runtime.settings.allowedPolicy"
  | "runtime.settings.assist"
  | "runtime.settings.automaticApply"
  | "runtime.settings.autopilot"
  | "runtime.settings.bindingRetained"
  | "runtime.settings.cacheInvalidation"
  | "runtime.settings.channelHint"
  | "runtime.settings.channelRef"
  | "runtime.settings.confirmation"
  | "runtime.settings.contextRequired"
  | "runtime.settings.credentialHint"
  | "runtime.settings.disableLive"
  | "runtime.settings.displayName"
  | "runtime.settings.enableLive"
  | "runtime.settings.enterCredential"
  | "runtime.settings.executeHistory"
  | "runtime.settings.externalSends"
  | "runtime.settings.hideCredential"
  | "runtime.settings.humanApproval"
  | "runtime.settings.inactive"
  | "runtime.settings.liveEnabled"
  | "runtime.settings.liveReady"
  | "runtime.settings.liveRequires"
  | "runtime.settings.mode"
  | "runtime.settings.modelProfile"
  | "runtime.settings.noCredential"
  | "runtime.settings.promptCache"
  | "runtime.settings.refundLegal"
  | "runtime.settings.refused"
  | "runtime.settings.removeCredential"
  | "runtime.settings.requireConfirmation"
  | "runtime.settings.safeguards"
  | "runtime.settings.save"
  | "runtime.settings.saveCredential"
  | "runtime.settings.showCredential"
  | "runtime.settings.stableKnowledge"
  | "runtime.settings.title"
  | "runtime.testStatus.failed"
  | "runtime.testStatus.passed"
  | "runtime.testStatus.running"
  | "runtime.testStatus.warning"
  | "runtime.trust.collect"
  | "runtime.trust.evidence"
  | "runtime.trust.expected"
  | "runtime.trust.fail"
  | "runtime.trust.noRun"
  | "runtime.trust.notRun"
  | "runtime.trust.notice"
  | "runtime.trust.observed"
  | "runtime.trust.pass"
  | "runtime.trust.rejected"
  | "runtime.trust.result"
  | "runtime.trust.title"
  | "runtime.trust.total"
  | "runtime.trust.verdictFail"
  | "runtime.trust.verdictPass"
  | "runtime.trust.verdictWarning"
  | "runtime.trust.warning"
  | "runtime.widgets.calendarCaption"
  | "runtime.widgets.calendarNotice"
  | "runtime.widgets.calendarTitle"
  | "runtime.widgets.financeCaption"
  | "runtime.widgets.financeNotice"
  | "runtime.widgets.financeTitle"
  | "runtime.widgets.knowledgeCaption"
  | "runtime.widgets.knowledgeNotice"
  | "runtime.widgets.knowledgeTitle"
  | "runtime.widgets.supportCaption"
  | "runtime.widgets.supportNotice"
  | "runtime.widgets.supportTitle"
  | "runtime.workbench.acceptedEvents"
  | "runtime.workbench.accounting"
  | "runtime.workbench.accountingNotice"
  | "runtime.workbench.blocked"
  | "runtime.workbench.calendar"
  | "runtime.workbench.calendarMutation"
  | "runtime.workbench.calendarNotice"
  | "runtime.workbench.channel"
  | "runtime.workbench.citations"
  | "runtime.workbench.clear"
  | "runtime.workbench.confirmation"
  | "runtime.workbench.due"
  | "runtime.workbench.evidencePack"
  | "runtime.workbench.evidenceTasks"
  | "runtime.workbench.execution"
  | "runtime.workbench.generic"
  | "runtime.workbench.genericCaption"
  | "runtime.workbench.genericNotice"
  | "runtime.workbench.groundedAnswer"
  | "runtime.workbench.highUrgent"
  | "runtime.workbench.inbox"
  | "runtime.workbench.kind"
  | "runtime.workbench.knowledgeCaption"
  | "runtime.workbench.module"
  | "runtime.workbench.needsReview"
  | "runtime.workbench.next"
  | "runtime.workbench.noAnswer"
  | "runtime.workbench.noApprovals"
  | "runtime.workbench.noMeeting"
  | "runtime.workbench.notScheduled"
  | "runtime.workbench.open"
  | "runtime.workbench.ownerReview"
  | "runtime.workbench.payableCaption"
  | "runtime.workbench.policy"
  | "runtime.workbench.proposals"
  | "runtime.workbench.qualified"
  | "runtime.workbench.reader"
  | "runtime.workbench.readerNotice"
  | "runtime.workbench.registered"
  | "runtime.workbench.reviewOnly"
  | "runtime.workbench.sales"
  | "runtime.workbench.scheduleCaption"
  | "runtime.workbench.slaCaption"
  | "runtime.workbench.support"
  | "runtime.workbench.supportNotice"
  | "runtime.workbench.title"
  | "runtime.workbench.unavailable"
  | "runtime.workbench.unavailableNotice"
  | "runtime.workbench.waitChannel"
  | "runtime.workbench.waiting"
  | "setup.activeContext"
  | "setup.actor.assistant"
  | "setup.actor.system"
  | "setup.actor.user"
  | "setup.applyHint"
  | "setup.applyVersion"
  | "setup.businessContext"
  | "setup.chat"
  | "setup.complete"
  | "setup.completeAllGates"
  | "setup.completeCount"
  | "setup.completeGates"
  | "setup.contextHint"
  | "setup.contextStartsHere"
  | "setup.contextVersion"
  | "setup.continueChat"
  | "setup.description"
  | "setup.draft"
  | "setup.draftRevision"
  | "setup.emptyDescription"
  | "setup.emptyTitle"
  | "setup.exactTest"
  | "setup.fallbackSummary"
  | "setup.fromConversation"
  | "setup.gateLabels.accountingScope"
  | "setup.gateLabels.approvalPolicy"
  | "setup.gateLabels.approvalThresholds"
  | "setup.gateLabels.automationPolicy"
  | "setup.gateLabels.availabilityRules"
  | "setup.gateLabels.businessIdentity"
  | "setup.gateLabels.calendarSources"
  | "setup.gateLabels.channels"
  | "setup.gateLabels.citationPolicy"
  | "setup.gateLabels.confidencePolicy"
  | "setup.gateLabels.confirmationPolicy"
  | "setup.gateLabels.conflictPolicy"
  | "setup.gateLabels.currencyAndLocale"
  | "setup.gateLabels.customerSegments"
  | "setup.gateLabels.escalationAndHandoff"
  | "setup.gateLabels.evidenceRequirements"
  | "setup.gateLabels.freshnessPolicy"
  | "setup.gateLabels.hoursAndSla"
  | "setup.gateLabels.participantRules"
  | "setup.gateLabels.privacyAndSensitiveData"
  | "setup.gateLabels.productsServices"
  | "setup.gateLabels.prohibitedActions"
  | "setup.gateLabels.prohibitedClaims"
  | "setup.gateLabels.prohibitedCommitments"
  | "setup.gateLabels.readinessOwnership"
  | "setup.gateLabels.reminderPolicy"
  | "setup.gateLabels.researchScope"
  | "setup.gateLabels.schedulingScope"
  | "setup.gateLabels.sourcePolicy"
  | "setup.gateLabels.sourceSystems"
  | "setup.gateLabels.supportScope"
  | "setup.gateLabels.timeZone"
  | "setup.gateLabels.toneAndLanguage"
  | "setup.gates"
  | "setup.gatesReview"
  | "setup.historyUnchanged"
  | "setup.messageHint"
  | "setup.messageLabel"
  | "setup.messagePlaceholder"
  | "setup.messageRefused"
  | "setup.messageUnconfirmed"
  | "setup.messages"
  | "setup.needsFollowUp"
  | "setup.newChat"
  | "setup.noCandidate"
  | "setup.noDraft"
  | "setup.noGates"
  | "setup.notApplied"
  | "setup.openChat"
  | "setup.openVersions"
  | "setup.operationRefused"
  | "setup.passTestFirst"
  | "setup.private"
  | "setup.privateChat"
  | "setup.reviewBeforeTest"
  | "setup.reviewContext"
  | "setup.reviewGates"
  | "setup.reviewSummary"
  | "setup.revision"
  | "setup.revisionComplete"
  | "setup.revisionHistoryHint"
  | "setup.revisionOnly"
  | "setup.revisionStatus.completed"
  | "setup.revisionStatus.open"
  | "setup.revisionStatus.ready"
  | "setup.revisionStatus.superseded"
  | "setup.revisionStatus.unavailable"
  | "setup.revisions"
  | "setup.revisionsHint"
  | "setup.selectedRevision"
  | "setup.selectedStatus"
  | "setup.send"
  | "setup.setupGates"
  | "setup.startRefused"
  | "setup.testContext"
  | "setup.testPassed"
  | "setup.testRequired"
  | "setup.testableDraftRequired"
  | "setup.title"
  | "setup.totalRevisions"
  | "setup.unknownGate"
  | "setup.versionActive"
  | "setup.versions"
  | "setup.views"
  | "setup.waitingForOwner"
  | "shell.activeContext"
  | "shell.boundContext"
  | "shell.channelConnected"
  | "shell.channelDisconnected"
  | "shell.controllerAttention"
  | "shell.controllerHealthy"
  | "shell.conversation"
  | "shell.diagnostics"
  | "shell.genericAgent"
  | "shell.kind.accounting"
  | "shell.kind.customer-support"
  | "shell.kind.generic-agent"
  | "shell.kind.research"
  | "shell.kind.scheduling"
  | "shell.live"
  | "shell.loading"
  | "shell.modules"
  | "shell.noContextApplied"
  | "shell.noExecuteSession"
  | "shell.operate"
  | "shell.path"
  | "shell.primaryOperations"
  | "shell.reading"
  | "shell.refused"
  | "shell.sections"
  | "shell.settings"
  | "shell.setup"
  | "shell.telegramConnected"
  | "shell.test"
  | "shell.unavailable"
  | "shell.unknownKind"
  | "shell.unknownStatus"
  | "shell.workspace"
  | "studioPage.title";

/** Existing next-intl namespace translator; never passed into a drawing component. */
export type ModulePageTranslator = (key: ModulePageMessageKey, values?: Readonly<Record<string, string | number>>) => string;

type RuntimeConversationsUnreadValues = { readonly count: number };
type RuntimeCustomerChatContextValues = { readonly digest: string };
type RuntimeDiagnosticsAcceptedValues = { readonly count: number };
type RuntimeDiagnosticsBoundRepliesValues = { readonly count: number };
type RuntimeDiagnosticsChecksValues = { readonly count: number };
type RuntimeDiagnosticsEventsValues = { readonly count: number };
type RuntimeDiagnosticsTelegramEventsValues = { readonly count: number };
type RuntimeExecuteChatAttachmentValues = { readonly label: string; readonly mediaType: string };
type RuntimeExecuteChatSchemaValues = { readonly version: string };
type RuntimeKindTestBoundaryDetailValues = { readonly scenario: string; readonly context: string; readonly count: number; readonly picker: string; readonly commands: string };
type RuntimeKindTestRunValues = { readonly scenario: string };
type RuntimeLabelsActionValues = { readonly key: string };
type RuntimeLabelsFieldValues = { readonly key: string };
type RuntimeLabelsPolicyValues = { readonly policy: string };
type RuntimeLabelsPriorityValues = { readonly priority: string };
type RuntimePageTestCountValues = { readonly count: number };
type RuntimeQueueFactValueValues = { readonly value: string; readonly confidence: string; readonly source: string };
type RuntimeQueueFactsCountValues = { readonly count: number };
type RuntimeQueueItemsCountValues = { readonly count: number };
type RuntimeQueueTasksCountValues = { readonly count: number };
type RuntimeQueueTicketValueValues = { readonly summary: string; readonly count: number; readonly state: string };
type RuntimeSettingsActiveVersionValues = { readonly version: number };
type RuntimeSettingsAllowedPolicyValues = { readonly mode: string };
type RuntimeSettingsCredentialHintValues = { readonly provider: string };
type RuntimeSettingsHideCredentialValues = { readonly label: string };
type RuntimeSettingsRemoveCredentialValues = { readonly label: string };
type RuntimeSettingsSaveCredentialValues = { readonly label: string };
type RuntimeSettingsShowCredentialValues = { readonly label: string };
type RuntimeSettingsStableKnowledgeValues = { readonly version: number };
type RuntimeTrustResultValues = { readonly status: string };
type RuntimeWorkbenchGenericCaptionValues = { readonly version: string };
type RuntimeWorkbenchKnowledgeCaptionValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchPayableCaptionValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchRegisteredValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchScheduleCaptionValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchSlaCaptionValues = { readonly kind: string; readonly version: string };
type SetupActiveContextValues = { readonly version: string };
type SetupApplyVersionValues = { readonly version: number };
type SetupCompleteAllGatesValues = { readonly count: number };
type SetupCompleteCountValues = { readonly passed: number; readonly total: number };
type SetupContextVersionValues = { readonly version: number };
type SetupDraftRevisionValues = { readonly revision: number };
type SetupFallbackSummaryValues = { readonly revision: number };
type SetupReviewSummaryValues = { readonly draft: string; readonly version: string };
type SetupRevisionValues = { readonly revision: number | "?"; readonly status: string };
type SetupRevisionOnlyValues = { readonly revision: number };
type SetupSelectedRevisionValues = { readonly revision: string };
type SetupSelectedStatusValues = { readonly status: string };
type SetupTestContextValues = { readonly revision: number; readonly version: string; readonly digest: string };
type SetupTotalRevisionsValues = { readonly count: number };
type SetupUnknownGateValues = { readonly key: string };
type SetupVersionActiveValues = { readonly version: string | number };
type ShellActiveContextValues = { readonly version: string; readonly channel: string; readonly controller: string };
type ShellBoundContextValues = { readonly version: number };
type ShellConversationValues = { readonly number: number };
type ShellUnknownKindValues = { readonly kind: string };
type ShellUnknownStatusValues = { readonly status: string };
type ShellWorkspaceValues = { readonly id: string };

/** Resolve labels and formatters at the existing connected owner boundary. */
export const buildModulePageCopy = (t: ModulePageTranslator) => ({
  "conversations": {
    "synced": t("runtime.conversations.synced"),
    "syncing": t("runtime.conversations.syncing"),
    "takeover": t("runtime.conversations.takeover"),
    "title": t("runtime.conversations.title"),
    "unread": (values: RuntimeConversationsUnreadValues) => t("runtime.conversations.unread", values),
  },
  "credentialStatus": {
    "configured": t("runtime.credentialStatus.configured"),
    "invalid": t("runtime.credentialStatus.invalid"),
  },
  "customerChat": {
    "ai": t("runtime.customerChat.ai"),
    "approval": t("runtime.customerChat.approval"),
    "approvalNotice": t("runtime.customerChat.approvalNotice"),
    "approve": t("runtime.customerChat.approve"),
    "context": (values: RuntimeCustomerChatContextValues) => t("runtime.customerChat.context", values),
    "customer": t("runtime.customerChat.customer"),
    "empty": t("runtime.customerChat.empty"),
    "evidence": t("runtime.customerChat.evidence"),
    "historyNotice": t("runtime.customerChat.historyNotice"),
    "loading": t("runtime.customerChat.loading"),
    "markFailed": t("runtime.customerChat.markFailed"),
    "markSent": t("runtime.customerChat.markSent"),
    "operator": t("runtime.customerChat.operator"),
    "reconciliation": t("runtime.customerChat.reconciliation"),
    "reconciliationNotice": t("runtime.customerChat.reconciliationNotice"),
    "refused": t("runtime.customerChat.refused"),
    "return": t("runtime.customerChat.return"),
    "select": t("runtime.customerChat.select"),
    "takeover": t("runtime.customerChat.takeover"),
    "title": t("runtime.customerChat.title"),
  },
  "deliveryStatus": {
    "ambiguous": t("runtime.deliveryStatus.ambiguous"),
    "approval_required": t("runtime.deliveryStatus.approval_required"),
    "received": t("runtime.deliveryStatus.received"),
  },
  "diagnostics": {
    "accepted": (values: RuntimeDiagnosticsAcceptedValues) => t("runtime.diagnostics.accepted", values),
    "ai": t("runtime.diagnostics.ai"),
    "all": t("runtime.diagnostics.all"),
    "boundReplies": (values: RuntimeDiagnosticsBoundRepliesValues) => t("runtime.diagnostics.boundReplies", values),
    "channel": t("runtime.diagnostics.channel"),
    "checks": (values: RuntimeDiagnosticsChecksValues) => t("runtime.diagnostics.checks", values),
    "compact": t("runtime.diagnostics.compact"),
    "events": (values: RuntimeDiagnosticsEventsValues) => t("runtime.diagnostics.events", values),
    "filterNotice": t("runtime.diagnostics.filterNotice"),
    "health": t("runtime.diagnostics.health"),
    "healthTab": t("runtime.diagnostics.healthTab"),
    "installation": t("runtime.diagnostics.installation"),
    "kind": t("runtime.diagnostics.kind"),
    "noEvents": t("runtime.diagnostics.noEvents"),
    "safeNotice": t("runtime.diagnostics.safeNotice"),
    "signals": t("runtime.diagnostics.signals"),
    "telegramEvents": (values: RuntimeDiagnosticsTelegramEventsValues) => t("runtime.diagnostics.telegramEvents", values),
    "trace": t("runtime.diagnostics.trace"),
    "traceTab": t("runtime.diagnostics.traceTab"),
    "workbench": t("runtime.diagnostics.workbench"),
  },
  "executeChat": {
    "acceptTask": t("runtime.executeChat.acceptTask"),
    "ai": t("runtime.executeChat.ai"),
    "attachment": (values: RuntimeExecuteChatAttachmentValues) => t("runtime.executeChat.attachment", values),
    "messageLabel": t("runtime.executeChat.messageLabel"),
    "openWorkbench": t("runtime.executeChat.openWorkbench"),
    "placeholder": t("runtime.executeChat.placeholder"),
    "refused": t("runtime.executeChat.refused"),
    "schema": (values: RuntimeExecuteChatSchemaValues) => t("runtime.executeChat.schema", values),
    "send": t("runtime.executeChat.send"),
    "system": t("runtime.executeChat.system"),
    "title": t("runtime.executeChat.title"),
    "typedInput": t("runtime.executeChat.typedInput"),
    "widgetRefused": t("runtime.executeChat.widgetRefused"),
    "you": t("runtime.executeChat.you"),
  },
  "fields": {
    "amount": t("runtime.fields.amount"),
    "approvalState": t("runtime.fields.approvalState"),
    "citations": t("runtime.fields.citations"),
    "confidence": t("runtime.fields.confidence"),
    "conflicts": t("runtime.fields.conflicts"),
    "currency": t("runtime.fields.currency"),
    "dateTime": t("runtime.fields.dateTime"),
    "options": t("runtime.fields.options"),
    "priority": t("runtime.fields.priority"),
    "sla": t("runtime.fields.sla"),
    "status": t("runtime.fields.status"),
    "summary": t("runtime.fields.summary"),
    "timeZone": t("runtime.fields.timeZone"),
    "title": t("runtime.fields.title"),
  },
  "kindTest": {
    "accounting": t("runtime.kindTest.accounting"),
    "boundary": t("runtime.kindTest.boundary"),
    "boundaryDetail": (values: RuntimeKindTestBoundaryDetailValues) => t("runtime.kindTest.boundaryDetail", values),
    "calendar": t("runtime.kindTest.calendar"),
    "citation": t("runtime.kindTest.citation"),
    "closed": t("runtime.kindTest.closed"),
    "cockpit": t("runtime.kindTest.cockpit"),
    "context": t("runtime.kindTest.context"),
    "conversation": t("runtime.kindTest.conversation"),
    "default": t("runtime.kindTest.default"),
    "fakeHint": t("runtime.kindTest.fakeHint"),
    "generic": t("runtime.kindTest.generic"),
    "local": t("runtime.kindTest.local"),
    "noRegistration": t("runtime.kindTest.noRegistration"),
    "pending": t("runtime.kindTest.pending"),
    "ready": t("runtime.kindTest.ready"),
    "refused": t("runtime.kindTest.refused"),
    "run": (values: RuntimeKindTestRunValues) => t("runtime.kindTest.run", values),
    "runUnavailable": t("runtime.kindTest.runUnavailable"),
    "safety": t("runtime.kindTest.safety"),
    "sandbox": t("runtime.kindTest.sandbox"),
    "scenario": t("runtime.kindTest.scenario"),
    "state": t("runtime.kindTest.state"),
    "unavailable": t("runtime.kindTest.unavailable"),
  },
  "labels": {
    "action": (values: RuntimeLabelsActionValues) => t("runtime.labels.action", values),
    "field": (values: RuntimeLabelsFieldValues) => t("runtime.labels.field", values),
    "policy": (values: RuntimeLabelsPolicyValues) => t("runtime.labels.policy", values),
    "priority": (values: RuntimeLabelsPriorityValues) => t("runtime.labels.priority", values),
  },
  "operate": {
    "chat": t("runtime.operate.chat"),
    "customerQueue": t("runtime.operate.customerQueue"),
    "customers": t("runtime.operate.customers"),
    "internalChat": t("runtime.operate.internalChat"),
    "internalWorkbench": t("runtime.operate.internalWorkbench"),
    "view": t("runtime.operate.view"),
    "workbench": t("runtime.operate.workbench"),
  },
  "pageTest": {
    "closed": t("runtime.pageTest.closed"),
    "compact": t("runtime.pageTest.compact"),
    "contractUnavailable": t("runtime.pageTest.contractUnavailable"),
    "conversation": t("runtime.pageTest.conversation"),
    "count": (values: RuntimePageTestCountValues) => t("runtime.pageTest.count", values),
    "evidence": t("runtime.pageTest.evidence"),
    "noContract": t("runtime.pageTest.noContract"),
    "notRun": t("runtime.pageTest.notRun"),
    "safety": t("runtime.pageTest.safety"),
    "scenarios": t("runtime.pageTest.scenarios"),
    "state": t("runtime.pageTest.state"),
    "suite": t("runtime.pageTest.suite"),
    "summary": t("runtime.pageTest.summary"),
    "trust": t("runtime.pageTest.trust"),
    "unavailable": t("runtime.pageTest.unavailable"),
    "unavailableView": t("runtime.pageTest.unavailableView"),
  },
  "priority": {
    "high": t("runtime.priority.high"),
    "low": t("runtime.priority.low"),
    "normal": t("runtime.priority.normal"),
    "urgent": t("runtime.priority.urgent"),
  },
  "queue": {
    "customerQueue": t("runtime.queue.customerQueue"),
    "factValue": (values: RuntimeQueueFactValueValues) => t("runtime.queue.factValue", values),
    "factsCount": (values: RuntimeQueueFactsCountValues) => t("runtime.queue.factsCount", values),
    "information": t("runtime.queue.information"),
    "itemsCount": (values: RuntimeQueueItemsCountValues) => t("runtime.queue.itemsCount", values),
    "loadingFacts": t("runtime.queue.loadingFacts"),
    "loadingTasks": t("runtime.queue.loadingTasks"),
    "noFacts": t("runtime.queue.noFacts"),
    "noTasks": t("runtime.queue.noTasks"),
    "notice": t("runtime.queue.notice"),
    "tasks": t("runtime.queue.tasks"),
    "tasksCount": (values: RuntimeQueueTasksCountValues) => t("runtime.queue.tasksCount", values),
    "ticketValue": (values: RuntimeQueueTicketValueValues) => t("runtime.queue.ticketValue", values),
    "title": t("runtime.queue.title"),
  },
  "sessions": {
    "archived": t("runtime.sessions.archived"),
    "collapse": t("runtime.sessions.collapse"),
    "expand": t("runtime.sessions.expand"),
    "label": t("runtime.sessions.label"),
    "new": t("runtime.sessions.new"),
    "title": t("runtime.sessions.title"),
  },
  "settings": {
    "activeVersion": (values: RuntimeSettingsActiveVersionValues) => t("runtime.settings.activeVersion", values),
    "allowedPolicy": (values: RuntimeSettingsAllowedPolicyValues) => t("runtime.settings.allowedPolicy", values),
    "assist": t("runtime.settings.assist"),
    "automaticApply": t("runtime.settings.automaticApply"),
    "autopilot": t("runtime.settings.autopilot"),
    "bindingRetained": t("runtime.settings.bindingRetained"),
    "cacheInvalidation": t("runtime.settings.cacheInvalidation"),
    "channelHint": t("runtime.settings.channelHint"),
    "channelRef": t("runtime.settings.channelRef"),
    "confirmation": t("runtime.settings.confirmation"),
    "contextRequired": t("runtime.settings.contextRequired"),
    "credentialHint": (values: RuntimeSettingsCredentialHintValues) => t("runtime.settings.credentialHint", values),
    "disableLive": t("runtime.settings.disableLive"),
    "displayName": t("runtime.settings.displayName"),
    "enableLive": t("runtime.settings.enableLive"),
    "enterCredential": t("runtime.settings.enterCredential"),
    "executeHistory": t("runtime.settings.executeHistory"),
    "externalSends": t("runtime.settings.externalSends"),
    "hideCredential": (values: RuntimeSettingsHideCredentialValues) => t("runtime.settings.hideCredential", values),
    "humanApproval": t("runtime.settings.humanApproval"),
    "inactive": t("runtime.settings.inactive"),
    "liveEnabled": t("runtime.settings.liveEnabled"),
    "liveReady": t("runtime.settings.liveReady"),
    "liveRequires": t("runtime.settings.liveRequires"),
    "mode": t("runtime.settings.mode"),
    "modelProfile": t("runtime.settings.modelProfile"),
    "noCredential": t("runtime.settings.noCredential"),
    "promptCache": t("runtime.settings.promptCache"),
    "refundLegal": t("runtime.settings.refundLegal"),
    "refused": t("runtime.settings.refused"),
    "removeCredential": (values: RuntimeSettingsRemoveCredentialValues) => t("runtime.settings.removeCredential", values),
    "requireConfirmation": t("runtime.settings.requireConfirmation"),
    "safeguards": t("runtime.settings.safeguards"),
    "save": t("runtime.settings.save"),
    "saveCredential": (values: RuntimeSettingsSaveCredentialValues) => t("runtime.settings.saveCredential", values),
    "showCredential": (values: RuntimeSettingsShowCredentialValues) => t("runtime.settings.showCredential", values),
    "stableKnowledge": (values: RuntimeSettingsStableKnowledgeValues) => t("runtime.settings.stableKnowledge", values),
    "title": t("runtime.settings.title"),
  },
  "testStatus": {
    "failed": t("runtime.testStatus.failed"),
    "passed": t("runtime.testStatus.passed"),
    "running": t("runtime.testStatus.running"),
    "warning": t("runtime.testStatus.warning"),
  },
  "trust": {
    "collect": t("runtime.trust.collect"),
    "evidence": t("runtime.trust.evidence"),
    "expected": t("runtime.trust.expected"),
    "fail": t("runtime.trust.fail"),
    "noRun": t("runtime.trust.noRun"),
    "notRun": t("runtime.trust.notRun"),
    "notice": t("runtime.trust.notice"),
    "observed": t("runtime.trust.observed"),
    "pass": t("runtime.trust.pass"),
    "rejected": t("runtime.trust.rejected"),
    "result": (values: RuntimeTrustResultValues) => t("runtime.trust.result", values),
    "title": t("runtime.trust.title"),
    "total": t("runtime.trust.total"),
    "verdictFail": t("runtime.trust.verdictFail"),
    "verdictPass": t("runtime.trust.verdictPass"),
    "verdictWarning": t("runtime.trust.verdictWarning"),
    "warning": t("runtime.trust.warning"),
  },
  "widgets": {
    "calendarCaption": t("runtime.widgets.calendarCaption"),
    "calendarNotice": t("runtime.widgets.calendarNotice"),
    "calendarTitle": t("runtime.widgets.calendarTitle"),
    "financeCaption": t("runtime.widgets.financeCaption"),
    "financeNotice": t("runtime.widgets.financeNotice"),
    "financeTitle": t("runtime.widgets.financeTitle"),
    "knowledgeCaption": t("runtime.widgets.knowledgeCaption"),
    "knowledgeNotice": t("runtime.widgets.knowledgeNotice"),
    "knowledgeTitle": t("runtime.widgets.knowledgeTitle"),
    "supportCaption": t("runtime.widgets.supportCaption"),
    "supportNotice": t("runtime.widgets.supportNotice"),
    "supportTitle": t("runtime.widgets.supportTitle"),
  },
  "workbench": {
    "acceptedEvents": t("runtime.workbench.acceptedEvents"),
    "accounting": t("runtime.workbench.accounting"),
    "accountingNotice": t("runtime.workbench.accountingNotice"),
    "blocked": t("runtime.workbench.blocked"),
    "calendar": t("runtime.workbench.calendar"),
    "calendarMutation": t("runtime.workbench.calendarMutation"),
    "calendarNotice": t("runtime.workbench.calendarNotice"),
    "channel": t("runtime.workbench.channel"),
    "citations": t("runtime.workbench.citations"),
    "clear": t("runtime.workbench.clear"),
    "confirmation": t("runtime.workbench.confirmation"),
    "due": t("runtime.workbench.due"),
    "evidencePack": t("runtime.workbench.evidencePack"),
    "evidenceTasks": t("runtime.workbench.evidenceTasks"),
    "execution": t("runtime.workbench.execution"),
    "generic": t("runtime.workbench.generic"),
    "genericCaption": (values: RuntimeWorkbenchGenericCaptionValues) => t("runtime.workbench.genericCaption", values),
    "genericNotice": t("runtime.workbench.genericNotice"),
    "groundedAnswer": t("runtime.workbench.groundedAnswer"),
    "highUrgent": t("runtime.workbench.highUrgent"),
    "inbox": t("runtime.workbench.inbox"),
    "kind": t("runtime.workbench.kind"),
    "knowledgeCaption": (values: RuntimeWorkbenchKnowledgeCaptionValues) => t("runtime.workbench.knowledgeCaption", values),
    "module": t("runtime.workbench.module"),
    "needsReview": t("runtime.workbench.needsReview"),
    "next": t("runtime.workbench.next"),
    "noAnswer": t("runtime.workbench.noAnswer"),
    "noApprovals": t("runtime.workbench.noApprovals"),
    "noMeeting": t("runtime.workbench.noMeeting"),
    "notScheduled": t("runtime.workbench.notScheduled"),
    "open": t("runtime.workbench.open"),
    "ownerReview": t("runtime.workbench.ownerReview"),
    "payableCaption": (values: RuntimeWorkbenchPayableCaptionValues) => t("runtime.workbench.payableCaption", values),
    "policy": t("runtime.workbench.policy"),
    "proposals": t("runtime.workbench.proposals"),
    "qualified": t("runtime.workbench.qualified"),
    "reader": t("runtime.workbench.reader"),
    "readerNotice": t("runtime.workbench.readerNotice"),
    "registered": (values: RuntimeWorkbenchRegisteredValues) => t("runtime.workbench.registered", values),
    "reviewOnly": t("runtime.workbench.reviewOnly"),
    "sales": t("runtime.workbench.sales"),
    "scheduleCaption": (values: RuntimeWorkbenchScheduleCaptionValues) => t("runtime.workbench.scheduleCaption", values),
    "slaCaption": (values: RuntimeWorkbenchSlaCaptionValues) => t("runtime.workbench.slaCaption", values),
    "support": t("runtime.workbench.support"),
    "supportNotice": t("runtime.workbench.supportNotice"),
    "title": t("runtime.workbench.title"),
    "unavailable": t("runtime.workbench.unavailable"),
    "unavailableNotice": t("runtime.workbench.unavailableNotice"),
    "waitChannel": t("runtime.workbench.waitChannel"),
    "waiting": t("runtime.workbench.waiting"),
  },
  "setup": {
    "activeContext": (values: SetupActiveContextValues) => t("setup.activeContext", values),
    "actor": {
      "assistant": t("setup.actor.assistant"),
      "system": t("setup.actor.system"),
      "user": t("setup.actor.user"),
    },
    "applyHint": t("setup.applyHint"),
    "applyVersion": (values: SetupApplyVersionValues) => t("setup.applyVersion", values),
    "businessContext": t("setup.businessContext"),
    "chat": t("setup.chat"),
    "complete": t("setup.complete"),
    "completeAllGates": (values: SetupCompleteAllGatesValues) => t("setup.completeAllGates", values),
    "completeCount": (values: SetupCompleteCountValues) => t("setup.completeCount", values),
    "completeGates": t("setup.completeGates"),
    "contextHint": t("setup.contextHint"),
    "contextStartsHere": t("setup.contextStartsHere"),
    "contextVersion": (values: SetupContextVersionValues) => t("setup.contextVersion", values),
    "continueChat": t("setup.continueChat"),
    "description": t("setup.description"),
    "draft": t("setup.draft"),
    "draftRevision": (values: SetupDraftRevisionValues) => t("setup.draftRevision", values),
    "emptyDescription": t("setup.emptyDescription"),
    "emptyTitle": t("setup.emptyTitle"),
    "exactTest": t("setup.exactTest"),
    "fallbackSummary": (values: SetupFallbackSummaryValues) => t("setup.fallbackSummary", values),
    "fromConversation": t("setup.fromConversation"),
    "gateLabels": {
      "accountingScope": t("setup.gateLabels.accountingScope"),
      "approvalPolicy": t("setup.gateLabels.approvalPolicy"),
      "approvalThresholds": t("setup.gateLabels.approvalThresholds"),
      "automationPolicy": t("setup.gateLabels.automationPolicy"),
      "availabilityRules": t("setup.gateLabels.availabilityRules"),
      "businessIdentity": t("setup.gateLabels.businessIdentity"),
      "calendarSources": t("setup.gateLabels.calendarSources"),
      "channels": t("setup.gateLabels.channels"),
      "citationPolicy": t("setup.gateLabels.citationPolicy"),
      "confidencePolicy": t("setup.gateLabels.confidencePolicy"),
      "confirmationPolicy": t("setup.gateLabels.confirmationPolicy"),
      "conflictPolicy": t("setup.gateLabels.conflictPolicy"),
      "currencyAndLocale": t("setup.gateLabels.currencyAndLocale"),
      "customerSegments": t("setup.gateLabels.customerSegments"),
      "escalationAndHandoff": t("setup.gateLabels.escalationAndHandoff"),
      "evidenceRequirements": t("setup.gateLabels.evidenceRequirements"),
      "freshnessPolicy": t("setup.gateLabels.freshnessPolicy"),
      "hoursAndSla": t("setup.gateLabels.hoursAndSla"),
      "participantRules": t("setup.gateLabels.participantRules"),
      "privacyAndSensitiveData": t("setup.gateLabels.privacyAndSensitiveData"),
      "productsServices": t("setup.gateLabels.productsServices"),
      "prohibitedActions": t("setup.gateLabels.prohibitedActions"),
      "prohibitedClaims": t("setup.gateLabels.prohibitedClaims"),
      "prohibitedCommitments": t("setup.gateLabels.prohibitedCommitments"),
      "readinessOwnership": t("setup.gateLabels.readinessOwnership"),
      "reminderPolicy": t("setup.gateLabels.reminderPolicy"),
      "researchScope": t("setup.gateLabels.researchScope"),
      "schedulingScope": t("setup.gateLabels.schedulingScope"),
      "sourcePolicy": t("setup.gateLabels.sourcePolicy"),
      "sourceSystems": t("setup.gateLabels.sourceSystems"),
      "supportScope": t("setup.gateLabels.supportScope"),
      "timeZone": t("setup.gateLabels.timeZone"),
      "toneAndLanguage": t("setup.gateLabels.toneAndLanguage"),
    },
    "gates": t("setup.gates"),
    "gatesReview": t("setup.gatesReview"),
    "historyUnchanged": t("setup.historyUnchanged"),
    "messageHint": t("setup.messageHint"),
    "messageLabel": t("setup.messageLabel"),
    "messagePlaceholder": t("setup.messagePlaceholder"),
    "messageRefused": t("setup.messageRefused"),
    "messageUnconfirmed": t("setup.messageUnconfirmed"),
    "messages": t("setup.messages"),
    "needsFollowUp": t("setup.needsFollowUp"),
    "newChat": t("setup.newChat"),
    "noCandidate": t("setup.noCandidate"),
    "noDraft": t("setup.noDraft"),
    "noGates": t("setup.noGates"),
    "notApplied": t("setup.notApplied"),
    "openChat": t("setup.openChat"),
    "openVersions": t("setup.openVersions"),
    "operationRefused": t("setup.operationRefused"),
    "passTestFirst": t("setup.passTestFirst"),
    "private": t("setup.private"),
    "privateChat": t("setup.privateChat"),
    "reviewBeforeTest": t("setup.reviewBeforeTest"),
    "reviewContext": t("setup.reviewContext"),
    "reviewGates": t("setup.reviewGates"),
    "reviewSummary": (values: SetupReviewSummaryValues) => t("setup.reviewSummary", values),
    "revision": (values: SetupRevisionValues) => t("setup.revision", values),
    "revisionComplete": t("setup.revisionComplete"),
    "revisionHistoryHint": t("setup.revisionHistoryHint"),
    "revisionOnly": (values: SetupRevisionOnlyValues) => t("setup.revisionOnly", values),
    "revisionStatus": {
      "completed": t("setup.revisionStatus.completed"),
      "open": t("setup.revisionStatus.open"),
      "ready": t("setup.revisionStatus.ready"),
      "superseded": t("setup.revisionStatus.superseded"),
      "unavailable": t("setup.revisionStatus.unavailable"),
    },
    "revisions": t("setup.revisions"),
    "revisionsHint": t("setup.revisionsHint"),
    "selectedRevision": (values: SetupSelectedRevisionValues) => t("setup.selectedRevision", values),
    "selectedStatus": (values: SetupSelectedStatusValues) => t("setup.selectedStatus", values),
    "send": t("setup.send"),
    "setupGates": t("setup.setupGates"),
    "startRefused": t("setup.startRefused"),
    "testContext": (values: SetupTestContextValues) => t("setup.testContext", values),
    "testPassed": t("setup.testPassed"),
    "testRequired": t("setup.testRequired"),
    "testableDraftRequired": t("setup.testableDraftRequired"),
    "title": t("setup.title"),
    "totalRevisions": (values: SetupTotalRevisionsValues) => t("setup.totalRevisions", values),
    "unknownGate": (values: SetupUnknownGateValues) => t("setup.unknownGate", values),
    "versionActive": (values: SetupVersionActiveValues) => t("setup.versionActive", values),
    "versions": t("setup.versions"),
    "views": t("setup.views"),
    "waitingForOwner": t("setup.waitingForOwner"),
  },
  "shell": {
    "activeContext": (values: ShellActiveContextValues) => t("shell.activeContext", values),
    "boundContext": (values: ShellBoundContextValues) => t("shell.boundContext", values),
    "channelConnected": t("shell.channelConnected"),
    "channelDisconnected": t("shell.channelDisconnected"),
    "controllerAttention": t("shell.controllerAttention"),
    "controllerHealthy": t("shell.controllerHealthy"),
    "conversation": (values: ShellConversationValues) => t("shell.conversation", values),
    "diagnostics": t("shell.diagnostics"),
    "genericAgent": t("shell.genericAgent"),
    "kind": {
      "accounting": t("shell.kind.accounting"),
      "customer-support": t("shell.kind.customer-support"),
      "generic-agent": t("shell.kind.generic-agent"),
      "research": t("shell.kind.research"),
      "scheduling": t("shell.kind.scheduling"),
    },
    "live": t("shell.live"),
    "loading": t("shell.loading"),
    "modules": t("shell.modules"),
    "noContextApplied": t("shell.noContextApplied"),
    "noExecuteSession": t("shell.noExecuteSession"),
    "operate": t("shell.operate"),
    "path": t("shell.path"),
    "primaryOperations": t("shell.primaryOperations"),
    "reading": t("shell.reading"),
    "refused": t("shell.refused"),
    "sections": t("shell.sections"),
    "settings": t("shell.settings"),
    "setup": t("shell.setup"),
    "telegramConnected": t("shell.telegramConnected"),
    "test": t("shell.test"),
    "unavailable": t("shell.unavailable"),
    "unknownKind": (values: ShellUnknownKindValues) => t("shell.unknownKind", values),
    "unknownStatus": (values: ShellUnknownStatusValues) => t("shell.unknownStatus", values),
    "workspace": (values: ShellWorkspaceValues) => t("shell.workspace", values),
  },
  "studioPage": {
    "title": t("studioPage.title"),
  },
});

/** Complete settled display copy carried through the page drawing tree. */
export type ModulePageCopy = ReturnType<typeof buildModulePageCopy>;

/** Add this to the page Base and State contracts, not to their domain-only screen union. */
export type ModulePageCopyProps = { readonly copy: ModulePageCopy };

/** Internal body props; preserve the original exported domain types used by owner projections. */
export type WithModulePageCopy<Props extends object> = Props & ModulePageCopyProps;


/** Display an exact typed test status without changing its semantic identity. */
const testRunStatusLabel = (status: keyof ModulePageCopy["testStatus"] | undefined, copy: ModulePageCopy): string => status === undefined ? copy.pageTest.notRun : copy.testStatus[status];

/** Format credential status while preserving unknown server identifiers. */
const credentialStatusLabel = (status: string, copy: ModulePageCopy): string => status === "configured" || status === "invalid" ? copy.credentialStatus[status] : copy.shell.unknownStatus({ status });

/** Shell and screen contract resolved by the connected module route. */
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
const setupVersionsPane = (props: WithModulePageCopy<SetupSurfaceProps>) => { const { copy } = props; return (<SurfaceCard ariaLabel={copy.setup.revisions} composition="joined">
  <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
    <Heading level={3}>{copy.setup.revisions}</Heading>
    <Text size="sm" tone="muted">{copy.setup.revisionsHint}</Text>
  </div>
  <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
    <Tabs label={copy.setup.revisions} selectedKey={props.selectedRevisionId} labelVisibility="always" items={props.revisions.map(r => ({ id: r.id, label: copy.setup.revision({ revision: r.revision, status: copy.setup.revisionStatus[r.status] }) }))} onSelect={props.onSelectRevision} />
    <Text size="sm">{copy.setup.selectedRevision({ revision: props.selectedRevisionId })}</Text>
    <TextAction onPress={() => props.onSelectPane("conversation")}>{copy.setup.openChat}</TextAction>
    {props.setupStartRefused ? <Text size="sm" live="assertive">{copy.setup.startRefused}</Text> : null}
  </div>
  {props.canStartRevision ? <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
    <Button variant="secondary" isPending={props.setupStartPending} isDisabled={props.setupPeerDisabled || props.setupSendPending || props.setupApplyPending || props.setupStartPending} onPress={props.onStartRevision}>{copy.setup.newChat}</Button>
  </div> : null}
</SurfaceCard>); };
const setupConversationPane = (props: WithModulePageCopy<SetupSurfaceProps>) => <PrivateSetupChatBlock copy={props.copy} messages={props.messages} pending={props.pending} ownPending={props.setupSendPending} peerDisabled={props.setupPeerDisabled || props.setupApplyPending || props.setupStartPending} refused={props.setupSendRefused} unconfirmed={props.setupUnconfirmed} revisions={props.revisions} selectedRevisionId={props.selectedRevisionId} canSend={props.canSend} canStartRevision={props.canStartRevision} showRevisionControls={false} draft={props.draftText} onDraft={props.onDraft} onSelectRevision={props.onSelectRevision} onStartRevision={props.onStartRevision} onSend={props.onSend} onOpenVersions={() => props.onSelectPane("versions")} />;
const setupContextPane = (props: WithModulePageCopy<SetupSurfaceProps>) => <ContextVersionBlock copy={props.copy} activeVersion={props.activeVersion} draft={props.draft} pending={props.pending} ownPending={props.setupApplyPending} peerDisabled={props.setupPeerDisabled || props.setupSendPending || props.setupStartPending} refused={props.setupApplyRefused ?? false} onApply={props.onApply} />;
const setupSummaryPane = (props: WithModulePageCopy<SetupSurfaceProps>) => {
  const { copy } = props; 
  const draft = props.draft;
  return <SurfaceCard label={copy.setup.businessContext} composition="joined">
    <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
      <Heading level={4}>{draft === null ? copy.setup.noDraft : draft.version === null ? copy.setup.draftRevision({ revision: draft.revision }) : copy.setup.contextVersion({ version: draft.version })}</Heading>
      <Text size="sm" tone="muted">{draft === null ? copy.setup.noDraft : copy.setup.fromConversation}</Text>
    </div>
    <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
      <Text size="sm" weight="semibold">{draft?.summary ?? copy.setup.contextStartsHere}</Text>
      <Text size="sm" tone="muted">{draft ? copy.setup.reviewBeforeTest : copy.setup.contextHint}</Text>
      <TextAction onPress={() => props.onSelectPane("context")}>{copy.setup.reviewGates}</TextAction>
    </div>
    <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
      <Text size="sm">{copy.setup.activeContext({ version: props.activeVersion === null ? copy.setup.notApplied : `v${props.activeVersion}` })}</Text>
      <Text size="sm" tone="muted">{copy.setup.historyUnchanged}</Text>
    </div>
  </SurfaceCard>;
};
const SetupSurface = (props: WithModulePageCopy<SetupSurfaceProps>) => {
  const { copy } = props; 
  const { compactPane } = props;
  return <section className={AGENTOS_SETUP_SURFACE_CLASS_NAME} data-contract="MEASURE-2 GAP-4"><Heading level={2}>{copy.setup.title}</Heading><Text size="sm" tone="muted">{copy.setup.description}</Text><Tabs label={copy.setup.views} selectedKey={compactPane} labelVisibility="always" items={[{ id: "conversation", label: copy.setup.chat }, { id: "context", label: copy.setup.gates }, { id: "versions", label: copy.setup.versions }]} onSelect={key => props.onSelectPane(key as SetupSurfaceProps["compactPane"])} panelId={key => `setup-panel-${key}`} />{compactPane === "conversation" ? <section id="setup-panel-conversation" role="tabpanel" aria-label={copy.setup.chat}><PrimaryRailLayout primary={setupConversationPane(props)} rail={setupSummaryPane(props)} railWidth="standard" align="start" collapsedOrder="primary-first" /></section> : compactPane === "context" ? <section id="setup-panel-context" role="tabpanel" aria-label={copy.setup.gates}>{setupContextPane(props)}</section> : <section id="setup-panel-versions" role="tabpanel" aria-label={copy.setup.versions}>{setupVersionsPane(props)}</section>}</section>;
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
  copy,
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
}: WithModulePageCopy<TestSurfaceProps>) => { return (<div><div>



    <ChoiceTabs props={{
      label: copy.pageTest.compact,
      selectedKey: compactPane,
      tabs: [{
        id: "conversation",
        label: copy.pageTest.conversation
      }, {
        id: "scenarios",
        label: copy.pageTest.scenarios
      }, {
        id: "evidence",
        label: copy.pageTest.evidence
      }]
    }} on={{
      select: key => onSelectPane(key as TestSurfaceProps["compactPane"])
    }} /></div>{cockpitPane(compactPane !== "scenarios", ModuleCockpitRailBlock, {
    label: copy.pageTest.suite,
    fact: copy.pageTest.count({ count: contract.scenarios.length }),
    summary: copy.pageTest.summary,
    items: contract.scenarios.map(scenario => ({
      id: scenario.key,
      label: scenario.label,
      status: testRunStatusLabel(testSurface?.runs.find(run => run.scenarioKey === scenario.key)?.status, copy)
    })),
    selectedId: selectedScenarioKey,
    onSelect: onSelectScenario
  })}{cockpitPane(compactPane !== "conversation", KindTestWorkbenchBlock, {
    copy,
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
    copy,
    contract,
    run: testSurface?.run ?? null,
    assertions: testSurface?.assertions ?? [],
    contextLabel
  })}</div>); };
const TestUnavailableSurface = ({ copy }: ModulePageCopyProps) => { return (<div><div>



    <ChoiceTabs props={{
      label: copy.pageTest.unavailableView,
      selectedKey: "conversation",
      tabs: [{
        id: "conversation",
        label: copy.pageTest.unavailable
      }]
    }} /></div><div>




    <ModuleCockpitRailBlock label={copy.pageTest.suite} fact={copy.pageTest.unavailable} items={[]} selectedId="" onSelect={() => undefined} /></div><div>




    <SurfaceCard
      label={copy.pageTest.contractUnavailable}
    ><div>{<div>{[<div key="item-0">{<Text size="sm">{copy.pageTest.state}</Text>}{<Text size="sm">{copy.pageTest.noContract}</Text>}</div>]}</div>}</div></SurfaceCard>


  </div><div>





    <SurfaceCard
      label={copy.pageTest.trust}
      fact={copy.pageTest.unavailable}
    ><div>{<div>{[<div key="item-0">{<Text size="sm">{copy.pageTest.safety}</Text>}{<Text size="sm">{copy.pageTest.closed}</Text>}</div>]}</div>}</div></SurfaceCard>


  </div></div>); };
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
const chatPane = (props: WithModulePageCopy<OperateSurfaceProps>) => <div>{props.operationTarget.startsWith("customer-") ? <SupportCustomerChatBlock copy={props.copy} conversation={props.supportInbox.conversations.find(item => item.id === props.supportInbox.selectedConversationId) ?? null} messages={props.supportInbox.messages} pending={props.supportInbox.pending} refused={props.supportInbox.refused} onApprove={props.onApproveSupportReply} onTakeover={props.onSetSupportTakeover} onReconcile={props.onReconcileSupportDelivery} /> : <ExecuteChatBlock copy={props.copy} sessionTitle={props.selectedSessionTitle} messages={props.messages} pending={props.pending} refused={props.refused} registry={DEFAULT_WIDGET_REGISTRY} onSend={props.onSend} onWidgetAction={props.onWidgetAction} />}</div>;
const chatPaneWideOnly = (props: WithModulePageCopy<OperateSurfaceProps>) => <div>{props.operationTarget.startsWith("customer-") ? <SupportCustomerChatBlock copy={props.copy} conversation={props.supportInbox.conversations.find(item => item.id === props.supportInbox.selectedConversationId) ?? null} messages={props.supportInbox.messages} pending={props.supportInbox.pending} refused={props.supportInbox.refused} onApprove={props.onApproveSupportReply} onTakeover={props.onSetSupportTakeover} onReconcile={props.onReconcileSupportDelivery} /> : <ExecuteChatBlock copy={props.copy} sessionTitle={props.selectedSessionTitle} messages={props.messages} pending={props.pending} refused={props.refused} registry={DEFAULT_WIDGET_REGISTRY} onSend={props.onSend} onWidgetAction={props.onWidgetAction} />}</div>;
const workbenchPane = (props: WithModulePageCopy<OperateSurfaceProps>) => <div>{props.operationTarget.startsWith("customer-") ? <SupportQueueWorkbenchBlock copy={props.copy} tickets={props.supportInbox.tickets} facts={props.supportInbox.facts} selectedConversationId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} /> : <KindWorkbenchBlock copy={props.copy} moduleId={props.installationId} kindKey={props.kindKey} workbenchKey={props.workbenchKey} workbenchVersion={props.workbenchVersion} tasks={props.tasks} events={props.events} registry={DEFAULT_WORKBENCH_REGISTRY} />}</div>;
const workbenchPaneWideOnly = (props: WithModulePageCopy<OperateSurfaceProps>) => <div>{props.operationTarget.startsWith("customer-") ? <SupportQueueWorkbenchBlock copy={props.copy} tickets={props.supportInbox.tickets} facts={props.supportInbox.facts} selectedConversationId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} /> : <KindWorkbenchBlock copy={props.copy} moduleId={props.installationId} kindKey={props.kindKey} workbenchKey={props.workbenchKey} workbenchVersion={props.workbenchVersion} tasks={props.tasks} events={props.events} registry={DEFAULT_WORKBENCH_REGISTRY} />}</div>;
const OperateSurface = (props: WithModulePageCopy<OperateSurfaceProps>) => { const { copy } = props; return (<div><div>



    <RouteTabs props={{
      label: copy.operate.view,
      selectedKey: props.operationTarget,
      tabs: props.kindKey === "customer-support" ? [{
        id: "customer-chat",
        label: copy.operate.customers
      }, {
        id: "customer-workbench",
        label: copy.operate.customerQueue
      }, {
        id: "internal-chat",
        label: copy.operate.internalChat
      }, {
        id: "internal-workbench",
        label: copy.operate.internalWorkbench
      }] : [{
        id: "internal-chat",
        label: copy.operate.chat
      }, {
        id: "internal-workbench",
        label: copy.operate.workbench
      }]
    }} on={{
      select: key => props.onSelectTarget(key as OperateSurfaceProps["operationTarget"])
    }} /></div>{props.operationTarget.startsWith("customer-") ? <SupportCustomerConversationRailBlock copy={props.copy} conversations={props.supportInbox.conversations} selectedId={props.supportInbox.selectedConversationId} pending={props.supportInbox.pending} onSelect={props.onSelectSupportConversation} /> : <ExecuteSessionRailBlock copy={props.copy} sessions={props.sessions} selectedId={props.selectedSessionId} pending={props.pending} onSelect={props.onSelectSession} onCreate={props.onCreateSession} />}{props.operationTarget.endsWith("-chat") ? chatPane(props) : chatPaneWideOnly(props)}{props.operationTarget.endsWith("-workbench") ? workbenchPane(props) : workbenchPaneWideOnly(props)}</div>); };
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
  copy,
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
}: WithModulePageCopy<SettingsFormContentProps>) => {
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
        label={copy.settings.displayName}
        placeholder={currentDisplayName}
        isDisabled={pending}
        variant="secondary"
        onValueChange={setDisplayName}
      />



      <Input
        key={`profile-${currentModelProfile}`}
        id="agentos-module-model-profile"
        name="modelProfile"
        label={copy.settings.modelProfile}
        placeholder={currentModelProfile}
        isDisabled={pending}
        variant="secondary"
        onValueChange={setModelProfile}
      />



      <Input
        key={`channel-${currentChannelAccountRef}`}
        id="agentos-module-channel-account-ref"
        name="channelAccountRef"
        label={copy.settings.channelRef}
        placeholder={currentChannelAccountRef || "telegram:nivo-support"}
        isDisabled={pending}
        variant="secondary"
        hint={copy.settings.channelHint}
        onValueChange={setChannelAccountRef}
      /></>




    <ChoiceTabs props={{
      label: copy.settings.mode,
      selectedKey: operatingMode,
      tabs: [{
        id: "assist",
        label: copy.settings.assist
      }, {
        id: "autopilot",
        label: copy.settings.autopilot
      }]
    }} on={{
      select: key => setOperatingMode(key as "assist" | "autopilot")
    }} />



    <Checkbox props={{
      label: copy.settings.confirmation,
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
      >{copy.settings.save}</Button>



      <Button
        variant="secondary"
        isPending={pending}
        isDisabled={!liveEnabled && !canEnableLive}
        onPress={() => onSetLiveEnabled(!liveEnabled)}
      >{liveEnabled ? copy.settings.disableLive : copy.settings.enableLive}</Button></>{credentialSlots.map(slot => <Input
        key={`${slot.key}-${credentialStatuses.find(row => row.providerKey === slot.key)?.maskedHint ?? "empty"}`}
        id={`agentos-module-credential-${slot.key}`}
        name={slot.key}
        label={slot.label}
        kind="password"
        placeholder={credentialStatuses.find(row => row.providerKey === slot.key)?.maskedHint ?? copy.settings.enterCredential}
        isDisabled={pending}
        revealLabel={copy.settings.showCredential({ label: slot.label })}
        hideLabel={copy.settings.hideCredential({ label: slot.label })}
        variant="secondary"
        hint={copy.settings.credentialHint({ provider: slot.provider })}
        onValueChange={value => setCredentialValues(current => ({
        ...current,
        [slot.key]: value
      }))}
      />)}{credentialSlots.length === 0 ? undefined : <Text size="sm" tone="muted" live="polite">{credentialStatuses.length === 0 ? copy.settings.noCredential : credentialStatuses.map(row => `${row.providerKey}: ${row.maskedHint} · ${credentialStatusLabel(row.status, copy)}`).join(" · ")}</Text>}{credentialSlots.flatMap(slot => {
      const configured = credentialStatuses.some(row => row.providerKey === slot.key);
      const value = credentialValues[slot.key]?.trim() ?? "";
      return [<Button
        key="item-0"
        variant="secondary"
        isDisabled={value.length === 0}
        isPending={pending}
        onPress={() => value.length > 0 && onSaveCredential(slot.key, value)}
      >{copy.settings.saveCredential({ label: slot.label })}</Button>, ...(configured ? [<Button
        key="item-0"
        variant="ghost"
        isDisabled={pending}
        onPress={() => onRemoveCredential(slot.key)}
      >{copy.settings.removeCredential({ label: slot.label })}</Button>] : [])];
    })}{refused ? <Text size="sm" tone="muted" live="assertive">{copy.settings.refused}</Text> : <Text size="sm" tone="muted" live="polite">{liveEnabled ? copy.settings.liveEnabled : canEnableLive ? copy.settings.liveReady : copy.settings.liveRequires}</Text>}</div>;
};
type SettingsSurfaceProps = SettingsFormContentProps & {
  readonly activeVersion: number | null;
};
const SettingsSurface = ({
  copy,
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
}: WithModulePageCopy<SettingsSurfaceProps>) => { return (<div>


  <SurfaceCard
    label={copy.settings.title}
  >
    <SettingsFormContent copy={copy} currentDisplayName={currentDisplayName} currentModelProfile={currentModelProfile} currentConfirmation={currentConfirmation} currentOperatingMode={currentOperatingMode} currentChannelAccountRef={currentChannelAccountRef} liveEnabled={liveEnabled} canEnableLive={canEnableLive} pending={pending} refused={refused} credentialSlots={credentialSlots} credentialStatuses={credentialStatuses} onSave={onSave} onSetLiveEnabled={onSetLiveEnabled} onSaveCredential={onSaveCredential} onRemoveCredential={onRemoveCredential} />
  </SurfaceCard>



  <SurfaceCard
    label={copy.settings.safeguards}
    fact={activeVersion === null ? copy.settings.contextRequired : copy.settings.activeVersion({ version: activeVersion })}
  ><div>{<div>{[[copy.settings.externalSends, currentConfirmation ? copy.settings.requireConfirmation : copy.settings.allowedPolicy({ mode: copy.settings[currentOperatingMode] })], [copy.settings.refundLegal, copy.settings.humanApproval], [copy.settings.promptCache, activeVersion === null ? copy.settings.inactive : copy.settings.stableKnowledge({ version: activeVersion })], [copy.settings.cacheInvalidation, copy.settings.automaticApply], [copy.settings.executeHistory, copy.settings.bindingRetained]].map(([ label, value], index) => <div key={index}>{<Text size="sm">{label}</Text>}{<Text size="sm" weight="semibold">{value}</Text>}</div>)}</div>}</div></SurfaceCard>

</div>); };
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
const diagnosticFacts = (entries: ReadonlyArray<readonly [string, AgentosRuntimeValue]>, copy: ModulePageCopy) => entries.map(([ key, value], index) => <div key={index}>

  <Text size="sm">{copy.labels.field({ key })}</Text>
  <Text size="sm" weight="semibold">{safeValue(value)}</Text></div>);
type DiagnosticsHealthCardProps = Pick<DiagnosticsSurfaceProps, "diagnostics" | "selectedSignal">;
const diagnosticHealthFact = (selectedSignal: DiagnosticsSurfaceProps["selectedSignal"], copy: ModulePageCopy): string => {
  if (selectedSignal === "all") return copy.diagnostics.all;
  return selectedSignal === "channel" ? copy.diagnostics.channel : copy.diagnostics.ai;
};
const DiagnosticsHealthCard = ({
  copy,
  diagnostics,
  selectedSignal
}: WithModulePageCopy<DiagnosticsHealthCardProps>) => { return (<SurfaceCard
  label={copy.diagnostics.health}
  fact={diagnosticHealthFact(selectedSignal, copy)}
><div><div>{diagnosticFacts(diagnosticEntries(diagnostics, selectedSignal), copy)}</div>

    <Text size="sm" tone="muted">{copy.diagnostics.safeNotice}</Text></div></SurfaceCard>); };
type DiagnosticsTraceCardProps = Pick<DiagnosticsSurfaceProps, "installationId" | "kindKey" | "workbenchKey" | "events">;
const DiagnosticsTraceCard = ({
  copy,
  installationId,
  kindKey,
  workbenchKey,
  events
}: WithModulePageCopy<DiagnosticsTraceCardProps>) => {
  const facts: ReadonlyArray<readonly [string, string]> = [[copy.diagnostics.installation, installationId], [copy.diagnostics.kind, kindKey], [copy.diagnostics.workbench, workbenchKey], ...events.slice(-5).reverse().map(event => [event.eventType, `${event.source} · ${new Date(event.observedAt).toLocaleString()}`] as const)];
  return <SurfaceCard
    label={copy.diagnostics.trace}
    fact={events.length === 0 ? copy.diagnostics.noEvents : copy.diagnostics.accepted({ count: events.length })}
  ><div><div>{facts.map(([ label, value], index) => <div key={index}>
            <Text size="sm">{label}</Text>
            <Text size="sm" weight="semibold">{value}</Text></div>)}</div></div></SurfaceCard>;
};
const DiagnosticsSurface = ({
  copy,
  installationId,
  kindKey,
  workbenchKey,
  diagnostics,
  events,
  selectedSignal,
  compactPane,
  onSelectSignal,
  onSelectPane
}: WithModulePageCopy<DiagnosticsSurfaceProps>) => { return (<div><div>



    <ChoiceTabs props={{
      label: copy.diagnostics.compact,
      selectedKey: compactPane,
      tabs: [{
        id: "readiness",
        label: copy.diagnostics.healthTab
      }, {
        id: "signals",
        label: copy.diagnostics.signals
      }, {
        id: "evidence",
        label: copy.diagnostics.traceTab
      }]
    }} on={{
      select: key => onSelectPane(key as DiagnosticsSurfaceProps["compactPane"])
    }} /></div>{cockpitPane(compactPane !== "signals", ModuleCockpitRailBlock, {
    label: copy.diagnostics.signals,
    fact: copy.diagnostics.events({ count: events.length }),
    summary: copy.diagnostics.filterNotice,
    items: [{
      id: "all",
      label: copy.diagnostics.all,
      status: copy.diagnostics.checks({ count: Object.keys(diagnostics).length })
    }, {
      id: "channel",
      label: copy.diagnostics.channel,
      status: copy.diagnostics.telegramEvents({ count: events.filter(event => event.source.toLowerCase().includes("telegram")).length })
    }, {
      id: "ai",
      label: copy.diagnostics.ai,
      status: copy.diagnostics.boundReplies({ count: events.filter(event => event.replyContractKey.length > 0).length })
    }],
    selectedId: selectedSignal,
    onSelect: (key: string) => onSelectSignal(key as DiagnosticsSurfaceProps["selectedSignal"])
  })}{cockpitPane(compactPane !== "readiness", DiagnosticsHealthCard, {
    copy,
    diagnostics,
    selectedSignal
  })}{cockpitSidecarPane(compactPane !== "evidence", DiagnosticsTraceCard, {
    copy,
    installationId,
    kindKey,
    workbenchKey,
    events
  })}</div>); };

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
  readonly copy: ModulePageCopy;
  readonly shell: AgentOSSolutionModuleShellProps;
  readonly screen: AgentOSSolutionModuleScreen;
};

/** Draw the selected Module Studio surface from resolved state, data and actions only. */
export const AgentOSSolutionModulePageBase = (props: AgentOSSolutionModulePageProps) => {
  const {
    shell,
    screen,
    copy
  }: AgentOSSolutionModulePageViewProps = props;
  if (screen.view === "setup") return <ModuleRouteShellBlock copy={copy} {...shell} content={SetupSurface} contentProps={{ ...screen.contentProps, copy }} />;
  if (screen.view === "operate") return <ModuleRouteShellBlock copy={copy} {...shell} content={OperateSurface} contentProps={{ ...screen.contentProps, copy }} />;
  if (screen.view === "test-unavailable") return <ModuleRouteShellBlock copy={copy} {...shell} content={TestUnavailableSurface} contentProps={{ copy }} />;
  if (screen.view === "test") return <ModuleRouteShellBlock copy={copy} {...shell} content={TestSurface} contentProps={{ ...screen.contentProps, copy }} />;
  if (screen.view === "settings") return <ModuleRouteShellBlock copy={copy} {...shell} content={SettingsSurface} contentProps={{ ...screen.contentProps, copy }} />;
  return <ModuleRouteShellBlock copy={copy} {...shell} content={DiagnosticsSurface} contentProps={{ ...screen.contentProps, copy }} />;
};

/** State accepted by the typed runtime-loading page. */
export type AgentOSSolutionModuleStateProps = {
  readonly copy: ModulePageCopy;
  readonly refused: boolean;
};

/** Draw a typed load or refusal state while no runtime projection is available. */
export const AgentOSSolutionModuleState = (props: AgentOSSolutionModuleStateProps) => {
  const {
    refused,
    copy
  }: AgentOSSolutionModuleStateProps = props;
  return <div><div>


    <Heading level={1}>{copy.studioPage.title}</Heading></div><>


    <SurfaceCard
      label={refused ? copy.shell.unavailable : copy.shell.loading}
    ><div>{<div>{[<div key="item-0">{<Text size="sm">{copy.pageTest.state}</Text>}{<Text size="sm">{refused ? copy.shell.refused : copy.shell.reading}</Text>}</div>]}</div>}</div></SurfaceCard></></div>;
};
