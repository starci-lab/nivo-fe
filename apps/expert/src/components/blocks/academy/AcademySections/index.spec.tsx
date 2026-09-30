import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import messages from "@/messages/en.json"
import { AcademySectionsBase } from "./component"
import { AcademySections } from "./index"

vi.mock("@/modules/api/academy", () => ({ submitLead: vi.fn().mockResolvedValue({ ok: true }) }))

const mountSections = () =>
    render(
        <NextIntlClientProvider locale="en" messages={messages}>
            <AcademySections courses={[]} />
        </NextIntlClientProvider>,
    )

describe("AcademySections", () => {
    it("renders the real sections and accessible lead form", async () => {
        const { container } = mountSections()

        await expectNoA11yViolations(container)
        expect(screen.getByRole("textbox", { name: messages.landing.lead.name })).toBeInTheDocument()
        expect(screen.getByRole("textbox", { name: messages.landing.lead.phone })).toBeInTheDocument()
    })

    it("exports its presentational twin", () => {
        expect(AcademySectionsBase).toBeTypeOf("function")
    })

    it("settles a successful lead submission into its confirmation state", async () => {
        mountSections()

        fireEvent.change(screen.getByRole("textbox", { name: messages.landing.lead.name }), {
            target: { value: "Reader" },
        })
        fireEvent.change(screen.getByRole("textbox", { name: messages.landing.lead.phone }), {
            target: { value: "0123" },
        })
        fireEvent.click(screen.getByRole("button", { name: messages.landing.lead.submit }))

        await waitFor(() => expect(screen.getByText(messages.landing.lead.sent)).toBeInTheDocument())
    })
})
