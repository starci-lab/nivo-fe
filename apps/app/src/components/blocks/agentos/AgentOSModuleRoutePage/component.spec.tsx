import type { AgentosModuleTestContractView } from "@/modules/api/agentos-module-tests"

import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n"
import { describe, expect, it, vi } from "vitest"
import { SessionProvider } from "@/modules/auth/session"
import {
    AgentOSSolutionModulePageBase,
    type AgentOSSolutionModulePageViewProps,
    type AgentOSSolutionModuleScreen,
    buildModulePageCopy,
} from "./component"

const action = vi.fn()
const shell: AgentOSSolutionModulePageViewProps["props"] = {
    workspaceLabel: "Acme workspace",
    moduleName: "Support Desk",
    moduleKind: "customer-support",
    lifecycleLabel: "ready",
    contextVersion: "v1 active",
    channelLabel: "Telegram 12345",
    controllerLabel: "controller ready",
    activeView: "setup",
}
const shellOn: AgentOSSolutionModulePageViewProps["on"] = {
    backToModules: action,
    navigate: action,
}

const contract: AgentosModuleTestContractView = {
    workbench: { key: "conversation-sandbox", version: "1.0.0" },
    contract: { key: "conversation-test", version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [
        {
            key: "urgent-support",
            label: "Urgent support",
            description: "Uses fake customer data",
            fixture: { urgency: "high" },
            assertions: [],
        },
    ],
}

type CopyFixtureProps = {
    readonly shell: AgentOSSolutionModulePageViewProps["props"]
    readonly screen: AgentOSSolutionModuleScreen
}
type PageFixtureProps = CopyFixtureProps & { readonly locale: "en" | "vi" }
const CopyFixture = ({ shell, screen }: CopyFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <AgentOSSolutionModulePageBase state={{ copy: buildModulePageCopy(t), screen }} props={shell} on={shellOn} />
}
const PageFixture = ({ shell, screen, locale }: PageFixtureProps) => (
    <NextIntlClientProvider
        locale={locale}
        timeZone={TIME_ZONE}
        messages={locale === "en" ? enMessages : viMessages}
        onError={(error) => {
            throw error
        }}
    >
        <SessionProvider>
            <CopyFixture shell={shell} screen={screen} />
        </SessionProvider>
    </NextIntlClientProvider>
)
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
            onCreateVersion: action,
            onConfirmRequirement: action,
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
            mode: "exploratory",
            compactPane: "conversation",
            onSelectScenario: action,
            onSelectMode: action,
            onSelectPane: action,
            onRun: action,
        },
    },
    { view: "test-unavailable" },
    {
        view: "operate",
        contentProps: {
            installationId: "installation-1",
            kindKey: "accounting",
            workbenchKey: "accounting-sheet",
            workbenchVersion: "1.0.0",
            sessions: [],
            selectedSessionId: null,
            selectedSessionTitle: "Primary Operations",
            messages: [],
            tasks: [],
            events: [],
            operationTarget: "internal-chat",
            isChatbot: false,
            chatbotWorkbench: null,
            chatbotRefusedCode: null,
            supportInbox: {
                selectedConversationId: null,
                pending: false,
            },
            pending: false,
            refused: false,
            onSelectSession: action,
            onSelectTarget: action,
            onCreateSession: action,
            onSend: action,
            onWidgetAction: action,
            onSelectSupportConversation: action,
            onConnectChatbotZalo: action,
            onSetChatbotHandoff: action,
            onResolveChatbotHandoff: action,
            onReconcileChatbotDelivery: action,
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
            displayName: "Support Desk",
            modelProfile: "nivo-default",
            requireConfirmation: true,
            operatingMode: "assist",
            channelAccountRef: "TELEGRAM:12345",
            credentialValues: {},
            liveEnabled: false,
            canEnableLive: true,
            pending: false,
            refused: false,
            credentialSlots: [{ key: "telegram-bot-token", label: "Telegram bot token", provider: "Telegram" }],
            credentialStatuses: [{ providerKey: "telegram-bot-token", maskedHint: "••••1234", status: "configured" }],
            on: {
                save: action,
                setLiveEnabled: action,
                saveCredential: action,
                removeCredential: action,
                changeDisplayName: action,
                changeModelProfile: action,
                changeConfirmation: action,
                changeOperatingMode: action,
                changeChannelAccountRef: action,
                changeCredential: action,
            },
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
        const html = renderToStaticMarkup(
            <PageFixture
                shell={{ ...shell, activeView: screen.view === "test-unavailable" ? "test" : screen.view }}
                screen={screen}
                locale="en"
            />,
        )
        expect(html).toContain("Support Desk")
    })

    // Real catalog assertions for every route body.
    describe.each(["en", "vi"] as const)("Module page copy in %s", (locale) => {
        const messages = locale === "en" ? enMessages : viMessages
        const copy = messages.console.agentos.modules
        it.each(screens)("localizes the $view route without translating supplied identity", (screen) => {
            const html = renderToStaticMarkup(
                <PageFixture
                    locale={locale}
                    shell={{ ...shell, activeView: screen.view === "test-unavailable" ? "test" : screen.view }}
                    screen={screen}
                />,
            )
            const expected =
                screen.view === "setup"
                    ? copy.setup.title
                    : screen.view === "test"
                      ? copy.runtime.pageTest.suite
                      : screen.view === "test-unavailable"
                        ? copy.runtime.pageTest.unavailable
                        : screen.view === "operate"
                          ? copy.runtime.operate.view
                          : screen.view === "settings"
                            ? copy.runtime.settings.title
                            : copy.runtime.diagnostics.health
            expect(html).toContain(expected)
            expect(html).toContain("Support Desk")
            expect(html).toContain(copy.shell.sections)
        })
    })
})

describe("AgentOSSolutionModulePageBase", () => {
    describe.each(["en", "vi"] as const)("AgentOS SPLIT-6 page owner chains %s", (locale) => {
        const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules

        it("projects one backend-owned module runtime through the pure routed shell", () => {
            const html = renderToStaticMarkup(
                <PageFixture
                    locale={locale}
                    shell={{
                        workspaceLabel: "Workspace workspac",
                        moduleName: "Sales Copilot",
                        moduleKind: "sales",
                        lifecycleLabel: "ready",
                        contextVersion: "not applied",
                        channelLabel: "Channel not connected",
                        controllerLabel: "Controller healthy",
                        activeView: "diagnostics",
                    }}
                    screen={{
                        view: "diagnostics",
                        contentProps: {
                            installationId: "installation-1",
                            kindKey: "sales",
                            workbenchKey: "sales-pipeline",
                            diagnostics: { available: true },
                            events: [],
                            selectedSignal: "all",
                            compactPane: "readiness",
                            onSelectSignal: vi.fn(),
                            onSelectPane: vi.fn(),
                        },
                    }}
                />,
            )
            expect(html).toContain(copy.shell.modules)
            expect(html).toContain("Sales Copilot")
            expect(html).toContain("installation-1")
            expect(html).toContain(copy.runtime.diagnostics.signals)
            expect(html).toContain(copy.runtime.diagnostics.health)
            expect(html).toContain(copy.runtime.diagnostics.trace)
            expect(html).toContain("Controller healthy")
        })
    })
})
