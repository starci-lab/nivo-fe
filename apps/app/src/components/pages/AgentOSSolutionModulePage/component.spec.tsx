import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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


describe.each(["en", "vi"] as const)("Settings interaction copy %s", locale => {
 const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
 it("reveals, hides, saves and removes the manifest credential without translating input", () => {
  const settings = screens.find(candidate => candidate.view === "settings")!
  if (settings.view !== "settings") throw new Error("Settings fixture missing")
  const onSaveCredential = vi.fn(); const onRemoveCredential = vi.fn(); const onSave = vi.fn(); const onSetLiveEnabled = vi.fn()
  const contentProps = { ...settings.contentProps, onSaveCredential, onRemoveCredential, onSave, onSetLiveEnabled }
  const view = render(<PageFixture locale={locale} shell={{ ...shell, activeView: "settings" }} screen={{ view: "settings", contentProps }} />)
  const input = screen.getByLabelText("Telegram bot token", { selector: "input" })
  expect(input).toHaveAttribute("type", "password")
  expect(input).toHaveAttribute("placeholder", "••••1234")
  fireEvent.click(screen.getByRole("button", { name: copy.settings.showCredential({ label: "Telegram bot token" }) }))
  expect(input).toHaveAttribute("type", "text")
  fireEvent.click(screen.getByRole("button", { name: copy.settings.hideCredential({ label: "Telegram bot token" }) }))
  expect(input).toHaveAttribute("type", "password")
  const saveCredential = screen.getByRole("button", { name: copy.settings.saveCredential({ label: "Telegram bot token" }) })
  expect(saveCredential).toBeDisabled()
  fireEvent.change(input, { target: { value: "  synthetic-test-value  " } })
  fireEvent.click(saveCredential)
  fireEvent.click(screen.getByRole("button", { name: copy.settings.removeCredential({ label: "Telegram bot token" }) }))
  expect(onSaveCredential).toHaveBeenCalledExactlyOnceWith("telegram-bot-token", "synthetic-test-value")
  expect(onRemoveCredential).toHaveBeenCalledExactlyOnceWith("telegram-bot-token")
  fireEvent.change(screen.getByRole("textbox", { name: copy.settings.displayName }), { target: { value: "Owner name" } })
  fireEvent.change(screen.getByRole("textbox", { name: copy.settings.modelProfile }), { target: { value: "raw-model" } })
  fireEvent.change(screen.getByRole("textbox", { name: copy.settings.channelRef }), { target: { value: "  TELEGRAM:987  " } })
  fireEvent.click(screen.getByRole("checkbox", { name: copy.settings.confirmation }))
  fireEvent.click(screen.getByRole("button", { name: copy.settings.save }))
  expect(onSave).toHaveBeenCalledExactlyOnceWith({ displayName: "Owner name", modelProfile: "raw-model", requireConfirmation: false }, "assist", "TELEGRAM:987")
  expect(screen.getByText(copy.settings.liveReady)).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.settings.enableLive }))
  expect(onSetLiveEnabled).toHaveBeenCalledExactlyOnceWith(true)
  view.rerender(<PageFixture locale={locale} shell={{ ...shell, activeView: "settings" }} screen={{ view: "settings", contentProps: { ...contentProps, liveEnabled: true } }} />)
  expect(screen.getByText(copy.settings.liveEnabled)).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.settings.disableLive }))
  expect(onSetLiveEnabled.mock.calls).toEqual([[true], [false]])
  view.unmount()
 })
 it.each(["configured", "invalid", "constructor"])("keeps %s status display separate from credential identity", status => {
  const settings = screens.find(candidate => candidate.view === "settings")!
  if (settings.view !== "settings") throw new Error("Settings fixture missing")
  const view = render(<PageFixture locale={locale} shell={{ ...shell, activeView: "settings" }} screen={{ view: "settings", contentProps: { ...settings.contentProps, activeVersion: null, currentConfirmation: false, currentOperatingMode: "autopilot", canEnableLive: false, credentialStatuses: [{ providerKey: "telegram-bot-token", maskedHint: "masked-only", status }] } }} />)
  expect(screen.getByRole("button", { name: copy.settings.enableLive })).toBeDisabled()
  expect(screen.getByText(copy.settings.liveRequires)).toBeInTheDocument()
  expect(screen.getByText(copy.settings.allowedPolicy({ mode: copy.settings.autopilot }))).toBeInTheDocument()
  const expectedStatus = status === "configured" || status === "invalid" ? copy.credentialStatus[status] : copy.shell.unknownStatus({ status })
  expect(screen.getByText(`telegram-bot-token: masked-only · ${expectedStatus}`)).toBeInTheDocument()
  view.rerender(<PageFixture locale={locale} shell={{ ...shell, activeView: "settings" }} screen={{ view: "settings", contentProps: { ...settings.contentProps, pending: true, refused: true, credentialStatuses: [] } }} />)
  expect(screen.getByText(copy.settings.refused)).toBeInTheDocument()
  expect(screen.getByText(copy.settings.noCredential)).toBeInTheDocument()
  expect(screen.getByLabelText("Telegram bot token", { selector: "input" })).toBeDisabled()
  expect(screen.queryByRole("button", { name: copy.settings.removeCredential({ label: "Telegram bot token" }) })).toBeNull()
  view.unmount()
 })
})

describe.each(["en", "vi"] as const)("Diagnostics filtered raw values %s", locale => {
 it.each(["all", "channel", "ai"] as const)("filters %s without translating field names or values", selectedSignal => {
  const diagnostics = screens.find(candidate => candidate.view === "diagnostics")!
  if (diagnostics.view !== "diagnostics") throw new Error("Diagnostics fixture missing")
  const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
  const html = renderToStaticMarkup(<PageFixture locale={locale} shell={{ ...shell, activeView: "diagnostics" }} screen={{ view: "diagnostics", contentProps: { ...diagnostics.contentProps, selectedSignal, diagnostics: { telegramWebhook: "raw-webhook", promptCache: 17, constructor: null, rawField: [1, true] } } }} />)
  expect(html).toContain(copy.diagnostics[selectedSignal])
  if (selectedSignal !== "ai") expect(html).toContain("raw-webhook")
  if (selectedSignal !== "channel") expect(html).toContain(copy.labels.field({ key: "promptCache" }))
  if (selectedSignal === "channel") {
   expect(html).not.toContain(copy.labels.field({ key: "promptCache" }))
   expect(html).not.toContain(copy.labels.field({ key: "rawField" }))
   expect(html).not.toContain(copy.labels.field({ key: "constructor" }))
  }
  if (selectedSignal === "ai") {
   expect(html).not.toContain("raw-webhook")
   expect(html).not.toContain(copy.labels.field({ key: "rawField" }))
   expect(html).not.toContain(copy.labels.field({ key: "constructor" }))
  }
  if (selectedSignal === "all") {
   expect(html).toContain(copy.labels.field({ key: "constructor" }))
   expect(html).toContain("[1,true]")
  }
 })
})

describe.each(["en", "vi"] as const)("Page owner action forwarding %s", locale => {
 let animationDescriptor: PropertyDescriptor | undefined
 beforeEach(() => {
  animationDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations")
  Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] })
 })
 afterEach(() => {
  if (animationDescriptor) Object.defineProperty(Element.prototype, "getAnimations", animationDescriptor)
  else Reflect.deleteProperty(Element.prototype, "getAnimations")
 })

 const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
 it("forwards Setup history and review actions with one mounted panel", () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  const setup = screens.find(candidate => candidate.view === "setup")!
  if (setup.view !== "setup") throw new Error("Setup fixture missing")
  const onSelectPane = vi.fn(); const onStartRevision = vi.fn(); const onSelectRevision = vi.fn()
  const props = { ...setup.contentProps, canStartRevision: false, onSelectPane, onStartRevision, onSelectRevision, revisions: [...setup.contentProps.revisions, { id: "setup-raw-2", revision: 2, status: "open" as const }] }
  const view = render(<PageFixture locale={locale} shell={shell} screen={{ view: "setup", contentProps: props }} />)
  fireEvent.click(screen.getByRole("button", { name: copy.setup.openVersions }))
  fireEvent.click(screen.getByRole("button", { name: copy.setup.reviewGates }))
  expect(onSelectPane.mock.calls).toEqual([["versions"], ["context"]])
  fireEvent.click(screen.getByRole("tab", { name: copy.setup.versions }))
  expect(onSelectPane).toHaveBeenLastCalledWith("versions")
  view.rerender(<PageFixture locale={locale} shell={shell} screen={{ view: "setup", contentProps: { ...props, compactPane: "versions", setupStartRefused: true } }} />)
  expect(screen.getAllByRole("tabpanel")).toHaveLength(1)
  expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "setup-panel-versions")
  expect(screen.getByText(copy.setup.startRefused)).toBeInTheDocument()
  fireEvent.click(screen.getByRole("tab", { name: copy.setup.revision({ revision: 2, status: copy.setup.revisionStatus.open }) }))
  expect(onSelectRevision).toHaveBeenCalledExactlyOnceWith("setup-raw-2")
  expect(screen.queryByRole("button", { name: copy.setup.newChat })).toBeNull()
  view.rerender(<PageFixture locale={locale} shell={shell} screen={{ view: "setup", contentProps: { ...props, compactPane: "versions", canStartRevision: true, revisions: props.revisions.map(revision => ({ ...revision, status: "completed" as const })) } }} />)
  fireEvent.click(screen.getByRole("button", { name: copy.setup.newChat }))
  expect(onStartRevision).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole("button", { name: copy.setup.openChat }))
  expect(onSelectPane).toHaveBeenLastCalledWith("conversation")
  view.unmount()
 })
 it("forwards diagnostic filters and displays exact persisted event counts", () => {
  const diagnostics = screens.find(candidate => candidate.view === "diagnostics")!
  if (diagnostics.view !== "diagnostics") throw new Error("Diagnostics fixture missing")
  const onSelectSignal = vi.fn(); const onSelectPane = vi.fn()
  const event = { id: "event/raw", installationId: "installation-1", contextVersionId: "context-1", source: "Telegram/raw", externalEventId: "external/raw", eventType: "Raw event", observedAt: "2026-08-26T00:00:00.000Z", kindKey: "customer-support", kindVersion: "1.0.0", replyContractKey: "reply/raw", replyContractVersion: "1.0.0", toolSchemaDigest: "raw", payload: {}, evidence: {}, createdAt: "2026-08-26T00:00:00.000Z" }
  const view = render(<PageFixture locale={locale} shell={{ ...shell, activeView: "diagnostics" }} screen={{ view: "diagnostics", contentProps: { ...diagnostics.contentProps, onSelectSignal, onSelectPane, events: [event] } }} />)
  expect(screen.getByText(copy.diagnostics.accepted({ count: 1 }))).toBeInTheDocument()
  expect(screen.getByText(copy.diagnostics.telegramEvents({ count: 1 }))).toBeInTheDocument()
  expect(screen.getByText(copy.diagnostics.boundReplies({ count: 1 }))).toBeInTheDocument()
  expect(screen.getByText("Raw event")).toBeInTheDocument()
  fireEvent.click(screen.getByText(copy.diagnostics.channel))
  expect(onSelectSignal).toHaveBeenCalledExactlyOnceWith("channel")
  fireEvent.click(screen.getByRole("radio", { name: copy.diagnostics.traceTab }))
  expect(onSelectPane).toHaveBeenCalledExactlyOnceWith("evidence")
  view.unmount()
 })
 it.each(["customer-chat", "customer-workbench", "internal-chat", "internal-workbench"] as const)("keeps %s owner identity and selection tokens", operationTarget => {
  const operate = screens.find(candidate => candidate.view === "operate")!
  if (operate.view !== "operate") throw new Error("Operate fixture missing")
  const onSelectTarget = vi.fn()
  const view = render(<PageFixture locale={locale} shell={{ ...shell, activeView: "operate" }} screen={{ view: "operate", contentProps: { ...operate.contentProps, operationTarget, onSelectTarget } }} />)
  expect(screen.getByRole("tablist", { name: copy.operate.view })).toBeInTheDocument()
  const destination = operationTarget === "internal-chat" ? "customer-workbench" : "internal-chat"
  fireEvent.click(screen.getByRole("tab", { name: destination === "internal-chat" ? copy.operate.internalChat : copy.operate.customerQueue }))
  expect(onSelectTarget).toHaveBeenCalledExactlyOnceWith(destination)
  view.unmount()
 })
})



