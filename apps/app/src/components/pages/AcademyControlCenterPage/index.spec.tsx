import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type AcademyPageProbeProps = { readonly props: { readonly siteId: string, readonly mode: string }, readonly on: { readonly selectMode: (mode: "system") => void } }

vi.mock("./component", () => ({ AcademyControlCenterPageBase: ({ props, on }: AcademyPageProbeProps) => <button type="button" onClick={() => on.selectMode("system")}>{props.siteId}:{props.mode}</button> }))
import { AcademyControlCenterPage } from "."

describe("AcademyControlCenterPage", () => {
    it("owns Growth/System mode for the persisted site", () => {
        render(<AcademyControlCenterPage siteId="site-1" />)
        fireEvent.click(screen.getByRole("button", { name: "site-1:growth" }))
        expect(screen.getByRole("button", { name: "site-1:system" })).toBeInTheDocument()
    })
})