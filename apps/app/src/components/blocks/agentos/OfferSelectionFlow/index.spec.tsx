import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({
    catalog: { data: undefined as unknown, isValidating: false, mutate: vi.fn() },
    session: { state: { status: "signed-in", accessToken: "token" } },
}))
type PathnameRequest = { readonly href: string }
vi.mock("@/i18n/navigation", () => ({
    getPathname: (request: PathnameRequest) => request.href,
}))
vi.mock("next-intl", () => ({
    useLocale: () => "en",
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/hooks", () => ({
    useQueryCatalogItemsSwr: () => mocks.catalog,
}))
type ViewOffer = { readonly offerId: string; readonly offerVersion: string; readonly displayName: string; readonly amount: string; readonly currency: string }
type ViewInput = {
    readonly state: string
    readonly props: Record<string, unknown>
    readonly on?: {
        readonly select?: (offerId: string) => void
        readonly refresh?: () => void
    }
}
const captured: { view: ViewInput | null } = { view: null }
vi.mock("./component", () => ({
    OfferSelectionFlowBase: (input: ViewInput) => {
        captured.view = input
        return <>
            <output data-testid="flow-state">{input.state}</output>
            <output data-testid="flow-props">{JSON.stringify(input.props)}</output>
            {input.on?.select === undefined ? null : <button onClick={() => input.on?.select?.("nivo-workspace-scale")}>select-offer</button>}
            {input.on?.refresh === undefined ? null : <button onClick={input.on.refresh}>refresh</button>}
        </>
    },
}))
import OfferSelectionFlow from "./"
const props = () => JSON.parse(screen.getByTestId("flow-props").textContent ?? "{}") as Record<string, unknown>
const offersProp = () => (props().offers ?? []) as ReadonlyArray<ViewOffer>
describe("OfferSelectionFlow connected orchestration", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        captured.view = null
        mocks.catalog = { data: { ok: true, data: [] }, isValidating: false, mutate: vi.fn() }
        mocks.session.state = { status: "signed-in", accessToken: "token" }
    })
    it("waits for the signed-in session before settling any offer state", () => {
        mocks.session.state = { status: "restoring" } as never
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("loading")
    })
    it("keeps the skeleton while the current-offer read is unresolved", () => {
        mocks.catalog = { data: undefined, isValidating: true, mutate: vi.fn() }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("loading")
        expect(props().offers).toBeUndefined()
    })
    it("presents the three accepted draft offers with the Growth draft selected", () => {
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("selection")
        const offers = offersProp()
        expect(offers.map(offer => offer.displayName)).toEqual(["Nivo Workspace Starter", "Nivo Workspace Growth", "Nivo Workspace Scale"])
        expect(offers.map(offer => `${offer.amount} ${offer.currency}`)).toEqual(["1,490,000 VND", "2,990,000 VND", "5,990,000 VND"])
        expect(props().selectedOfferId).toBe("nivo-workspace-growth")
    })
    it("hands the selected offer identity and version to the checkout route as navigation", () => {
        render(<OfferSelectionFlow />)
        expect(props().checkoutHref).toBe("/agentos/workspaces/new/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22")
    })
    it("recomputes the review destination when the purchaser selects another draft", () => {
        render(<OfferSelectionFlow />)
        fireEvent.click(screen.getByRole("button", { name: "select-offer" }))
        expect(props().selectedOfferId).toBe("nivo-workspace-scale")
        expect(props().checkoutHref).toContain("offer=nivo-workspace-scale")
    })
    it("shows the read's refusal sentence with the draft hierarchy and a safe refresh", () => {
        const mutate = vi.fn()
        mocks.catalog = { data: { ok: false, reason: "catalog read refused" }, isValidating: true, mutate }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("unavailable")
        expect(props().message).toBe("catalog read refused")
        expect(props().isRefreshPending).toBe(true)
        expect(offersProp()).toHaveLength(3)
        fireEvent.click(screen.getByRole("button", { name: "refresh" }))
        expect(mutate).toHaveBeenCalledOnce()
    })
    it("resolves the workspaces return path through the locale-aware owner", () => {
        render(<OfferSelectionFlow />)
        const links = props().links as { readonly workspaces: string }
        expect(links.workspaces).toBe("/agentos/workspaces")
    })
})
