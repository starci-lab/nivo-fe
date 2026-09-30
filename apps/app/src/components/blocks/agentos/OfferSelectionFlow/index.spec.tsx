import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({
    offers: { data: undefined as unknown, isValidating: false, error: undefined as unknown, mutate: vi.fn() },
    session: { state: { status: "signed-in", accessToken: "token" } as unknown },
    search: "",
}))
type PathnameRequest = { readonly href: string }
vi.mock("@/modules/i18n", () => ({
    getPathname: (request: PathnameRequest) => request.href,
}))
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(mocks.search),
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("@/hooks", () => ({
    useSession: () => mocks.session,
    useAccessToken: () => {
        const state = mocks.session.state as { readonly status: string; readonly accessToken?: string };
        return state.status === "signed-in" ? state.accessToken ?? null : null;
    },
    useQueryWorkspaceCheckoutOffersSwr: () => mocks.offers,
}))
type ViewOffer = {
    readonly offerId: string
    readonly offerVersion: string
    readonly displayName: string
    readonly amount: string
}
type ViewInput = {
    readonly state: string
    readonly props: Record<string, unknown>
    readonly on?: {
        readonly select?: (offerId: string) => void
        readonly refresh?: () => void
        readonly signIn?: () => void
    }
}
const captured: { view: ViewInput | null } = { view: null }
vi.mock("./component", () => ({
    OfferSelectionFlowBase: (input: ViewInput) => {
        captured.view = input
        return (
            <>
                <output data-testid="flow-state">{input.state}</output>
                <output data-testid="flow-props">{JSON.stringify(input.props)}</output>
                {input.on?.select === undefined ? null : (
                    <button onClick={() => input.on?.select?.("nivo-workspace-scale")}>select-offer</button>
                )}
                {input.on?.refresh === undefined ? null : <button onClick={input.on.refresh}>refresh</button>}
            </>
        )
    },
}))
import OfferSelectionFlow from "./"
/** One boundary offer as the checkout boundary publishes it (amount carries no separator). */
const boundaryOffer = (offerId: string, offerVersion: string, displayName: string, amount: string) => ({
    offerId,
    offerVersion,
    displayName,
    includedOutcome: "One managed agent workspace",
    amount,
    currency: "VND",
    billingCadence: "yearly",
    renewalMode: "explicit-reauthorization",
    eligibility: "market:VN",
})
const offersAnswer = (selectionState: string) => ({
    ok: true,
    data: {
        status: "offers",
        offers: [
            boundaryOffer("nivo-workspace-starter", "draft-2026-09-22", "Nivo Workspace Starter", "1490000"),
            boundaryOffer("nivo-workspace-growth", "draft-2026-09-22", "Nivo Workspace Growth", "2990000"),
            boundaryOffer("nivo-workspace-scale", "draft-2026-09-22", "Nivo Workspace Scale", "5990000"),
        ],
        selection: { offerId: "nivo-workspace-growth", offerVersion: "draft-2026-09-22", state: selectionState },
    },
})
const refusedAnswer = (code: string, nextAction?: string) => ({
    ok: true,
    data: { status: "refused", code, nextAction },
})
const props = () => JSON.parse(screen.getByTestId("flow-props").textContent ?? "{}") as Record<string, unknown>
const offersProp = () => (props().offers ?? []) as ReadonlyArray<ViewOffer>
describe("OfferSelectionFlow", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        captured.view = null
        mocks.search = ""
        mocks.offers = { data: offersAnswer("current"), isValidating: false, error: undefined, mutate: vi.fn() }
        mocks.session = { state: { status: "signed-in", accessToken: "token" } }
    })
    it("waits for the signed-in session before settling any offer state", () => {
        mocks.session = { state: { status: "restoring" } }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("loading")
    })
    it("keeps the skeleton while the boundary's current-offer read is unresolved", () => {
        mocks.offers = { data: undefined, isValidating: true, error: undefined, mutate: vi.fn() }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("loading")
        expect(props().offers).toBeUndefined()
    })
    it("presents the boundary's current offers with the presented version selected", () => {
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("selection")
        const offers = offersProp()
        expect(offers.map((offer) => offer.displayName)).toEqual([
            "Nivo Workspace Starter",
            "Nivo Workspace Growth",
            "Nivo Workspace Scale",
        ])
        expect(offers.map((offer) => offer.amount)).toEqual(["₫1,490,000", "₫2,990,000", "₫5,990,000"])
        expect(props().selectedOfferId).toBe("nivo-workspace-growth")
    })
    it("hands the selected offer identity and version to the checkout route as navigation", () => {
        render(<OfferSelectionFlow />)
        expect(props().checkoutHref).toBe(
            "/agentos/workspaces/new/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22",
        )
    })
    it("recomputes the review destination when the purchaser selects another current offer", () => {
        render(<OfferSelectionFlow />)
        fireEvent.click(screen.getByRole("button", { name: "select-offer" }))
        expect(props().selectedOfferId).toBe("nivo-workspace-scale")
        expect(props().checkoutHref).toContain("offer=nivo-workspace-scale")
    })
    it("shows the transport's refusal sentence with the last list and a safe refresh", () => {
        const mutate = vi.fn()
        mocks.offers = {
            data: { ok: false, reason: "boundary read refused" },
            isValidating: true,
            error: undefined,
            mutate,
        }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("unavailable")
        expect(props().message).toBe("boundary read refused")
        fireEvent.click(screen.getByRole("button", { name: "refresh" }))
        expect(mutate).toHaveBeenCalledOnce()
    })
    it("omits the offer and requests no checkout when the presented version is stale", () => {
        mocks.offers = { data: offersAnswer("stale"), isValidating: false, error: undefined, mutate: vi.fn() }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("unavailable")
        expect(props().checkoutHref).toBeUndefined()
    })
    it("shows no private offer terms and routes to Login when the boundary refuses the purchaser", () => {
        mocks.offers = {
            data: refusedAnswer("purchaser-not-admitted", "login-verify-email"),
            isValidating: false,
            error: undefined,
            mutate: vi.fn(),
        }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("no-session")
        expect(props().offers).toBeUndefined()
        expect(props().message).toContain("not an admitted purchaser")
        expect((props().copy as { readonly noSessionTitle: string }).noSessionTitle).toBe("Sign in to see offers")
        expect(props().signInHref).toBe("/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fnew")
        expect(props().signUpHref).toBe("/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fnew")
    })
    it("shows no private offer terms when nobody is signed in", () => {
        mocks.session = { state: { status: "anonymous" } }
        render(<OfferSelectionFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("no-session")
        expect(props().offers).toBeUndefined()
        expect(props().signInHref).toContain("/authentication")
    })
    it("resolves the workspaces return path through the locale-aware owner", () => {
        render(<OfferSelectionFlow />)
        const links = props().links as { readonly workspaces: string }
        expect(links.workspaces).toBe("/agentos/workspaces")
    })
})
