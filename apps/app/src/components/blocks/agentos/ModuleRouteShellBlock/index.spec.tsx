import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ModuleRouteShellBlock as ActualModuleRouteShellBlock } from "./index"

describe("ModuleRouteShellBlock", () => {
    it("uses the human kind heading while retaining a machine key", () => {
        const html = renderToStaticMarkup(<ModuleRouteShellBlock workspaceLabel="Workspace" moduleName="custom:1234567890abcdef1234567890" moduleKind="generic-agent" lifecycleLabel="ready" contextVersion="not applied" channelLabel="Channel not connected" controllerLabel="Controller healthy" activeView="setup" content={() => <div>Setup</div>} contentProps={{}} onBackToModules={() => undefined} onNavigate={() => undefined} />)
        expect(html).toContain("Generic agent")
        expect(html).toContain("custom:1234567890abcdef1234567890")
    })
})

type ModuleRouteShellBlockFixtureProps = Omit<ComponentProps<typeof ActualModuleRouteShellBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const ModuleRouteShellBlockCopyFixture = (props: ModuleRouteShellBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualModuleRouteShellBlock {...props} copy={buildModulePageCopy(t)} />
}
const ModuleRouteShellBlock = ({ locale = "en", ...props }: ModuleRouteShellBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><ModuleRouteShellBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Module shell copy %s", locale => {
 it.each(["generic-agent", "__proto__", "constructor"])("preserves machine identity for %s", moduleKind => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
  const html = renderToStaticMarkup(<ModuleRouteShellBlock locale={locale} workspaceLabel="Raw workspace" moduleName="custom:1234567890abcdef1234567890" moduleKind={moduleKind} lifecycleLabel="Raw status" contextVersion="v1" channelLabel="Raw channel" controllerLabel="Raw controller" activeView="setup" content={() => <div>Raw body</div>} contentProps={{}} onBackToModules={() => undefined} onNavigate={() => undefined} />)
  expect(html).toContain(copy.modules)
  expect(html).toContain("custom:1234567890abcdef1234567890")
  expect(html).toContain(moduleKind === "generic-agent" ? copy.genericAgent : moduleKind)
 })
})


describe.each(["en", "vi"] as const)("Shell display names and navigation %s", locale => {
 it("uses the supplied display name and preserves raw navigation destinations", () => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
  const onNavigate = vi.fn(); const onBackToModules = vi.fn()
  const view = render(<ModuleRouteShellBlock locale={locale} workspaceLabel="Owner workspace" moduleName="Owner display name" moduleKind="generic-agent" lifecycleLabel="Raw lifecycle" contextVersion="v7" channelLabel="Raw channel" controllerLabel="Raw controller" activeView="setup" content={() => <div>Owned body</div>} contentProps={{}} onBackToModules={onBackToModules} onNavigate={onNavigate} />)
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Owner display name")
  for (const destination of ["test", "operate", "settings", "diagnostics"] as const) fireEvent.click(screen.getByRole("tab", { name: copy[destination] }))
  expect(onNavigate.mock.calls).toEqual([["test"], ["operate"], ["settings"], ["diagnostics"]])
  fireEvent.click(screen.getByText(copy.modules))
  expect(onBackToModules).toHaveBeenCalledTimes(1)
  view.unmount()
 })
})


describe.each(["en", "vi"] as const)("Module back navigation %s", locale => {
 it("returns to Modules while retaining the human heading and full machine key", () => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
  const onBackToModules = vi.fn()
  const view = render(<ModuleRouteShellBlock locale={locale} workspaceLabel="Workspace with a long identity" moduleName="custom:1234567890abcdef1234567890" moduleKind="generic-agent" lifecycleLabel="ready" contextVersion="not applied" channelLabel="Channel not connected" controllerLabel="Controller healthy" activeView="setup" content={() => <div>Setup body</div>} contentProps={{}} onBackToModules={onBackToModules} onNavigate={() => undefined} />)
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
