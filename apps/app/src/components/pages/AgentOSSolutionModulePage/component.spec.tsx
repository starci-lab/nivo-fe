import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { describe, expect, it, vi } from "vitest"
import type { ContextDraft } from "@/components/blocks/agentos/ContextVersionBlock"
import type { AgentosModuleTestContract } from "@/modules/api/console"
import {
    AgentOSSolutionModulePageBase,
    exactTestSurfaceFor,
    type AgentOSSolutionModulePageViewProps,
    type AgentOSSolutionModuleScreen,
    buildModulePageCopy,
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

type CopyFixtureProps = Omit<AgentOSSolutionModulePageViewProps, "copy">
type PageFixtureProps = CopyFixtureProps & { readonly locale: "en" | "vi" }
const CopyFixture = ({ shell, screen }: CopyFixtureProps) => { const t = useTranslations("console.agentos.modules"); return <AgentOSSolutionModulePageBase shell={shell} screen={screen} copy={buildModulePageCopy(t)} /> }
const PageFixture = ({ shell, screen, locale }: PageFixtureProps) => <NextIntlClientProvider locale={locale} timeZone={TIME_ZONE} messages={locale === "en" ? enMessages : viMessages} onError={error => { throw error }}><CopyFixture shell={shell} screen={screen} /></NextIntlClientProvider>

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
        const html = renderToStaticMarkup(<PageFixture shell={{ ...shell, activeView: screen.view === "test-unavailable" ? "test" : screen.view }} screen={screen} locale="en" />)
        expect(html).toContain("Support Desk")
    })

    it("mounts exactly one controlled Setup panel", () => {
        const setup = screens[0]!
        const html = renderToStaticMarkup(<PageFixture shell={shell} screen={setup} locale="en" />)
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

// Real catalog assertions for every route body and every controlled Setup pane.
describe.each(["en", "vi"] as const)("Module page copy in %s", locale => {
    const messages = locale === "en" ? enMessages : viMessages
    const copy = messages.console.agentos.modules
    it.each(screens)("localizes the $view route without translating supplied identity", screen => {
        const html = renderToStaticMarkup(<PageFixture locale={locale} shell={{ ...shell, activeView: screen.view === "test-unavailable" ? "test" : screen.view }} screen={screen} />)
        const expected = screen.view === "setup" ? copy.setup.title : screen.view === "test" ? copy.runtime.pageTest.suite : screen.view === "test-unavailable" ? copy.runtime.pageTest.unavailable : screen.view === "operate" ? copy.runtime.operate.view : screen.view === "settings" ? copy.runtime.settings.title : copy.runtime.diagnostics.health
        expect(html).toContain(expected)
        expect(html).toContain("Support Desk")
        expect(html).toContain(copy.shell.sections)
    })
    it.each(["conversation", "context", "versions"] as const)("keeps exactly one %s Setup panel", compactPane => {
        const setup = screens.find(screen => screen.view === "setup")!
        if (setup.view !== "setup") throw new Error("Setup fixture missing")
        const html = renderToStaticMarkup(<PageFixture locale={locale} shell={shell} screen={{ ...setup, contentProps: { ...setup.contentProps, compactPane } }} />)
        expect((html.match(/role="tabpanel"/g) ?? []).length).toBe(1)
        expect(html).toContain('id="setup-panel-' + compactPane + '"')
        expect(html).toContain(compactPane === "conversation" ? copy.setup.privateChat : compactPane === "context" ? copy.setup.reviewContext : copy.setup.revisionsHint)
    })
})
