import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { ContextVersionBlock as ActualContextVersionBlock, type ContextDraft } from "./ContextVersionBlock"
import { PrivateSetupChatBlock as ActualPrivateSetupChatBlock } from "./PrivateSetupChatBlock"
import { exactTestSurfaceFor } from "@/components/pages/AgentOSSolutionModulePage/component"

const gates = [
    "Business identity", "Products and services", "Support scope", "Customer segments", "Channels", "Hours and SLA",
    "Escalation and handoff", "Prohibited commitments", "Privacy and sensitive data", "Tone and language",
    "Automation policy", "Readiness ownership",
].map((label, index) => ({ key: `gate-${index}`, label, passed: true }))

const testedDraft: ContextDraft = {
    contextId: "22222222-2222-4222-8222-222222222222",
    setupSessionId: "11111111-1111-4111-8111-111111111111",
    revision: 2,
    status: "completed",
    version: 2,
    digest: "a".repeat(64),
    summary: "A Vietnamese real-estate Support Desk",
    facts: ["Escalate qualified leads to the sales team"],
    gates,
    exactTestPassed: true,
    isActive: false,
}

describe.each(["en", "vi"] as const)("Support Desk Setup journey %s", locale => {
    const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules" })).setup
    beforeAll(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) })
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

    it("permits Apply only after the exact Setup digest has trusted Test evidence", () => {
        const apply = vi.fn()
        const view = render(<ContextVersionBlock locale={locale}
            activeVersion={1}
            draft={testedDraft}
            pending={false}
            refused={false}
            onApply={apply}
        />)

        expect(screen.getByText(copy.completeCount({ passed: 12, total: 12 }))).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: copy.applyVersion({ version: 2 }) }))
        expect(apply).toHaveBeenCalledTimes(1)

        view.rerender(<ContextVersionBlock locale={locale}
            activeVersion={1}
            draft={{ ...testedDraft, exactTestPassed: false }}
            pending={false}
            refused={false}
            onApply={apply}
        />)
        expect(screen.getByRole("button", { name: copy.passTestFirst })).toBeDisabled()
    })

    it("does not attach stale Test evidence to a different Setup draft", () => {
        const stale = {
            run: {
                setupSessionId: "33333333-3333-4333-8333-333333333333",
                draftDigest: "b".repeat(64),
            },
            assertions: [{ id: "assertion-1" }],
        } as never
        const exact = {
            run: {
                setupSessionId: testedDraft.setupSessionId,
                draftDigest: testedDraft.digest,
            },
            assertions: [{ id: "assertion-2" }],
        } as never

        expect(exactTestSurfaceFor(stale, testedDraft)).toBeNull()
        expect(exactTestSurfaceFor(exact, testedDraft)).toBe(exact)
        expect(exactTestSurfaceFor(exact, { ...testedDraft, digest: null })).toBeNull()
    })
})
type ContextVersionBlockFixtureProps = Omit<ComponentProps<typeof ActualContextVersionBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const ContextVersionBlockCopyFixture = (props: ContextVersionBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualContextVersionBlock {...props} copy={buildModulePageCopy(t)} />
}
const ContextVersionBlock = ({ locale = "en", ...props }: ContextVersionBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><ContextVersionBlockCopyFixture {...props} /></NextIntlClientProvider>


type PrivateSetupChatBlockFixtureProps = Omit<ComponentProps<typeof ActualPrivateSetupChatBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const PrivateSetupChatBlockCopyFixture = (props: PrivateSetupChatBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualPrivateSetupChatBlock {...props} copy={buildModulePageCopy(t)} />
}
const PrivateSetupChatBlock = ({ locale = "en", ...props }: PrivateSetupChatBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><PrivateSetupChatBlockCopyFixture {...props} /></NextIntlClientProvider>
