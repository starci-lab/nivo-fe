import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AcademyControlCenter } from "./index"

const m = vi.hoisted(() => ({ session: { state: { status: "signed-in", accessToken: "test-token" } }, sites: { ok: true, data: [] as unknown[] }, list: vi.fn(), open: vi.fn() }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => m.session }))
vi.mock("@/modules/api/console", () => ({ myExpertSites: m.list }))
type PageView = { state: string; mode: string; onSelectMode: (mode: string) => void; onOpenPublicSite: () => void }
vi.mock("./component", () => ({ AcademyControlCenterBase: (input: PageView) => <><output data-testid="state">{input.state}:{input.mode}</output><button onClick={() => input.onSelectMode("system")}>system</button><button onClick={input.onOpenPublicSite}>open</button></> }))

beforeEach(() => { vi.clearAllMocks(); m.session.state.status = "signed-in"; m.sites = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null }] }; m.list.mockResolvedValue(m.sites); window.open = vi.fn() })

describe("AcademyControlCenter connected owner", () => {
    it("restores, resolves the owned site, reports tab selection, and opens the public host", async () => { const onSelectMode = vi.fn(); render(<AcademyControlCenter siteId="site-1" mode="growth" onSelectMode={onSelectMode} />); expect(screen.getByTestId("state")).toHaveTextContent("restoring"); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("ready:growth")); fireEvent.click(screen.getByText("system")); expect(onSelectMode).toHaveBeenCalledWith("system"); fireEvent.click(screen.getByText("open")); expect(window.open).toHaveBeenCalledWith("https://academy.nivo.vn", "_blank", "noopener,noreferrer") })
    it("renders refused state when the site is not owned", async () => { m.sites = { ok: true, data: [] }; m.list.mockResolvedValue(m.sites); render(<AcademyControlCenter siteId="missing" mode="growth" onSelectMode={vi.fn()} />); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("refused")) })
})