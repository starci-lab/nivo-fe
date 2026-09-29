import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyIntegrationCenterBase } from "./component"

const card = {
    id: "google",
    title: "Google",
    description: "Analytics",
    statusLabel: "Connected",
    statusTone: "success" as const,
    detail: "client-1",
    actionLabel: "Configure",
}
describe("AcademyIntegrationCenterBase", () => {
    it("renders refusal and resting provider cards", () => {
        expect(
            renderToStaticMarkup(
                <AcademyIntegrationCenterBase
                    state="refused"
                    props={{ sectionLabel: "Integrations", refusedLabel: "Unavailable", cards: [] }}
                    on={{ select: vi.fn(), changeField: vi.fn(), submit: vi.fn() }}
                />,
            ),
        ).toContain("Unavailable")
        expect(
            renderToStaticMarkup(
                <AcademyIntegrationCenterBase
                    state="resting"
                    props={{ sectionLabel: "Integrations", refusedLabel: "Unavailable", cards: [card] }}
                    on={{ select: vi.fn(), changeField: vi.fn(), submit: vi.fn() }}
                />,
            ),
        ).toContain("Integrations")
    })
    it("renders selected password form and outcome", () => {
        const html = renderToStaticMarkup(
            <AcademyIntegrationCenterBase
                state="answered"
                props={{
                    sectionLabel: "Integrations",
                    refusedLabel: "Unavailable",
                    cards: [card],
                    selected: {
                        id: "google",
                        label: "Google setup",
                        fields: [{ id: "secret", name: "secret", label: "Secret", kind: "password" }],
                        submitLabel: "Save",
                        revealLabel: "Show",
                        hideLabel: "Hide",
                    },
                    pendingId: "google",
                    outcome: "Saved",
                }}
                on={{ select: vi.fn(), changeField: vi.fn(), submit: vi.fn() }}
            />,
        )
        expect(html).toContain("Google setup")
        expect(html).toContain("Secret")
        expect(html).toContain("Saved")
    })
})

describe("AcademyIntegrationCenterBase", () => {
    it("fires integration, lead, student, and solution actions", () => {
        const submit = vi.fn()
        const change = vi.fn()
        render(
            <AcademyIntegrationCenterBase
                state="answered"
                props={{
                    sectionLabel: "Integrations",
                    refusedLabel: "Unavailable",
                    cards: [
                        {
                            id: "google",
                            title: "Google",
                            description: "Analytics",
                            statusLabel: "Connected",
                            statusTone: "success",
                            detail: "client",
                            actionLabel: "Configure",
                        },
                    ],
                    selected: {
                        id: "google",
                        label: "Setup",
                        fields: [{ id: "secret", name: "secret", label: "Secret", kind: "password" }],
                        submitLabel: "Save",
                        revealLabel: "Show",
                        hideLabel: "Hide",
                    },
                }}
                on={{ select: vi.fn(), changeField: change, submit }}
            />,
        )
        fireEvent.change(screen.getByLabelText("Secret"), { target: { value: "value" } })
        fireEvent.click(screen.getByRole("button", { name: "Save" }))
        expect(change).toHaveBeenCalled()
        expect(submit).toHaveBeenCalled()
        cleanup()
        renderToStaticMarkup(
            <AcademyIntegrationCenterBase
                state="answered"
                props={{
                    sectionLabel: "Integrations",
                    refusedLabel: "Unavailable",
                    cards: [],
                    selected: {
                        id: "plain",
                        label: "Plain",
                        fields: [{ id: "name", name: "name", label: "Name", kind: "text" }],
                        submitLabel: "Save",
                        revealLabel: "Show",
                        hideLabel: "Hide",
                    },
                }}
                on={{ select: vi.fn(), changeField: vi.fn(), submit: vi.fn() }}
            />,
        )
    })
})
