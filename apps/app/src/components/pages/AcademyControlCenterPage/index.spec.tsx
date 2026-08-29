import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type AcademyPageProbeProps = { readonly siteId: string, readonly mode: string, readonly onSelectMode: (mode: "system") => void }

vi.mock("./component", () => ({ AcademyControlCenterPageBase: ({ siteId, mode, onSelectMode }: AcademyPageProbeProps) => <button type="button" onClick={() => onSelectMode("system")}>{siteId}:{mode}</button> }))
import { AcademyControlCenterPage } from "."

describe("AcademyControlCenterPage", () => {
    it("owns Growth/System mode for the persisted site", () => {
        render(<AcademyControlCenterPage siteId="site-1" />)
        fireEvent.click(screen.getByRole("button", { name: "site-1:growth" }))
        expect(screen.getByRole("button", { name: "site-1:system" })).toBeInTheDocument()
    })
})