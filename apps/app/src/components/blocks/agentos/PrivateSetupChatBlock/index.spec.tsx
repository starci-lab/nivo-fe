import { renderToStaticMarkup } from "react-dom/server"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, createTranslator, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n/config"
/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { PrivateSetupChatBlock as ActualPrivateSetupChatBlock, type PrivateSetupChatBlockCopy, type SetupRevision } from "./index"

type CopyTranslator = ReturnType<typeof createTranslator<typeof enMessages, "console.agentos.modules">>

/** The settled copy this block draws, resolved from the same module catalog the connected owner reads. */
const copyFor = (t: CopyTranslator): PrivateSetupChatBlockCopy => ({
    "setup": {
        "actor": {
            "assistant": t("setup.actor.assistant"),
            "system": t("setup.actor.system"),
            "user": t("setup.actor.user"),
        },
        "emptyDescription": t("setup.emptyDescription"),
        "emptyTitle": t("setup.emptyTitle"),
        "messageHint": t("setup.messageHint"),
        "messageLabel": t("setup.messageLabel"),
        "messagePlaceholder": t("setup.messagePlaceholder"),
        "messageRefused": t("setup.messageRefused"),
        "messageUnconfirmed": t("setup.messageUnconfirmed"),
        "messages": t("setup.messages"),
        "openVersions": t("setup.openVersions"),
        "private": t("setup.private"),
        "privateChat": t("setup.privateChat"),
        "revision": (values) => t("setup.revision", values),
        "revisionComplete": t("setup.revisionComplete"),
        "revisionStatus": {
            "completed": t("setup.revisionStatus.completed"),
            "open": t("setup.revisionStatus.open"),
            "ready": t("setup.revisionStatus.ready"),
            "superseded": t("setup.revisionStatus.superseded"),
            "unavailable": t("setup.revisionStatus.unavailable"),
        },
        "send": t("setup.send"),
    },
})

const revisions: ReadonlyArray<SetupRevision> = [{ id: "setup-1", revision: 1, status: "open" }]

type PrivateSetupChatBlockFixtureProps = Omit<ComponentProps<typeof ActualPrivateSetupChatBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const PrivateSetupChatBlockCopyFixture = (props: PrivateSetupChatBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualPrivateSetupChatBlock {...props} copy={copyFor(t)} />
}
const PrivateSetupChatBlock = ({ locale = "en", ...props }: PrivateSetupChatBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><PrivateSetupChatBlockCopyFixture {...props} /></NextIntlClientProvider>

describe("PrivateSetupChatBlock", () => {
    beforeAll(() => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia
    })

    describe.each(["en", "vi"] as const)("Support Desk Setup journey %s", locale => {
        const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).setup
        it("keeps completed Setup history private and starts a separate revision", () => {
            const selectRevision = vi.fn()
            const startRevision = vi.fn()
            const openVersions = vi.fn()
            render(<PrivateSetupChatBlock locale={locale}
                messages={[{ id: "message-1", role: "assistant", content: "What SLA should I follow?" }]}
                revisions={[
                    { id: "revision-1", revision: 1, status: "completed" },
                    { id: "revision-2", revision: 2, status: "completed" },
                ]}
                selectedRevisionId="revision-2"
                canSend={false}
                canStartRevision
                onSelectRevision={selectRevision}
                onStartRevision={startRevision}
                onSend={vi.fn()}
                onOpenVersions={openVersions}
            />)

            expect(screen.queryByLabelText(copy.messageLabel)).toBeNull()
            expect(screen.queryByRole("button", { name: copy.send })).toBeNull()
            fireEvent.click(screen.getByRole("button", { name: copy.openVersions }))
            expect(openVersions).toHaveBeenCalledTimes(1)
            expect(selectRevision).not.toHaveBeenCalled()
            expect(startRevision).not.toHaveBeenCalled()
        })
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
    it("keeps the send action beside the field and bounds the chat host so the composer stays in reach", () => {
        const { container } = render(<PrivateSetupChatBlock messages={[{ id: "u", role: "user", content: "Owner question" }]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="" onDraft={vi.fn()} onSend={vi.fn()} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        const send = screen.getByRole("button", { name: "Send" })
        const row = send.parentElement
        expect(row?.getAttribute("data-contract")).toBe("GAP-3")
        expect(row?.querySelector("[data-contract='MEASURE-2'] input[name='setupMessage']")).not.toBeNull()
        expect(container.querySelector("[data-contract='MEASURE-2 MEASURE-7']")).not.toBeNull()
        expect(screen.getByText(enMessages.console.agentos.modules.setup.messageHint)).toBeInTheDocument()
    })
    it("prevents duplicate submit while its own append is pending", () => {
        const onSend = vi.fn()
        render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="A policy" ownPending onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).not.toHaveBeenCalled()
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    })

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

    describe.each(["en", "vi"] as const)("Setup missing and unconfirmed %s", locale => {
        it("retains an unconfirmed draft and opens version history from read-only mode", () => {
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.setup
            const onOpenVersions = vi.fn()
            const props = { locale, messages: [], revisions: [], selectedRevisionId: "missing", canStartRevision: false, onSend: vi.fn(), onSelectRevision: vi.fn(), onStartRevision: vi.fn(), onOpenVersions }
            const view = render(<PrivateSetupChatBlock {...props} canSend draft="Durable owner text" unconfirmed />)
            expect(screen.getByText(copy.revisionStatus.unavailable, { exact: false })).toBeInTheDocument()
            expect(screen.getByText(copy.messageUnconfirmed)).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: copy.messageLabel })).toHaveValue("Durable owner text")
            view.rerender(<PrivateSetupChatBlock {...props} canSend={false} />)
            expect(screen.queryByRole("textbox")).toBeNull()
            fireEvent.click(screen.getByRole("button", { name: copy.openVersions }))
            expect(onOpenVersions).toHaveBeenCalledExactlyOnceWith()
            view.unmount()
        })
    })
})