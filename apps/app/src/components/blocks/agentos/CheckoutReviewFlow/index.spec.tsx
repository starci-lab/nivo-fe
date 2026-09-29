import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    start: { trigger: vi.fn() },
    offers: { data: undefined as unknown, isValidating: false, error: undefined as unknown, mutate: vi.fn() },
    search: "",
    session: { state: { status: "signed-in", accessToken: "token" } as unknown },
}))
type PathnameRequest = { readonly href: string; readonly locale: string }
/* Production-shaped: getPathname prefixes non-default locales, so feeding its localized output to
   the locale-aware router would double the prefix exactly like the live refused-return defect did. */
vi.mock("@/modules/i18n/navigation", () => ({
    getPathname: (request: PathnameRequest) => (request.locale === "en" ? `/en${request.href}` : request.href),
}))
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(mocks.search),
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("@/hooks", () => ({
    useQueryWorkspaceCheckoutOffersSwr: () => mocks.offers,
    useMutateWorkspaceCheckoutStartSwr: () => mocks.start,
    useRouter: () => ({ push: mocks.push }),
    useSession: () => mocks.session,
}))
type ViewInput = {
    readonly state: string
    readonly props: Record<string, unknown>
    readonly on?: {
        readonly requestPayment?: () => void
        readonly selectRail?: (rail: string) => void
        readonly changeOffer?: () => void
        readonly returnToOffers?: () => void
    }
}
const captured: { view: ViewInput | null } = { view: null }
vi.mock("./component", () => ({
    CheckoutReviewFlowBase: (input: ViewInput) => {
        captured.view = input
        return (
            <>
                <output data-testid="flow-state">{input.state}</output>
                <output data-testid="flow-props">{JSON.stringify(input.props)}</output>
                {input.on?.requestPayment === undefined ? null : (
                    <button onClick={input.on.requestPayment}>request-payment</button>
                )}
                {input.on?.selectRail === undefined ? null : (
                    <button onClick={() => input.on?.selectRail?.("vnpay")}>choose-vnpay</button>
                )}
                {input.on?.returnToOffers === undefined ? null : (
                    <button onClick={input.on.returnToOffers}>return-to-offers</button>
                )}
            </>
        )
    },
}))
import CheckoutReviewFlow from "./"
const growth = {
    offerId: "nivo-workspace-growth",
    offerVersion: "draft-2026-09-22",
    displayName: "Nivo Workspace Growth",
    includedOutcome: "One managed agent workspace",
    amount: "2990000",
    currency: "VND",
    billingCadence: "yearly",
    renewalMode: "explicit-reauthorization",
    eligibility: "market:VN",
}
const offersAnswer = (selectionState: string) => ({
    ok: true,
    data: {
        status: "offers",
        offers: [growth],
        selection: { offerId: growth.offerId, offerVersion: growth.offerVersion, state: selectionState },
    },
})
const prepared = (paymentAction: unknown, state = "selected", purchaseId: string | null = "PUR-1") => ({
    ok: true,
    data: {
        status: "prepared",
        purchaseId,
        paymentAction,
        purchase: {
            purchaseId: purchaseId ?? "PUR-1",
            state,
            offer: growth,
            lastConfirmedAt: "2026-09-22T10:00:00.000Z",
        },
    },
})
const props = () => JSON.parse(screen.getByTestId("flow-props").textContent ?? "{}") as Record<string, unknown>
const steps = () => (props().steps ?? []) as ReadonlyArray<{ readonly title: string; readonly detail: string }>
const request = (call: number) => mocks.start.trigger.mock.calls[call]?.[0] as Record<string, unknown>
describe("CheckoutReviewFlow", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        captured.view = null
        mocks.search = "offer=nivo-workspace-growth&offerVersion=draft-2026-09-22"
        mocks.session = { state: { status: "signed-in", accessToken: "token" } }
        mocks.offers = { data: offersAnswer("current"), isValidating: false, error: undefined, mutate: vi.fn() }
        mocks.start.trigger.mockResolvedValue(prepared(null))
    })
    it("frees the frozen offer from the boundary's current-offer recheck without inventing a purchaser name", () => {
        render(<CheckoutReviewFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("review")
        const view = props()
        expect(JSON.stringify(view.facts)).toContain("Nivo Workspace Growth")
        expect(JSON.stringify(view.facts)).toContain("draft-2026-09-22")
        expect(JSON.stringify(view.facts)).toContain("₫2,990,000")
        expect(JSON.stringify(view.facts)).toContain("yearly")
        expect((view.facts as Record<string, unknown>).purchaser).toBeNull()
        expect(view.admission).toBe("Admitted")
        expect(steps()[1]?.detail).toBe("start-checkout:nivo-workspace-growth@draft-2026-09-22")
        /* Anchors keep the localized href while router.push receives the raw path. */
        expect((view.links as Record<string, string>).offerSelection).toBe("/en/agentos/workspaces/new")
    })
    it("offers only the boundary's two domestic rails and starts nothing before one is chosen", () => {
        render(<CheckoutReviewFlow />)
        const rails = props().rails as ReadonlyArray<{ readonly rail: string }>
        expect(rails.map((rail) => rail.rail)).toEqual(["vnpay", "momo"])
        expect(props().selectedRail).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        expect(mocks.start.trigger).not.toHaveBeenCalled()
    })
    it("sends only the frozen identity, the purchaser-scoped retry key and the chosen rail", async () => {
        render(<CheckoutReviewFlow />)
        fireEvent.click(screen.getByRole("button", { name: "choose-vnpay" }))
        expect(props().selectedRail).toBe("vnpay")
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.start.trigger).toHaveBeenCalledTimes(1))
        expect(request(0)).toEqual({
            retryKey: "start-checkout:nivo-workspace-growth@draft-2026-09-22",
            offerId: "nivo-workspace-growth",
            offerVersion: "draft-2026-09-22",
            paymentRail: "vnpay",
        })
    })
    it("binds an existing entitlement on a renewal and still requires a fresh payment", async () => {
        mocks.search = "offer=nivo-workspace-growth&offerVersion=draft-2026-09-22&entitlement=ENT-2026-0007"
        render(<CheckoutReviewFlow />)
        fireEvent.click(screen.getByRole("button", { name: "choose-vnpay" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.start.trigger).toHaveBeenCalledTimes(1))
        expect(request(0)).toEqual({
            retryKey: "start-checkout:nivo-workspace-growth@draft-2026-09-22",
            offerId: "nivo-workspace-growth",
            offerVersion: "draft-2026-09-22",
            paymentRail: "vnpay",
            renewalEntitlementId: "ENT-2026-0007",
        })
    })
    it("reuses the same retry key on an identical retry", async () => {
        render(<CheckoutReviewFlow />)
        fireEvent.click(screen.getByRole("button", { name: "choose-vnpay" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("not-started"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.start.trigger).toHaveBeenCalledTimes(2))
        expect(request(0)).toEqual(request(1))
    })
    it("lands payment-not-started when the rail definitively accepted no initiation", async () => {
        render(<CheckoutReviewFlow />)
        fireEvent.click(screen.getByRole("button", { name: "choose-vnpay" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("not-started"))
        expect(props().notice).toBe(
            "No payment request was accepted. The same purchase identity remains available for a safe retry.",
        )
        expect(props().selectedRail).toBe("vnpay")
    })
    it("keeps one in-flight payment request across repeated presses", async () => {
        let release: (answer: unknown) => void = () => undefined
        mocks.start.trigger.mockReturnValue(
            new Promise((resolve) => {
                release = resolve
            }),
        )
        render(<CheckoutReviewFlow />)
        fireEvent.click(screen.getByRole("button", { name: "choose-vnpay" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        release(prepared(null))
        await waitFor(() => expect(mocks.start.trigger).toHaveBeenCalledTimes(1))
    })
    it("routes a purchase that already left the cursor to its status surface instead of charging again", async () => {
        mocks.start.trigger.mockResolvedValue(prepared(null, "paid", "PUR-1"))
        render(<CheckoutReviewFlow />)
        fireEvent.click(screen.getByRole("button", { name: "choose-vnpay" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/purchases/PUR-1"))
        expect(mocks.push).not.toHaveBeenCalledWith("/en/agentos/workspaces/purchases/PUR-1")
    })
    it("withholds payment and names the verified-Login door when the boundary refuses admission", () => {
        mocks.offers = {
            data: {
                ok: true,
                data: { status: "refused", code: "purchaser-not-admitted", nextAction: "login-verify-email" },
            },
            isValidating: false,
            error: undefined,
            mutate: vi.fn(),
        }
        render(<CheckoutReviewFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("refused")
        expect(props().message).toBe("The signed-in account is not an admitted purchaser yet.")
        expect(props().nextAction).toBe("Verify the account's email, then try again.")
    })
    it("withholds payment when the frozen offer version is no longer current", () => {
        mocks.offers = { data: offersAnswer("stale"), isValidating: false, error: undefined, mutate: vi.fn() }
        render(<CheckoutReviewFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("refused")
        expect(props().message).toContain("no longer current")
        expect(props().facts).toBeNull()
    })
    it("waits for a signed-in session without requesting payment", async () => {
        mocks.session = { state: { status: "restoring" } }
        render(<CheckoutReviewFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("loading")
        await waitFor(() => expect(mocks.start.trigger).not.toHaveBeenCalled())
    })
})
