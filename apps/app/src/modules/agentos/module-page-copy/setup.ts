import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries used by module setup and context review. */
export type SetupModulePageMessageKey =
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
    | "setup.confirmRequirement"
    | "setup.confirmed"
    | "setup.evidenceRequired"
    | "setup.contextHint"
    | "setup.contextStartsHere"
    | "setup.contextVersion"
    | "setup.continueChat"
    | "setup.createVersion"
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

type SetupActiveContextValues = { readonly version: string }

type SetupApplyVersionValues = { readonly version: number }

type SetupCompleteAllGatesValues = { readonly count: number }

type SetupCompleteCountValues = { readonly passed: number; readonly total: number }

type SetupContextVersionValues = { readonly version: number }

type SetupDraftRevisionValues = { readonly revision: number }

type SetupFallbackSummaryValues = { readonly revision: number }

type SetupReviewSummaryValues = { readonly draft: string; readonly version: string }

type SetupRevisionValues = { readonly revision: number | "?"; readonly status: string }

type SetupRevisionOnlyValues = { readonly revision: number }

type SetupSelectedRevisionValues = { readonly revision: string }

type SetupSelectedStatusValues = { readonly status: string }

type SetupTestContextValues = { readonly revision: number; readonly version: string; readonly digest: string }

type SetupTotalRevisionsValues = { readonly count: number }

type SetupUnknownGateValues = { readonly key: string }

type SetupVersionActiveValues = { readonly version: string | number }

/** Build the module setup copy branch from the connected translator. */
export const buildSetupCopy = (t: ModulePageTranslatorFor<SetupModulePageMessageKey>) => ({
    setup: {
        activeContext: (values: SetupActiveContextValues) => t("setup.activeContext", values),
        actor: {
            assistant: t("setup.actor.assistant"),
            system: t("setup.actor.system"),
            user: t("setup.actor.user"),
        },
        applyHint: t("setup.applyHint"),
        applyVersion: (values: SetupApplyVersionValues) => t("setup.applyVersion", values),
        businessContext: t("setup.businessContext"),
        chat: t("setup.chat"),
        complete: t("setup.complete"),
        completeAllGates: (values: SetupCompleteAllGatesValues) => t("setup.completeAllGates", values),
        completeCount: (values: SetupCompleteCountValues) => t("setup.completeCount", values),
        completeGates: t("setup.completeGates"),
        confirmRequirement: t("setup.confirmRequirement"),
        confirmed: t("setup.confirmed"),
        evidenceRequired: t("setup.evidenceRequired"),
        contextHint: t("setup.contextHint"),
        contextStartsHere: t("setup.contextStartsHere"),
        contextVersion: (values: SetupContextVersionValues) => t("setup.contextVersion", values),
        continueChat: t("setup.continueChat"),
        createVersion: t("setup.createVersion"),
        description: t("setup.description"),
        draft: t("setup.draft"),
        draftRevision: (values: SetupDraftRevisionValues) => t("setup.draftRevision", values),
        emptyDescription: t("setup.emptyDescription"),
        emptyTitle: t("setup.emptyTitle"),
        exactTest: t("setup.exactTest"),
        fallbackSummary: (values: SetupFallbackSummaryValues) => t("setup.fallbackSummary", values),
        fromConversation: t("setup.fromConversation"),
        gateLabels: {
            accountingScope: t("setup.gateLabels.accountingScope"),
            approvalPolicy: t("setup.gateLabels.approvalPolicy"),
            approvalThresholds: t("setup.gateLabels.approvalThresholds"),
            automationPolicy: t("setup.gateLabels.automationPolicy"),
            availabilityRules: t("setup.gateLabels.availabilityRules"),
            businessIdentity: t("setup.gateLabels.businessIdentity"),
            calendarSources: t("setup.gateLabels.calendarSources"),
            channels: t("setup.gateLabels.channels"),
            citationPolicy: t("setup.gateLabels.citationPolicy"),
            confidencePolicy: t("setup.gateLabels.confidencePolicy"),
            confirmationPolicy: t("setup.gateLabels.confirmationPolicy"),
            conflictPolicy: t("setup.gateLabels.conflictPolicy"),
            currencyAndLocale: t("setup.gateLabels.currencyAndLocale"),
            customerSegments: t("setup.gateLabels.customerSegments"),
            escalationAndHandoff: t("setup.gateLabels.escalationAndHandoff"),
            evidenceRequirements: t("setup.gateLabels.evidenceRequirements"),
            freshnessPolicy: t("setup.gateLabels.freshnessPolicy"),
            hoursAndSla: t("setup.gateLabels.hoursAndSla"),
            participantRules: t("setup.gateLabels.participantRules"),
            privacyAndSensitiveData: t("setup.gateLabels.privacyAndSensitiveData"),
            productsServices: t("setup.gateLabels.productsServices"),
            prohibitedActions: t("setup.gateLabels.prohibitedActions"),
            prohibitedClaims: t("setup.gateLabels.prohibitedClaims"),
            prohibitedCommitments: t("setup.gateLabels.prohibitedCommitments"),
            readinessOwnership: t("setup.gateLabels.readinessOwnership"),
            reminderPolicy: t("setup.gateLabels.reminderPolicy"),
            researchScope: t("setup.gateLabels.researchScope"),
            schedulingScope: t("setup.gateLabels.schedulingScope"),
            sourcePolicy: t("setup.gateLabels.sourcePolicy"),
            sourceSystems: t("setup.gateLabels.sourceSystems"),
            supportScope: t("setup.gateLabels.supportScope"),
            timeZone: t("setup.gateLabels.timeZone"),
            toneAndLanguage: t("setup.gateLabels.toneAndLanguage"),
        },
        gates: t("setup.gates"),
        gatesReview: t("setup.gatesReview"),
        historyUnchanged: t("setup.historyUnchanged"),
        messageHint: t("setup.messageHint"),
        messageLabel: t("setup.messageLabel"),
        messagePlaceholder: t("setup.messagePlaceholder"),
        messageRefused: t("setup.messageRefused"),
        messageUnconfirmed: t("setup.messageUnconfirmed"),
        messages: t("setup.messages"),
        needsFollowUp: t("setup.needsFollowUp"),
        newChat: t("setup.newChat"),
        noCandidate: t("setup.noCandidate"),
        noDraft: t("setup.noDraft"),
        noGates: t("setup.noGates"),
        notApplied: t("setup.notApplied"),
        openChat: t("setup.openChat"),
        openVersions: t("setup.openVersions"),
        operationRefused: t("setup.operationRefused"),
        passTestFirst: t("setup.passTestFirst"),
        private: t("setup.private"),
        privateChat: t("setup.privateChat"),
        reviewBeforeTest: t("setup.reviewBeforeTest"),
        reviewContext: t("setup.reviewContext"),
        reviewGates: t("setup.reviewGates"),
        reviewSummary: (values: SetupReviewSummaryValues) => t("setup.reviewSummary", values),
        revision: (values: SetupRevisionValues) => t("setup.revision", values),
        revisionComplete: t("setup.revisionComplete"),
        revisionHistoryHint: t("setup.revisionHistoryHint"),
        revisionOnly: (values: SetupRevisionOnlyValues) => t("setup.revisionOnly", values),
        revisionStatus: {
            completed: t("setup.revisionStatus.completed"),
            open: t("setup.revisionStatus.open"),
            ready: t("setup.revisionStatus.ready"),
            superseded: t("setup.revisionStatus.superseded"),
            unavailable: t("setup.revisionStatus.unavailable"),
        },
        revisions: t("setup.revisions"),
        revisionsHint: t("setup.revisionsHint"),
        selectedRevision: (values: SetupSelectedRevisionValues) => t("setup.selectedRevision", values),
        selectedStatus: (values: SetupSelectedStatusValues) => t("setup.selectedStatus", values),
        send: t("setup.send"),
        setupGates: t("setup.setupGates"),
        startRefused: t("setup.startRefused"),
        testContext: (values: SetupTestContextValues) => t("setup.testContext", values),
        testPassed: t("setup.testPassed"),
        testRequired: t("setup.testRequired"),
        testableDraftRequired: t("setup.testableDraftRequired"),
        title: t("setup.title"),
        totalRevisions: (values: SetupTotalRevisionsValues) => t("setup.totalRevisions", values),
        unknownGate: (values: SetupUnknownGateValues) => t("setup.unknownGate", values),
        versionActive: (values: SetupVersionActiveValues) => t("setup.versionActive", values),
        versions: t("setup.versions"),
        views: t("setup.views"),
        waitingForOwner: t("setup.waitingForOwner"),
    },
})
