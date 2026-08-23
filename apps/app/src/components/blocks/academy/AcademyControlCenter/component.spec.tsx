import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyControlCenterBase, type AcademyControlCenterLabels } from "./component"

type AcademyChildProps = { readonly siteId: string }
vi.mock("@/components/blocks/academy/AcademyGrowthSummary", () => ({ AcademyGrowthSummary: ({ siteId }: AcademyChildProps) => <span>growth-{siteId}</span> }))
vi.mock("@/components/blocks/academy/AcademyStudentCrm", () => ({ AcademyStudentCrm: ({ siteId }: AcademyChildProps) => <span>students-{siteId}</span> }))
vi.mock("@/components/blocks/academy/AcademyLeadPipeline", () => ({ AcademyLeadPipeline: ({ siteId }: AcademyChildProps) => <span>leads-{siteId}</span> }))
vi.mock("@/components/blocks/academy/AcademyIntegrationCenter", () => ({ AcademyIntegrationCenter: ({ siteId }: AcademyChildProps) => <span>integrations-{siteId}</span> }))

const labels: AcademyControlCenterLabels = { loading: "Loading", refused: "Refused", openSite: "Open", tabsLabel: "Mode", tabs: [{ id: "growth", label: "Growth" }, { id: "system", label: "System" }] }
const base = { title: "Academy", siteId: "site-1", mode: "growth" as const, labels, onSelectMode: vi.fn(), onOpenPublicSite: vi.fn() }

describe("AcademyControlCenterBase", () => {
    it("renders restoring and refused notices", () => { expect(renderToStaticMarkup(<AcademyControlCenterBase {...base} state="restoring" />)).toContain("Loading"); expect(renderToStaticMarkup(<AcademyControlCenterBase {...base} state="refused" />)).toContain("Refused") })
    it("renders growth/system sections and optional public action", () => { const growth = renderToStaticMarkup(<AcademyControlCenterBase {...base} state="ready" publicHost="academy.nivo.vn" />); expect(growth).toContain("growth-site-1"); expect(growth).toContain("students-site-1"); expect(growth).toContain("leads-site-1"); const system = renderToStaticMarkup(<AcademyControlCenterBase {...base} state="ready" mode="system" />); expect(system).toContain("integrations-site-1") })
})
