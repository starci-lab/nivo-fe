import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { ContextDraft } from "@/components/blocks/agentos/ContextVersionBlock"
import type { AgentosModuleTestContract } from "@/modules/api/console"
import {
    AgentOSSolutionModulePageBase,
    exactTestSurfaceFor,
    type AgentOSSolutionModulePageViewProps,
    type AgentOSSolutionModuleScreen,
} from "./component"

const action = vi.fn()
const shell: AgentOSSolutionModulePageViewProps["shell"] = {
    workspaceLabel: "Acme workspace",
    moduleName: "Support Desk",
    moduleKind: "customer-support",
    lifecycleLabel: "ready",
    contextVersion: "v1 active",
    channelLabel: "Telegram 12345",
    controllerLabel: "controller ready",
    activeView: "setup",
    onBackToModules: action,
    onNavigate: action,
}

const contract: AgentosModuleTestContract = {
    workbench: { key: "conversation-sandbox", version: "1.0.0" },
    contract: { key: "conversation-test", version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [{
        key: "urgent-support",
        label: "Urgent support",
        description: "Uses fake customer data",
        fixture: { urgency: "high" },
        assertions: [],
    }],
}

const screens: ReadonlyArray<AgentOSSolutionModuleScreen> = [
    {
        view: "setup",
        contentProps: {
            messages: [],
            revisions: [{ id: "setup-1", revision: 1, status: "completed" }],
            selectedRevisionId: "setup-1",
            canSend: false,
            canStartRevision: true,
            activeVersion: 1,
            draft: null,
            pending: false,
            draftText: "",
            refused: false,
            compactPane: "conversation",
            onSelectRevision: action,
            onStartRevision: action,
            onSend: action,
            onApply: action,
            onSelectPane: action,
            onDraft: action,
        },
    },
    {
        view: "test",
        contentProps: {
            contract,
            targetReady: true,
            contextLabel: "Context v1",
            testSurface: null,
            pending: false,
            selectedScenarioKey: "urgent-support",
            compactPane: "conversation",
            onSelectScenario: action,
            onSelectPane: action,
            onRun: action,
        },
    },
    { view: "test-unavailable" },
    {
        view: "operate",
        contentProps: {
            installationId: "installation-1",
            kindKey: "customer-support",
            workbenchKey: "support-queue",
            workbenchVersion: "1.0.0",
            sessions: [],
            selectedSessionId: null,
            selectedSessionTitle: "Primary Operations",
            messages: [],
            tasks: [],
            events: [],
            operationTarget: "customer-chat",
            supportInbox: {
                conversations: [],
                selectedConversationId: null,
                messages: [],
                tickets: [],
                facts: [],
                pending: false,
                refused: false,
            },
            pending: false,
            refused: false,
            onSelectSession: action,
            onSelectTarget: action,
            onCreateSession: action,
            onSend: action,
            onWidgetAction: action,
            onSelectSupportConversation: action,
            onApproveSupportReply: action,
            onSetSupportTakeover: action,
            onReconcileSupportDelivery: action,
        },
    },
    {
        view: "settings",
        contentProps: {
            activeVersion: 1,
            currentDisplayName: "Support Desk",
            currentModelProfile: "nivo-default",
            currentConfirmation: true,
            currentOperatingMode: "assist",
            currentChannelAccountRef: "TELEGRAM:12345",
            liveEnabled: false,
            canEnableLive: true,
            pending: false,
            refused: false,
            credentialSlots: [{ key: "telegram-bot-token", label: "Telegram bot token", provider: "Telegram" }],
            credentialStatuses: [{ providerKey: "telegram-bot-token", maskedHint: "••••1234", status: "configured" }],
            onSave: action,
            onSetLiveEnabled: action,
            onSaveCredential: action,
            onRemoveCredential: action,
        },
    },
    {
        view: "diagnostics",
        contentProps: {
            installationId: "installation-1",
            kindKey: "customer-support",
            workbenchKey: "support-queue",
            diagnostics: { controllerHealthy: true, telegramWebhook: "ready", promptCacheHit: 8 },
            events: [],
            selectedSignal: "all",
            compactPane: "readiness",
            onSelectSignal: action,
            onSelectPane: action,
        },
    },
]

describe("AgentOSSolutionModulePageBase", () => {
    it.each(screens)("renders the $view screen through its typed Grammar contract", (screen) => {
        const html = renderToStaticMarkup(<AgentOSSolutionModulePageBase shell={{ ...shell, activeView: screen.view === "test-unavailable" ? "test" : screen.view }} screen={screen} />)
        expect(html).toContain("Support Desk")
    })

    it("mounts exactly one controlled Setup panel", () => {
        const setup = screens[0]!
        const html = renderToStaticMarkup(<AgentOSSolutionModulePageBase shell={shell} screen={setup} />)
        expect((html.match(/role="tabpanel"/g) ?? []).length).toBe(1)
        expect(html).toContain('id="setup-panel-conversation"')
        expect(html).not.toContain('id="setup-panel-context"')
        expect(html).not.toContain('id="setup-panel-versions"')
    })

    it("accepts only exact setup digest evidence", () => {
        const draft: ContextDraft = {
            contextId: null,
            setupSessionId: "setup-1",
            revision: 1,
            status: "completed",
            version: null,
            summary: "Support context",
            facts: [],
            digest: "a".repeat(64),
            gates: [],
            exactTestPassed: true,
            isActive: false,
        }
        const exact = {
            contract,
            runs: [],
            assertions: [],
            run: { setupSessionId: "setup-1", draftDigest: "a".repeat(64) },
        }
        expect(exactTestSurfaceFor(exact as never, draft)).toBe(exact)
        expect(exactTestSurfaceFor({ ...exact, run: { ...exact.run, draftDigest: "b".repeat(64) } } as never, draft)).toBeNull()
        expect(exactTestSurfaceFor(null, draft)).toBeNull()
    })
})
