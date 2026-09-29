import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AcademyControlCenter } from "./index"

const m = vi.hoisted(() => ({
    session: { state: { status: "signed-in", accessToken: "test-token" } },
    sites: { ok: true, data: [] as Array<unknown> },
    list: vi.fn(),
    open: vi.fn(),
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => m.session }))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: m.list }))
type PageView = {
    state: string
    props: { mode: string }
    on: { selectMode: (mode: string) => void; openPublicSite: () => void }
}
vi.mock("./component", () => ({
    AcademyControlCenterBase: (input: PageView) => (
        <>
            <output data-testid="state">
                {input.state}:{input.props.mode}
            </output>
            <button onClick={() => input.on.selectMode("system")}>system</button>
            <button onClick={input.on.openPublicSite}>open</button>
        </>
    ),
}))

beforeEach(() => {
    vi.clearAllMocks()
    m.session.state.status = "signed-in"
    m.sites = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null }] }
    m.list.mockResolvedValue(m.sites)
    window.open = vi.fn()
})

describe("AcademyControlCenter connected owner", () => {
    it("restores, resolves the owned site, reports tab selection, and opens the public host", async () => {
        const onSelectMode = vi.fn()
        render(<AcademyControlCenter siteId="site-1" mode="growth" onSelectMode={onSelectMode} />)
        expect(screen.getByTestId("state")).toHaveTextContent("restoring")
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("ready:growth"))
        fireEvent.click(screen.getByText("system"))
        expect(onSelectMode).toHaveBeenCalledWith("system")
        fireEvent.click(screen.getByText("open"))
        expect(window.open).toHaveBeenCalledWith("https://academy.nivo.vn", "_blank", "noopener,noreferrer")
    })
    it("renders refused state when the site is not owned", async () => {
        m.sites = { ok: true, data: [] }
        m.list.mockResolvedValue(m.sites)
        render(<AcademyControlCenter siteId="missing" mode="growth" onSelectMode={vi.fn()} />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("refused"))
    })
})
