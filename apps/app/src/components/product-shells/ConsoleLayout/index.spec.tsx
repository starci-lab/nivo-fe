import { render, screen, waitFor } from "@testing-library/react"
import type { ComponentType } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ locale: "vi", replace: vi.fn(), session: { state: { status: "signed-in" } } }))
vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
interface MockBaseProps { readonly body: ComponentType; readonly bodyProps: object }
vi.mock("./component", () => ({ ConsoleLayoutBase: ({ body: Body, bodyProps }: MockBaseProps) => <div><Body {...bodyProps} /></div> }))

import { ConsoleLayout } from "."

describe("ConsoleLayout connected guard", () => {
    const Workspace = () => <>workspace</>
    beforeEach(() => { mocks.locale = "vi"; mocks.session.state = { status: "signed-in" }; mocks.replace.mockClear() })
    it("keeps a signed-in routed page", () => { render(<ConsoleLayout body={Workspace} bodyProps={{}} />); expect(screen.getByText("workspace")).toBeInTheDocument(); expect(mocks.replace).not.toHaveBeenCalled() })
    it("returns an anonymous reader to the locale-aware door", async () => {
        mocks.locale = "en"; mocks.session.state = { status: "anonymous" }
        render(<ConsoleLayout body={Workspace} bodyProps={{}} />)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication"))
    })
})
