import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    pathname: "/overview",
    replace: vi.fn(),
    session: { state: { status: "signed-in" } },
    labels: { navigationLabel: "", primaryLabel: "", skipLabel: "" },
}))
vi.mock("@/hooks", () => ({
    useRouter: () => ({ replace: mocks.replace }),
    usePathname: () => mocks.pathname,
    useSession: () => mocks.session,
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
interface MockBaseProps {
    readonly state: { readonly children: React.ReactNode }
    readonly props: { readonly navigationLabel: string; readonly primaryLabel: string; readonly skipLabel: string }
}
vi.mock("./component", () => ({
    ConsoleLayoutBase: ({ state, props: data }: MockBaseProps) => {
        mocks.labels = { navigationLabel: data.navigationLabel, primaryLabel: data.primaryLabel, skipLabel: data.skipLabel }
        return <div>{state.children}</div>
    },
}))

import { ConsoleLayout } from "."
import en from "@/messages/en.json"

describe("ConsoleLayout", () => {
    const workspace = <>workspace</>
    beforeEach(() => {
        mocks.session.state = { status: "signed-in" }
        mocks.replace.mockClear()
    })
    it("keeps a signed-in routed page", () => {
        render(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(screen.getByText("workspace")).toBeInTheDocument()
        expect(mocks.replace).not.toHaveBeenCalled()
    })
    it("names the rail and the routed region apart, and neither after the band's context", () => {
        render(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(mocks.labels.navigationLabel).toBe(en.console.navigationLabel)
        expect(mocks.labels.primaryLabel).toBe(en.console.workspaceLabel)
        expect(mocks.labels.primaryLabel).not.toBe(mocks.labels.navigationLabel)
        expect(mocks.labels.primaryLabel).not.toBe(en.console.title)
        expect(mocks.labels.skipLabel).toBe(en.console.skipToContent)
    })
    it("returns an anonymous reader to the locale-aware door carrying the interrupted route", async () => {
        mocks.session.state = { status: "anonymous" }
        mocks.pathname = "/agentos/workspaces/w1/modules/m1/setup"
        render(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(screen.queryByText("workspace")).toBeNull()
        await waitFor(() =>
            expect(mocks.replace).toHaveBeenCalledWith(
                "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fw1%2Fmodules%2Fm1%2Fsetup",
            ),
        )
    })
    it("carries nothing when the interrupted route is the root", async () => {
        mocks.session.state = { status: "anonymous" }
        mocks.pathname = "/"
        render(<ConsoleLayout>{workspace}</ConsoleLayout>)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication"))
    })
    it("draws no private shell while the refresh cookie is still being restored", () => {
        mocks.session.state = { status: "restoring" }
        render(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(screen.queryByText("workspace")).toBeNull()
        expect(mocks.replace).not.toHaveBeenCalled()
    })
})
