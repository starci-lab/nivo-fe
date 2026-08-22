import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ locale: "vi", push: vi.fn() }))

type AgentOSPageProbeProps = {
    readonly path: { readonly currentLabel: string }
    readonly onOpenOverview: () => void
}

vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("./component", () => ({
    AgentOSPageBase: ({ path, onOpenOverview }: AgentOSPageProbeProps) => (
        <button type="button" onClick={onOpenOverview}>{path.currentLabel}</button>
    ),
}))

import { AgentOSPage } from "."

describe("AgentOSPage route owner", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
    })

    it("opens the default-locale overview route", () => {
        render(<AgentOSPage mode="new" />)
        fireEvent.click(screen.getByRole("button", { name: "agentos.title" }))
        expect(mocks.push).toHaveBeenCalledWith("/overview")
    })

    it("preserves a non-default locale when returning to overview", () => {
        mocks.locale = "en"
        render(<AgentOSPage mode="new" />)
        fireEvent.click(screen.getByRole("button", { name: "agentos.title" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/overview")
    })
})
