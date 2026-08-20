import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyControlCenterPageBase, type AcademyControlCenterPageLabels } from "./component"

type AcademyChildProps = { readonly siteId: string }
vi.mock("@/components/blocks/academy/AcademyGrowthSummary", () => ({ AcademyGrowthSummary: ({ siteId }: AcademyChildProps) => <span>growth-{siteId}</span> }))
vi.mock("@/components/blocks/academy/AcademyStudentCrm", () => ({ AcademyStudentCrm: ({ siteId }: AcademyChildProps) => <span>students-{siteId}</span> }))
vi.mock("@/components/blocks/academy/AcademyLeadPipeline", () => ({ AcademyLeadPipeline: ({ siteId }: AcademyChildProps) => <span>leads-{siteId}</span> }))
vi.mock("@/components/blocks/academy/AcademyIntegrationCenter", () => ({ AcademyIntegrationCenter: ({ siteId }: AcademyChildProps) => <span>integrations-{siteId}</span> }))

const labels: AcademyControlCenterPageLabels = { loading: "Loading", refused: "Refused", openSite: "Open", tabsLabel: "Mode", tabs: [{ id: "growth", label: "Growth" }, { id: "system", label: "System" }] }
const base = { title: "Academy", siteId: "site-1", mode: "growth" as const, labels, onSelectMode: vi.fn(), onOpenPublicSite: vi.fn() }

describe("AcademyControlCenterPageBase", () => {
    it("renders restoring and refused notices", () => { expect(renderToStaticMarkup(<AcademyControlCenterPageBase {...base} state="restoring" />)).toContain("Loading"); expect(renderToStaticMarkup(<AcademyControlCenterPageBase {...base} state="refused" />)).toContain("Refused") })
    it("renders growth/system sections and optional public action", () => { const growth = renderToStaticMarkup(<AcademyControlCenterPageBase {...base} state="ready" publicHost="academy.nivo.vn" />); expect(growth).toContain("growth-site-1"); expect(growth).toContain("students-site-1"); expect(growth).toContain("leads-site-1"); const system = renderToStaticMarkup(<AcademyControlCenterPageBase {...base} state="ready" mode="system" />); expect(system).toContain("integrations-site-1") })
})
