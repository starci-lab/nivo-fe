import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AcademyControlCenterPage } from "./index"

const m = vi.hoisted(() => ({ session: { state: { status: "signed-in" } }, sites: { ok: true, data: [] as unknown[] }, list: vi.fn(), open: vi.fn() }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => m.session }))
vi.mock("@/modules/api/console", () => ({ myExpertSites: m.list }))
type PageView = { state: string; mode: string; onSelectMode: (mode: string) => void; onOpenPublicSite: () => void }
vi.mock("./component", () => ({ _AcademyControlCenterPage: (input: PageView) => <><output data-testid="state">{input.state}:{input.mode}</output><button onClick={() => input.onSelectMode("system")}>system</button><button onClick={input.onOpenPublicSite}>open</button></> }))

beforeEach(() => { vi.clearAllMocks(); m.session.state.status = "signed-in"; m.sites = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null }] }; m.list.mockResolvedValue(m.sites); window.open = vi.fn() })

describe("AcademyControlCenterPage connected owner", () => {
    it("restores, resolves owned site, switches mode and opens public host", async () => { render(<AcademyControlCenterPage siteId="site-1" />); expect(screen.getByTestId("state")).toHaveTextContent("restoring"); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("ready:growth")); fireEvent.click(screen.getByText("system")); fireEvent.click(screen.getByText("open")); expect(window.open).toHaveBeenCalledWith("https://academy.nivo.vn", "_blank", "noopener,noreferrer") })
    it("renders refused state when the site is not owned", async () => { m.sites = { ok: true, data: [] }; m.list.mockResolvedValue(m.sites); render(<AcademyControlCenterPage siteId="missing" />); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("refused")) })
})
