import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type TemplateProvisioningProbeProps = { readonly context: { readonly mode: string, readonly templateKey?: string, readonly siteId?: string } }

vi.mock("@/components/blocks/provisioning/TemplateAppProvisioning", () => ({
    TemplateAppProvisioning: ({ context }: TemplateProvisioningProbeProps) => <div>{JSON.stringify(context)}</div>,
}))
import { TemplateAppProvisioningPageBase, type TemplateAppProvisioningPageViewProps } from "./component"

const labels: TemplateAppProvisioningPageViewProps["labels"] = { path: "Path", apps: "Apps", createTitle: "Create", createDescription: "Configure", provisioningTitle: "Provisioning", provisioningDescription: "Resume" }

describe("TemplateAppProvisioningPageBase", () => {
    it("passes only the template identity before persistence", () => {
        render(<TemplateAppProvisioningPageBase mode="new" templateKey="ai_academy" labels={labels} onOpenApps={vi.fn()} />)
        expect(screen.getByText('{"mode":"new","templateKey":"ai_academy"}')).toBeInTheDocument()
    })

    it("passes only the site identity after persistence", () => {
        render(<TemplateAppProvisioningPageBase mode="resume" siteId="site-1" labels={labels} onOpenApps={vi.fn()} />)
        expect(screen.getByText('{"mode":"resume","siteId":"site-1"}')).toBeInTheDocument()
    })
})
