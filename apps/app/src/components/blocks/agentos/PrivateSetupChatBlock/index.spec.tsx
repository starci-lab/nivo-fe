import { renderToStaticMarkup } from "react-dom/server"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { PrivateSetupChatBlock as ActualPrivateSetupChatBlock, type SetupRevision } from "./index"

const revisions: ReadonlyArray<SetupRevision> = [{ id: "setup-1", revision: 1, status: "open" }]

describe("PrivateSetupChatBlock", () => {
    beforeAll(() => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia
    })
    it("retains a controlled draft when the append is refused", () => {
        const onSend = vi.fn()
        const { rerender } = render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="Keep this policy" onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).toHaveBeenCalledWith("Keep this policy")
        rerender(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="Keep this policy" refused onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        expect(screen.getByDisplayValue("Keep this policy")).toBeInTheDocument()
        expect(screen.getByText(/was refused/iu)).toBeInTheDocument()
    })

    it("keeps the editable composer visible but disabled during peer work", () => {
        const onSend = vi.fn()
        render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="A policy" ownPending={false} peerDisabled onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        expect(screen.getByRole("textbox", { name: "Message to Nivo" })).toBeDisabled()
        expect(screen.queryByText(/revision is complete/)).toBeNull()
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).not.toHaveBeenCalled()
    })
    it("prevents duplicate submit while its own append is pending", () => {
        const onSend = vi.fn()
        render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="A policy" ownPending onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).not.toHaveBeenCalled()
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    })
})

type PrivateSetupChatBlockFixtureProps = Omit<ComponentProps<typeof ActualPrivateSetupChatBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const PrivateSetupChatBlockCopyFixture = (props: PrivateSetupChatBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualPrivateSetupChatBlock {...props} copy={buildModulePageCopy(t)} />
}
const PrivateSetupChatBlock = ({ locale = "en", ...props }: PrivateSetupChatBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><PrivateSetupChatBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Private setup copy %s", locale => {
 it("preserves the entered message and passes its raw text once", () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.setup
  const onSend = vi.fn()
  const view = render(<PrivateSetupChatBlock locale={locale} messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="Owner policy" onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
  expect(screen.getByRole("textbox", { name: copy.messageLabel })).toHaveValue("Owner policy")
  fireEvent.submit(screen.getByRole("button", { name: copy.send }).closest("form")!)
  expect(onSend).toHaveBeenCalledExactlyOnceWith("Owner policy")
  view.unmount()
 })
})

describe.each(["en", "vi"] as const)("Setup identity states %s", locale => {
 it.each(["open", "ready", "completed", "superseded"] as const)("localizes %s and every role without rewriting messages", status => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.setup
  const html = renderToStaticMarkup(<PrivateSetupChatBlock locale={locale} messages={[{ id: "u", role: "user", content: "Owner question" }, { id: "a", role: "assistant", content: "Business answer" }, { id: "s", role: "system", content: "Raw system detail" }]} revisions={[{ id: "revision-raw", revision: 2, status }]} selectedRevisionId="revision-raw" canSend={false} canStartRevision={false} onSend={vi.fn()} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
  expect(html).toContain(copy.revisionStatus[status])
  for (const role of ["user", "assistant", "system"] as const) expect(html).toContain(copy.actor[role])
  expect(html).toContain("Owner question")
  expect(html).toContain("Business answer")
  expect(html).toContain("Raw system detail")
 })
})
