import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

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
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/hooks", () => ({
    useQueryMyExpertSitesSwr: mocks.apps,
    useQueryMyAgentWorkspacesSwr: mocks.workspaces,
    useQueryMyPodOpenclawStatusSwr: mocks.pod,
    useQueryMyDomainsSwr: mocks.domains,
    useQueryMyWalletSwr: mocks.wallet,
    useQueryMyInvoicesSwr: mocks.invoices,
}))
interface MockPageProps {
    readonly title: string
    readonly lede: string
    readonly pathLabel: string
    readonly consoleLabel: string
    readonly buildAppLabel: string
    readonly atAGlanceLabel: string
    readonly servicesLabel: string
    readonly accountLabel: string
    readonly onBuildApp: () => void
}
vi.mock("./component", () => ({ OverviewPageBase: (props: MockPageProps) => <div>
    <span>{props.pathLabel}:{props.consoleLabel}:{props.title}</span>
    <span>{props.lede}:{props.atAGlanceLabel}:{props.servicesLabel}:{props.accountLabel}</span>
    <button type="button" onClick={props.onBuildApp}>{props.buildAppLabel}</button>
</div> }))

import { OverviewPage } from "."

const slices = () => [mocks.apps, mocks.workspaces, mocks.pod, mocks.domains, mocks.wallet, mocks.invoices]

describe("OverviewPage route", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        for (const slice of slices()) slice.mockImplementation(answer)
    })

    it("hands the page every resolved label and routes the one page command", () => {
        render(<OverviewPage />)

        expect(screen.getByText("navigationLabel:title:overview.title")).toBeInTheDocument()
        expect(screen.getByText("overview.lede:overview.atAGlance:servicesCaption:accountCaption")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "overview.buildApp" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps")
    })

    it("asks every overview slice exactly once for one render of the page", () => {
        render(<OverviewPage />)

        for (const slice of slices()) expect(slice).toHaveBeenCalledTimes(1)
    })

    it("keeps a slice that has not settled from holding back the page", () => {
        mocks.domains.mockImplementation(() => ({ data: undefined, error: undefined, isLoading: true, mutate: vi.fn() }))
        render(<OverviewPage />)

        expect(screen.getByText("navigationLabel:title:overview.title")).toBeInTheDocument()
        expect(mocks.domains).toHaveBeenCalledTimes(1)
    })
})
