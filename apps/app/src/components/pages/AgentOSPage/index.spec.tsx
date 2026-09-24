import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const mocks = vi.hoisted(() => ({ locale: "vi", push: vi.fn() }))

type AgentOSPageProbeProps = {
    readonly mode: string
    readonly orderId?: string
    readonly labels: { readonly createAction: string }
    readonly onOpenDashboard: () => void
    readonly onCreate: () => void
}

vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("./component", () => ({
    AgentOSPageBase: (props: AgentOSPageProbeProps) => (
        <div>
            <output>{props.mode}:{props.orderId}</output>
            <button type="button" onClick={props.onOpenDashboard}>dashboard</button>
            {props.mode === "dashboard"
                ? <button type="button" onClick={props.onCreate}>{props.labels.createAction}</button>
                : null}
        </div>
    ),
}))

import { AgentOSPage } from "."

describe("AgentOSPage", () => {
    beforeEach(() => { mocks.locale = "vi"; mocks.push.mockClear() })

    it("routes dashboard creation without resolving child data", () => {
        render(<AgentOSPage mode="dashboard" />)
        fireEvent.click(screen.getByRole("button", { name: "agentos.purchase" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/create")
    })

    it("keeps the primary Mua workspace purchase action on the dashboard entry", () => {
        const dashboard = render(<AgentOSPage mode="dashboard" />)
        expect(screen.getByRole("button", { name: "agentos.purchase" })).toBeInTheDocument()
        dashboard.unmount()

        render(<AgentOSPage mode="create" />)
        expect(screen.queryByRole("button", { name: "agentos.purchase" })).not.toBeInTheDocument()
    })

    it("carries the shell rev 17 purchaseAction label for the dashboard primary action", () => {
        render(<AgentOSPage mode="dashboard" />)

        expect(screen.getByRole("button", { name: "agentos.purchase" })).toBeInTheDocument()
        expect(viMessages.console.agentos.purchase).toBe("Mua workspace")
        expect(enMessages.console.agentos.purchase).toBe("Buy workspace")
    })

    it("preserves non-default locale navigation", () => {
        mocks.locale = "en"
        render(<AgentOSPage mode="resume" orderId="order-1" />)
        fireEvent.click(screen.getByRole("button", { name: "dashboard" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos")
        expect(screen.getByText("resume:order-1")).toBeInTheDocument()
    })
})
