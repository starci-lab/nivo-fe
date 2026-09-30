import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"

vi.mock("@nivo/ui", () => ({
    ThemeToggle: () => <button type="button">Theme</button>,
}))

import { AcademyChrome } from "./index"
import en from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const mount = (messages: typeof en | typeof viMessages, locale: string) =>
    render(
        <NextIntlClientProvider locale={locale} messages={messages}>
            <AcademyChrome content={<p>Academy content</p>} />
        </NextIntlClientProvider>,
    )

describe("academy chrome", () => {
    it("emits the document ground theme and seats routed content in the one main landmark", async () => {
        const view = mount(en, "en")
        await expectNoA11yViolations(view.container)
        expect(view.container.innerHTML).toContain("background-color: var(--background)")
        expect(screen.getByRole("main")).toHaveTextContent("Academy content")
        expect(screen.getAllByRole("main")).toHaveLength(1)
    })

    it.each([
        [en, "en", en.landing.skipToContent],
        [viMessages, "vi", viMessages.landing.skipToContent],
    ] as const)("words the skip link from the %s catalog", (messages, locale, words) => {
        mount(messages, locale)
        expect(screen.getByRole("link", { name: words })).toHaveAttribute("href", "#main-content")
    })
})
