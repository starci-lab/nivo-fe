import { render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ locale: "vi", replace: vi.fn(), session: { state: { status: "signed-in" } } }))
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
interface MockBaseProps { readonly body: ReactNode }
vi.mock("./component", () => ({ ConsoleLayoutBase: (props: MockBaseProps) => <div>{props.body}</div> }))

import { ConsoleLayout } from "."

describe("ConsoleLayout connected guard", () => {
    beforeEach(() => { mocks.locale = "vi"; mocks.session.state = { status: "signed-in" }; mocks.replace.mockClear() })
    it("keeps a signed-in routed page", () => { render(<ConsoleLayout body="workspace" />); expect(screen.getByText("workspace")).toBeInTheDocument(); expect(mocks.replace).not.toHaveBeenCalled() })
    it("returns an anonymous reader to the locale-aware door", async () => {
        mocks.locale = "en"; mocks.session.state = { status: "anonymous" }
        render(<ConsoleLayout body="workspace" />)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/en/authentication"))
    })
})
