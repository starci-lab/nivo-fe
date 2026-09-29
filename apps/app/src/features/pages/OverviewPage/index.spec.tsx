import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const answer = () => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn() })
const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    apps: vi.fn(),
    workspaces: vi.fn(),
    pod: vi.fn(),
    domains: vi.fn(),
    wallet: vi.fn(),
    invoices: vi.fn(),
}))
vi.mock("@/hooks/swr/queries/console", () => ({
    useQueryMyExpertSitesSwr: mocks.apps,
    useQueryMyAgentWorkspacesSwr: mocks.workspaces,
    useQueryMyPodOpenclawStatusSwr: mocks.pod,
    useQueryMyDomainsSwr: mocks.domains,
    useQueryMyWalletSwr: mocks.wallet,
    useQueryMyInvoicesSwr: mocks.invoices,
}))
vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useRouter: () => ({ push: mocks.push }),
}))
interface MockBaseProps {
    readonly props: {
        readonly title: string
        readonly lede: string
        readonly pathLabel: string
        readonly consoleLabel: string
        readonly buildAppLabel: string
        readonly atAGlanceLabel: string
        readonly servicesLabel: string
        readonly accountLabel: string
    }
    readonly on: { readonly buildApp: () => void }
}
vi.mock("./component", () => ({
    OverviewPageBase: (input: MockBaseProps) => (
        <div>
            <span>
                {input.props.pathLabel}:{input.props.consoleLabel}:{input.props.title}
            </span>
            <span>
                {input.props.lede}:{input.props.atAGlanceLabel}:{input.props.servicesLabel}:{input.props.accountLabel}
            </span>
            <button type="button" onClick={input.on.buildApp}>
                {input.props.buildAppLabel}
            </button>
        </div>
    ),
}))

import { OverviewPage } from "."

const consoleCopy = enMessages.console
const headline = `${consoleCopy.breadcrumbLabel}:${consoleCopy.title}:${consoleCopy.overview.title}`
const slices = () => [mocks.apps, mocks.workspaces, mocks.pod, mocks.domains, mocks.wallet, mocks.invoices]

describe("OverviewPage", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        for (const slice of slices()) slice.mockImplementation(answer)
    })

    it("hands the page every resolved label and routes the one next step to the workspace purchase route", () => {
        render(<OverviewPage />)

        expect(screen.getByText(headline)).toBeInTheDocument()
        expect(
            screen.getByText(
                `${consoleCopy.overview.lede}:${consoleCopy.overview.atAGlance}:${consoleCopy.servicesCaption}:${consoleCopy.accountCaption}`,
            ),
        ).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: consoleCopy.agentos.purchase }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
        expect(mocks.push).not.toHaveBeenCalledWith("/apps")
    })

    it("carries the shell rev 17 purchaseAction label for the one next step", () => {
        render(<OverviewPage />)

        expect(screen.getByRole("button", { name: consoleCopy.agentos.purchase })).toBeInTheDocument()
        expect(viMessages.console.agentos.purchase).toBe("Mua workspace")
        expect(enMessages.console.agentos.purchase).toBe("Buy workspace")
    })

    it("asks every overview slice exactly once for one render of the page", () => {
        render(<OverviewPage />)

        for (const slice of slices()) expect(slice).toHaveBeenCalledTimes(1)
    })

    it("keeps a slice that has not settled from holding back the page", () => {
        mocks.domains.mockImplementation(() => ({
            data: undefined,
            error: undefined,
            isLoading: true,
            mutate: vi.fn(),
        }))
        render(<OverviewPage />)

        expect(screen.getByText(headline)).toBeInTheDocument()
        expect(mocks.domains).toHaveBeenCalledTimes(1)
    })
})
