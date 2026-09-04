import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ContextVersionBlock as ActualContextVersionBlock, type ContextDraft } from "./index"

const draft: ContextDraft = { contextId: "context-1", setupSessionId: "setup-1", revision: 1, status: "completed", version: 1, digest: "a".repeat(64), summary: "Support context", facts: ["24/7 support"], gates: [{ key: "identity", label: "Business identity", passed: true }], exactTestPassed: true, isActive: false }

describe("ContextVersionBlock", () => {
    it("keeps Apply disabled until the existing immutable guard is ready", () => {
        const onApply = vi.fn()
        const html = renderToStaticMarkup(<ContextVersionBlock activeVersion={null} draft={{ ...draft, exactTestPassed: false }} pending={false} refused={false} onApply={onApply} />)
        expect(html).toContain("Required before Apply")
        expect(html).toContain("disabled")
        expect(onApply).not.toHaveBeenCalled()
    })
})

type ContextVersionBlockFixtureProps = Omit<ComponentProps<typeof ActualContextVersionBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const ContextVersionBlockCopyFixture = (props: ContextVersionBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualContextVersionBlock {...props} copy={buildModulePageCopy(t)} />
}
const ContextVersionBlock = ({ locale = "en", ...props }: ContextVersionBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><ContextVersionBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Context copy %s", locale => {
 it("keeps completed context identity and distinguishes untested, active and missing versions", () => {
  const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules" })).setup
  const untested = renderToStaticMarkup(<ContextVersionBlock locale={locale} activeVersion={null} draft={{ ...draft, exactTestPassed: false }} pending={false} refused={false} onApply={vi.fn()} />)
  expect(untested).toContain(copy.testRequired)
  expect(untested).toContain("Support context")
  expect(untested).toContain("disabled")
  const missing = renderToStaticMarkup(<ContextVersionBlock locale={locale} activeVersion={null} draft={null} pending={false} refused onApply={vi.fn()} />)
  expect(missing).toContain(copy.noGates)
  expect(missing).toContain(copy.operationRefused)
  const active = renderToStaticMarkup(<ContextVersionBlock locale={locale} activeVersion={1} draft={{ ...draft, isActive: true }} pending={false} refused={false} onApply={vi.fn()} />)
  expect(active).toContain(copy.versionActive({ version: 1 }))
  expect(active).toContain("disabled")
 })
})

describe.each(["en", "vi"] as const)("Context pending copy %s", locale => {
 it("keeps an otherwise applicable context disabled during its own command", () => {
  const html = renderToStaticMarkup(<ContextVersionBlock locale={locale} activeVersion={null} draft={draft} pending ownPending refused={false} onApply={vi.fn()} />)
  expect(html).toContain("disabled")
  expect(html).toContain("Support context")
 })
})


describe.each(["en", "vi"] as const)("Context actionable guards %s", locale => {
 it("applies only a completed inactive version and keeps incomplete and peer work inert", () => {
  const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).setup
  const onApply = vi.fn()
  const props = { locale, activeVersion: null, pending: false, refused: false, onApply }
  const view = render(<ContextVersionBlock {...props} draft={{ ...draft, status: "open", version: null, exactTestPassed: false, gates: [{ key: "raw-key", label: "Owner gate", passed: false }] }} />)
  expect(screen.getByText(copy.needsFollowUp)).toBeInTheDocument()
  expect(screen.getByText("Owner gate")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.completeGates }))
  expect(onApply).not.toHaveBeenCalled()
  view.rerender(<ContextVersionBlock {...props} draft={draft} peerDisabled />)
  expect(screen.getByRole("button", { name: copy.applyVersion({ version: 1 }) })).toBeDisabled()
  fireEvent.click(screen.getByRole("button", { name: copy.applyVersion({ version: 1 }) }))
  expect(onApply).not.toHaveBeenCalled()
  view.rerender(<ContextVersionBlock {...props} draft={draft} />)
  expect(screen.getByText("Support context")).toBeInTheDocument()
  expect(screen.getByText("24/7 support")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.applyVersion({ version: 1 }) }))
  expect(onApply).toHaveBeenCalledTimes(1)
  view.rerender(<ContextVersionBlock {...props} activeVersion={1} draft={{ ...draft, isActive: true }} />)
  expect(screen.getByRole("button", { name: copy.versionActive({ version: "1" }) })).toBeDisabled()
  view.unmount()
 })
})

