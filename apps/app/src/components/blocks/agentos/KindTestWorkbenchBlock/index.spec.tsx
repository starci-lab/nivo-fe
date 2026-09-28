import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n/config"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleTestContract } from "@/modules/api/console"
import { DEFAULT_TEST_WORKBENCH_REGISTRY, KindTestWorkbenchBlock as ActualKindTestWorkbenchBlock, type KindTestWorkbenchBlockCopy } from "."

type CopyTranslator = ReturnType<typeof createTranslator<typeof enMessages, "console.agentos.modules">>

/** The settled copy this block draws, resolved from the same module catalog the connected owner reads. */
const copyFor = (t: CopyTranslator): KindTestWorkbenchBlockCopy => ({
    "kindTest": {
        "accounting": t("runtime.kindTest.accounting"),
        "boundary": t("runtime.kindTest.boundary"),
        "boundaryDetail": (values) => t("runtime.kindTest.boundaryDetail", values),
        "calendar": t("runtime.kindTest.calendar"),
        "citation": t("runtime.kindTest.citation"),
        "closed": t("runtime.kindTest.closed"),
        "cockpit": t("runtime.kindTest.cockpit"),
        "context": t("runtime.kindTest.context"),
        "conversation": t("runtime.kindTest.conversation"),
        "default": t("runtime.kindTest.default"),
        "fakeHint": t("runtime.kindTest.fakeHint"),
        "generic": t("runtime.kindTest.generic"),
        "local": t("runtime.kindTest.local"),
        "noRegistration": t("runtime.kindTest.noRegistration"),
        "pending": t("runtime.kindTest.pending"),
        "ready": t("runtime.kindTest.ready"),
        "refused": t("runtime.kindTest.refused"),
        "run": (values) => t("runtime.kindTest.run", values),
        "runUnavailable": t("runtime.kindTest.runUnavailable"),
        "safety": t("runtime.kindTest.safety"),
        "sandbox": t("runtime.kindTest.sandbox"),
        "scenario": t("runtime.kindTest.scenario"),
        "state": t("runtime.kindTest.state"),
        "unavailable": t("runtime.kindTest.unavailable"),
    },
})

const contractFor = (workbenchKey: string): AgentosModuleTestContract => ({
    workbench: { key: workbenchKey, version: "1.0.0" },
    contract: { key: `${workbenchKey}-contract`, version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [{
        key: "safe-fixture",
        label: "Safe fixture",
        description: "Fake input only",
        fixture: { value: "fixture" },
        assertions: [{ key: "present", label: "Value is present", source: "input", path: "value", operator: "present", severity: "fail" }],
    }],
})

type KindTestWorkbenchBlockFixtureProps = Omit<ComponentProps<typeof ActualKindTestWorkbenchBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const KindTestWorkbenchBlockCopyFixture = (props: KindTestWorkbenchBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualKindTestWorkbenchBlock {...props} copy={copyFor(t)} />
}
const KindTestWorkbenchBlock = ({ locale = "en", ...props }: KindTestWorkbenchBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><KindTestWorkbenchBlockCopyFixture {...props} /></NextIntlClientProvider>

describe("KindTestWorkbenchBlock", () => {
    it.each([
        ["conversation-sandbox", "Conversation test"],
        ["accounting-fixture", "Accounting fixture test"],
        ["calendar-sandbox", "Calendar sandbox test"],
        ["citation-check", "Citation grounding test"],
    ])("resolves trusted Test workbench %s", (workbenchKey, expectedTitle) => {
        const html = renderToStaticMarkup(
            <KindTestWorkbenchBlock
                contract={contractFor(workbenchKey)}
                contextLabel="Context v2 · candidate"
                targetReady
                pending={false}
                registry={DEFAULT_TEST_WORKBENCH_REGISTRY}
                onRun={vi.fn()}
            />,
        )
        expect(html).toContain(expectedTitle)
        expect(html).toContain("Fake input only")
        expect(html).toContain("cannot call live channels")
    })

    it("fails closed for an unregistered workbench", () => {
        const html = renderToStaticMarkup(
            <KindTestWorkbenchBlock
                contract={contractFor("untrusted-workbench")}
                contextLabel="Context v1"
                targetReady
                pending={false}
                registry={DEFAULT_TEST_WORKBENCH_REGISTRY}
                onRun={vi.fn()}
            />,
        )
        expect(html).toContain("Test workbench unavailable")
        expect(html).toContain("no test was executed")
    })

    describe.each(["en", "vi"] as const)("Kind test copy %s", locale => {
        it.each(["conversation-sandbox", "accounting-fixture", "calendar-sandbox", "citation-check", "generic-sandbox", "missing"])("renders %s with its real fixture and fail-closed fallback", workbenchKey => {
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.kindTest
            const html = renderToStaticMarkup(<KindTestWorkbenchBlock locale={locale} contract={contractFor(workbenchKey)} contextLabel="Untranslated context" targetReady pending={false} registry={DEFAULT_TEST_WORKBENCH_REGISTRY} onRun={vi.fn()} />)
            expect(html).toContain(workbenchKey === "missing" ? copy.unavailable : "Safe fixture")
            expect(html).toContain(workbenchKey === "missing" ? copy.closed : copy.fakeHint)
        })
    })

    describe.each(["en", "vi"] as const)("Scenario override actions %s", locale => {
        it.each([
            ["12.5", " TRUE ", "[1,2]", 12.5, true, [1, 2]],
            ["not-numeric", "false", " first, ,second ", "not-numeric", false, ["first", "second"]],
            ["3", "no", "{}", 3, false, "{}"],
        ] as const)("preserves typed override parsing for %s", (numberInput, booleanInput, arrayInput, numberValue, booleanValue, arrayValue) => {
            const base = contractFor("generic-sandbox")
            const contract = { ...base, scenarios: [{ ...base.scenarios[0]!, fixture: { nested: { amount: 1 }, approved: false, items: ["original"] } }] }
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).kindTest
            const onRun = vi.fn()
            const props = { locale, contract, contextLabel: "Raw context", pending: false, registry: DEFAULT_TEST_WORKBENCH_REGISTRY, onRun }
            const view = render(<KindTestWorkbenchBlock {...props} targetReady={false} />)
            expect(screen.getByRole("textbox", { name: "nested.amount" })).toBeDisabled()
            fireEvent.click(screen.getByRole("button", { name: copy.run({ scenario: "Safe fixture" }) }))
            expect(onRun).not.toHaveBeenCalled()
            view.rerender(<KindTestWorkbenchBlock {...props} targetReady />)
            fireEvent.change(screen.getByRole("textbox", { name: "nested.amount" }), { target: { value: numberInput } })
            fireEvent.change(screen.getByRole("textbox", { name: "approved" }), { target: { value: booleanInput } })
            fireEvent.change(screen.getByRole("textbox", { name: "items" }), { target: { value: arrayInput } })
            fireEvent.click(screen.getByRole("button", { name: copy.run({ scenario: "Safe fixture" }) }))
            expect(onRun).toHaveBeenCalledExactlyOnceWith("safe-fixture", { nested: { amount: numberValue }, approved: booleanValue, items: arrayValue })
            expect(contract.scenarios[0]!.fixture).toEqual({ nested: { amount: 1 }, approved: false, items: ["original"] })
            view.unmount()
        })
    })

    describe.each(["en", "vi"] as const)("Scenario local selection %s", locale => {
        it("resets overrides on scenario selection and reports the exact selected key", () => {
            const first = contractFor("generic-sandbox")
            const contract = { ...first, scenarios: [...first.scenarios, { ...first.scenarios[0]!, key: "second/raw", label: "Second owner fixture", fixture: { value: "Second default" } }] }
            const onRun = vi.fn(); const onSelectScenario = vi.fn()
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).kindTest
            const view = render(<KindTestWorkbenchBlock locale={locale} contract={contract} contextLabel="Raw context" targetReady pending={false} registry={DEFAULT_TEST_WORKBENCH_REGISTRY} onRun={onRun} onSelectScenario={onSelectScenario} />)
            fireEvent.change(screen.getByRole("textbox", { name: "value" }), { target: { value: "First override" } })
            fireEvent.click(screen.getByRole("radio", { name: "Second owner fixture" }))
            expect(onSelectScenario).toHaveBeenCalledExactlyOnceWith("second/raw")
            fireEvent.click(screen.getByRole("button", { name: copy.run({ scenario: "Second owner fixture" }) }))
            expect(onRun).toHaveBeenCalledExactlyOnceWith("second/raw", {})
            expect(screen.getByRole("textbox", { name: "value" })).toHaveAttribute("placeholder", JSON.stringify("Second default"))
            view.unmount()
        })
    })

    describe.each(["en", "vi"] as const)("Scenario registration boundary states %s", locale => {
        it("renders no runnable surface without scenarios and falls back from a missing selection", () => {
            const contract = contractFor("generic-sandbox")
            const onRun = vi.fn()
            const copy = copyFor(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } })).kindTest
            const props = { locale, contextLabel: "Raw context", targetReady: true, pending: false, registry: DEFAULT_TEST_WORKBENCH_REGISTRY, onRun }
            const view = render(<KindTestWorkbenchBlock {...props} contract={{ ...contract, scenarios: [] }} />)
            expect(view.container).toBeEmptyDOMElement()
            view.rerender(<KindTestWorkbenchBlock {...props} contract={contract} selectedScenarioKey="missing/raw" />)
            fireEvent.click(screen.getByRole("button", { name: copy.run({ scenario: "Safe fixture" }) }))
            expect(onRun).toHaveBeenCalledExactlyOnceWith("safe-fixture", {})
            view.unmount()
        })
        it("uses the published registry extension and default heading without inventing fixture fields", () => {
            const base = contractFor("registered-domain")
            const contract = { ...base, scenarios: [{ ...base.scenarios[0]!, fixture: {} }] }
            const registry = { ...DEFAULT_TEST_WORKBENCH_REGISTRY, "registered-domain": DEFAULT_TEST_WORKBENCH_REGISTRY["generic-sandbox"]! }
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.kindTest
            const onRun = vi.fn()
            const view = render(<KindTestWorkbenchBlock locale={locale} contract={contract} contextLabel="Raw context" targetReady pending={false} registry={registry} onRun={onRun} />)
            expect(screen.getByRole("heading", { name: copy.default })).toBeInTheDocument()
            expect(screen.queryByRole("textbox")).toBeNull()
            view.rerender(<KindTestWorkbenchBlock locale={locale} contract={contractFor("missing-registration")} contextLabel="Raw context" targetReady pending showScenarioPicker={false} registry={DEFAULT_TEST_WORKBENCH_REGISTRY} onRun={onRun} />)
            expect(screen.getByText(copy.pending)).toBeInTheDocument()
            expect(screen.getByRole("button", { name: copy.runUnavailable })).toBeDisabled()
            expect(onRun).not.toHaveBeenCalled()
            view.unmount()
        })
    })
})