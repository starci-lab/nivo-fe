import { render, screen, waitFor } from "@testing-library/react"
import type { ComponentType } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ locale: "vi", pathname: "/overview", replace: vi.fn(), session: { state: { status: "signed-in" } }, labels: { navigationLabel: "", primaryLabel: "" } }))
vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/hooks", () => ({ useRouter: () => ({ replace: mocks.replace }), usePathname: () => mocks.pathname }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
interface MockBaseProps { readonly state: { readonly body: ComponentType; readonly bodyProps: object }; readonly props: { readonly navigationLabel: string; readonly primaryLabel: string } }
vi.mock("./component", () => ({ ConsoleLayoutBase: ({ state, props: data }: MockBaseProps) => { mocks.labels = { navigationLabel: data.navigationLabel, primaryLabel: data.primaryLabel }; const Body = state.body; return <div><Body {...state.bodyProps} /></div> } }))

import { ConsoleLayout } from "."

describe("ConsoleLayout", () => {
    const Workspace = () => <>workspace</>
    beforeEach(() => { mocks.locale = "vi"; mocks.session.state = { status: "signed-in" }; mocks.replace.mockClear() })
    it("keeps a signed-in routed page", () => { render(<ConsoleLayout body={Workspace} bodyProps={{}} />); expect(screen.getByText("workspace")).toBeInTheDocument(); expect(mocks.replace).not.toHaveBeenCalled() })
    it("names the rail and the routed region apart, and neither after the band's context", () => {
        render(<ConsoleLayout body={Workspace} bodyProps={{}} />)
        expect(mocks.labels.navigationLabel).toBe("navigationLabel")
        expect(mocks.labels.primaryLabel).toBe("workspaceLabel")
        expect(mocks.labels.primaryLabel).not.toBe(mocks.labels.navigationLabel)
        expect(mocks.labels.primaryLabel).not.toBe("title")
    })
    it("returns an anonymous reader to the locale-aware door carrying the interrupted route", async () => {
        mocks.locale = "en"; mocks.session.state = { status: "anonymous" }; mocks.pathname = "/agentos/workspaces/w1/modules/m1/setup"
        render(<ConsoleLayout body={Workspace} bodyProps={{}} />)
        expect(screen.queryByText("workspace")).toBeNull()
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fw1%2Fmodules%2Fm1%2Fsetup"))
    })
    it("carries nothing when the interrupted route is the root", async () => {
        mocks.session.state = { status: "anonymous" }; mocks.pathname = "/"
        render(<ConsoleLayout body={Workspace} bodyProps={{}} />)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication"))
    })
    it("draws no private shell while the refresh cookie is still being restored", () => {
        mocks.session.state = { status: "restoring" }
        render(<ConsoleLayout body={Workspace} bodyProps={{}} />)
        expect(screen.queryByText("workspace")).toBeNull()
        expect(mocks.replace).not.toHaveBeenCalled()
    })
})
