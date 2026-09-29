import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n/config"
import { describe, expect, it, vi } from "vitest"
import { ContextVersionBlock as ActualContextVersionBlock, type ContextDraft, type ContextVersionBlockCopy } from "./index"

type CopyTranslator = ReturnType<typeof createTranslator<typeof enMessages, "console.agentos.modules">>

/** The settled copy this block draws, resolved from the same module catalog the connected owner reads. */
const copyFor = (t: CopyTranslator): ContextVersionBlockCopy => ({
    "setup": {
        "applyHint": t("setup.applyHint"),
        "applyVersion": (values) => t("setup.applyVersion", values),
        "complete": t("setup.complete"),
        "completeCount": (values) => t("setup.completeCount", values),
        "completeGates": t("setup.completeGates"),
        "confirmRequirement": t("setup.confirmRequirement"),
        "confirmed": t("setup.confirmed"),
        "evidenceRequired": t("setup.evidenceRequired"),
        "continueChat": t("setup.continueChat"),
        "createVersion": t("setup.createVersion"),
        "draftRevision": (values) => t("setup.draftRevision", values),
        "exactTest": t("setup.exactTest"),
        "gatesReview": t("setup.gatesReview"),
        "needsFollowUp": t("setup.needsFollowUp"),
        "noCandidate": t("setup.noCandidate"),
        "noDraft": t("setup.noDraft"),
        "noGates": t("setup.noGates"),
        "notApplied": t("setup.notApplied"),
        "operationRefused": t("setup.operationRefused"),
        "passTestFirst": t("setup.passTestFirst"),
        "reviewContext": t("setup.reviewContext"),
        "reviewSummary": (values) => t("setup.reviewSummary", values),
        "setupGates": t("setup.setupGates"),
        "testPassed": t("setup.testPassed"),
        "testRequired": t("setup.testRequired"),
        "versionActive": (values) => t("setup.versionActive", values),
    },
})

const draft: ContextDraft = { contextId: "context-1", setupSessionId: "setup-1", revision: 1, status: "completed", version: 1, digest: "a".repeat(64), definitionDigest: "d".repeat(64), authorityGeneration: 1, sourceGeneration: 1, retrievalGeneration: 1, summary: "Support context", facts: ["24/7 support"], gates: [{ key: "identity", label: "Business identity", passed: true, ownerConfirmation: false, confirmed: false, citationPolicy: "none" }], exactTestPassed: true, isActive: false }

type ContextVersionBlockFixtureProps = Omit<ComponentProps<typeof ActualContextVersionBlock>, "copy" | "onConfirmRequirement" | "onCreateVersion"> & { readonly locale?: "en" | "vi"; readonly onConfirmRequirement?: ComponentProps<typeof ActualContextVersionBlock>["onConfirmRequirement"]; readonly onCreateVersion?: ComponentProps<typeof ActualContextVersionBlock>["onCreateVersion"] }
const ContextVersionBlockCopyFixture = (props: ContextVersionBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualContextVersionBlock {...props} onCreateVersion={props.onCreateVersion ?? (() => undefined)} onConfirmRequirement={props.onConfirmRequirement ?? (() => undefined)} copy={copyFor(t)} />
}
const ContextVersionBlock = ({ locale = "en", ...props }: ContextVersionBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><ContextVersionBlockCopyFixture {...props} /></NextIntlClientProvider>

const gates = [
    "Business identity", "Products and services", "Support scope", "Customer segments", "Channels", "Hours and SLA",
    "Escalation and handoff", "Prohibited commitments", "Privacy and sensitive data", "Tone and language",
    "Automation policy", "Readiness ownership",
].map((label, index) => ({ key: `gate-${index}`, label, passed: true, ownerConfirmation: false, confirmed: false, citationPolicy: "none" as const }))

const testedDraft: ContextDraft = {
    contextId: "22222222-2222-4222-8222-222222222222",
    setupSessionId: "11111111-1111-4111-8111-111111111111",
    revision: 2,
    status: "completed",
    version: 2,
    digest: "a".repeat(64),
    definitionDigest: "d".repeat(64),
    authorityGeneration: 1,
    sourceGeneration: 1,
    retrievalGeneration: 1,
    summary: "A Vietnamese real-estate Support Desk",
    facts: ["Escalate qualified leads to the sales team"],
    gates,
    exactTestPassed: true,
    isActive: false,
}

describe("ContextVersionBlock", () => {
    it("keeps Apply disabled until the existing immutable guard is ready", () => {
        const onApply = vi.fn()
        const html = render(<ContextVersionBlock activeVersion={null} draft={{ ...draft, exactTestPassed: false }} pending={false} refused={false} onApply={onApply} />).container.innerHTML
        expect(html).toContain("Required before Apply")
        expect(html).toContain("disabled")
        expect(onApply).not.toHaveBeenCalled()
    })

    describe.each(["en", "vi"] as const)("Support Desk Setup journey %s", locale => {
        const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).setup
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
    })

    describe.each(["en", "vi"] as const)("Context copy %s", locale => {
        it("keeps completed context identity and distinguishes untested, active and missing versions", () => {
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules" })).setup
            const untested = render(<ContextVersionBlock locale={locale} activeVersion={null} draft={{ ...draft, exactTestPassed: false }} pending={false} refused={false} onApply={vi.fn()} />).container.innerHTML
            expect(untested).toContain(copy.testRequired)
            expect(untested).toContain("Support context")
            expect(untested).toContain("disabled")
            const missing = render(<ContextVersionBlock locale={locale} activeVersion={null} draft={null} pending={false} refused onApply={vi.fn()} />).container.innerHTML
            expect(missing).toContain(copy.noGates)
            expect(missing).toContain(copy.operationRefused)
            const active = render(<ContextVersionBlock locale={locale} activeVersion={1} draft={{ ...draft, isActive: true }} pending={false} refused={false} onApply={vi.fn()} />).container.innerHTML
            expect(active).toContain(copy.versionActive({ version: 1 }))
            expect(active).toContain("disabled")
        })
    })

    describe.each(["en", "vi"] as const)("Context pending copy %s", locale => {
        it("keeps an otherwise applicable context disabled during its own command", () => {
            const html = render(<ContextVersionBlock locale={locale} activeVersion={null} draft={draft} pending ownPending refused={false} onApply={vi.fn()} />).container.innerHTML
            expect(html).toContain("disabled")
            expect(html).toContain("Support context")
        })
    })

    describe.each(["en", "vi"] as const)("Context actionable guards %s", locale => {
        it("applies only a completed inactive version and keeps incomplete and peer work inert", () => {
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).setup
            const onApply = vi.fn()
            const props = { locale, activeVersion: null, pending: false, refused: false, onApply }
            const view = render(<ContextVersionBlock {...props} draft={{ ...draft, status: "open", version: null, exactTestPassed: false, gates: [{ key: "raw-key", label: "Owner gate", passed: false, ownerConfirmation: false, confirmed: false, citationPolicy: "none" }] }} />)
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
        it("requires and records an explicit owner confirmation action", () => {
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).setup
            const onConfirmRequirement = vi.fn()
            const gate = { ...draft.gates[0]!, ownerConfirmation: true }
            const view = render(<ContextVersionBlock locale={locale} activeVersion={null} draft={{ ...draft, gates: [gate] }} pending={false} refused={false} onApply={vi.fn()} onConfirmRequirement={onConfirmRequirement} />)
            fireEvent.click(screen.getByRole("button", { name: copy.confirmRequirement }))
            expect(onConfirmRequirement).toHaveBeenCalledExactlyOnceWith(gate)
            view.rerender(<ContextVersionBlock locale={locale} activeVersion={null} draft={{ ...draft, gates: [{ ...gate, confirmed: true }] }} pending={false} refused={false} onApply={vi.fn()} onConfirmRequirement={onConfirmRequirement} />)
            expect(screen.getByText(copy.confirmed)).toBeInTheDocument()
        })
        it("creates an immutable version before Test and Apply", () => {
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).setup
            const onCreateVersion = vi.fn()
            render(<ContextVersionBlock locale={locale} activeVersion={null} draft={{ ...draft, status: "ready", version: null, exactTestPassed: false }} pending={false} refused={false} onApply={vi.fn()} onCreateVersion={onCreateVersion} />)
            fireEvent.click(screen.getByRole("button", { name: copy.createVersion }))
            expect(onCreateVersion).toHaveBeenCalledTimes(1)
        })
    })
})