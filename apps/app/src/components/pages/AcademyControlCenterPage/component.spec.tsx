import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type AcademyControlProbeProps = { readonly siteId: string, readonly mode: string, readonly onSelectMode: (mode: "system") => void }

vi.mock("@/components/blocks/academy/AcademyControlCenter", () => ({ AcademyControlCenter: ({ siteId, mode, onSelectMode }: AcademyControlProbeProps) => <button type="button" onClick={() => onSelectMode("system")}>{siteId}:{mode}</button> }))
import { AcademyControlCenterPageBase } from "./component"

describe("AcademyControlCenterPageBase", () => {
    it("passes only identity and page-owned mode", () => {
        const select = vi.fn()
        render(<AcademyControlCenterPageBase siteId="site-1" mode="growth" onSelectMode={select} />)
        fireEvent.click(screen.getByRole("button", { name: "site-1:growth" }))
        expect(select).toHaveBeenCalledWith("system")
    })
})