import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n/config"
import { describe, expect, it, vi } from "vitest"
import { ModuleRouteShellBlock as ActualModuleRouteShellBlock, type ModuleRouteShellBlockCopy } from "./index"

type CopyTranslator = (key: string, values?: Readonly<Record<string, string | number>>) => string

/** The settled copy this block draws, resolved from the same module catalog the connected owner reads. */
const copyFor = (t: CopyTranslator): ModuleRouteShellBlockCopy => ({
    shell: {
        activeContext: (values) => t("shell.activeContext", values),
        boundContext: (values) => t("shell.boundContext", values),
        channelConnected: t("shell.channelConnected"),
        channelDisconnected: t("shell.channelDisconnected"),
        controllerAttention: t("shell.controllerAttention"),
        controllerHealthy: t("shell.controllerHealthy"),
        conversation: (values) => t("shell.conversation", values),
        diagnostics: t("shell.diagnostics"),
        genericAgent: t("shell.genericAgent"),
        kind: {
            accounting: t("shell.kind.accounting"),
            "customer-support": t("shell.kind.customer-support"),
            "generic-agent": t("shell.kind.generic-agent"),
            research: t("shell.kind.research"),
            scheduling: t("shell.kind.scheduling"),
        },
        live: t("shell.live"),
        loading: t("shell.loading"),
        modules: t("shell.modules"),
        noContextApplied: t("shell.noContextApplied"),
        noExecuteSession: t("shell.noExecuteSession"),
        operate: t("shell.operate"),
        path: t("shell.path"),
        primaryOperations: t("shell.primaryOperations"),
        reading: t("shell.reading"),
        refused: t("shell.refused"),
        sections: t("shell.sections"),
        settings: t("shell.settings"),
        setup: t("shell.setup"),
        telegramConnected: t("shell.telegramConnected"),
        test: t("shell.test"),
        unavailable: t("shell.unavailable"),
        unknownKind: (values) => t("shell.unknownKind", values),
        unknownStatus: (values) => t("shell.unknownStatus", values),
        workspace: (values) => t("shell.workspace", values),
    },
})

type ModuleRouteShellBlockFixtureProps = Omit<ComponentProps<typeof ActualModuleRouteShellBlock>, "copy"> & {
    readonly locale?: "en" | "vi"
}
const ModuleRouteShellBlockCopyFixture = (props: ModuleRouteShellBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualModuleRouteShellBlock {...props} copy={copyFor(t)} />
}
const ModuleRouteShellBlock = ({ locale = "en", ...props }: ModuleRouteShellBlockFixtureProps) => (
    <NextIntlClientProvider
        locale={locale}
        messages={locale === "en" ? enMessages : viMessages}
        timeZone={TIME_ZONE}
        onError={(error) => {
            throw error
        }}
    >
        <ModuleRouteShellBlockCopyFixture {...props} />
    </NextIntlClientProvider>
)

describe("ModuleRouteShellBlock", () => {
    it("uses the human kind heading while retaining a machine key", () => {
        const html = render(
            <ModuleRouteShellBlock
                workspaceLabel="Workspace"
                moduleName="custom:1234567890abcdef1234567890"
                moduleKind="generic-agent"
                lifecycleLabel="ready"
                contextVersion="not applied"
                channelLabel="Channel not connected"
                controllerLabel="Controller healthy"
                activeView="setup"
                content={() => <div>Setup</div>}
                contentProps={{}}
                onBackToModules={() => undefined}
                onNavigate={() => undefined}
            />,
        ).container.innerHTML
        expect(html).toContain("Generic agent")
        expect(html).toContain("custom:1234567890abcdef1234567890")
    })

    describe.each(["en", "vi"] as const)("Module shell copy %s", (locale) => {
        it.each(["generic-agent", "__proto__", "constructor"])("preserves machine identity for %s", (moduleKind) => {
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
            const html = render(
                <ModuleRouteShellBlock
                    locale={locale}
                    workspaceLabel="Raw workspace"
                    moduleName="custom:1234567890abcdef1234567890"
                    moduleKind={moduleKind}
                    lifecycleLabel="Raw status"
                    contextVersion="v1"
                    channelLabel="Raw channel"
                    controllerLabel="Raw controller"
                    activeView="setup"
                    content={() => <div>Raw body</div>}
                    contentProps={{}}
                    onBackToModules={() => undefined}
                    onNavigate={() => undefined}
                />,
            ).container.innerHTML
            expect(html).toContain(copy.modules)
            expect(html).toContain("custom:1234567890abcdef1234567890")
            expect(html).toContain(moduleKind === "generic-agent" ? copy.genericAgent : moduleKind)
        })
    })

    describe.each(["en", "vi"] as const)("Shell display names and navigation %s", (locale) => {
        it("uses the supplied display name and preserves raw navigation destinations", () => {
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
            const onNavigate = vi.fn()
            const onBackToModules = vi.fn()
            const view = render(
                <ModuleRouteShellBlock
                    locale={locale}
                    workspaceLabel="Owner workspace"
                    moduleName="Owner display name"
                    moduleKind="generic-agent"
                    lifecycleLabel="Raw lifecycle"
                    contextVersion="v7"
                    channelLabel="Raw channel"
                    controllerLabel="Raw controller"
                    activeView="setup"
                    content={() => <div>Owned body</div>}
                    contentProps={{}}
                    onBackToModules={onBackToModules}
                    onNavigate={onNavigate}
                />,
            )
            expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Owner display name")
            for (const destination of ["test", "operate", "settings", "diagnostics"] as const)
                fireEvent.click(screen.getByRole("tab", { name: copy[destination] }))
            expect(onNavigate.mock.calls).toEqual([["test"], ["operate"], ["settings"], ["diagnostics"]])
            fireEvent.click(screen.getByText(copy.modules))
            expect(onBackToModules).toHaveBeenCalledTimes(1)
            view.unmount()
        })
    })

    describe.each(["en", "vi"] as const)("Module back navigation %s", (locale) => {
        it("returns to Modules while retaining the human heading and full machine key", () => {
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
            const onBackToModules = vi.fn()
            const view = render(
                <ModuleRouteShellBlock
                    locale={locale}
                    workspaceLabel="Workspace with a long identity"
                    moduleName="custom:1234567890abcdef1234567890"
                    moduleKind="generic-agent"
                    lifecycleLabel="ready"
                    contextVersion="not applied"
                    channelLabel="Channel not connected"
                    controllerLabel="Controller healthy"
                    activeView="setup"
                    content={() => <div>Setup body</div>}
                    contentProps={{}}
                    onBackToModules={onBackToModules}
                    onNavigate={() => undefined}
                />,
            )
            expect(screen.getByRole("heading", { level: 1, name: copy.genericAgent })).toBeInTheDocument()
            expect(screen.getByText("custom:1234567890abcdef1234567890")).toBeInTheDocument()
            expect(screen.getByText("Setup body")).toBeInTheDocument()
            const backLink = screen.getByRole("link", { name: copy.modules })
            expect(backLink).toHaveTextContent(copy.modules)
            fireEvent.click(backLink)
            expect(onBackToModules).toHaveBeenCalledTimes(1)
            view.unmount()
        })
    })
})
