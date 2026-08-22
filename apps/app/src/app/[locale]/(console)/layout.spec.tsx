import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"

const mocks = vi.hoisted(() => ({
    locale: "vi",
    replace: vi.fn(),
    session: { state: { status: "signed-in" } },
}))

type NodeOwnerProps = { readonly children?: ReactNode, readonly content?: ReactNode }
type TreeProbeProps = { readonly render: (input?: unknown) => ReactNode }
type SlotOwner = Record<string, ((input?: unknown) => ReactNode) | ReactNode>

const renderSlots = (slots: SlotOwner) => Object.entries(slots).map(([key, slot]) => (
    <div key={key}>{typeof slot === "function" ? slot({}) : slot}</div>
))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/components/layouts/ConsoleNav", () => ({ ConsoleNav: () => <nav>navigation</nav> }))
vi.mock("@/components/layouts/ConsoleTopBar", () => ({ ConsoleTopBar: () => <header>topbar</header> }))
vi.mock("@nivo/ui", () => ({
    StarCiDashboardThemeBoundary: ({ content }: NodeOwnerProps) => <>{content}</>,
    Tree: ({ render }: TreeProbeProps) => <>{render({})}</>,
    defineContractComponent: (_key: string, slots: SlotOwner) => () => <>{renderSlots(slots)}</>,
    defineContractProjection: (_key: string, owner: () => ReactNode) => owner,
    defineLeafComponent: (_key: string, _props: unknown, owner: () => ReactNode) => owner,
}))

import ConsoleLayout from "./layout"

describe("ConsoleLayout", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.session.state = { status: "signed-in" }
        mocks.replace.mockClear()
    })

    it("keeps global chrome beside the routed body for a signed-in reader", () => {
        render(<ConsoleLayout><main>workspace body</main></ConsoleLayout>)

        expect(screen.getByText("topbar")).toBeInTheDocument()
        expect(screen.getByText("navigation")).toBeInTheDocument()
        expect(screen.getByText("workspace body")).toBeInTheDocument()
        expect(mocks.replace).not.toHaveBeenCalled()
    })

    it("returns an anonymous default-locale reader to authentication", async () => {
        mocks.session.state = { status: "anonymous" }
        render(<ConsoleLayout>body</ConsoleLayout>)

        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication"))
    })

    it("preserves a non-default locale when returning an anonymous reader", async () => {
        mocks.locale = "en"
        mocks.session.state = { status: "anonymous" }
        render(<ConsoleLayout>body</ConsoleLayout>)

        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/en/authentication"))
    })
})
