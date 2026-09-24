import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    order: { trigger: vi.fn() },
    payLink: { trigger: vi.fn() },
    mutateInvoices: vi.fn(),
    catalog: { data: undefined as unknown },
    invoices: { data: undefined as unknown },
    search: "",
    session: { state: { status: "signed-in", accessToken: "token" } },
}))
type PathnameRequest = { readonly href: string; readonly locale: string }
/* Production-shaped: getPathname prefixes non-default locales, so feeding its localized output to
   the locale-aware router would double the prefix exactly like the live refused-return defect did. */
vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ push: mocks.push }),
    getPathname: (request: PathnameRequest) => request.locale === "en" ? `/en${request.href}` : request.href,
}))
vi.mock("next-intl", async () => {
    const copyEn = (await import("@/messages/en.json")).default.console.agentos.checkoutReview as Record<string, string>
    const translate = (key: string, values?: Record<string, unknown>) =>
        Object.entries(values ?? {}).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), copyEn[key] ?? key)
    return {
        useLocale: () => "en",
        useFormatter: () => ({ number: (value: number) => `VND ${value}` }),
        useTranslations: () => translate,
    }
})
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(mocks.search),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/hooks", () => ({
    useQueryCatalogItemsSwr: () => mocks.catalog,
    useQueryMyInvoicesSwr: () => ({ data: mocks.invoices.data, mutate: mocks.mutateInvoices }),
    useMutateOrderAgentosSwr: () => mocks.order,
    useMutateCreateWalletTopUpPayLinkSwr: () => mocks.payLink,
}))
vi.mock("@/modules/config", () => ({ BILLING_CURRENCY: "VND" }))
type ViewInput = {
    readonly state: string
    readonly props: Record<string, unknown>
    readonly on?: {
        readonly requestPayment?: () => void
        readonly changeOffer?: () => void
        readonly returnToOffers?: () => void
    }
}
const captured: { view: ViewInput | null } = { view: null }
vi.mock("./component", () => ({
    CheckoutReviewFlowBase: (input: ViewInput) => {
        captured.view = input
        return <>
            <output data-testid="flow-state">{input.state}</output>
            <output data-testid="flow-props">{JSON.stringify(input.props)}</output>
            {input.on?.requestPayment === undefined ? null : <button onClick={input.on.requestPayment}>request-payment</button>}
            {input.on?.returnToOffers === undefined ? null : <button onClick={input.on.returnToOffers}>return-to-offers</button>}
        </>
    },
}))
import CheckoutReviewFlow from "./"
const item = {
    id: "item-1",
    slug: "nivo-ai-agent",
    name: "Nivo AI Agent",
    tagline: "Run an agent workspace",
    templateKey: null,
    tiers: [
        { id: "tier-basic", tierKey: "agent_basic", name: "Basic", priceMonthlyVnd: 490000, orderIndex: 0 },
        { id: "tier-pro", tierKey: "agent_pro", name: "Pro", priceMonthlyVnd: 990000, orderIndex: 1 },
    ],
}
const invoice = (status: string) => ({
    id: "INV-1",
    amountVnd: 990000,
    status,
    dueAt: "2026-08-29T10:00:00.000Z",
    paidAt: status === "paid" ? "2026-08-22T09:00:00.000Z" : null,
    catalogOrder: { id: "PUR-0001", catalogItem: { name: "Nivo AI Agent" }, catalogTier: { name: "Pro" } },
})
const invoices = (rows: ReadonlyArray<unknown>) => ({ ok: true, data: rows })
/** A Keycloak-shaped access token whose payload carries the purchaser claims the review binds. */
const accessTokenWith = (claims: Record<string, unknown>) =>
    `hdr.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`
const PURCHASER_TOKEN = accessTokenWith({ sub: "user-an-nguyen", name: "An Nguyen", preferred_username: "an.nguyen", email: "an.nguyen@northstar.test" })
const props = () => JSON.parse(screen.getByTestId("flow-props").textContent ?? "{}") as Record<string, unknown>
describe("CheckoutReviewFlow", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        captured.view = null
        mocks.catalog = { data: { ok: true, data: [item] } }
        mocks.search = "offer=nivo-ai-agent&tier=agent_pro"
        mocks.session.state = { status: "signed-in", accessToken: PURCHASER_TOKEN }
        mocks.order.trigger.mockResolvedValue({ ok: true, data: { id: "PUR-0001" } })
        mocks.invoices = { data: invoices([invoice("unpaid")]) }
        mocks.mutateInvoices.mockResolvedValue(invoices([invoice("unpaid")]))
        mocks.payLink.trigger.mockResolvedValue({ ok: true, data: { paymentId: "PAY-1", checkoutUrl: "https://pay.sepay.test/checkout", checkoutFields: JSON.stringify({ orderCode: "PUR-0001" }) } })
        vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => undefined)
    })
    it("prepares one purchase identity from the admitted offer before review", async () => {
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        expect(mocks.order.trigger).toHaveBeenCalledTimes(1)
        expect(mocks.order.trigger).toHaveBeenCalledWith({ catalogItemSlug: "nivo-ai-agent", catalogTierId: "tier-pro" })
        const view = props()
        expect(view.purchaseRef).toBe("PUR-0001")
        expect(JSON.stringify(view.facts)).toContain("agent_pro")
        expect(JSON.stringify(view.facts)).toContain("VND 990000")
        expect(JSON.stringify(view.steps)).toContain("PUR-0001")
        /* Anchors keep the localized href while router.push receives the raw path. */
        expect((view.links as Record<string, string>).offerSelection).toBe("/en/agentos/workspaces/new")
    })
    it("binds the admitted purchaser's session identity into the fact, badge and first step", async () => {
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        const view = props()
        expect(view.admission).toBe("An Nguyen · Admitted")
        expect(JSON.stringify(view.facts)).toContain("An Nguyen · an.nguyen@northstar.test")
        expect(JSON.stringify(view.steps)).toContain("An Nguyen · Vietnam eligibility")
    })
    it("withholds the named identity when the session token carries no name claim", async () => {
        mocks.session.state = { status: "signed-in", accessToken: accessTokenWith({ sub: "user-unnamed" }) }
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        const view = props()
        expect(view.admission).toBe("Admitted")
        expect((view.facts as Record<string, unknown>).purchaser).toBeNull()
        expect(JSON.stringify(view.steps)).toContain("Admitted purchaser · current offer terms")
    })
    it("prepares the purchase only once when the catalogue revalidates", async () => {
        const { rerender } = render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        mocks.catalog = { data: { ok: true, data: [item] } }
        rerender(<CheckoutReviewFlow />)
        await waitFor(() => expect(mocks.order.trigger).toHaveBeenCalledTimes(1))
    })
    it("refuses without preparing a purchase when the selected offer is no longer current", async () => {
        mocks.search = "offer=retired-offer&tier=agent_pro"
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("refused"))
        expect(mocks.order.trigger).not.toHaveBeenCalled()
        expect(props().message).toContain("no longer current")
    })
    it("refuses a tiered offer whose selected rung no longer exists", async () => {
        mocks.search = "offer=nivo-ai-agent&tier=agent_enterprise"
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("refused"))
        expect(mocks.order.trigger).not.toHaveBeenCalled()
    })
    it("surfaces the seller's refusal when the purchase command is refused", async () => {
        mocks.order.trigger.mockResolvedValue({ ok: false, reason: "Offer terms changed since selection" })
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("refused"))
        expect(props().message).toBe("Offer terms changed since selection")
        /* The anchor stays localized; the button hands the locale-aware router the raw path. */
        expect((props().links as Record<string, string>).offerSelection).toBe("/en/agentos/workspaces/new")
        fireEvent.click(screen.getByRole("button", { name: "return-to-offers" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
        expect(mocks.push).not.toHaveBeenCalledWith("/en/agentos/workspaces/new")
    })
    it("raises the provider action on the frozen invoice amount with the purchase's own return URL", async () => {
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.payLink.trigger).toHaveBeenCalledTimes(1))
        const input = mocks.payLink.trigger.mock.calls[0]?.[0] as { amountVnd: number; returnUrl: string; cancelUrl: string }
        expect(input.amountVnd).toBe(990000)
        expect(input.returnUrl).toContain("/en/agentos/workspaces/purchases/PUR-0001")
        expect(input.cancelUrl).toContain("payment=cancelled")
        await waitFor(() => expect(HTMLFormElement.prototype.submit).toHaveBeenCalled())
    })
    it("keeps one in-flight payment request across repeated presses", async () => {
        let release: (answer: unknown) => void = () => undefined
        mocks.payLink.trigger.mockReturnValue(new Promise(resolve => { release = resolve }))
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        release({ ok: true, data: { paymentId: "PAY-1", checkoutUrl: "https://pay.sepay.test/checkout", checkoutFields: "{}" } })
        await waitFor(() => expect(mocks.payLink.trigger).toHaveBeenCalledTimes(1))
    })
    it("lands on payment-not-started when the provider refuses the request", async () => {
        mocks.payLink.trigger.mockResolvedValue({ ok: false, reason: "provider unavailable" })
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("not-started"))
        expect(props().notice).toBe("provider unavailable")
    })
    it("lands on payment-not-started when no invoice exists to charge", async () => {
        mocks.mutateInvoices.mockResolvedValue(invoices([]))
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("not-started"))
        expect(mocks.payLink.trigger).not.toHaveBeenCalled()
    })
    it("routes an already-paid purchase to its status surface instead of re-raising payment", async () => {
        mocks.mutateInvoices.mockResolvedValue(invoices([invoice("paid")]))
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/purchases/PUR-0001"))
        expect(mocks.payLink.trigger).not.toHaveBeenCalled()
    })
    it("routes to the status surface when the payment request outcome is unknown", async () => {
        mocks.payLink.trigger.mockRejectedValue(new Error("network"))
        render(<CheckoutReviewFlow />)
        await waitFor(() => expect(screen.getByTestId("flow-state")).toHaveTextContent("review"))
        fireEvent.click(screen.getByRole("button", { name: "request-payment" }))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/purchases/PUR-0001"))
    })
    it("waits for a signed-in session without preparing a purchase", async () => {
        mocks.session.state = { status: "restoring" } as never
        render(<CheckoutReviewFlow />)
        expect(screen.getByTestId("flow-state")).toHaveTextContent("loading")
        await waitFor(() => expect(mocks.order.trigger).not.toHaveBeenCalled())
    })
})
